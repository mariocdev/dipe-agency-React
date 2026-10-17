<?php
/** SMTP settings and transport for Dipe's own form notifications. */

defined( 'ABSPATH' ) || exit;

const DIPE_CORE_MAIL_OPTION = 'dipe_core_mail_settings';

function dipe_core_mail_defaults() {
	return array(
		'host'       => 'bonsolis-servidordepruebas-net.correoseguro.dinaserver.com',
		'mode'       => 'smtps',
		'team_email' => 'formularios@bonsolis.servidordepruebas.net',
		'team_pass'  => '',
		'user_email' => 'noreply@bonsolis.servidordepruebas.net',
		'user_pass'  => '',
		'contact_recipients' => '',
	);
}

function dipe_core_mail_settings() {
	$saved = get_option( DIPE_CORE_MAIL_OPTION, array() );
	return array_merge( dipe_core_mail_defaults(), is_array( $saved ) ? $saved : array() );
}

/** The database holds ciphertext; the WordPress auth salt supplies the key. */
function dipe_core_mail_key() {
	return hash( 'sha256', wp_salt( 'auth' ) . '|dipe-core-mail-v1', true );
}

function dipe_core_mail_encrypt( $password ) {
	if ( ! function_exists( 'openssl_encrypt' ) ) {
		return false;
	}
	try {
		$nonce = random_bytes( 12 );
	} catch ( Exception $error ) {
		return false;
	}
	$tag        = '';
	$ciphertext = openssl_encrypt( $password, 'aes-256-gcm', dipe_core_mail_key(), OPENSSL_RAW_DATA, $nonce, $tag );
	if ( false === $ciphertext ) {
		return false;
	}
	return 'v1:' . base64_encode( $nonce . $tag . $ciphertext );
}

function dipe_core_mail_decrypt( $stored ) {
	if ( ! is_string( $stored ) || 0 !== strpos( $stored, 'v1:' ) || ! function_exists( 'openssl_decrypt' ) ) {
		return false;
	}
	$data = base64_decode( substr( $stored, 3 ), true );
	if ( false === $data || strlen( $data ) < 29 ) {
		return false;
	}
	return openssl_decrypt(
		substr( $data, 28 ),
		'aes-256-gcm',
		dipe_core_mail_key(),
		OPENSSL_RAW_DATA,
		substr( $data, 0, 12 ),
		substr( $data, 12, 16 )
	);
}

function dipe_core_mail_admin_menu() {
	add_options_page( 'Correo Dipe', 'Correo Dipe', 'manage_options', 'dipe-correo', 'dipe_core_mail_settings_page' );
}
add_action( 'admin_menu', 'dipe_core_mail_admin_menu' );

