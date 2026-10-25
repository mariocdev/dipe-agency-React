<?php
/** Privacidad y protección de los formularios públicos de preguntas y opiniones. */
defined( 'ABSPATH' ) || exit;

function dipe_core_shop_form_origin_permission() {
	$site = wp_parse_url( home_url( '/' ) );
	foreach ( array( 'HTTP_ORIGIN', 'HTTP_REFERER' ) as $header ) {
		if ( empty( $_SERVER[ $header ] ) ) continue;
		$origin = wp_parse_url( wp_unslash( $_SERVER[ $header ] ) );
		$port = static function ( $parts ) { return (int) ( $parts['port'] ?? ( 'https' === ( $parts['scheme'] ?? '' ) ? 443 : 80 ) ); };
		if ( ! is_array( $origin ) || strtolower( $origin['host'] ?? '' ) !== strtolower( $site['host'] ?? '' ) || ( $origin['scheme'] ?? '' ) !== ( $site['scheme'] ?? '' ) || $port( $origin ) !== $port( $site ) ) return new WP_Error( 'dipe_shop_origin', 'Abre el formulario desde esta web para enviarlo.', array( 'status' => 403 ) );
	}
	return true;
}

function dipe_core_shop_form_identity() {
	if ( is_user_logged_in() ) return 'user_' . get_current_user_id();
	// No guarda la IP ni confía en cabeceras de proxy enviadas por el visitante.
	$ip = isset( $_SERVER['REMOTE_ADDR'] ) && is_string( $_SERVER['REMOTE_ADDR'] ) ? $_SERVER['REMOTE_ADDR'] : '';
	return 'guest_' . hash_hmac( 'sha256', $ip, wp_salt( 'nonce' ) );
}

function dipe_core_shop_form_signature( $purpose, $product_id, $issued, $random ) {
	$session = is_user_logged_in() ? wp_get_session_token() : '';
	return hash_hmac( 'sha256', implode( '|', array( $purpose, $product_id, dipe_core_shop_form_identity(), $session, $issued, $random ) ), wp_salt( 'nonce' ) );
}

function dipe_core_shop_form_token( $purpose, $product_id ) {
	$issued = time();
	$random = wp_generate_password( 24, false, false );
	return $issued . ':' . $random . ':' . dipe_core_shop_form_signature( $purpose, $product_id, $issued, $random );
}

function dipe_core_shop_review_permission( $product_id ) {
	if ( ! is_user_logged_in() ) return new WP_Error( 'dipe_shop_review_login', 'Accede a tu cuenta para valorar un producto que hayas comprado.', array( 'status' => 403 ) );
	if ( ! function_exists( 'wc_customer_bought_product' ) || ! wc_customer_bought_product( '', get_current_user_id(), $product_id ) ) return new WP_Error( 'dipe_shop_review_purchase', 'Solo puedes valorar productos que hayas comprado con tu cuenta.', array( 'status' => 403 ) );
	return true;
}

/** Reserva atómica por usuario/IP; las dos vías comparten las mismas reglas. */
function dipe_core_shop_form_reserve( $purpose, $product_id, $privacy, $website, $token, $text ) {
	$origin = dipe_core_shop_form_origin_permission();
	if ( is_wp_error( $origin ) ) return $origin;
	if ( ! in_array( $privacy, array( true, 1, '1' ), true ) ) return new WP_Error( 'dipe_shop_privacy', 'Debes aceptar la política de privacidad para enviar el formulario.', array( 'status' => 400 ) );
	if ( ! is_string( $website ) || '' !== trim( $website ) ) return new WP_Error( 'dipe_shop_form_invalid', 'No se ha podido validar el formulario.', array( 'status' => 400 ) );
	if ( ! is_string( $token ) || ! preg_match( '/^(\d{10}):([a-zA-Z0-9]{24}):([a-f0-9]{64})$/D', $token, $parts ) ) return new WP_Error( 'dipe_shop_form_expired', 'Actualiza el formulario y vuelve a enviarlo.', array( 'status' => 403 ) );
	$issued = (int) $parts[1];
	if ( $issued > time() || time() - $issued > HOUR_IN_SECONDS || ! hash_equals( dipe_core_shop_form_signature( $purpose, $product_id, $issued, $parts[2] ), $parts[3] ) ) return new WP_Error( 'dipe_shop_form_expired', 'El formulario ha caducado. Actualízalo y vuelve a enviarlo.', array( 'status' => 403 ) );
	$identity = hash_hmac( 'sha256', dipe_core_shop_form_identity(), wp_salt( 'nonce' ) );
	$key = 'dipe_shop_form_' . $identity;
	$lock_key = $key . '_lock';
	$owner = wp_generate_password( 24, false, false );
	$existing = get_option( $lock_key );
	if ( is_array( $existing ) && (int) ( $existing['time'] ?? 0 ) < time() - 60 ) delete_option( $lock_key );
	if ( ! add_option( $lock_key, array( 'time' => time(), 'owner' => $owner ), '', false ) ) return new WP_Error( 'dipe_shop_form_busy', 'Hay un envío en curso. Espera un momento.', array( 'status' => 429 ) );
	$normalized = strtolower( preg_replace( '/\s+/u', ' ', trim( $text ) ) ?? '' );
	$duplicate = 'dipe_shop_duplicate_' . hash_hmac( 'sha256', $identity . '|' . $purpose . '|' . $product_id . '|' . $normalized, wp_salt( 'nonce' ) );
	$reservation = array( 'key' => $key, 'lock' => $lock_key, 'owner' => $owner, 'token' => hash( 'sha256', $token ), 'duplicate' => $duplicate );
	$GLOBALS['dipe_shop_form_reservations'][ $owner ] = $reservation;
	if ( get_transient( $duplicate ) ) {
		dipe_core_shop_form_release( $reservation );
		return new WP_Error( 'dipe_shop_form_duplicate', 'Ese mensaje ya se ha recibido para este producto.', array( 'status' => 409 ) );
	}
	$hour = get_transient( $key . '_hour' );
	if ( get_transient( $key . '_minute' ) || ( is_array( $hour ) && (int) $hour['count'] >= 10 ) || get_transient( 'dipe_shop_used_' . $reservation['token'] ) ) {
		dipe_core_shop_form_release( $reservation );
		return new WP_Error( 'dipe_shop_form_rate', 'Espera antes de volver a enviar. Se permite un envío por minuto y un máximo de diez por hora.', array( 'status' => 429 ) );
	}
	return $reservation;
}

