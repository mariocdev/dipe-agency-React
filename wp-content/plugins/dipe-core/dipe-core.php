<?php
/**
 * Plugin Name: Dipe Core
 * Description: Modelo de contenido y datos estructurados de Dipe Agency.
 * Version: 0.4.32
 * Requires at least: 6.4
 * Requires PHP: 8.2
 * Author: Dipe Agency
 * Text Domain: dipe-core
 */

defined( 'ABSPATH' ) || exit;

const DIPE_CORE_VERSION = '0.4.32';
const DIPE_CORE_REWRITE_VERSION = '0.4.4';

require_once __DIR__ . '/includes/mail-settings.php';
require_once __DIR__ . '/includes/form-submissions.php';
require_once __DIR__ . '/includes/admin-branding.php';
require_once __DIR__ . '/includes/team.php';
require_once __DIR__ . '/includes/related-services.php';
require_once __DIR__ . '/includes/blog.php';
require_once __DIR__ . '/includes/seo.php';
require_once __DIR__ . '/includes/project-archive-seo.php';
require_once __DIR__ . '/includes/site-tools.php';
require_once __DIR__ . '/includes/shop-features.php';
require_once __DIR__ . '/includes/shop-discussions-admin.php';
require_once __DIR__ . '/includes/shop-checkout.php';
require_once __DIR__ . '/includes/shop-emails.php';

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

/** Restore visibility once after removing the former global staging lock. */
function dipe_core_restore_search_visibility() {
	if ( ! current_user_can( 'manage_options' ) || get_option( 'dipe_core_search_visibility_restored' ) ) {
		return;
	}

	update_option( 'blog_public', 1 );
	update_option( 'dipe_core_search_visibility_restored', 1, false );
}
add_action( 'admin_init', 'dipe_core_restore_search_visibility' );

// Registra proyectos y sus taxonomías públicas.
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
			'supports'     => array( 'title', 'editor', 'thumbnail', 'custom-fields' ),
			'menu_icon'    => 'dashicons-portfolio',
			'show_in_menu' => true,
		)
	);

	register_taxonomy(
		'dipe_project_tag',
		array( 'dipe_proyecto' ),
		array(
			'labels' => array(
				'name'          => __( 'Etiquetas de proyectos', 'dipe-core' ),
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
			'rewrite'           => false,
		)
	);

	register_taxonomy(
		'dipe_project_category',
		array( 'dipe_proyecto' ),
		array(
			'labels' => array(
				'name'          => __( 'Categorías de proyectos', 'dipe-core' ),
				'singular_name' => __( 'Categoría de proyecto', 'dipe-core' ),
				'add_new_item'  => __( 'Añadir categoría de proyecto', 'dipe-core' ),
				'edit_item'     => __( 'Editar categoría de proyecto', 'dipe-core' ),
			),
			'public'            => true,
			'hierarchical'      => true,
			'show_ui'           => true,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'rest_base'         => 'dipe-project-categories',
			'rewrite'           => array( 'slug' => 'proyectos/categoria', 'with_front' => false ),
		)
	);
}
add_action( 'init', 'dipe_core_register_content_types' );

// Prepara los términos iniciales de los proyectos.
function dipe_core_seed_project_terms() {
	if ( ! term_exists( 'destacados', 'dipe_project_tag' ) ) {
		wp_insert_term(
			__( 'Destacados', 'dipe-core' ),
			'dipe_project_tag',
			array( 'slug' => 'destacados' )
		);
	}

	foreach (
		array(
			'wordpress'  => __( 'WordPress', 'dipe-core' ),
			'prestashop' => __( 'PrestaShop', 'dipe-core' ),
		) as $slug => $name
	) {
		if ( ! term_exists( $slug, 'dipe_project_category' ) ) {
			wp_insert_term( $name, 'dipe_project_category', array( 'slug' => $slug ) );
		}
	}
}
add_action( 'init', 'dipe_core_seed_project_terms', 20 );

/**
 * Moves categories created before tags and categories were split. The old terms
 * are removed only after their project relationships have been copied.
 */
function dipe_core_migrate_legacy_project_categories() {
	if ( '1' === get_option( 'dipe_core_project_taxonomy_split' ) ) {
		return;
	}

	$legacy_terms = get_terms(
		array(
			'taxonomy'   => 'dipe_project_tag',
			'hide_empty' => false,
		)
	);
	if ( is_wp_error( $legacy_terms ) ) {
		return;
	}

	$complete = true;
	foreach ( $legacy_terms as $legacy_term ) {
		if ( 'destacados' === $legacy_term->slug ) {
			continue;
		}

		$category = term_exists( $legacy_term->slug, 'dipe_project_category' );
		if ( ! $category ) {
			$category = wp_insert_term(
				$legacy_term->name,
				'dipe_project_category',
				array(
					'slug'        => $legacy_term->slug,
					'description' => $legacy_term->description,
				)
			);
		}
		if ( is_wp_error( $category ) || ! $category ) {
			$complete = false;
			continue;
		}

		$category_id = is_array( $category ) ? (int) $category['term_id'] : (int) $category;
		$project_ids = get_objects_in_term( $legacy_term->term_id, 'dipe_project_tag' );
		if ( is_wp_error( $project_ids ) ) {
			$complete = false;
			continue;
		}

		foreach ( $project_ids as $project_id ) {
			$assigned = wp_set_object_terms( $project_id, $category_id, 'dipe_project_category', true );
			if ( is_wp_error( $assigned ) || ! wp_remove_object_terms( $project_id, $legacy_term->term_id, 'dipe_project_tag' ) ) {
				$complete = false;
			}
		}

		if ( $complete && ! wp_delete_term( $legacy_term->term_id, 'dipe_project_tag' ) ) {
			$complete = false;
		}
	}

	if ( $complete ) {
		update_option( 'dipe_core_project_taxonomy_split', '1' );
	}
}
add_action( 'init', 'dipe_core_migrate_legacy_project_categories', 30 );