function dipe_core_mail_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'No tienes permisos para configurar el correo.', 'dipe-core' ) );
	}
	$settings = dipe_core_mail_settings();
	$status   = isset( $_GET['dipe_mail_status'] ) ? sanitize_key( wp_unslash( $_GET['dipe_mail_status'] ) ) : '';
	$messages = array(
		'saved'        => 'Configuración guardada. Las contraseñas no se muestran de nuevo.',
		'invalid'      => 'Revisa el servidor, el tipo de conexión y las direcciones de correo.',
		'password'     => 'Al cambiar una dirección de envío, introduce también la contraseña de esa cuenta.',
		'encryption'   => 'No se pudo proteger la contraseña. La configuración anterior sigue intacta.',
		'test-sent'    => 'El servidor aceptó el correo de prueba. Comprueba también su recepción.',
		'test-failed'  => 'No se pudo enviar el correo de prueba. Revisa las cuentas y la configuración SMTP.',
		'test-invalid' => 'Introduce un destinatario válido y configura la cuenta antes de probar.',
	);
	?>
	<div class="wrap">
		<h1>Correo Dipe</h1>
		<p>Configura los dos remitentes usados por los formularios. Solo los administradores pueden acceder a esta pantalla. Las contraseñas se guardan cifradas en la base de datos y nunca se muestran aquí.</p>
		<?php if ( isset( $messages[ $status ] ) ) : ?>
			<div class="notice <?php echo 'saved' === $status || 'test-sent' === $status ? 'notice-success' : 'notice-error'; ?> is-dismissible"><p><?php echo esc_html( $messages[ $status ] ); ?></p></div>
		<?php endif; ?>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="dipe_core_save_mail">
			<?php wp_nonce_field( 'dipe_core_save_mail' ); ?>
			<h2>Servidor saliente</h2>
			<table class="form-table" role="presentation">
				<tr><th scope="row"><label for="dipe-mail-host">Servidor SMTP</label></th><td><input id="dipe-mail-host" name="dipe_mail[host]" type="text" class="regular-text" required value="<?php echo esc_attr( $settings['host'] ); ?>"></td></tr>
				<tr><th scope="row"><label for="dipe-mail-mode">Conexión segura</label></th><td><select id="dipe-mail-mode" name="dipe_mail[mode]"><option value="smtps" <?php selected( $settings['mode'], 'smtps' ); ?>>SMTPS · puerto 465 (recomendado)</option><option value="starttls" <?php selected( $settings['mode'], 'starttls' ); ?>>STARTTLS · puerto 587</option></select></td></tr>
			</table>
			<h2>Avisos al equipo</h2>
			<p>Remitente de las notificaciones internas. El correo del visitante se usará como Reply-To cuando proceda.</p>
			<table class="form-table" role="presentation">
				<tr><th scope="row"><label for="dipe-mail-team-email">Usuario SMTP y remitente</label></th><td><input id="dipe-mail-team-email" name="dipe_mail[team_email]" type="email" class="regular-text" required autocomplete="off" value="<?php echo esc_attr( $settings['team_email'] ); ?>"></td></tr>
				<tr><th scope="row"><label for="dipe-mail-team-pass">Contraseña SMTP</label></th><td><input id="dipe-mail-team-pass" name="dipe_mail[team_pass]" type="password" class="regular-text" autocomplete="new-password" value=""><p class="description"><?php echo false !== dipe_core_mail_decrypt( $settings['team_pass'] ) ? 'Guardada. Deja el campo vacío para conservarla.' : 'Sin configurar o no disponible. Introduce la contraseña de esta cuenta.'; ?></p></td></tr>
			</table>
			<h2>Destinatarios de Contacto</h2>
			<p>Recibirán una copia individual de cada solicitud de Contacto. No se muestran ni se aceptan desde el formulario público.</p>
			<table class="form-table" role="presentation">
				<tr><th scope="row"><label for="dipe-mail-contact-recipients">Destinatarios</label></th><td><textarea id="dipe-mail-contact-recipients" name="dipe_mail[contact_recipients]" class="large-text" rows="4" placeholder="equipo@ejemplo.com&#10;otra-persona@ejemplo.com"><?php echo esc_textarea( $settings['contact_recipients'] ); ?></textarea><p class="description">Una dirección por línea o separadas por comas.</p></td></tr>
			</table>
			<h2>Confirmaciones al visitante</h2>
			<p>Remitente de los mensajes automáticos al usuario. Solo se utilizará en los formularios que tengan confirmación.</p>
			<table class="form-table" role="presentation">
				<tr><th scope="row"><label for="dipe-mail-user-email">Usuario SMTP y remitente</label></th><td><input id="dipe-mail-user-email" name="dipe_mail[user_email]" type="email" class="regular-text" required autocomplete="off" value="<?php echo esc_attr( $settings['user_email'] ); ?>"></td></tr>
				<tr><th scope="row"><label for="dipe-mail-user-pass">Contraseña SMTP</label></th><td><input id="dipe-mail-user-pass" name="dipe_mail[user_pass]" type="password" class="regular-text" autocomplete="new-password" value=""><p class="description"><?php echo false !== dipe_core_mail_decrypt( $settings['user_pass'] ) ? 'Guardada. Deja el campo vacío para conservarla.' : 'Sin configurar o no disponible. Introduce la contraseña de esta cuenta.'; ?></p></td></tr>
			</table>
			<?php submit_button( 'Guardar configuración de correo' ); ?>
		</form>
		<hr>
		<h2>Enviar prueba</h2>
		<p>Guarda primero los ajustes. El envío de prueba utiliza la cuenta elegida y no guarda ninguna solicitud de formulario.</p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="dipe_core_test_mail">
			<?php wp_nonce_field( 'dipe_core_test_mail' ); ?>
			<label for="dipe-mail-test-profile">Remitente</label>
			<select id="dipe-mail-test-profile" name="dipe_mail_profile"><option value="team">Formularios · avisos al equipo</option><option value="user">Noreply · confirmaciones</option></select>
			<label for="dipe-mail-test-to">Destinatario</label>
			<input id="dipe-mail-test-to" name="dipe_mail_to" type="email" class="regular-text" required>
			<?php submit_button( 'Enviar correo de prueba', 'secondary', 'submit', false ); ?>
		</form>
	</div>
	<?php
}