function dipe_core_shop_form_release( $reservation ) {
	$existing = get_option( $reservation['lock'] );
	if ( is_array( $existing ) && ( $existing['owner'] ?? '' ) === $reservation['owner'] ) delete_option( $reservation['lock'] );
	unset( $GLOBALS['dipe_shop_form_reservations'][ $reservation['owner'] ] );
}

function dipe_core_shop_form_commit( $reservation ) {
	$key = $reservation['key'];
	$hour = get_transient( $key . '_hour' );
	if ( ! is_array( $hour ) ) $hour = array( 'count' => 0, 'until' => time() + HOUR_IN_SECONDS );
	$hour['count'] = (int) $hour['count'] + 1;
	set_transient( $key . '_hour', $hour, max( 1, $hour['until'] - time() ) );
	set_transient( $key . '_minute', 1, MINUTE_IN_SECONDS );
	set_transient( 'dipe_shop_used_' . $reservation['token'], 1, HOUR_IN_SECONDS );
	set_transient( $reservation['duplicate'], 1, DAY_IN_SECONDS );
}

function dipe_core_shop_privacy_meta() {
	return array( '_dipe_privacy_accepted_at' => gmdate( 'c' ), '_dipe_privacy_policy_url' => home_url( '/politica-de-privacidad/' ) );
}

add_action( 'shutdown', function () {
	foreach ( $GLOBALS['dipe_shop_form_reservations'] ?? array() as $reservation ) dipe_core_shop_form_release( $reservation );
} );

function dipe_core_shop_question_form( WP_REST_Request $request ) {
	$product = dipe_core_shop_public_product( $request['product_id'] );
	if ( ! $product || $product->get_id() !== (int) $request['product_id'] ) return new WP_Error( 'dipe_shop_product', 'Este producto no está disponible.', array( 'status' => 404 ) );
	return dipe_core_shop_private_response( array( 'token' => dipe_core_shop_form_token( 'question', $product->get_id() ), 'privacy_url' => home_url( '/politica-de-privacidad/' ), 'guest' => ! is_user_logged_in(), 'moderated' => true !== dipe_core_shop_review_permission( $product->get_id() ) ) );
}

add_action( 'rest_api_init', function () {
	register_rest_route( 'dipe/v1', '/shop/products/(?P<product_id>\d+)/question-form', array(
		'methods' => 'GET', 'callback' => 'dipe_core_shop_question_form', 'permission_callback' => 'dipe_core_shop_form_origin_permission',
		'args' => array( 'product_id' => array( 'type' => 'integer', 'minimum' => 1 ) ),
	) );
} );

