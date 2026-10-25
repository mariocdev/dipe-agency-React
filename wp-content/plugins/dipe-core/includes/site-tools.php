<?php
/** Small site controls under WordPress Tools. */

defined( 'ABSPATH' ) || exit;

// Añade el control del loader al menú Herramientas.
function dipe_core_register_loader_tool() {
	add_management_page(
		__( 'Loader de la web', 'dipe-core' ),
		__( 'Loader de la web', 'dipe-core' ),
		'manage_options',
		'dipe-loader',
		'dipe_core_render_loader_tool'
	);
}
add_action( 'admin_menu', 'dipe_core_register_loader_tool' );

// Muestra el interruptor de la animación inicial de la web.
function dipe_core_render_loader_tool() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$enabled = (bool) get_option( 'dipe_core_loader_enabled', 1 );
	// This flag only selects a fixed notice; it does not change any settings.
	$saved = isset( $_GET['saved'] ) ? sanitize_key( wp_unslash( $_GET['saved'] ) ) : '';
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Loader de la web', 'dipe-core' ); ?></h1>
		<?php if ( '1' === $saved ) : ?>
			<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Ajuste guardado.', 'dipe-core' ); ?></p></div>
		<?php elseif ( '0' === $saved ) : ?>
			<div class="notice notice-error"><p><?php esc_html_e( 'No se ha podido guardar el ajuste. Vuelve a intentarlo.', 'dipe-core' ); ?></p></div>
		<?php endif; ?>
		<form action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" method="post">
			<input type="hidden" name="action" value="dipe_core_save_loader">
			<?php wp_nonce_field( 'dipe_core_save_loader' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><?php esc_html_e( 'Animación de entrada', 'dipe-core' ); ?></th>
					<td>
						<label for="dipe-loader-enabled">
							<input type="checkbox" id="dipe-loader-enabled" name="loader_enabled" value="1" <?php checked( $enabled ); ?>>
							<?php esc_html_e( 'Mostrar el loader al entrar en la web', 'dipe-core' ); ?>
						</label>
						<p class="description"><?php esc_html_e( 'Se aplica a todos los visitantes. Desmárcalo y guarda antes de pasar PageSpeed para medir la carga sin la animación.', 'dipe-core' ); ?></p>
						<p class="description"><?php esc_html_e( 'Activado, conserva una aparición por pestaña. Para volver a verlo, abre la web en una pestaña nueva. Si utilizas caché del hosting o CDN, vacíala también después de cambiar este ajuste.', 'dipe-core' ); ?></p>
					</td>
				</tr>
			</table>
			<?php submit_button( __( 'Guardar cambios', 'dipe-core' ) ); ?>
		</form>
	</div>
	<?php
}

// Guarda el estado del loader.
function dipe_core_save_loader_tool() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'No tienes permisos para cambiar este ajuste.', 'dipe-core' ), '', array( 'response' => 403 ) );
	}
	if ( 'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
		wp_die( esc_html__( 'Método no permitido.', 'dipe-core' ), '', array( 'response' => 405 ) );
	}
	check_admin_referer( 'dipe_core_save_loader' );

	$enabled = isset( $_POST['loader_enabled'] ) && '1' === wp_unslash( $_POST['loader_enabled'] ) ? 1 : 0;
	update_option( 'dipe_core_loader_enabled', $enabled );
	$saved = (int) get_option( 'dipe_core_loader_enabled', 1 ) === $enabled;

	wp_safe_redirect( add_query_arg(
		array( 'page' => 'dipe-loader', 'saved' => $saved ? '1' : '0' ),
		admin_url( 'tools.php' )
	) );
	exit;
}
add_action( 'admin_post_dipe_core_save_loader', 'dipe_core_save_loader_tool' );
