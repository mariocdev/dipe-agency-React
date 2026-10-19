<?php
/** Blog detail: two ACF fields and navigation between published posts. */

defined( 'ABSPATH' ) || exit;

// Define el medio del banner y el subtítulo de las entradas.
function dipe_core_register_blog_fields() {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}
	acf_add_local_field_group(
		array(
			'key' => 'group_dipe_post_banner',
			'title' => __( 'Cabecera de la entrada', 'dipe-core' ),
			'fields' => array(
				array(
					'key' => 'field_dipe_post_banner_media',
					'label' => __( 'Imagen o vídeo del banner', 'dipe-core' ),
					'name' => 'dipe_post_banner_media',
					'type' => 'file',
					'return_format' => 'array',
					'mime_types' => 'jpg,jpeg,png,gif,webp,avif,mp4,webm',
					'required' => 0,
					'instructions' => __( 'Archivo de la cabecera. Si se deja vacío, se usa la imagen destacada nativa si existe. El vídeo se muestra con controles, sin reproducción automática.', 'dipe-core' ),
				),
				array(
					'key' => 'field_dipe_post_subtitle',
					'label' => __( 'Subtítulo', 'dipe-core' ),
					'name' => 'dipe_post_subtitle',
					'type' => 'textarea',
					'rows' => 3,
					'new_lines' => '',
					'required' => 0,
					'instructions' => __( 'Texto breve bajo el título, sin HTML. El cuerpo y sus encabezados se escriben en el editor nativo.', 'dipe-core' ),
				),
			),
			'location' => array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'post' ) ) ),
			'show_in_rest' => 1,
		)
	);
}
add_action( 'acf/init', 'dipe_core_register_blog_fields' );

// Devuelve las entradas contiguas publicadas y sin contraseña.
function dipe_core_blog_navigation( $request ) {
	$item = get_post( absint( $request['id'] ) );
	if ( ! $item || 'post' !== $item->post_type || 'publish' !== $item->post_status || post_password_required( $item ) ) {
		return new WP_Error( 'dipe_post_not_found', __( 'Entrada no encontrada.', 'dipe-core' ), array( 'status' => 404 ) );
	}
	$original_post = $GLOBALS['post'] ?? null;
	$GLOBALS['post'] = $item;
	try {
		$adjacent = array( 'previous' => get_previous_post(), 'next' => get_next_post() );
	} finally {
		if ( null === $original_post ) {
			unset( $GLOBALS['post'] );
		} else {
			$GLOBALS['post'] = $original_post;
		}
	}
	$result = array( 'previous' => null, 'next' => null );
	foreach ( $adjacent as $direction => $post ) {
		if ( $post instanceof WP_Post && 'publish' === $post->post_status && ! $post->post_password ) {
			$result[ $direction ] = array( 'id' => (int) $post->ID, 'title' => get_the_title( $post ), 'url' => get_permalink( $post ) );
		}
	}
	return rest_ensure_response( $result );
}

// Registra la ruta REST de navegación entre entradas.
function dipe_core_register_blog_routes() {
	register_rest_route(
		'dipe/v1',
		'/posts/(?P<id>\d+)/navigation',
		array(
			'methods' => WP_REST_Server::READABLE,
			'permission_callback' => '__return_true',
			'callback' => 'dipe_core_blog_navigation',
			'args' => array( 'id' => array( 'type' => 'integer', 'minimum' => 1, 'sanitize_callback' => 'absint' ) ),
		)
	);
}
add_action( 'rest_api_init', 'dipe_core_register_blog_routes' );