function dipe_core_mail_redirect( $status ) {
	wp_safe_redirect( add_query_arg( 'dipe_mail_status', $status, admin_url( 'options-general.php?page=dipe-correo' ) ) );
	exit;
}

function dipe_core_mail_save() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'No tienes permisos para configurar el correo.', 'dipe-core' ) );
	}
	check_admin_referer( 'dipe_core_save_mail' );
	$posted = isset( $_POST['dipe_mail'] ) && is_array( $_POST['dipe_mail'] ) ? wp_unslash( $_POST['dipe_mail'] ) : array();
	$old    = dipe_core_mail_settings();
	$host   = strtolower( sanitize_text_field( $posted['host'] ?? '' ) );
	$mode   = sanitize_key( $posted['mode'] ?? '' );
	$team   = sanitize_email( $posted['team_email'] ?? '' );
	$user   = sanitize_email( $posted['user_email'] ?? '' );
	$recipient_input = isset( $posted['contact_recipients'] ) && is_string( $posted['contact_recipients'] ) ? $posted['contact_recipients'] : '';
	$contact_recipients = dipe_core_mail_contact_recipients( $recipient_input );
	if ( ! preg_match( '/^[a-z0-9.-]+$/', $host ) || false !== strpos( $host, '..' ) || ! in_array( $mode, array( 'smtps', 'starttls' ), true ) || ! is_email( $team ) || ! is_email( $user ) || $team === $user ) {
		dipe_core_mail_redirect( 'invalid' );
	}
	if ( '' !== trim( $recipient_input ) && ! $contact_recipients ) {
		dipe_core_mail_redirect( 'invalid' );
	}
	$new = array(
		'host'       => $host,
		'mode'       => $mode,
		'team_email' => $team,
		'team_pass'  => $old['team_pass'],
		'user_email' => $user,
		'user_pass'  => $old['user_pass'],
		'contact_recipients' => implode( "\n", $contact_recipients ),
	);
	foreach ( array( 'team', 'user' ) as $profile ) {
		$password = isset( $posted[ $profile . '_pass' ] ) && is_string( $posted[ $profile . '_pass' ] ) ? $posted[ $profile . '_pass' ] : '';
		if ( $new[ $profile . '_email' ] !== $old[ $profile . '_email' ] && '' === $password ) {
			dipe_core_mail_redirect( 'password' );
		}
		if ( '' !== $password ) {
			if ( strlen( $password ) > 1024 ) {
				dipe_core_mail_redirect( 'invalid' );
			}
			$encrypted = dipe_core_mail_encrypt( $password );
			if ( false === $encrypted ) {
				dipe_core_mail_redirect( 'encryption' );
			}
			$new[ $profile . '_pass' ] = $encrypted;
		}
	}
	if ( false === get_option( DIPE_CORE_MAIL_OPTION, false ) ) {
		add_option( DIPE_CORE_MAIL_OPTION, $new, '', false );
	} else {
		update_option( DIPE_CORE_MAIL_OPTION, $new, false );
	}
	dipe_core_mail_redirect( 'saved' );
}
add_action( 'admin_post_dipe_core_save_mail', 'dipe_core_mail_save' );

