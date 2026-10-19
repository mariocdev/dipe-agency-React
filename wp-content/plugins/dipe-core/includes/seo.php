<?php
/** Minimal Yoast settings and compatibility with Dipe's content model. */

defined( 'ABSPATH' ) || exit;

/** Only documents with their own paginated URL, plus native search results. */
function dipe_core_is_secondary_listing() {
	return ! is_admin() && ! is_feed() && (
		is_search() || is_paged() || (int) get_query_var( 'paged' ) > 1 || (int) get_query_var( 'page' ) > 1
	);
}

/** Native WordPress output when Yoast is inactive. */
function dipe_core_secondary_listing_robots( $robots ) {
	if ( dipe_core_is_secondary_listing() ) {
		unset( $robots['index'], $robots['nofollow'], $robots['none'] );
		$robots['noindex'] = true;
		$robots['follow']  = true;
	}
	return $robots;
}
add_filter( 'wp_robots', 'dipe_core_secondary_listing_robots', 99 );

/** Yoast uses directive values rather than WordPress's boolean flags. */
function dipe_core_yoast_secondary_listing_robots( $robots ) {
	if ( dipe_core_is_secondary_listing() ) {
		unset( $robots['noindex'], $robots['nofollow'], $robots['none'] );
		$robots['index']  = 'noindex';
		$robots['follow'] = 'follow';
	}
	return $robots;
}
add_filter( 'wpseo_robots_array', 'dipe_core_yoast_secondary_listing_robots', 99 );

/** An empty canonical means no rel=canonical tag, never an empty href. */
function dipe_core_secondary_listing_canonical( $canonical ) {
	return dipe_core_is_secondary_listing() ? false : $canonical;
}
add_filter( 'wpseo_canonical', 'dipe_core_secondary_listing_canonical', 99 );
add_filter( 'get_canonical_url', 'dipe_core_secondary_listing_canonical', 99 );

/**
 * Apply the requested feature profile once, after Yoast has initialized.
 * Use its option API and only keys supported by the installed version. Leave
 * per-page metadata, organization data, URL settings and later admin edits alone.
 */
function dipe_core_configure_yoast_minimal_profile() {
	if ( ! current_user_can( 'manage_options' ) || ! class_exists( 'WPSEO_Options' ) ) {
		return;
	}

	$profile = 'minimal-v1';
	if ( $profile === get_option( 'dipe_core_yoast_profile' ) ) {
		return;
	}

	$known = WPSEO_Options::get_all();
	if ( ! isset( $known['enable_xml_sitemap'], $known['opengraph'] ) ) {
		return;
	}

	$settings = array(
		'enable_xml_sitemap'                 => true,
		'enable_schema'                      => true,
		'opengraph'                          => true,
		'twitter'                            => true,
		'keyword_analysis_active'            => false,
		'content_analysis_active'            => false,
		'inclusive_language_analysis_active' => false,
		'enable_cornerstone_content'         => false,
		'enable_metabox_insights'            => false,
		'enable_text_link_counter'           => false,
		'enable_link_suggestions'            => false,
		'enable_admin_bar_menu'              => false,
		'enable_task_list'                   => false,
		'enable_ai_generator'                => false,
		'enable_llms_txt'                    => false,
		'enable_index_now'                   => false,
		'enable_enhanced_slack_sharing'       => false,
		'enable_headless_rest_endpoints'      => false,
		'enable_schema_aggregation_endpoint' => false,
		'semrush_integration_active'         => false,
		'wincher_integration_active'         => false,
		'algolia_integration_active'         => false,
		'tracking'                           => false,
	);
	$settings = array_intersect_key( $settings, $known );

	foreach ( $settings as $key => $value ) {
		if ( (bool) $known[ $key ] !== $value ) {
			WPSEO_Options::set( $key, $value );
		}
	}

	// A failed save must not mark the profile as applied.
	WPSEO_Options::clear_cache();
	foreach ( $settings as $key => $value ) {
		if ( (bool) WPSEO_Options::get( $key ) !== $value ) {
			return;
		}
	}

	update_option( 'dipe_core_yoast_profile', $profile, false );
}
add_action( 'admin_init', 'dipe_core_configure_yoast_minimal_profile', 50 );

/** Administrative records have no public detail pages. */
function dipe_core_yoast_exclude_post_type( $excluded, $post_type ) {
	return $excluded || in_array( $post_type, array( 'dipe_equipo', 'dipe_solicitud' ), true );
}
add_filter( 'wpseo_sitemap_exclude_post_type', 'dipe_core_yoast_exclude_post_type', 10, 2 );

/** Featured-project labels and related services do not have public archives. */
function dipe_core_yoast_exclude_taxonomy( $excluded, $taxonomy ) {
	return $excluded || in_array( $taxonomy, array( 'dipe_project_tag', 'dipe_related_service' ), true );
}
add_filter( 'wpseo_sitemap_exclude_taxonomy', 'dipe_core_yoast_exclude_taxonomy', 10, 2 );

/** Extend Yoast's connected graph with the business facts shown on the site. */
function dipe_core_yoast_business_graph( $graph ) {
	if ( ! is_array( $graph ) ) {
		return $graph;
	}

	// Facts supplied in the reference HTML and already visible in Contact/Footer.
	// Keep URLs tied to the current WordPress installation, including after migration.
	$business = array(
		'@type'     => array( 'Organization', 'LocalBusiness' ),
		'@id'       => home_url( '/' ) . '#organization',
		'name'      => 'Dipe',
		'url'       => home_url( '/' ),
		'email'     => 'info@dipe.es',
		'telephone' => '+34923623738',
		'address'   => array(
			'@type'           => 'PostalAddress',
			'streetAddress'   => 'Jesús Arambarri, 33',
			'addressLocality' => 'Salamanca',
			'postalCode'      => '37003',
			'addressCountry'  => 'ES',
		),
		'contactPoint' => array(
			'@type'             => 'ContactPoint',
			'contactType'       => 'sales',
			'telephone'         => '+34923623738',
			'email'             => 'info@dipe.es',
			'availableLanguage' => array( 'Spanish' ),
		),
	);
	$logo = wp_get_attachment_image_url( absint( get_theme_mod( 'custom_logo' ) ), 'full' );
	if ( $logo ) {
		$business['logo']  = $logo;
		$business['image'] = $logo;
	}

	$found = false;
	foreach ( $graph as $key => $piece ) {
		$types = (array) ( $piece['@type'] ?? array() );
		if ( ! array_intersect( array( 'Organization', 'LocalBusiness' ), $types ) ) {
			continue;
		}
		// Preserve Yoast's entity ID, existing social profiles and other known data.
		$business['@id']   = $piece['@id'] ?? $business['@id'];
		$business['@type'] = array_values( array_unique( array_merge( $types, $business['@type'] ) ) );
		$graph[ $key ]     = array_replace( $piece, $business );
		$found            = true;
		break;
	}
	if ( ! $found ) {
		$graph[] = $business;
	}

	foreach ( $graph as $key => $piece ) {
		$types = (array) ( $piece['@type'] ?? array() );
		if ( array_intersect( array( 'WebSite', 'Article', 'BlogPosting' ), $types ) ) {
			$graph[ $key ]['publisher'] = array( '@id' => $business['@id'] );
		}
		if ( is_front_page() && in_array( 'WebPage', $types, true ) ) {
			$graph[ $key ]['about'] = array( '@id' => $business['@id'] );
		}
	}
	return $graph;
}
add_filter( 'wpseo_schema_graph', 'dipe_core_yoast_business_graph', 20 );
