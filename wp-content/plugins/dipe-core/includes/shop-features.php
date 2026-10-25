<?php
/** Favoritos privados y preguntas públicas de productos, sin plugins adicionales. */
defined( 'ABSPATH' ) || exit;
require_once __DIR__ . '/shop-form-security.php';

/** Las preguntas se almacenan aparte de las reseñas y no afectan a sus medias. */
function dipe_core_register_product_questions() {
	register_post_type( 'dipe_product_qa', array(
		'labels' => array( 'name' => 'Preguntas de productos', 'singular_name' => 'Pregunta de producto' ),
		'public' => false, 'show_ui' => false, 'show_in_rest' => false,
		'exclude_from_search' => true, 'rewrite' => false, 'query_var' => false,
		'supports' => array( 'title', 'editor', 'author' ),
	) );
}
add_action( 'init', 'dipe_core_register_product_questions' );

function dipe_core_shop_public_product( $id ) {
	if ( ! absint( $id ) || ! function_exists( 'wc_get_product' ) ) {
		return null;
	}
	$product = wc_get_product( absint( $id ) );
	if ( $product && $product->is_type( 'variation' ) ) {
		$product = wc_get_product( $product->get_parent_id() );
	}
	if ( ! $product || 'publish' !== $product->get_status() || ! $product->is_publicly_viewable() || get_post_field( 'post_password', $product->get_id() ) ) {
		return null;
	}
	return $product;
}

function dipe_core_shop_customer_permission() {
	return is_user_logged_in() ? true : new WP_Error( 'dipe_shop_login', 'Accede a tu cuenta para continuar.', array( 'status' => 401 ) );
}

function dipe_core_shop_private_response( $data ) {
	$response = rest_ensure_response( $data );
	$response->header( 'Cache-Control', 'private, no-store, max-age=0' );
	return $response;
}

function dipe_core_shop_valid_favorites( $ids ) {
	$valid = array();
	foreach ( array_slice( array_unique( array_map( 'absint', (array) $ids ) ), 0, 100 ) as $id ) {
		$product = dipe_core_shop_public_product( $id );
		if ( $product ) {
			$valid[] = $product->get_id();
		}
	}
	return array_values( array_unique( $valid ) );
}

function dipe_core_shop_get_favorites() {
	return dipe_core_shop_private_response( array( 'ids' => dipe_core_shop_valid_favorites( get_user_meta( get_current_user_id(), '_dipe_shop_favorites', true ) ) ) );
}

/** Mutación individual o unión de favoritos de invitado, siempre del usuario actual. */
function dipe_core_shop_save_favorites( WP_REST_Request $request ) {
	$user_id = get_current_user_id();
	$lock = 'dipe_shop_favorites_lock_' . $user_id;
	$locked_at = (int) get_option( $lock );
	if ( $locked_at && $locked_at < time() - 30 ) {
		delete_option( $lock );
	}
	if ( ! add_option( $lock, time(), '', false ) ) {
		return new WP_Error( 'dipe_shop_busy', 'Tu lista se está actualizando. Vuelve a intentarlo.', array( 'status' => 409 ) );
	}
	try {
		$current = dipe_core_shop_valid_favorites( get_user_meta( $user_id, '_dipe_shop_favorites', true ) );
		if ( $request->get_param( 'product_id' ) ) {
			$product = dipe_core_shop_public_product( $request['product_id'] );
			if ( ! $product ) {
				return new WP_Error( 'dipe_shop_product', 'Este producto no está disponible.', array( 'status' => 404 ) );
			}
			$id = $product->get_id();
			$ids = array_values( array_diff( $current, array( $id ) ) );
			if ( $request['saved'] ) {
				if ( ! in_array( $id, $current, true ) && count( $current ) >= 100 ) {
					return new WP_Error( 'dipe_shop_limit', 'Puedes guardar hasta 100 productos en tu lista.', array( 'status' => 400 ) );
				}
				$ids[] = $id;
			}
		} else {
			$ids = array_slice( array_values( array_unique( array_merge( $current, dipe_core_shop_valid_favorites( $request['product_ids'] ) ) ) ), 0, 100 );
		}
		update_user_meta( $user_id, '_dipe_shop_favorites', $ids );
		if ( $ids !== array_values( (array) get_user_meta( $user_id, '_dipe_shop_favorites', true ) ) ) {
			return new WP_Error( 'dipe_shop_save', 'No se ha podido guardar tu lista.', array( 'status' => 500 ) );
		}
		return dipe_core_shop_private_response( array( 'ids' => $ids ) );
	} finally {
		delete_option( $lock );
	}
}

/** Solo preguntas publicadas; no devuelve correos ni identidades administrativas. */
function dipe_core_shop_get_questions( WP_REST_Request $request ) {
	$product = dipe_core_shop_public_product( $request['product_id'] );
	if ( ! $product || $product->get_id() !== (int) $request['product_id'] ) {
		return new WP_Error( 'dipe_shop_product', 'Este producto no está disponible.', array( 'status' => 404 ) );
	}
	$query = new WP_Query( array(
		'post_type' => 'dipe_product_qa', 'post_status' => 'publish', 'post_parent' => $product->get_id(),
		'posts_per_page' => 10, 'paged' => $request['page'], 'orderby' => 'date', 'order' => 'DESC',
	) );
	$items = array();
	foreach ( $query->posts as $question ) {
		$user = get_userdata( $question->post_author );
		$items[] = array(
			'id' => (int) $question->ID, 'question' => $question->post_content,
			'author' => $user ? wp_strip_all_tags( $user->display_name, true ) : ( $question->post_author ? 'Usuario' : 'Invitado' ),
			'date' => get_post_time( 'c', true, $question ),
			'answer' => (string) get_post_meta( $question->ID, '_dipe_product_answer', true ),
		);
	}
	return rest_ensure_response( array( 'items' => $items, 'total' => (int) $query->found_posts, 'pages' => max( 1, (int) $query->max_num_pages ) ) );
}