function dipe_core_mail_contact_recipients( $value = null ) {
	if ( null === $value ) {
		$settings = dipe_core_mail_settings();
		$value    = $settings['contact_recipients'] ?? '';
	}
	$raw        = is_string( $value ) ? sanitize_textarea_field( $value ) : '';
	$addresses  = preg_split( '/[\s,;]+/', $raw, -1, PREG_SPLIT_NO_EMPTY );
	$recipients = array();
	foreach ( $addresses as $address ) {
		$address = sanitize_email( $address );
		if ( is_email( $address ) ) {
			$recipients[ strtolower( $address ) ] = $address;
		}
	}
	return array_values( $recipients );
}

/** Only Dipe's two configured sender addresses select these SMTP credentials. */
function dipe_core_mail_configure_phpmailer( $mailer ) {
	$settings = dipe_core_mail_settings();
	$from     = strtolower( (string) $mailer->From );
	$profile  = $from === strtolower( $settings['team_email'] ) ? 'team' : ( $from === strtolower( $settings['user_email'] ) ? 'user' : '' );
	if ( ! $profile ) {
		// WordPress can reuse the PHPMailer object within one request.
		if ( in_array( strtolower( (string) $mailer->Username ), array( strtolower( $settings['team_email'] ), strtolower( $settings['user_email'] ) ), true ) ) {
			$mailer->isMail();
			$mailer->Host       = '';
			$mailer->SMTPSecure = '';
			$mailer->SMTPAuth   = false;
			$mailer->Username   = '';
			$mailer->Password   = '';
		}
		return;
	}
	$password = dipe_core_mail_decrypt( $settings[ $profile . '_pass' ] );
	$mailer->isSMTP();
	$mailer->Host       = $settings['host'];
	$mailer->Port       = 'starttls' === $settings['mode'] ? 587 : 465;
	$mailer->SMTPSecure = 'starttls' === $settings['mode'] ? \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS : \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
	$mailer->SMTPAuth   = true;
	$mailer->Username   = $settings[ $profile . '_email' ];
	$mailer->Password   = false === $password ? '' : $password;
}
add_action( 'phpmailer_init', 'dipe_core_mail_configure_phpmailer' );

function dipe_core_mail_send( $profile, $to, $subject, $message, $headers = array() ) {
	if ( ! in_array( $profile, array( 'team', 'user' ), true ) ) {
		return false;
	}
	$settings = dipe_core_mail_settings();
	if ( false === dipe_core_mail_decrypt( $settings[ $profile . '_pass' ] ) ) {
		return false;
	}
	$headers   = (array) $headers;
	$headers[] = 'From: Dipe Agency <' . $settings[ $profile . '_email' ] . '>';
	$headers[] = 'Content-Type: text/plain; charset=UTF-8';
	return wp_mail( $to, $subject, $message, $headers );
}

function dipe_core_mail_test() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'No tienes permisos para probar el correo.', 'dipe-core' ) );
	}
	check_admin_referer( 'dipe_core_test_mail' );
	$profile = isset( $_POST['dipe_mail_profile'] ) ? sanitize_key( wp_unslash( $_POST['dipe_mail_profile'] ) ) : '';
	$to      = isset( $_POST['dipe_mail_to'] ) ? sanitize_email( wp_unslash( $_POST['dipe_mail_to'] ) ) : '';
	if ( ! in_array( $profile, array( 'team', 'user' ), true ) || ! is_email( $to ) ) {
		dipe_core_mail_redirect( 'test-invalid' );
	}
	$sent = dipe_core_mail_send( $profile, $to, 'Prueba de correo Dipe', 'Este mensaje comprueba la configuración SMTP de Dipe Agency.' );
	dipe_core_mail_redirect( $sent ? 'test-sent' : 'test-failed' );
}
add_action( 'admin_post_dipe_core_test_mail', 'dipe_core_mail_test' );
