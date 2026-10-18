<?php
/** Services shared by blog posts and projects; destinations are native pages. */

defined( 'ABSPATH' ) || exit;

function dipe_core_register_related_services() {
	register_taxonomy(
		'dipe_related_service',
		array( 'post', 'dipe_proyecto' ),
		array(
			'labels' => array(
				'name' => __( 'Servicios relacionados', 'dipe-core' ),
				'singular_name' => __( 'Servicio relacionado', 'dipe-core' ),
				'add_new_item' => __( 'Añadir servicio relacionado', 'dipe-core' ),
				'edit_item' => __( 'Editar servicio relacionado', 'dipe-core' ),
				'search_items' => __( 'Buscar servicios relacionados', 'dipe-core' ),
			),
			'public' => false,
			'publicly_queryable' => false,
			'hierarchical' => false,
			'show_ui' => true,
			'show_admin_column' => true,
			'show_in_rest' => true,
			'show_in_nav_menus' => false,
			'rest_base' => 'dipe-related-services',
			'rewrite' => false,
			'query_var' => false,
		)
	);
}
add_action( 'init', 'dipe_core_register_related_services', 11 );

function dipe_core_related_service_page_url( $term_id ) {
	$page_id = absint( get_term_meta( $term_id, 'dipe_service_page', true ) );
	if ( ! $page_id || 'page' !== get_post_type( $page_id ) || 'publish' !== get_post_status( $page_id ) ) {
		return '';
	}
	return get_permalink( $page_id );
}

function dipe_core_related_service_term_link( $url, $term, $taxonomy ) {
	if ( 'dipe_related_service' !== $taxonomy ) {
		return $url;
	}
	return dipe_core_related_service_page_url( $term->term_id ) ?: $url;
}
add_filter( 'term_link', 'dipe_core_related_service_term_link', 10, 3 );

function dipe_core_register_related_service_fields() {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}
	acf_add_local_field_group(
		array(
			'key' => 'group_dipe_related_service',
			'title' => __( 'Destino del servicio relacionado', 'dipe-core' ),
			'fields' => array(
				array(
					'key' => 'field_dipe_service_page',
					'label' => __( 'Página del servicio', 'dipe-core' ),
					'name' => 'dipe_service_page',
					'type' => 'post_object',
					'post_type' => array( 'page' ),
					'return_format' => 'id',
					'required' => 1,
					'allow_null' => 0,
					'multiple' => 0,
					'ui' => 1,
					'instructions' => __( 'Elige la página nativa del servicio. El enlace se mostrará cuando esa página esté publicada. No se crea un archivo de taxonomía.', 'dipe-core' ),
				),
				array(
					'key' => 'field_dipe_service_image',
					'label' => __( 'Imagen del servicio', 'dipe-core' ),
					'name' => 'dipe_service_image',
					'type' => 'image',
					'return_format' => 'array',
					'preview_size' => 'medium',
					'required' => 0,
					'instructions' => __( 'Imagen opcional de la tarjeta, compartida por entradas y proyectos.', 'dipe-core' ),
				),
			),
			'location' => array( array( array( 'param' => 'taxonomy', 'operator' => '==', 'value' => 'dipe_related_service' ) ) ),
			'show_in_rest' => 0,
		)
	);
}
add_action( 'acf/init', 'dipe_core_register_related_service_fields' );

function dipe_core_related_services_for_rest( $object ) {
	$terms = get_the_terms( absint( $object['id'] ), 'dipe_related_service' );
	if ( ! $terms || is_wp_error( $terms ) ) {
		return array();
	}
	$services = array();
	foreach ( wp_list_sort( $terms, 'name', 'ASC' ) as $term ) {
		$url = dipe_core_related_service_page_url( $term->term_id );
		if ( ! $url ) {
			continue;
		}
		$image_id = absint( get_term_meta( $term->term_id, 'dipe_service_image', true ) );
		$image_url = $image_id && wp_attachment_is_image( $image_id ) ? wp_get_attachment_image_url( $image_id, 'large' ) : false;
		$services[] = array(
			'id' => (int) $term->term_id,
			'name' => $term->name,
			'url' => $url,
			'image' => $image_url ? array( 'url' => $image_url, 'alt' => (string) get_post_meta( $image_id, '_wp_attachment_image_alt', true ) ) : null,
		);
	}
	return $services;
}

function dipe_core_register_related_services_rest() {
	register_rest_field(
		array( 'post', 'dipe_proyecto' ),
		'dipe_related_services',
		array(
			'get_callback' => 'dipe_core_related_services_for_rest',
			'schema' => array(
				'type' => 'array',
				'items' => array( 'type' => 'object' ),
				'context' => array( 'view', 'edit' ),
				'readonly' => true,
			),
		)
	);
}
add_action( 'rest_api_init', 'dipe_core_register_related_services_rest' );
