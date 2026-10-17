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

function dipe_core_register_content_types() {
	register_post_type(
		'dipe_item',
		array(
			'labels' => array(
				'name'          => __( 'Muestras', 'dipe-core' ),
				'singular_name' => __( 'Muestra', 'dipe-core' ),
				'add_new_item'  => __( 'Añadir muestra', 'dipe-core' ),
				'edit_item'     => __( 'Editar muestra', 'dipe-core' ),
			),
			'public'       => true,
			'has_archive'  => 'muestras',
			'rewrite'      => array( 'slug' => 'muestras' ),
			'show_in_rest' => true,
			'rest_base'    => 'dipe-items',
			'supports'     => array( 'title', 'excerpt', 'thumbnail', 'custom-fields' ),
			'menu_icon'    => 'dashicons-portfolio',
			'show_in_menu' => true,
		)
	);

	register_post_meta(
		'dipe_item',
		'dipe_item_client',
		array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => array(
				'schema' => array(
					'type' => 'string',
					'context' => array( 'view', 'edit' ),
				),
			),
			'sanitize_callback' => 'sanitize_text_field',
			'auth_callback'     => 'dipe_core_can_edit_meta',
		)
	);

	register_post_meta(
		'dipe_item',
		'dipe_item_url',
		array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => array(
				'schema' => array(
					'type'   => 'string',
					'format' => 'uri',
					'context' => array( 'view', 'edit' ),
				),
			),
			'sanitize_callback' => 'esc_url_raw',
			'auth_callback'     => 'dipe_core_can_edit_meta',
		)
	);
}
add_action( 'init', 'dipe_core_register_content_types' );

function dipe_core_can_edit_meta( $allowed, $meta_key, $post_id ) {
	return current_user_can( 'edit_post', $post_id );
}

function dipe_core_add_meta_boxes() {
	add_meta_box(
		'dipe_item_details',
		__( 'Datos de la muestra', 'dipe-core' ),
		'dipe_core_render_details_meta_box',
		'dipe_item',
		'normal',
		'default'
	);
}
add_action( 'add_meta_boxes_dipe_item', 'dipe_core_add_meta_boxes' );

function dipe_core_render_details_meta_box( $post ) {
	wp_nonce_field( 'dipe_core_save_details', 'dipe_core_details_nonce' );
	$client = get_post_meta( $post->ID, 'dipe_item_client', true );
	$url    = get_post_meta( $post->ID, 'dipe_item_url', true );
	?>
	<p>
		<label for="dipe_item_client"><strong><?php esc_html_e( 'Cliente', 'dipe-core' ); ?></strong></label><br>
		<input class="widefat" id="dipe_item_client" name="dipe_item_client" type="text" value="<?php echo esc_attr( $client ); ?>">
	</p>
	<p>
		<label for="dipe_item_url"><strong><?php esc_html_e( 'URL externa', 'dipe-core' ); ?></strong></label><br>
		<input class="widefat" id="dipe_item_url" name="dipe_item_url" type="url" value="<?php echo esc_attr( $url ); ?>" placeholder="https://">
	</p>
	<?php
}

function dipe_core_save_details( $post_id ) {
	if ( ! isset( $_POST['dipe_core_details_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['dipe_core_details_nonce'] ) ), 'dipe_core_save_details' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	if ( isset( $_POST['dipe_item_client'] ) ) {
		update_post_meta( $post_id, 'dipe_item_client', sanitize_text_field( wp_unslash( $_POST['dipe_item_client'] ) ) );
	}
	if ( isset( $_POST['dipe_item_url'] ) ) {
		update_post_meta( $post_id, 'dipe_item_url', esc_url_raw( wp_unslash( $_POST['dipe_item_url'] ) ) );
	}
}
add_action( 'save_post_dipe_item', 'dipe_core_save_details' );

function dipe_core_activate() {
	dipe_core_register_content_types();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'dipe_core_activate' );
register_deactivation_hook( __FILE__, 'flush_rewrite_rules' );
