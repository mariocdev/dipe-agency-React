<?php
/**
 * Plugin Name: Dipe Core
 * Description: Modelo de contenido y datos estructurados de Dipe Agency.
 * Version: 0.1.0
 * Requires at least: 6.4
 * Requires PHP: 8.2
 * Author: Dipe Agency
 * Text Domain: dipe-core
 */

defined( 'ABSPATH' ) || exit;

const DIPE_CORE_VERSION = '0.2.0';

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
			'rewrite'      => array( 'slug' => 'proyectos' ),
			'show_in_rest' => true,
			'rest_base'    => 'dipe-proyectos',
			'supports'     => array( 'title', 'custom-fields' ),
			'menu_icon'    => 'dashicons-portfolio',
			'show_in_menu' => true,
		)
	);
}
add_action( 'init', 'dipe_core_register_content_types' );

function dipe_core_maybe_flush_rewrite_rules() {
	if ( DIPE_CORE_VERSION === get_option( 'dipe_core_rewrite_version' ) ) {
		return;
	}

	flush_rewrite_rules( false );
	update_option( 'dipe_core_rewrite_version', DIPE_CORE_VERSION );
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

function dipe_core_acf_required_notice() {
	if ( function_exists( 'acf_add_local_field_group' ) || ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	echo '<div class="notice notice-warning"><p>' . esc_html__( 'Dipe Core necesita ACF Pro activo para mostrar los campos de Proyectos.', 'dipe-core' ) . '</p></div>';
}
add_action( 'admin_notices', 'dipe_core_acf_required_notice' );

function dipe_core_activate() {
	dipe_core_register_content_types();
	update_option( 'blog_public', 0 );
	flush_rewrite_rules();
	update_option( 'dipe_core_rewrite_version', DIPE_CORE_VERSION );
}
register_activation_hook( __FILE__, 'dipe_core_activate' );
register_deactivation_hook( __FILE__, 'flush_rewrite_rules' );
