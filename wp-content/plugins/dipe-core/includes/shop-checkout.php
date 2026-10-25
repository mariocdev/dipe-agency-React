<?php
/** Checkout nativo, configuración reversible y aceptación explícita de políticas. */
defined( 'ABSPATH' ) || exit;

function dipe_shop_classic_checkout_enabled() {
	return function_exists( 'wc_get_page_id' ) && has_shortcode( (string) get_post_field( 'post_content', wc_get_page_id( 'checkout' ) ), 'woocommerce_checkout' );
}

function dipe_shop_checkout_policy_urls() {
	return array( home_url( '/politica-de-privacidad/' ), home_url( '/politica-de-devoluciones-y-envio/' ) );
}

// Sustituye exclusivamente el bloque de compra; conserva el resto de la página.
function dipe_shop_checkout_classic_blocks( $blocks ) {
	foreach ( $blocks as &$block ) {
		if ( 'woocommerce/checkout' === $block['blockName'] ) {
			$block = array( 'blockName' => 'core/shortcode', 'attrs' => array(), 'innerBlocks' => array(), 'innerHTML' => '[woocommerce_checkout]', 'innerContent' => array( '[woocommerce_checkout]' ) );
		} elseif ( ! empty( $block['innerBlocks'] ) ) {
			$block['innerBlocks'] = dipe_shop_checkout_classic_blocks( $block['innerBlocks'] );
		}
	}
	return $blocks;
}

function dipe_shop_checkout_admin_menu() {
	if ( function_exists( 'WC' ) ) add_management_page( 'Checkout Dipe', 'Checkout Dipe', 'manage_woocommerce', 'dipe-shop-checkout', 'dipe_shop_checkout_admin_page' );
}
add_action( 'admin_menu', 'dipe_shop_checkout_admin_menu' );

function dipe_shop_checkout_admin_page() {
	if ( ! current_user_can( 'manage_woocommerce' ) ) return;
	$page_id = wc_get_page_id( 'checkout' );
	$content = $page_id > 0 ? (string) get_post_field( 'post_content', $page_id ) : '';
	echo '<div class="wrap"><h1>Checkout Dipe</h1>';
	if ($page_id > 0) {
		$checkout_url = wc_get_checkout_url();
		$edit_url = get_edit_post_link($page_id, 'raw');
		echo '<p>La página de finalizar compra se puede editar en WordPress. Conserva <code>[woocommerce_checkout]</code> para estas dos presentaciones; puedes añadir contenido antes o después. La distribución interna del formulario y los pasos se controlan en el proyecto.</p><p>';
		if ($edit_url) echo '<a class="button" href="' . esc_url($edit_url) . '">Editar página en WordPress</a> ';
		if (dipe_shop_classic_checkout_enabled()) {
			echo '<a class="button" href="' . esc_url($checkout_url) . '">Ver selector</a> <a class="button" href="' . esc_url(add_query_arg('vista_checkout', 'normal', $checkout_url)) . '">Probar checkout normal</a> <a class="button" href="' . esc_url(add_query_arg('vista_checkout', 'pasos', $checkout_url)) . '">Probar checkout por pasos</a>';
		} else {
			echo 'Para probar las dos presentaciones, aplica primero el formulario clásico con el botón inferior.';
		}
		echo '</p>';
	}
	echo '<p>El diseño Dipe usa el formulario clásico de WooCommerce: etiquetas externas, resumen y métodos de pago a la derecha y aceptación obligatoria de ambas políticas.</p>';
	echo '<p>La conversión sustituye solo el bloque de finalizar compra de la página asignada. Conserva una copia del contenido original y no cambia envíos, impuestos, pasarelas ni pedidos.</p>';
	if ( isset( $_GET['updated'] ) ) echo '<div class="notice notice-success"><p>Configuración guardada. Revisa el checkout en la web.</p></div>';
	if ( has_block( 'woocommerce/checkout', $content ) && ! has_shortcode( $content, 'woocommerce_checkout' ) ) {
		echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '"><input type="hidden" name="action" value="dipe_shop_checkout_setup"><input type="hidden" name="operation" value="apply">';
		wp_nonce_field( 'dipe_shop_checkout_setup' );
		submit_button( 'Aplicar diseño de checkout Dipe' );
		echo '</form>';
	} elseif ( dipe_shop_classic_checkout_enabled() ) {
		echo '<p><strong>Formulario clásico activo.</strong> Con los assets y el PHP del tema actualizados, el cliente puede elegir checkout normal o por pasos al entrar. Ambas presentaciones usan un único formulario nativo, la misma sesión y las pasarelas instaladas.</p>';
	} else {
		echo '<p>No se ha encontrado un bloque de compra estándar. Revisa la página asignada en WooCommerce y su contenido; no se modifica automáticamente.</p>';
	}
	$backup = get_post_meta( $page_id, '_dipe_checkout_content_backup', true );
	if ( is_array( $backup ) && isset( $backup['applied'], $backup['original'] ) && $backup['applied'] === $content ) {
		echo '<hr><p>Puedes recuperar el contenido anterior mientras no hayas editado la página tras la conversión.</p><form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '"><input type="hidden" name="action" value="dipe_shop_checkout_setup"><input type="hidden" name="operation" value="restore">';
		wp_nonce_field( 'dipe_shop_checkout_setup' );
		submit_button( 'Restaurar contenido anterior', 'secondary' );
		echo '</form>';
	}
	echo '</div>';
}

