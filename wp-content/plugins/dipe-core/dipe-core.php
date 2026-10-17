<?php
/**
 * Plugin Name: Dipe Core
 * Description: Modelo de contenido y datos estructurados de Dipe Agency.
 * Version: 0.4.2
 * Requires at least: 6.4
 * Requires PHP: 8.2
 * Author: Dipe Agency
 * Text Domain: dipe-core
 */

defined( 'ABSPATH' ) || exit;

const DIPE_CORE_VERSION = '0.4.2';
// Admin and SMTP releases do not change public rewrite rules.
const DIPE_CORE_REWRITE_VERSION = '0.4.0';

require_once __DIR__ . '/includes/mail-settings.php';
require_once __DIR__ . '/includes/form-submissions.php';

/**
 * Set the site's editorial URLs once. Do not override later admin changes.
 */
function dipe_core_configure_blog_urls() {
	if ( 'blog-v1' === get_option( 'dipe_core_blog_urls_version' ) ) {
		return;
	}

	global $wp_rewrite;
	$wp_rewrite->set_permalink_structure( '/blog/%postname%/' );
	$wp_rewrite->set_category_base( 'categoria' );
	update_option( 'dipe_core_blog_urls_version', 'blog-v1' );
}
add_action( 'init', 'dipe_core_configure_blog_urls', 0 );

/**
 * A published page gives React's /blog/ archive a real WordPress URL and SEO anchor.
 */
function dipe_core_ensure_blog_page() {
	if ( get_option( 'dipe_core_blog_page_created' ) ) {
		return;
	}

	$page = get_page_by_path( 'blog', OBJECT, 'page' );
	if ( $page && 'publish' !== $page->post_status ) {
		return;
	}
	if ( ! $page ) {
		$page_id = wp_insert_post(
			array(
				'post_type'    => 'page',
				'post_title'   => 'Blog',
				'post_name'    => 'blog',
				'post_status'  => 'publish',
				'post_content' => '',
			),
			true
		);
		if ( is_wp_error( $page_id ) ) {
			return;
		}
	}

	update_option( 'dipe_core_blog_page_created', 1 );
}
add_action( 'init', 'dipe_core_ensure_blog_page', 30 );

/** Redirect the two former public URL patterns when they no longer resolve. */
function dipe_core_redirect_old_blog_urls() {
	if ( ! is_404() ) {
		return;
	}

	$path = trim( (string) ( $GLOBALS['wp']->request ?? '' ), '/' );
	if ( preg_match( '#^category/(.+)$#', $path, $matches ) ) {
		$category = get_category_by_slug( basename( $matches[1] ) );
		if ( $category ) {
			$url = get_term_link( $category );
			if ( ! is_wp_error( $url ) ) {
				wp_safe_redirect( $url, 301 );
				exit;
			}
		}
	}

	if ( $path && false === strpos( $path, '/' ) ) {
		$post = get_page_by_path( $path, OBJECT, 'post' );
		if ( $post && 'publish' === $post->post_status ) {
			wp_safe_redirect( get_permalink( $post ), 301 );
			exit;
		}
	}
}
add_action( 'template_redirect', 'dipe_core_redirect_old_blog_urls' );

/**
 * This project is a non-public environment until an explicit production
 * transition. Keep every WordPress response out of search results.
 */
function dipe_core_prevent_search_indexing( $robots ) {
	$robots['noindex']      = true;
	$robots['nofollow']     = true;
	$robots['noarchive']    = true;
	$robots['nosnippet']    = true;
	$robots['noimageindex'] = true;

	return $robots;
}
add_filter( 'wp_robots', 'dipe_core_prevent_search_indexing' );

function dipe_core_send_noindex_header() {
	if ( ! is_admin() ) {
		header( 'X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex', true );
	}
}
add_action( 'send_headers', 'dipe_core_send_noindex_header' );

function dipe_core_disallow_robots() {
	return "User-agent: *\nDisallow: /\n";
}
add_filter( 'robots_txt', 'dipe_core_disallow_robots' );

function dipe_core_disable_search_visibility() {
	if ( '0' !== (string) get_option( 'blog_public' ) ) {
		update_option( 'blog_public', 0 );
	}
}
add_action( 'admin_init', 'dipe_core_disable_search_visibility' );

