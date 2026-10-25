<?php
/**
 * Order Customer Details
 *
 * @see https://woocommerce.com/document/template-structure/
 * @package WooCommerce\Templates
 * @version 8.7.0
 * Dipe: direcciones del pedido con etiquetas y tarjetas alineadas.
 */

defined( 'ABSPATH' ) || exit;

// WooCommerce resuelve el acceso al pedido antes de cargar esta plantilla.
$show_shipping = ! wc_ship_to_billing_address_only() && $order->needs_shipping_address();
$render_address = function ( $address_type ) use ( $order ) {
	$address = $order->get_address( $address_type );
	$labels = array(
		'first_name' => 'Nombre',
		'last_name'  => 'Apellidos',
		'company'    => 'Empresa',
		'address_1'  => 'Dirección',
		'address_2'  => 'Piso, puerta, etc.',
		'postcode'   => 'Código postal',
		'city'       => 'Localidad',
		'state'      => 'Provincia / Región',
		'country'    => 'País',
		'phone'      => 'Teléfono',
	);
	if ( 'billing' === $address_type ) {
		$labels['email'] = 'Correo electrónico';
	}
	$country = $address['country'] ?? '';
	$countries = WC()->countries->get_countries();
	$states = WC()->countries->get_states( $country );
	$fields = array();
	foreach ( $labels as $key => $label ) {
		$value = trim( (string) ( $address[ $key ] ?? '' ) );
		if ( '' === $value ) {
			continue;
		}
		if ( 'country' === $key ) {
			$value = $countries[ $value ] ?? $value;
		} elseif ( 'state' === $key && is_array( $states ) ) {
			$value = $states[ $value ] ?? $value;
		}
		$fields[] = array( 'label' => $label, 'value' => $value );
	}
	?>
	<address>
		<?php if ( $fields ) : ?>
			<dl class="dipe-order-customer-details__fields">
				<?php foreach ( $fields as $field ) : ?>
					<div>
						<dt><?php echo esc_html( $field['label'] ); ?></dt>
						<dd><?php echo esc_html( $field['value'] ); ?></dd>
					</div>
				<?php endforeach; ?>
			</dl>
		<?php else : ?>
			<p class="dipe-order-customer-details__empty">No hay una dirección registrada para este pedido.</p>
		<?php endif; ?>
		<?php do_action( 'woocommerce_order_details_after_customer_address', $address_type, $order ); ?>
	</address>
	<?php
};
?>
<section class="woocommerce-customer-details dipe-order-customer-details">
	<div class="woocommerce-columns woocommerce-columns--<?php echo $show_shipping ? '2' : '1'; ?> woocommerce-columns--addresses col2-set addresses dipe-order-customer-details__columns">
		<div class="woocommerce-column woocommerce-column--1 woocommerce-column--billing-address col-1 dipe-order-customer-details__card">
			<h2 class="woocommerce-column__title"><?php esc_html_e( 'Billing address', 'woocommerce' ); ?></h2>
			<?php $render_address( 'billing' ); ?>
		</div>
		<?php if ( $show_shipping ) : ?>
			<div class="woocommerce-column woocommerce-column--2 woocommerce-column--shipping-address col-2 dipe-order-customer-details__card">
				<h2 class="woocommerce-column__title"><?php esc_html_e( 'Shipping address', 'woocommerce' ); ?></h2>
				<?php $render_address( 'shipping' ); ?>
			</div>
		<?php endif; ?>
	</div>
	<?php do_action( 'woocommerce_order_details_after_customer_details', $order ); ?>
</section>
