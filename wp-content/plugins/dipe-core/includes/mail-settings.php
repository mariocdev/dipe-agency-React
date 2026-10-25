<?php
/** SMTP compartido por formularios, WooCommerce y los correos de WordPress. */

defined( 'ABSPATH' ) || exit;

const DIPE_CORE_MAIL_OPTION = 'dipe_core_mail_settings';

// Define los valores iniciales de correo y destinatarios.
function dipe_core_mail_defaults() {
	return array(
		'host'       => 'bonsolis-servidordepruebas-net.correoseguro.dinaserver.com',
		'mode'       => 'smtps',
		'team_email' => 'formularios@bonsolis.servidordepruebas.net',
		'team_pass'  => '',
		'user_email' => 'noreply@bonsolis.servidordepruebas.net',
		'user_pass'  => '',
		'woocommerce_profile' => '',
		'wordpress_profile' => '',
		'contact_recipients' => '',
		'services_recipients' => '',
		'main_recipients' => '',
		'contact_redirect_page' => 0,
		'services_redirect_page' => 0,
		'main_redirect_page' => 0,
	);
}

// Combina los ajustes guardados con sus valores iniciales.
function dipe_core_mail_settings() {
	$saved = get_option( DIPE_CORE_MAIL_OPTION, array() );
	return array_merge( dipe_core_mail_defaults(), is_array( $saved ) ? $saved : array() );
}

/** Only native, published pages without a password can be redirect targets. */
function dipe_core_mail_redirect_page_id( $value ) {
	$id = is_scalar( $value ) ? absint( $value ) : 0;
	$page = $id ? get_post( $id ) : null;
	return $page && 'page' === $page->post_type && 'publish' === $page->post_status && '' === $page->post_password ? $id : 0;
}

// Resuelve la página de gracias válida configurada para cada formulario.
function dipe_core_mail_form_redirect_url( $form_type, $settings = null ) {
	$keys = array(
		'contacto' => 'contact_redirect_page',
		'contacto-servicios' => 'services_redirect_page',
		'contacto-general' => 'main_redirect_page',
	);
	if ( ! isset( $keys[ $form_type ] ) ) {
		return '';
	}
	$settings = is_array( $settings ) ? $settings : dipe_core_mail_settings();
	$page_id = dipe_core_mail_redirect_page_id( $settings[ $keys[ $form_type ] ] ?? 0 );
	return $page_id ? esc_url_raw( get_permalink( $page_id ) ?: '' ) : '';
}

// Dibuja el selector de página de gracias en los ajustes de correo.
function dipe_core_mail_redirect_page_row( $settings, $key ) {
	$id = 'dipe-mail-' . $key;
	?>
	<tr>
		<th scope="row"><label for="<?php echo esc_attr( $id ); ?>">Página de gracias</label></th>
		<td>
			<?php wp_dropdown_pages( array(
				'name' => 'dipe_mail[' . $key . ']',
				'id' => $id,
				'selected' => absint( $settings[ $key ] ?? 0 ),
				'post_status' => 'publish',
				'show_option_none' => 'Sin redirección (mostrar confirmación en el formulario)',
				'option_none_value' => '0',
				'sort_column' => 'post_title',
			) ); ?>
			<p class="description">Tras recibir la solicitud, el visitante irá a esta página. Selecciona una página publicada sin contraseña.</p>
		</td>
	</tr>
	<?php
}

/** The database holds ciphertext; the WordPress auth salt supplies the key. */
function dipe_core_mail_key() {
	return hash( 'sha256', wp_salt( 'auth' ) . '|dipe-core-mail-v1', true );
}

// Cifra la contraseña SMTP antes de guardarla en WordPress.
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

// Recupera la contraseña SMTP si el valor cifrado sigue siendo válido.
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

function dipe_core_mail_admin_styles( $hook ) {
	if ( 'settings_page_dipe-correo' !== $hook ) return;
	$path = dirname( __DIR__ ) . '/admin/mail-settings.css';
	wp_enqueue_style( 'dipe-mail-settings', plugins_url( 'admin/mail-settings.css', dirname( __DIR__ ) . '/dipe-core.php' ), array( 'dipe-admin-branding' ), (string) filemtime( $path ) );
}
add_action( 'admin_enqueue_scripts', 'dipe_core_mail_admin_styles', 110 );

// Muestra la configuración compartida; las credenciales nunca vuelven al HTML.
function dipe_core_mail_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'No tienes permisos para configurar el correo.', 'dipe-core' ) );
	}
	$settings = dipe_core_mail_settings();
	$status   = isset( $_GET['dipe_mail_status'] ) && is_string( $_GET['dipe_mail_status'] ) ? sanitize_key( wp_unslash( $_GET['dipe_mail_status'] ) ) : '';
	$messages = array(
		'saved'        => 'Configuración guardada. Las contraseñas no se muestran de nuevo.',
		'invalid'      => 'Revisa el servidor, el tipo de conexión y las direcciones de correo.',
		'redirect'     => 'Selecciona páginas de gracias publicadas y sin contraseña, o elige Sin redirección.',
		'password'     => 'Al cambiar una dirección de envío, introduce también la contraseña de esa cuenta.',
		'route-password' => 'La cuenta elegida para tienda o WordPress necesita una contraseña SMTP válida. Introdúcela y vuelve a guardar.',
		'encryption'   => 'No se pudo proteger la contraseña. La configuración anterior sigue intacta.',
		'test-sent'    => 'El servidor aceptó el correo de prueba. Comprueba también su recepción.',
		'test-failed'  => 'No se pudo enviar el correo de prueba. Revisa las cuentas y la configuración SMTP.',
		'test-invalid' => 'Introduce un destinatario válido y configura la cuenta antes de probar.',
	);
	require dirname( __DIR__ ) . '/admin/mail-settings-page.php';
}
function dipe_core_mail_redirect( $status ) {
	wp_safe_redirect( add_query_arg( 'dipe_mail_status', $status, admin_url( 'options-general.php?page=dipe-correo' ) ) );
	exit;
}