function dipe_shop_checkout_setup() {
	if ( ! current_user_can( 'manage_woocommerce' ) || ! function_exists( 'WC' ) ) wp_die( 'No tienes permisos para configurar la compra.' );
	check_admin_referer( 'dipe_shop_checkout_setup' );
	$page_id = wc_get_page_id( 'checkout' );
	if ( $page_id <= 0 || ! current_user_can( 'edit_post', $page_id ) ) wp_die( 'No hay una página de compra editable asignada.' );
	$content = (string) get_post_field( 'post_content', $page_id );
	$operation = isset( $_POST['operation'] ) ? sanitize_key( wp_unslash( $_POST['operation'] ) ) : '';
	if ( 'apply' === $operation && has_block( 'woocommerce/checkout', $content ) && ! has_shortcode( $content, 'woocommerce_checkout' ) ) {
		$next = serialize_blocks( dipe_shop_checkout_classic_blocks( parse_blocks( $content ) ) );
		// El respaldo se escribe antes que la página; nunca se sustituye una copia anterior.
		$backup = get_post_meta( $page_id, '_dipe_checkout_content_backup', true );
		if ( ! is_array( $backup ) ) {
			if ( ! add_post_meta( $page_id, '_dipe_checkout_content_backup', wp_slash( array( 'original' => $content, 'applied' => $next ) ), true ) ) wp_die( 'No se ha podido guardar la copia del contenido. No se ha modificado la página.' );
		} elseif ( ! isset( $backup['original'], $backup['applied'] ) || $backup['applied'] !== $next ) {
			wp_die( 'Ya hay una copia de una conversión distinta. Revisa el contenido antes de aplicar otra.' );
		}
	} elseif ( 'restore' === $operation ) {
		$backup = get_post_meta( $page_id, '_dipe_checkout_content_backup', true );
		if ( ! is_array( $backup ) || ! isset( $backup['applied'], $backup['original'] ) || $backup['applied'] !== $content ) wp_die( 'La página ha cambiado. No se sobrescribe su contenido.' );
		$next = $backup['original'];
	} else {
		wp_die( 'La página ya está configurada o no contiene el bloque esperado.' );
	}
	$result = wp_update_post( wp_slash( array( 'ID' => $page_id, 'post_content' => $next ) ), true );
	if ( is_wp_error( $result ) ) wp_die( esc_html( $result->get_error_message() ) );
	if ( 'restore' === $operation ) delete_post_meta( $page_id, '_dipe_checkout_content_backup' );
	wp_safe_redirect( admin_url( 'tools.php?page=dipe-shop-checkout&updated=1' ) );
	exit;
}
add_action( 'admin_post_dipe_shop_checkout_setup', 'dipe_shop_checkout_setup' );

// La casilla propia conserva los identificadores nativos para los refrescos AJAX.
add_filter( 'woocommerce_checkout_show_terms', function ( $show ) { return dipe_shop_classic_checkout_enabled() ? false : $show; } );