function dipe_core_shop_create_question( WP_REST_Request $request ) {
	$product = dipe_core_shop_public_product( $request['product_id'] );
	if ( ! $product || $product->get_id() !== (int) $request['product_id'] ) {
		return new WP_Error( 'dipe_shop_product', 'Este producto no está disponible.', array( 'status' => 404 ) );
	}
	$text = trim( sanitize_textarea_field( $request['question'] ) );
	if ( strlen( $text ) < 10 || '' === $text ) {
		return new WP_Error( 'dipe_shop_question', 'Escribe una pregunta de al menos 10 caracteres.', array( 'status' => 400 ) );
	}
	$user_id = get_current_user_id();
	$publish = true === dipe_core_shop_review_permission( $product->get_id() );
	$reservation = dipe_core_shop_form_reserve( 'question', $product->get_id(), $request['privacy'], $request['website'], $request['form_token'], $text );
	if ( is_wp_error( $reservation ) ) return $reservation;
	try {
		$id = wp_insert_post( wp_slash( array(
			'post_type' => 'dipe_product_qa', 'post_status' => $publish ? 'publish' : 'pending', 'post_parent' => $product->get_id(),
			'post_author' => $user_id, 'post_title' => wp_html_excerpt( $text, 80, '…' ), 'post_content' => $text,
			'meta_input' => dipe_core_shop_privacy_meta(),
		) ), true );
		if ( is_wp_error( $id ) || ! $id ) {
			return new WP_Error( 'dipe_shop_question_save', 'No se ha podido guardar la pregunta.', array( 'status' => 500 ) );
		}
		dipe_core_shop_form_commit( $reservation );
		$message = $publish ? 'Tu pregunta ya está publicada. La tienda podrá responderte aquí.' : ( $user_id ? 'Pregunta recibida. Se publicará con tu nombre de perfil cuando la tienda la apruebe.' : 'Pregunta recibida. Se publicará como Invitado cuando la tienda la apruebe.' );
		return dipe_core_shop_private_response( array( 'published' => $publish, 'message' => $message ) );
	} finally {
		dipe_core_shop_form_release( $reservation );
	}
}

function dipe_core_shop_feature_routes() {
	register_rest_route( 'dipe/v1', '/shop/wishlist', array(
		array( 'methods' => 'GET', 'callback' => 'dipe_core_shop_get_favorites', 'permission_callback' => 'dipe_core_shop_customer_permission' ),
		array( 'methods' => 'POST', 'callback' => 'dipe_core_shop_save_favorites', 'permission_callback' => 'dipe_core_shop_customer_permission', 'args' => array(
			'product_ids' => array( 'type' => 'array', 'required' => true, 'maxItems' => 100, 'items' => array( 'type' => 'integer', 'minimum' => 1 ) ),
		) ),
	) );
	register_rest_route( 'dipe/v1', '/shop/wishlist/(?P<product_id>\d+)', array(
		'methods' => 'POST', 'callback' => 'dipe_core_shop_save_favorites', 'permission_callback' => 'dipe_core_shop_customer_permission',
		'args' => array( 'product_id' => array( 'type' => 'integer', 'minimum' => 1 ), 'saved' => array( 'type' => 'boolean', 'required' => true ) ),
	) );
	register_rest_route( 'dipe/v1', '/shop/products/(?P<product_id>\d+)/questions', array(
		array( 'methods' => 'GET', 'callback' => 'dipe_core_shop_get_questions', 'permission_callback' => '__return_true', 'args' => array(
			'product_id' => array( 'type' => 'integer', 'minimum' => 1 ), 'page' => array( 'type' => 'integer', 'minimum' => 1, 'default' => 1 ),
		) ),
		array( 'methods' => 'POST', 'callback' => 'dipe_core_shop_create_question', 'permission_callback' => 'dipe_core_shop_form_origin_permission', 'args' => array(
			'product_id' => array( 'type' => 'integer', 'minimum' => 1 ),
			'question' => array( 'type' => 'string', 'required' => true, 'minLength' => 10, 'maxLength' => 2000, 'sanitize_callback' => 'sanitize_textarea_field' ),
			'privacy' => array( 'type' => 'boolean', 'required' => true ),
			'website' => array( 'type' => 'string', 'default' => '', 'maxLength' => 200 ),
			'form_token' => array( 'type' => 'string', 'required' => true, 'maxLength' => 128 ),
		) ),
	) );
}
add_action( 'rest_api_init', 'dipe_core_shop_feature_routes' );

function dipe_core_shop_account_favorites_link( $items ) {
	$result = array();
	foreach ( $items as $key => $label ) {
		if ( 'customer-logout' === $key ) {
			$result['dipe-wishlist'] = 'Lista de deseos';
		}
		$result[ $key ] = $label;
	}
	if ( ! isset( $result['dipe-wishlist'] ) ) {
		$result['dipe-wishlist'] = 'Lista de deseos';
	}
	return $result;
}
add_filter( 'woocommerce_account_menu_items', 'dipe_core_shop_account_favorites_link' );

function dipe_core_shop_account_favorites_url( $url, $endpoint ) {
	return 'dipe-wishlist' === $endpoint ? add_query_arg( 'favoritos', '1', wc_get_page_permalink( 'shop' ) ) : $url;
}
add_filter( 'woocommerce_get_endpoint_url', 'dipe_core_shop_account_favorites_url', 10, 2 );