function dipe_core_register_content_types() {
	register_post_type(
		'dipe_proyecto',
		array(
			'labels' => array(
				'name'          => __( 'Proyectos', 'dipe-core' ),
				'singular_name' => __( 'Proyecto', 'dipe-core' ),
				'add_new_item'  => __( 'Añadir proyecto', 'dipe-core' ),
				'edit_item'     => __( 'Editar proyecto', 'dipe-core' ),
			),
			'public'       => true,
			'has_archive'  => 'proyectos',
			'rewrite'      => array( 'slug' => 'proyectos', 'with_front' => false ),
			'show_in_rest' => true,
			'rest_base'    => 'dipe-proyectos',
			'supports'     => array( 'title', 'custom-fields' ),
			'menu_icon'    => 'dashicons-portfolio',
			'show_in_menu' => true,
		)
	);

	register_taxonomy(
		'dipe_project_tag',
		array( 'dipe_proyecto' ),
		array(
			'labels' => array(
				'name'          => __( 'Etiquetas de proyecto', 'dipe-core' ),
				'singular_name' => __( 'Etiqueta de proyecto', 'dipe-core' ),
				'add_new_item'  => __( 'Añadir etiqueta de proyecto', 'dipe-core' ),
				'edit_item'     => __( 'Editar etiqueta de proyecto', 'dipe-core' ),
			),
			'public'            => true,
			'hierarchical'      => false,
			'show_ui'           => true,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'rest_base'         => 'dipe-project-tags',
			'rewrite'           => array( 'slug' => 'etiqueta-proyecto', 'with_front' => false ),
		)
	);
}
add_action( 'init', 'dipe_core_register_content_types' );

function dipe_core_seed_project_terms() {
	if ( ! term_exists( 'destacados', 'dipe_project_tag' ) ) {
		wp_insert_term(
			__( 'Destacados', 'dipe-core' ),
			'dipe_project_tag',
			array( 'slug' => 'destacados' )
		);
	}
}
add_action( 'init', 'dipe_core_seed_project_terms', 20 );

function dipe_core_maybe_flush_rewrite_rules() {
	if ( DIPE_CORE_REWRITE_VERSION === get_option( 'dipe_core_rewrite_version' ) ) {
		return;
	}

	flush_rewrite_rules( false );
	update_option( 'dipe_core_rewrite_version', DIPE_CORE_REWRITE_VERSION );
}
add_action( 'init', 'dipe_core_maybe_flush_rewrite_rules', 20 );

function dipe_core_register_project_fields() {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	acf_add_local_field_group(
		array(
			'key'                   => 'group_dipe_project_home_card',
			'title'                 => __( 'Tarjeta de inicio', 'dipe-core' ),
			'fields'                => array(
				array(
					'key'           => 'field_dipe_project_home_card_image',
					'label'         => __( 'Imagen de tarjeta de inicio', 'dipe-core' ),
					'name'          => 'dipe_project_home_card_image',
					'type'          => 'image',
					'instructions'  => __( 'Imagen horizontal para la tarjeta del proyecto en la página de inicio.', 'dipe-core' ),
					'required'      => 1,
					'return_format' => 'array',
					'preview_size'  => 'medium',
					'library'       => 'all',
				),
			),
			'location'              => array(
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'dipe_proyecto',
					),
				),
			),
			'position'              => 'normal',
			'style'                 => 'default',
			'label_placement'       => 'top',
			'instruction_placement' => 'label',
			'show_in_rest'          => 1,
		)
	);
}
add_action( 'acf/init', 'dipe_core_register_project_fields' );

function dipe_core_get_project_card_image_for_rest( $project ) {
	$image_id = absint( get_post_meta( $project['id'], 'dipe_project_home_card_image', true ) );

	if ( ! $image_id ) {
		return null;
	}

	$image_url = wp_get_attachment_image_url( $image_id, 'full' );

	if ( ! $image_url ) {
		return null;
	}

	return array(
		'id'  => $image_id,
		'url' => $image_url,
		'alt' => get_post_meta( $image_id, '_wp_attachment_image_alt', true ),
	);
}

function dipe_core_register_project_rest_fields() {
	register_rest_field(
		'dipe_proyecto',
		'dipe_project_card_image',
		array(
			'get_callback' => 'dipe_core_get_project_card_image_for_rest',
			'schema'       => array(
				'description' => __( 'Imagen de tarjeta del proyecto.', 'dipe-core' ),
				'type'        => array( 'object', 'null' ),
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
		)
	);
}
add_action( 'rest_api_init', 'dipe_core_register_project_rest_fields' );

function dipe_core_acf_required_notice() {
	if ( function_exists( 'acf_add_local_field_group' ) || ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	echo '<div class="notice notice-warning"><p>' . esc_html__( 'Dipe Core necesita ACF Pro activo para mostrar los campos de Proyectos.', 'dipe-core' ) . '</p></div>';
}
add_action( 'admin_notices', 'dipe_core_acf_required_notice' );

function dipe_core_activate() {
	dipe_core_configure_blog_urls();
	dipe_core_register_content_types();
	dipe_core_seed_project_terms();
	dipe_core_ensure_blog_page();
	update_option( 'blog_public', 0 );
	flush_rewrite_rules();
	update_option( 'dipe_core_rewrite_version', DIPE_CORE_REWRITE_VERSION );
}
register_activation_hook( __FILE__, 'dipe_core_activate' );
register_deactivation_hook( __FILE__, 'flush_rewrite_rules' );
