<?php
/** Vista privada de Ajustes > Correo Dipe. Cargada tras comprobar permisos. */
defined( 'ABSPATH' ) || exit;

$profiles = array( 'team' => 'Avisos al equipo', 'user' => 'Mensajes automáticos' );
$forms = array(
	'contact' => 'Contacto internas',
	'services' => 'Contacto Servicios',
	'main' => 'Contacto principal',
);
?>
<div class="wrap dipe-mail">
	<header class="dipe-mail__header">
		<h1>Correo Dipe</h1>
		<p>Un servidor SMTP y dos cuentas reutilizables para formularios, tienda y WordPress.</p>
	</header>
	<?php if ( isset( $messages[ $status ] ) ) : ?>
		<div class="notice <?php echo in_array( $status, array( 'saved', 'test-sent' ), true ) ? 'notice-success' : 'notice-error'; ?> is-dismissible"><p><?php echo esc_html( $messages[ $status ] ); ?></p></div>
	<?php endif; ?>
	<nav class="dipe-mail__nav" aria-label="Secciones de correo">
		<a href="#dipe-mail-server">Servidor</a>
		<a href="#dipe-mail-accounts">Cuentas</a>
		<a href="#dipe-mail-routing">Tienda y WordPress</a>
		<a href="#dipe-mail-forms">Formularios</a>
		<a href="#dipe-mail-test">Enviar prueba</a>
	</nav>
	<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<input type="hidden" name="action" value="dipe_core_save_mail">
		<?php wp_nonce_field( 'dipe_core_save_mail' ); ?>
		<section class="dipe-mail__card" id="dipe-mail-server" aria-labelledby="dipe-mail-server-title">
			<h2 id="dipe-mail-server-title">Servidor saliente</h2>
			<p>Compartido por las dos cuentas. Cada envío se autentica con la cuenta que le corresponda.</p>
			<table class="form-table" role="presentation">
				<tr><th scope="row"><label for="dipe-mail-host">Servidor SMTP</label></th><td><input id="dipe-mail-host" name="dipe_mail[host]" type="text" class="regular-text" required value="<?php echo esc_attr( $settings['host'] ); ?>"></td></tr>
				<tr><th scope="row"><label for="dipe-mail-mode">Conexión segura</label></th><td><select id="dipe-mail-mode" name="dipe_mail[mode]"><option value="smtps" <?php selected( $settings['mode'], 'smtps' ); ?>>SMTPS · puerto 465 (recomendado)</option><option value="starttls" <?php selected( $settings['mode'], 'starttls' ); ?>>STARTTLS · puerto 587</option></select></td></tr>
			</table>
		</section>
		<section id="dipe-mail-accounts" aria-labelledby="dipe-mail-accounts-title">
			<h2 id="dipe-mail-accounts-title">Cuentas de envío</h2>
			<p>Las contraseñas se guardan cifradas. Déjalas vacías para conservar las actuales.</p>
			<div class="dipe-mail__grid">
				<?php foreach ( $profiles as $profile => $label ) :
					$ready = false !== dipe_core_mail_decrypt( $settings[ $profile . '_pass' ] );
					?>
					<div class="dipe-mail__card dipe-mail__account">
						<div class="dipe-mail__card-heading">
							<h3><?php echo esc_html( $label ); ?></h3>
							<span class="dipe-mail__badge <?php echo $ready ? 'dipe-mail__badge--ready' : ''; ?>"><?php echo $ready ? 'Contraseña guardada' : 'Falta contraseña'; ?></span>
						</div>
						<p><?php echo 'team' === $profile ? 'Los formularios usan esta cuenta para los avisos internos y el correo del visitante como Reply-To.' : 'Cuenta disponible para correos de tienda y WordPress. Las confirmaciones de Contacto al visitante siguen pendientes de activar.'; ?></p>
						<table class="form-table" role="presentation">
							<tr><th scope="row"><label for="dipe-mail-<?php echo esc_attr( $profile ); ?>-email">Usuario SMTP y remitente</label></th><td><input id="dipe-mail-<?php echo esc_attr( $profile ); ?>-email" name="dipe_mail[<?php echo esc_attr( $profile ); ?>_email]" type="email" class="regular-text" required autocomplete="off" value="<?php echo esc_attr( $settings[ $profile . '_email' ] ); ?>"></td></tr>
							<tr><th scope="row"><label for="dipe-mail-<?php echo esc_attr( $profile ); ?>-pass">Contraseña SMTP</label></th><td><input id="dipe-mail-<?php echo esc_attr( $profile ); ?>-pass" name="dipe_mail[<?php echo esc_attr( $profile ); ?>_pass]" type="password" class="regular-text" autocomplete="new-password" value="" aria-describedby="dipe-mail-<?php echo esc_attr( $profile ); ?>-password-help"><p class="description" id="dipe-mail-<?php echo esc_attr( $profile ); ?>-password-help"><?php echo $ready ? 'Guardada; no acredita conexión ni entrega. Introduce otra solo para cambiarla.' : 'Sin configurar o no disponible. Introduce la contraseña de esta cuenta.'; ?></p></td></tr>
						</table>
					</div>
				<?php endforeach; ?>
			</div>
		</section>
		<section class="dipe-mail__card" id="dipe-mail-routing" aria-labelledby="dipe-mail-routing-title">
			<h2 id="dipe-mail-routing-title">Tienda y WordPress</h2>
			<p>Elige qué cuenta SMTP debe enviar estos mensajes. El remitente será la dirección de esa cuenta; se conservan el nombre, los destinatarios, el contenido y Reply-To.</p>
			<?php if ( class_exists( 'WooCommerce' ) && '' === $settings['woocommerce_profile'] && '' === $settings['wordpress_profile'] ) : ?>
				<p class="dipe-mail__note"><strong>Tienda sin cuenta SMTP asignada.</strong> Selecciona una cuenta para WooCommerce y guarda. Tener guardadas las contraseñas de los formularios no conecta por sí solo todos los correos de pedidos.</p>
			<?php endif; ?>
			<table class="form-table" role="presentation">
				<?php foreach ( array( 'woocommerce' => 'Correos de WooCommerce', 'wordpress' => 'Otros correos de WordPress' ) as $route => $label ) : ?>
					<tr>
						<th scope="row"><label for="dipe-mail-<?php echo esc_attr( $route ); ?>-profile"><?php echo esc_html( $label ); ?></label></th>
						<td>
							<select id="dipe-mail-<?php echo esc_attr( $route ); ?>-profile" name="dipe_mail[<?php echo esc_attr( $route ); ?>_profile]" aria-describedby="dipe-mail-<?php echo esc_attr( $route ); ?>-help">
								<option value="" <?php selected( $settings[ $route . '_profile' ], '' ); ?>><?php echo 'woocommerce' === $route ? 'Usar el ajuste general de WordPress' : 'Conservar transporte actual (sin SMTP general de Dipe)'; ?></option>
								<?php foreach ( $profiles as $profile => $profile_label ) : ?>
									<option value="<?php echo esc_attr( $profile ); ?>" <?php selected( $settings[ $route . '_profile' ], $profile ); ?>><?php echo esc_html( $profile_label . ' · ' . $settings[ $profile . '_email' ] ); ?></option>
								<?php endforeach; ?>
							</select>
							<p class="description" id="dipe-mail-<?php echo esc_attr( $route ); ?>-help"><?php echo 'woocommerce' === $route ? 'Incluye Nuevo pedido, Pedido a la espera y el resto de notificaciones nativas. Sin una cuenta SMTP aplicable, seguirá usando el transporte actual del servidor.' : 'Recuperación de contraseña y otros avisos enviados mediante wp_mail(). Los formularios conservan sus cuentas propias.'; ?></p>
						</td>
					</tr>
				<?php endforeach; ?>
			</table>
			<?php if ( class_exists( 'WooCommerce' ) ) : ?>
				<p class="dipe-mail__note">Los destinatarios de pedidos, las notificaciones activas y sus textos se administran en <a href="<?php echo esc_url( admin_url( 'admin.php?page=wc-settings&tab=email' ) ); ?>">WooCommerce → Ajustes → Correos electrónicos</a>.</p>
			<?php endif; ?>
		</section>
		<section id="dipe-mail-forms" aria-labelledby="dipe-mail-forms-title">
			<h2 id="dipe-mail-forms-title">Formularios de contacto</h2>
			<p>Todos usan Avisos al equipo. Cada formulario conserva sus destinatarios y su página de gracias.</p>
			<div class="dipe-mail__forms">
				<?php foreach ( $forms as $key => $label ) :
					$count = count( dipe_core_mail_contact_recipients( $settings[ $key . '_recipients' ] ) );
					?>
					<details class="dipe-mail__card" <?php echo $count ? '' : 'open'; ?>>
						<summary><span><?php echo esc_html( $label ); ?></span><span class="dipe-mail__badge"><?php echo esc_html( $count ? sprintf( _n( '%d destinatario', '%d destinatarios', $count, 'dipe-core' ), $count ) : 'Sin destinatarios' ); ?></span></summary>
						<p>Se envía un aviso individual por dirección. Sin destinatarios, la solicitud se guarda con estado Error de envío.</p>
						<table class="form-table" role="presentation">
							<tr><th scope="row"><label for="dipe-mail-<?php echo esc_attr( $key ); ?>-recipients">Destinatarios</label></th><td><textarea id="dipe-mail-<?php echo esc_attr( $key ); ?>-recipients" name="dipe_mail[<?php echo esc_attr( $key ); ?>_recipients]" class="large-text" rows="3" placeholder="equipo@ejemplo.com&#10;otra-persona@ejemplo.com"><?php echo esc_textarea( $settings[ $key . '_recipients' ] ); ?></textarea><p class="description">Una dirección por línea o separadas por comas.</p></td></tr>
							<?php dipe_core_mail_redirect_page_row( $settings, $key . '_redirect_page' ); ?>
						</table>
					</details>
				<?php endforeach; ?>
			</div>
		</section>
		<div class="dipe-mail__save"><?php submit_button( 'Guardar configuración de correo' ); ?><p>Guarda los cambios antes de enviar una prueba.</p></div>
	</form>
	<section class="dipe-mail__card" id="dipe-mail-test" aria-labelledby="dipe-mail-test-title">
		<h2 id="dipe-mail-test-title">Enviar prueba SMTP</h2>
		<p>Usa los ajustes guardados de la cuenta elegida. No crea pedidos ni solicitudes. La aceptación del servidor no garantiza la llegada a la bandeja de entrada.</p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="dipe_core_test_mail">
			<?php wp_nonce_field( 'dipe_core_test_mail' ); ?>
			<div class="dipe-mail__test-fields">
				<div><label for="dipe-mail-test-profile">Cuenta de envío</label><select id="dipe-mail-test-profile" name="dipe_mail_profile"><?php foreach ( $profiles as $profile => $label ) : ?><option value="<?php echo esc_attr( $profile ); ?>"><?php echo esc_html( $label . ' · ' . $settings[ $profile . '_email' ] ); ?></option><?php endforeach; ?></select></div>
				<div><label for="dipe-mail-test-to">Destinatario</label><input id="dipe-mail-test-to" name="dipe_mail_to" type="email" class="regular-text" required></div>
			</div>
			<?php submit_button( 'Enviar correo de prueba', 'secondary' ); ?>
		</form>
	</section>
</div>