// Regenera las reglas de URL cuando cambia su versión guardada.
function dipe_core_maybe_flush_rewrite_rules() {
	if ( DIPE_CORE_REWRITE_VERSION === get_option( 'dipe_core_rewrite_version' ) ) {
		return;
	}

	flush_rewrite_rules( false );
	update_option( 'dipe_core_rewrite_version', DIPE_CORE_REWRITE_VERSION );
}
add_action( 'init', 'dipe_core_maybe_flush_rewrite_rules', 20 );

// Define los campos ACF utilizados en las fichas y tarjetas de proyectos.
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

	acf_add_local_field_group(
		array(
			'key'                   => 'group_dipe_project_detail',
			'title'                 => __( 'Detalle del proyecto', 'dipe-core' ),
			'fields'                => array(
				array(
					'key'           => 'field_dipe_project_banner_image',
					'label'         => __( 'Imagen de banner principal', 'dipe-core' ),
					'name'          => 'dipe_project_banner_image',
					'type'          => 'image',
					'instructions'  => __( 'Imagen principal del banner de la página de este proyecto.', 'dipe-core' ),
					'required'      => 0,
					'return_format' => 'array',
					'preview_size'  => 'medium',
					'library'       => 'all',
				),
				array(
					'key'            => 'field_dipe_project_development_date',
					'label'          => __( 'Fecha de desarrollo', 'dipe-core' ),
					'name'           => 'dipe_project_development_date',
					'type'           => 'date_picker',
					'instructions'   => __( 'Fecha en la que se desarrolló el proyecto; no es la fecha de publicación.', 'dipe-core' ),
					'required'       => 0,
					'display_format' => 'd/m/Y',
					'return_format'  => 'Y-m-d',
					'first_day'      => 1,
				),
				array(
					'key'          => 'field_dipe_project_youtube_url',
					'label'        => __( 'Vídeo de YouTube', 'dipe-core' ),
					'name'         => 'dipe_project_youtube_url',
					'type'         => 'url',
					'instructions' => __( 'Pega la URL pública del vídeo de YouTube. Este vídeo se mostrará antes de la galería.', 'dipe-core' ),
					'required'     => 0,
				),
				array(
					'key'          => 'field_dipe_project_live_url',
					'label'        => __( 'Página web lanzada', 'dipe-core' ),
					'name'         => 'dipe_project_live_url',
					'type'         => 'url',
					'instructions' => __( 'Pega la URL pública de la página web ya lanzada.', 'dipe-core' ),
					'required'     => 0,
				),
				array(
					'key'          => 'field_dipe_project_gallery',
					'label'        => __( 'Galería multimedia', 'dipe-core' ),
					'name'         => 'dipe_project_gallery',
					'type'         => 'repeater',
					'instructions' => __( 'Añade y ordena las imágenes, GIF o vídeos que se mostrarán en la galería del proyecto.', 'dipe-core' ),
					'required'     => 0,
					'layout'       => 'block',
					'button_label' => __( 'Añadir archivo multimedia', 'dipe-core' ),
					'sub_fields'   => array(
						array(
							'key'           => 'field_dipe_project_gallery_media',
							'label'         => __( 'Archivo multimedia', 'dipe-core' ),
							'name'          => 'media',
							'type'          => 'file',
							'instructions'  => __( 'Sube una imagen, GIF o vídeo.', 'dipe-core' ),
							'required'      => 1,
							'return_format' => 'array',
							'library'       => 'all',
							'mime_types'    => 'jpg,jpeg,png,gif,webp,avif,mp4,webm',
						),
					),
				),
				array(
					'key'          => 'field_dipe_project_featured_projects',
					'label'        => __( 'Proyectos destacados', 'dipe-core' ),
					'name'         => 'dipe_project_featured_projects',
					'type'         => 'relationship',
					'instructions' => __( 'Selecciona y ordena los proyectos que se mostrarán al final de este proyecto. Déjalo vacío para no mostrar esta sección.', 'dipe-core' ),
					'required'     => 0,
					'post_type'    => array( 'dipe_proyecto' ),
					'filters'      => array( 'search' ),
					'elements'     => array( 'featured_image' ),
					'return_format' => 'object',
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

// Prepara la imagen de tarjeta del proyecto para la respuesta REST.
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

// Añade al proyecto los campos REST que necesita el frontend.
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

// Avisa en administración si falta ACF.
function dipe_core_acf_required_notice() {
	if ( function_exists( 'acf_add_local_field_group' ) || ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	echo '<div class="notice notice-warning"><p>' . esc_html__( 'Dipe Core necesita ACF Pro activo para mostrar los campos de Proyectos, Entradas, Servicios relacionados y Equipo DIPE.', 'dipe-core' ) . '</p></div>';
}
add_action( 'admin_notices', 'dipe_core_acf_required_notice' );

// Prepara el contenido y las reglas de URL al activar el plugin.
function dipe_core_activate() {
	dipe_core_configure_blog_urls();
	dipe_core_register_content_types();
	dipe_core_seed_project_terms();
	dipe_core_ensure_blog_page();
	flush_rewrite_rules();
	update_option( 'dipe_core_rewrite_version', DIPE_CORE_REWRITE_VERSION );
}
register_activation_hook( __FILE__, 'dipe_core_activate' );
register_deactivation_hook( __FILE__, 'flush_rewrite_rules' );