// El formulario nativo mantiene estrellas y datos de WordPress, con campos propios.
add_filter( 'woocommerce_product_review_comment_form_args', function ( $args ) {
	$product_id = get_the_ID();
	$allowed = dipe_core_shop_review_permission( $product_id );
	if ( is_wp_error( $allowed ) ) {
		$args['comment_field'] = '<p>' . esc_html( $allowed->get_error_message() ) . ' <a href="' . esc_url( wc_get_page_permalink( 'myaccount' ) ) . '">Mi cuenta</a></p>';
		$args['fields'] = array();
		$args['submit_button'] = '';
		$args['submit_field'] = '';
		return $args;
	}
	$fields = new WP_HTML_Tag_Processor( $args['comment_field'] );
	while ( $fields->next_tag( 'TEXTAREA' ) ) {
		if ( 'comment' === $fields->get_attribute( 'name' ) ) { $fields->set_attribute( 'maxlength', '5000' ); break; }
	}
	$args['comment_field'] = $fields->get_updated_html();
	$args['comment_field'] .= '<p class="dipe-shop-form-privacy"><label><input type="checkbox" name="dipe_review_privacy" value="1" required aria-required="true"><span>He leído y acepto la <a href="' . esc_url( home_url( '/politica-de-privacidad/' ) ) . '" target="_blank" rel="noopener noreferrer">política de privacidad</a>.</span></label></p>';
	$args['comment_field'] .= '<p class="dipe-shop-form-trap" aria-hidden="true"><label>Sitio web<input type="text" name="dipe_review_website" value="" tabindex="-1" autocomplete="off"></label></p>';
	$args['comment_field'] .= '<input type="hidden" name="dipe_review_token" value="' . esc_attr( dipe_core_shop_form_token( 'review', $product_id ) ) . '"><input type="hidden" name="dipe_review_nonce" value="' . esc_attr( wp_create_nonce( 'dipe_shop_review_' . $product_id ) ) . '">';
	return $args;
}, 20 );

add_filter( 'preprocess_comment', function ( $data ) {
	$product_id = absint( $data['comment_post_ID'] ?? 0 );
	if ( 'product' !== get_post_type( $product_id ) ) return $data;
	// Responder desde el administrador mantiene sus nonces y permisos nativos.
	if ( ! empty( $data['comment_parent'] ) ) {
		$parent = get_comment( absint( $data['comment_parent'] ) );
		if ( is_admin() && $parent && (int) $parent->comment_post_ID === $product_id && current_user_can( 'moderate_comments' ) && current_user_can( 'edit_post', $product_id ) ) return $data;
		wp_die( 'Las respuestas a opiniones se gestionan desde la tienda.', 'No se ha enviado la opinión', array( 'response' => 403, 'back_link' => true ) );
	}
	// Un tipo de comentario manipulado tampoco evita el control de las opiniones.
	$data['comment_type'] = 'review';
	$data['comment_content'] = trim( sanitize_textarea_field( $data['comment_content'] ?? '' ) );
	$error = dipe_core_shop_review_permission( $product_id );
	$nonce = isset( $_POST['dipe_review_nonce'] ) && is_string( $_POST['dipe_review_nonce'] ) ? wp_unslash( $_POST['dipe_review_nonce'] ) : '';
	if ( ! is_wp_error( $error ) && ! wp_verify_nonce( $nonce, 'dipe_shop_review_' . $product_id ) ) $error = new WP_Error( 'dipe_shop_review_nonce', 'El formulario ha caducado. Recarga la ficha y vuelve a intentarlo.', array( 'status' => 403 ) );
	if ( ! is_wp_error( $error ) && ( strlen( $data['comment_content'] ) > 20000 || preg_match_all( '/./us', $data['comment_content'] ) > 5000 ) ) $error = new WP_Error( 'dipe_shop_review_length', 'La opinión no puede superar los 5000 caracteres.', array( 'status' => 400 ) );
	if ( ! is_wp_error( $error ) && wc_review_ratings_enabled() && ! in_array( $_POST['rating'] ?? '', array( '1', '2', '3', '4', '5' ), true ) ) $error = new WP_Error( 'dipe_shop_review_rating', 'Selecciona una valoración entre una y cinco estrellas.', array( 'status' => 400 ) );
	if ( ! is_wp_error( $error ) ) $error = dipe_core_shop_form_reserve( 'review', $product_id, $_POST['dipe_review_privacy'] ?? false, isset( $_POST['dipe_review_website'] ) && is_string( $_POST['dipe_review_website'] ) ? wp_unslash( $_POST['dipe_review_website'] ) : '', isset( $_POST['dipe_review_token'] ) && is_string( $_POST['dipe_review_token'] ) ? wp_unslash( $_POST['dipe_review_token'] ) : '', $data['comment_content'] );
	if ( is_wp_error( $error ) ) {
		$details = $error->get_error_data();
		wp_die( esc_html( $error->get_error_message() ), 'No se ha enviado la opinión', array( 'response' => $details['status'] ?? 400, 'back_link' => true ) );
	}
	$GLOBALS['dipe_shop_review_reservation'] = array( 'reservation' => $error, 'product_id' => $product_id, 'user_id' => get_current_user_id() );
	return $data;
}, 5 );

// Registra el envío al insertar, antes de que posibles avisos nativos retrasen la petición.
add_action( 'wp_insert_comment', function ( $id ) {
	$pending = $GLOBALS['dipe_shop_review_reservation'] ?? null;
	$comment = get_comment( $id );
	if ( ! $pending || ! $comment || (int) $comment->comment_post_ID !== $pending['product_id'] || (int) $comment->user_id !== $pending['user_id'] ) return;
	foreach ( dipe_core_shop_privacy_meta() as $key => $value ) add_comment_meta( $id, $key, $value, true );
	dipe_core_shop_form_commit( $pending['reservation'] );
	dipe_core_shop_form_release( $pending['reservation'] );
	unset( $GLOBALS['dipe_shop_review_reservation'] );
}, 30 );
