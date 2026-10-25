<?php
/** Contexto público de WooCommerce: WordPress decide las rutas reales. */
defined('ABSPATH') || exit;

function dipe_react_commerce_config()
{
	if (! function_exists('WC') || ! function_exists('is_shop')) {
		return array('enabled' => false);
	}

	$context = null;
	if (is_shop()) {
		$context = array('type' => 'shop', 'name' => 'Tienda');
	} elseif (is_cart()) {
		$context = array('type' => 'cart', 'name' => 'Tu carrito');
	} elseif (is_checkout()) {
		$context = array('type' => 'checkout', 'name' => is_order_received_page() ? 'Tu pedido' : 'Finalizar compra');
	} elseif (is_account_page()) {
		$context = array('type' => 'account', 'name' => 'Mi cuenta');
	} elseif (is_product()) {
		$context = array('type' => 'product', 'id' => get_queried_object_id(), 'slug' => get_post_field('post_name', get_queried_object_id()));
	} elseif (is_tax(array('product_cat', 'product_tag'))) {
		$term = get_queried_object();
		if ($term instanceof WP_Term) {
			$context = array(
				'type' => 'product_cat' === $term->taxonomy ? 'category' : 'tag',
				'id' => (int) $term->term_id, 'slug' => $term->slug,
				'name' => wp_strip_all_tags($term->name, true),
				'description' => wp_strip_all_tags(term_description($term->term_id, $term->taxonomy), true),
			);
		}
	}

	return array(
		'enabled' => true,
		'context' => $context,
		'shopUrl' => esc_url_raw(wc_get_page_permalink('shop')),
		'cartUrl' => esc_url_raw(wc_get_cart_url()),
		'checkoutUrl' => esc_url_raw(wc_get_checkout_url()),
		'accountUrl' => esc_url_raw(wc_get_page_permalink('myaccount')),
		'restNonce' => is_user_logged_in() ? wp_create_nonce('wp_rest') : null,
		'currency' => get_woocommerce_currency(),
		'priceDecimals' => wc_get_price_decimals(),
		'placeholder' => esc_url_raw(wc_placeholder_img_src('woocommerce_single')),
	);
}

// Conserva formularios, bloques, nonces y scripts originales de compra y cuenta.
function dipe_react_native_commerce_template($template)
{
	if (function_exists('is_checkout') && (is_checkout() || is_account_page())) {
		return get_theme_file_path('commerce-native.php');
	}
	return $template;
}
add_filter('template_include', 'dipe_react_native_commerce_template', 99);

// Se conserva la página asignada en WooCommerce, sin una pantalla de carrito propia.
function dipe_react_redirect_legacy_cart()
{
	if (function_exists('is_cart') && is_cart() && ! is_admin() && ! wp_doing_ajax()) {
		$destination = WC()->cart && ! WC()->cart->is_empty() ? wc_get_checkout_url() : wc_get_page_permalink('shop');
		wp_safe_redirect($destination, 302);
		exit;
	}
}
add_action('template_redirect', 'dipe_react_redirect_legacy_cart', 8);

// Espacios para elegir presentación y navegar por pasos sin duplicar el formulario.
add_action('woocommerce_before_checkout_form', function () {
	echo '<div id="dipe-checkout-experience"></div>';
}, 5);
add_action('woocommerce_after_checkout_form', function () {
	echo '<div id="dipe-checkout-experience-footer"></div>';
}, 30);

// Agrupa el resumen y los pagos sin copiar las plantillas de las pasarelas.
add_action('woocommerce_checkout_before_order_review_heading', function () {
	echo '<aside class="dipe-checkout-summary" aria-label="Resumen del pedido y pago">';
});
add_action('woocommerce_checkout_after_order_review', function () {
	echo '</aside>';
});

// Cada pieza tiene su propia tarjeta; se conservan las plantillas de pago nativas.
function dipe_react_checkout_order_card()
{
	echo '<div class="dipe-checkout-card dipe-checkout-order-card">';
	woocommerce_order_review();
	echo '</div>';
}

add_action('after_setup_theme', function () {
	remove_action('woocommerce_checkout_order_review', 'woocommerce_order_review', 10);
	add_action('woocommerce_checkout_order_review', 'dipe_react_checkout_order_card', 10);
	// El cupón usa Store API dentro del formulario existente, sin anidar otro form.
	remove_action('woocommerce_before_checkout_form', 'woocommerce_checkout_coupon_form', 10);
});

add_action('woocommerce_checkout_order_review', function () {
	if (wc_coupons_enabled()) {
		echo '<section class="dipe-checkout-card dipe-checkout-coupon" aria-label="Cupón de descuento"><p class="dipe-checkout-card__title">¿Tienes un cupón?</p><div id="dipe-checkout-coupon-slot"></div></section>';
	}
}, 12);

function dipe_react_checkout_shipping_html()
{
	$needs_shipping = WC()->cart && WC()->cart->needs_shipping();
	ob_start();
	?>
	<section class="dipe-checkout-card dipe-checkout-shipping" aria-label="Opciones de envío" <?php echo $needs_shipping ? '' : 'hidden'; ?>>
		<?php if ($needs_shipping) : ?>
			<p class="dipe-checkout-card__title">Opciones de envío</p>
			<?php if (WC()->cart->show_shipping()) : ?>
				<table class="dipe-checkout-shipping__table"><tbody>
					<?php do_action('woocommerce_review_order_before_shipping'); ?>
					<?php wc_cart_totals_shipping_html(); ?>
					<?php do_action('woocommerce_review_order_after_shipping'); ?>
				</tbody></table>
			<?php else : ?>
				<p class="dipe-checkout-shipping__hint">Introduce tu dirección para consultar los métodos de envío disponibles.</p>
			<?php endif; ?>
		<?php endif; ?>
	</section>
	<?php
	return ob_get_clean();
}

add_action('woocommerce_checkout_order_review', function () {
	echo dipe_react_checkout_shipping_html();
}, 15);

// Cambiar dirección, cupón o tarifa refresca la tarjeta además de los totales/pago.
add_filter('woocommerce_update_order_review_fragments', function ($fragments) {
	if (isset($fragments['.woocommerce-checkout-review-order-table']) && WC()->cart) {
		$fragments['.dipe-checkout-shipping'] = dipe_react_checkout_shipping_html();
	}
	return $fragments;
});

add_action('woocommerce_review_order_before_payment', function () {
	echo '<section class="dipe-checkout-card dipe-checkout-payment-card" aria-label="Pago y confirmación"><p class="dipe-checkout-card__title">Pago y confirmación</p>';
});
add_action('woocommerce_review_order_after_payment', function () {
	echo '</section>';
});

// El texto funcional del formulario es una etiqueta, no un encabezado editorial.
function dipe_react_review_form_labels($args)
{
	$args['title_reply_before'] = '<span id="reply-title" class="comment-reply-title">';
	$args['title_reply_after'] = '</span>';
	return $args;
}
add_filter('woocommerce_product_review_comment_form_args', 'dipe_react_review_form_labels');
