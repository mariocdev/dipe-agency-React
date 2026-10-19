<?php
/** WP Rocket integration; keep vendor files unchanged. */

defined( 'ABSPATH' ) || exit;

// The user explicitly enables public caching permanently (19-10-2026),
// accepting that cached HTML can bypass a later password gate in index.php.
const DIPE_CORE_ROCKET_PAGE_CACHE_READY = true;

if ( ! DIPE_CORE_ROCKET_PAGE_CACHE_READY ) {
	add_filter( 'do_rocket_generate_caching_files', '__return_false', PHP_INT_MAX );
	add_filter( 'rocket_htaccess_mod_rewrite', '__return_empty_string', PHP_INT_MAX );
	add_filter( 'rocket_cache_reject_uri', 'dipe_core_rocket_reject_protected_site', PHP_INT_MAX );
}

/** Make the temporary restriction visible without exposing a public switch. */
function dipe_core_rocket_protected_notice() {
	if ( DIPE_CORE_ROCKET_PAGE_CACHE_READY || ! defined( 'WP_ROCKET_SLUG' ) || ! current_user_can( 'manage_options' ) ) {
		return;
	}

	echo '<div class="notice notice-warning"><p>' . esc_html__( 'Dipe: la caché de página de WP Rocket está deshabilitada por la protección temporal del index.php raíz. Después de retirar esa contraseña, hay que habilitar el perfil público en dipe-core/includes/cache.php y volver a abrir el administrador para regenerar las reglas y purgar la caché.', 'dipe-core' ) . '</p></div>';
}
add_action( 'admin_notices', 'dipe_core_rocket_protected_notice' );

/** Also exclude existing files from Rocket's generated PHP cache configuration. */
function dipe_core_rocket_reject_protected_site( $uris ) {
	$uris[] = '/(.*)';
	return $uris;
}

/** Keep the app and its inline configuration together if JS options change. */
function dipe_core_rocket_exclude_app_scripts( $excluded ) {
	return array_values( array_unique( array_merge( (array) $excluded, array(
		'/themes/dipe-react/assets/',
		'dipe-react-config',
		'window.dipeSite',
	) ) ) );
}
add_filter( 'rocket_delay_js_exclusions', 'dipe_core_rocket_exclude_app_scripts' );
add_filter( 'rocket_exclude_defer_js', 'dipe_core_rocket_exclude_app_scripts' );
add_filter( 'rocket_exclude_js', 'dipe_core_rocket_exclude_app_scripts' );

/** Apply a conservative profile once through Rocket's native settings hooks. */
function dipe_core_configure_rocket_profile() {
	if ( ! current_user_can( 'manage_options' ) || ! defined( 'WP_ROCKET_SLUG' ) || ! function_exists( 'get_rocket_option' ) || ! function_exists( 'rocket_sanitize_textarea_field' ) ) {
		return;
	}

	$ready   = DIPE_CORE_ROCKET_PAGE_CACHE_READY;
	$profile = 'react-v3-' . ( $ready ? 'public' : 'protected' );
	if ( $profile === get_option( 'dipe_core_rocket_profile' ) ) {
		return;
	}

	$current = get_option( WP_ROCKET_SLUG );
	if ( ! is_array( $current ) || ! isset( $current['cache_mobile'] ) ) {
		return;
	}

	$settings = array(
		'cache_mobile'               => 1,
		'do_caching_mobile_files'    => 0,
		'cache_ssl'                  => 1,
		'cache_logged_user'          => 0,
		'manual_preload'             => $ready ? 1 : 0,
		'preload_links'              => $ready ? 1 : 0,
		'purge_cron_interval'        => 10,
		'purge_cron_unit'            => 'HOUR_IN_SECONDS',
		'minify_css'                 => 0,
		'minify_js'                  => 0,
		'minify_concatenate_js'      => 0,
		'defer_all_js'               => 0,
		'delay_js'                   => 0,
		'optimize_css_delivery'      => 0,
		'async_css'                  => 0,
		'remove_unused_css'          => 0,
		'lazyload'                   => 0,
		'lazyload_iframes'           => 0,
		'lazyload_youtube'           => 0,
		'lazyload_css_bg_img'        => 0,
		'image_dimensions'          => 0,
		'minify_google_fonts'        => 0,
		'control_heartbeat'          => 0,
		'schedule_automatic_cleanup' => 0,
		'analytics_enabled'          => 0,
	);
	$settings = array_intersect_key( $settings, $current );

	// Persist exclusions so they are visible in Rocket as well as applied by filters.
	$assets     = trailingslashit( wp_parse_url( get_theme_file_uri( 'assets/' ), PHP_URL_PATH ) );
	$app        = array( $assets, 'dipe-react-config', 'window.dipeSite' );
	$patterns   = array(
		'exclude_js'          => array( $assets . '(.*).js' ),
		'exclude_inline_js'   => array( 'window.dipeSite' ),
		'exclude_defer_js'    => $app,
		'delay_js_exclusions' => $app,
		'cache_purge_pages'   => array( home_url( '/blog/' ), home_url( '/proyectos/' ) ),
	);
	foreach ( $patterns as $key => $values ) {
		if ( ! array_key_exists( $key, $current ) ) {
			continue;
		}

		// Rocket strips domains from purge URLs during update_option(). Normalize
		// first so the saved-value comparison can record this profile just once.
		$settings[ $key ] = array_values( rocket_sanitize_textarea_field(
			$key,
			array_merge( (array) $current[ $key ], $values )
		) );
	}

	// One merged save preserves licenses, exclusions, CDN and all unrelated options.
	$updated = array_replace( $current, $settings );
	if ( $updated !== $current ) {
		update_option( WP_ROCKET_SLUG, $updated );
	}

	$saved = get_option( WP_ROCKET_SLUG );
	if ( ! is_array( $saved ) ) {
		return;
	}
	foreach ( $settings as $key => $value ) {
		if ( ! isset( $saved[ $key ] ) || $saved[ $key ] != $value ) {
			return;
		}
	}

	// Refresh generated rules even when the settings already matched the profile.
	// This installs/removes the temporary gate exclusion and clears older HTML.
	foreach ( array( 'flush_rocket_htaccess', 'rocket_generate_config_file', 'rocket_generate_advanced_cache_file', 'rocket_clean_domain' ) as $callback ) {
		if ( function_exists( $callback ) ) {
			call_user_func( $callback );
		}
	}

	update_option( 'dipe_core_rocket_profile', $profile, false );
}
add_action( 'admin_init', 'dipe_core_configure_rocket_profile', 60 );