function dipe_shop_checkout_policy_checkbox() {
	if ( ! dipe_shop_classic_checkout_enabled() ) return;
	$urls = dipe_shop_checkout_policy_urls();
	echo '<p class="form-row validate-required dipe-checkout-policies"><label class="woocommerce-form__label woocommerce-form__label-for-checkbox checkbox" for="terms"><input type="checkbox" class="woocommerce-form__input woocommerce-form__input-checkbox input-checkbox" name="terms" id="terms" value="1" required aria-required="true"><span>He leído y acepto la <a href="' . esc_url( $urls[0] ) . '" target="_blank" rel="noopener noreferrer">política de privacidad</a> y la <a href="' . esc_url( $urls[1] ) . '" target="_blank" rel="noopener noreferrer">política de devoluciones y envío</a>.&nbsp;<span class="required" aria-hidden="true">*</span></span></label><input type="hidden" name="terms-field" value="1"></p>';
}
add_action( 'woocommerce_review_order_before_submit', 'dipe_shop_checkout_policy_checkbox' );

function dipe_shop_checkout_native_consent() {
	// WooCommerce comprueba su nonce antes de validar o crear el pedido.
	return isset( $_POST['terms'] ) && is_string( $_POST['terms'] ) && '1' === wp_unslash( $_POST['terms'] );
}

function dipe_shop_checkout_validate_policies( $data, $errors ) {
	if ( ! dipe_shop_classic_checkout_enabled() || ! empty( $data['woocommerce_checkout_update_totals'] ) ) return;
	if ( ! dipe_shop_checkout_native_consent() ) {
		$errors->remove( 'terms' );
		$errors->add( 'dipe_policies_required', 'Debes aceptar la política de privacidad y la política de devoluciones y envío para realizar el pedido.', array( 'id' => 'terms' ) );
	}
}
add_action( 'woocommerce_after_checkout_validation', 'dipe_shop_checkout_validate_policies', 10, 2 );

function dipe_shop_checkout_record_policies( $order ) {
	$order->update_meta_data( '_dipe_policies_accepted_at', gmdate( 'c' ) );
	$order->update_meta_data( '_dipe_policies_accepted_urls', dipe_shop_checkout_policy_urls() );
}
add_action( 'woocommerce_checkout_create_order', function ( $order ) {
	if ( dipe_shop_classic_checkout_enabled() && dipe_shop_checkout_native_consent() ) dipe_shop_checkout_record_policies( $order );
} );

// Un POST directo a Store API tampoco puede omitir la aceptación al usar este checkout.
add_filter( 'rest_request_before_callbacks', function ( $response, $handler, $request ) {
	if ( null !== $response || ! dipe_shop_classic_checkout_enabled() || 'POST' !== $request->get_method() || ! preg_match( '#^/wc/store/v[0-9]+/checkout/?$#', $request->get_route() ) ) return $response;
	if ( ! in_array( $request->get_param( 'terms' ), array( true, 1, '1' ), true ) ) return new WP_Error( 'dipe_policies_required', 'Debes aceptar la política de privacidad y la política de devoluciones y envío para realizar el pedido.', array( 'status' => 400 ) );
	return $response;
}, 10, 3 );

add_action( 'woocommerce_store_api_checkout_update_order_from_request', function ( $order, $request ) {
	if ( dipe_shop_classic_checkout_enabled() && 'POST' === $request->get_method() && in_array( $request->get_param( 'terms' ), array( true, 1, '1' ), true ) ) dipe_shop_checkout_record_policies( $order );
}, 10, 2 );

// Se filtra después de la caché de paquetes y antes de elegir tarifa/calcular totales.
// WooCommerce decide la disponibilidad según zona, mínimo y cupón configurados.
function dipe_shop_only_available_free_shipping( $packages ) {
  foreach ( $packages as &$package ) {
    if ( empty( $package['rates'] ) || ! is_array( $package['rates'] ) ) continue;
    $free = array();
    foreach ( $package['rates'] as $rate_id => $rate ) {
      if ( $rate instanceof WC_Shipping_Rate && 'free_shipping' === $rate->get_method_id() ) {
        $free[ $rate_id ] = $rate;
      }
    }
    if ( $free ) $package['rates'] = $free;
  }
  unset( $package );
  return $packages;
}
add_filter( 'woocommerce_shipping_packages', 'dipe_shop_only_available_free_shipping', 100 );