// Valida los ajustes y conserva las contraseñas que no se hayan sustituido.
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
	$routing = array();
	foreach ( array( 'woocommerce_profile', 'wordpress_profile' ) as $key ) {
		$value = $posted[ $key ] ?? $old[ $key ];
		if ( ! is_string( $value ) || ! in_array( $value, array( '', 'team', 'user' ), true ) ) {
			dipe_core_mail_redirect( 'invalid' );
		}
		$routing[ $key ] = $value;
	}
	$recipient_input = isset( $posted['contact_recipients'] ) && is_string( $posted['contact_recipients'] ) ? $posted['contact_recipients'] : '';
	$contact_recipients = dipe_core_mail_contact_recipients( $recipient_input );
	$services_input = isset( $posted['services_recipients'] ) && is_string( $posted['services_recipients'] ) ? $posted['services_recipients'] : ( $old['services_recipients'] ?? '' );
	$services_recipients = dipe_core_mail_contact_recipients( $services_input );
	$main_input = isset( $posted['main_recipients'] ) && is_string( $posted['main_recipients'] ) ? $posted['main_recipients'] : ( $old['main_recipients'] ?? '' );
	$main_recipients = dipe_core_mail_contact_recipients( $main_input );
	if ( ! preg_match( '/^[a-z0-9.-]+$/', $host ) || false !== strpos( $host, '..' ) || ! in_array( $mode, array( 'smtps', 'starttls' ), true ) || ! is_email( $team ) || ! is_email( $user ) || $team === $user ) {
		dipe_core_mail_redirect( 'invalid' );
	}
	if ( '' !== trim( $recipient_input ) && ! $contact_recipients ) {
		dipe_core_mail_redirect( 'invalid' );
	}
	if ( '' !== trim( $services_input ) && ! $services_recipients ) {
		dipe_core_mail_redirect( 'invalid' );
	}
	if ( '' !== trim( $main_input ) && ! $main_recipients ) {
		dipe_core_mail_redirect( 'invalid' );
	}
	$redirect_pages = array();
	foreach ( array( 'contact_redirect_page', 'services_redirect_page', 'main_redirect_page' ) as $key ) {
		$value = $posted[ $key ] ?? $old[ $key ];
		if ( ! is_scalar( $value ) || ! preg_match( '/^(0|[1-9][0-9]*)$/', (string) $value ) ) {
			dipe_core_mail_redirect( 'redirect' );
		}
		$page_id = absint( $value );
		if ( $page_id && ! dipe_core_mail_redirect_page_id( $page_id ) ) {
			dipe_core_mail_redirect( 'redirect' );
		}
		$redirect_pages[ $key ] = $page_id;
	}
	$new = array_merge( array(
		'host'       => $host,
		'mode'       => $mode,
		'team_email' => $team,
		'team_pass'  => $old['team_pass'],
		'user_email' => $user,
		'user_pass'  => $old['user_pass'],
		'contact_recipients' => implode( "\n", $contact_recipients ),
		'services_recipients' => implode( "\n", $services_recipients ),
		'main_recipients' => implode( "\n", $main_recipients ),
	), $redirect_pages, $routing );
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
	foreach ( $routing as $profile ) {
		if ( $profile && false === dipe_core_mail_decrypt( $new[ $profile . '_pass' ] ) ) {
			dipe_core_mail_redirect( 'route-password' );
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

// Normaliza la lista de destinatarios válidos y elimina duplicados.
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

// Woo conserva su contenido y destinatarios; la cuenta elegida aporta el remitente.
function dipe_core_mail_woocommerce_from( $from ) {
	$settings = dipe_core_mail_settings();
	$profile  = $settings['woocommerce_profile'];
	return in_array( $profile, array( 'team', 'user' ), true ) ? $settings[ $profile . '_email' ] : $from;
}
add_filter( 'woocommerce_email_from_address', 'dipe_core_mail_woocommerce_from', 99 );

/** Remitentes propios primero; cuenta general de WordPress para los demás. */
function dipe_core_mail_configure_phpmailer( $mailer ) {
	$settings = dipe_core_mail_settings();
	$from     = strtolower( (string) $mailer->From );
	$profile  = $from === strtolower( $settings['team_email'] ) ? 'team' : ( $from === strtolower( $settings['user_email'] ) ? 'user' : '' );
	if ( ! $profile && in_array( $settings['wordpress_profile'], array( 'team', 'user' ), true ) ) {
		$profile = $settings['wordpress_profile'];
	}
	if ( ! $profile ) {
		// WordPress can reuse the PHPMailer object within one request.
		if ( in_array( strtolower( (string) $mailer->Username ), array( strtolower( $settings['team_email'] ), strtolower( $settings['user_email'] ) ), true ) ) {
			$mailer->isMail();
			$mailer->Host       = '';
			$mailer->SMTPSecure = '';
			$mailer->SMTPAuth   = false;
			$mailer->Username   = '';
			$mailer->Password   = '';
			$mailer->Sender     = '';
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
	// Mantiene nombre y Reply-To; alinea remitente y retorno con el buzón autenticado.
	$mailer->setFrom( $settings[ $profile . '_email' ], $mailer->FromName, false );
	$mailer->Sender = $settings[ $profile . '_email' ];
}
add_action( 'phpmailer_init', 'dipe_core_mail_configure_phpmailer' );

// Envía texto plano con el remitente del perfil configurado.
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

// Tramita un correo de prueba autorizado desde el panel de ajustes.
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
