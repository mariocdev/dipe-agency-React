<?php
/** Private form submissions and the administrator inbox. */

defined( 'ABSPATH' ) || exit;

function dipe_core_register_submission_type() {
	register_post_type(
		'dipe_solicitud',
		array(
			'labels'              => array( 'name' => 'Solicitudes', 'singular_name' => 'Solicitud' ),
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => false,
			'show_in_rest'        => false,
			'rewrite'             => false,
			'query_var'           => false,
			'supports'            => array( 'title', 'editor' ),
		)
	);
}
add_action( 'init', 'dipe_core_register_submission_type' );

function dipe_core_submission_form_labels() {
	return array(
		'contacto'             => 'Contacto',
		'presupuesto'          => 'Presupuesto',
		'trabaja-con-nosotros' => 'Trabaja con nosotros',
	);
}

function dipe_core_submission_status_labels() {
	return array(
		'pending' => 'Pendiente de envío',
		'sent'    => 'Enviado al equipo',
		'partial' => 'Envío parcial',
		'failed'  => 'Error de envío',
	);
}

/**
 * Called by a future, validated form handler. Never pass an unvalidated REST body
 * directly to this function. A saved submission survives a mail transport failure.
 */
function dipe_core_record_submission( $form_type, $fields ) {
	$form_type = sanitize_key( $form_type );
	$labels    = dipe_core_submission_form_labels();
	if ( ! isset( $labels[ $form_type ] ) || ! is_array( $fields ) ) {
		return new WP_Error( 'dipe_invalid_submission', 'Tipo de solicitud o campos no válidos.' );
	}

	$clean_fields = array();
	foreach ( $fields as $key => $value ) {
		if ( ! is_string( $key ) || ! is_scalar( $value ) ) {
			continue;
		}
		$key = sanitize_key( $key );
		if ( '' === $key ) {
			continue;
		}
		$clean_fields[ $key ] = sanitize_textarea_field( (string) $value );
	}
	if ( ! $clean_fields ) {
		return new WP_Error( 'dipe_empty_submission', 'La solicitud no contiene campos.' );
	}

	$name    = sanitize_text_field( $clean_fields['nombre'] ?? $clean_fields['name'] ?? '' );
	$email   = sanitize_email( $clean_fields['email'] ?? $clean_fields['correo'] ?? '' );
	$summary = '' !== $name ? $name : ( '' !== $email ? $email : current_time( 'd/m/Y H:i' ) );
	$id      = wp_insert_post(
		array(
			'post_type'    => 'dipe_solicitud',
			'post_status'  => 'private',
			'post_title'   => $labels[ $form_type ] . ' · ' . $summary,
			'post_content' => wp_json_encode( $clean_fields, JSON_UNESCAPED_UNICODE ),
			'meta_input'   => array(
				'_dipe_form_type'   => $form_type,
				'_dipe_mail_status' => 'pending',
				'_dipe_form_email'  => $email,
			),
		),
		true
	);
	return $id;
}

/** Update this after attempting all server-configured team notifications. */
function dipe_core_set_submission_mail_status( $id, $status ) {
	if ( 'dipe_solicitud' !== get_post_type( $id ) || ! isset( dipe_core_submission_status_labels()[ $status ] ) ) {
		return false;
	}
	return (bool) update_post_meta( $id, '_dipe_mail_status', $status );
}

function dipe_core_contact_request_value( $params, $key ) {
	return isset( $params[ $key ] ) && is_scalar( $params[ $key ] ) ? (string) $params[ $key ] : '';
}

function dipe_core_contact_origin_label( $params ) {
	$origins = array(
		'home'      => 'Home',
		'proyectos' => 'Archivo de proyectos',
	);
	$origin  = sanitize_key( dipe_core_contact_request_value( $params, 'origen' ) );
	return $origins[ $origin ] ?? $origins['home'];
}

function dipe_core_contact_rate_limit_key() {
	$address = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	return 'dipe_contact_rate_' . hash( 'sha256', $address ?: 'unknown' );
}

function dipe_core_register_contact_form_route() {
	register_rest_route(
		'dipe/v1',
		'/forms/contacto',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'dipe_core_submit_contact_form',
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'dipe_core_register_contact_form_route' );

function dipe_core_submit_contact_form( WP_REST_Request $request ) {
	$params  = $request->get_json_params();
	$params  = is_array( $params ) ? $params : $request->get_params();
	$company = trim( dipe_core_contact_request_value( $params, 'company' ) );
	if ( '' !== $company ) {
		return new WP_REST_Response( array( 'message' => 'Gracias. Hemos recibido tu mensaje.' ), 201 );
	}

	$nombre    = sanitize_text_field( dipe_core_contact_request_value( $params, 'nombre' ) );
	$email     = sanitize_email( dipe_core_contact_request_value( $params, 'email' ) );
	$telefono  = sanitize_text_field( dipe_core_contact_request_value( $params, 'telefono' ) );
	$mensaje   = sanitize_textarea_field( dipe_core_contact_request_value( $params, 'mensaje' ) );
	$origen    = dipe_core_contact_origin_label( $params );
	$privacidad = filter_var( $params['privacidad'] ?? false, FILTER_VALIDATE_BOOLEAN );
	$errors    = array();
	if ( strlen( $nombre ) < 2 || strlen( $nombre ) > 160 ) {
		$errors['nombre'] = 'Indica tu nombre.';
	}
	if ( ! is_email( $email ) ) {
		$errors['email'] = 'Indica un email válido.';
	}
	if ( strlen( $telefono ) < 3 || strlen( $telefono ) > 50 ) {
		$errors['telefono'] = 'Indica tu teléfono.';
	}
	if ( '' === $mensaje || strlen( $mensaje ) > 5000 ) {
		$errors['mensaje'] = 'Escribe tu mensaje.';
	}
	if ( ! $privacidad ) {
		$errors['privacidad'] = 'Debes aceptar la política de privacidad.';
	}
	if ( $errors ) {
		return new WP_Error( 'dipe_invalid_contact', 'Revisa los campos marcados.', array( 'status' => 422, 'fields' => $errors ) );
	}

	$rate_key = dipe_core_contact_rate_limit_key();
	if ( (int) get_transient( $rate_key ) >= 5 ) {
		return new WP_Error( 'dipe_contact_rate_limited', 'Has realizado demasiados envíos. Inténtalo de nuevo más tarde.', array( 'status' => 429 ) );
	}

	$submission = dipe_core_record_submission(
		'contacto',
		array(
			'nombre'     => $nombre,
			'email'      => $email,
			'telefono'   => $telefono,
			'mensaje'    => $mensaje,
			'origen'     => $origen,
			'privacidad' => 'aceptada',
		)
	);
	if ( is_wp_error( $submission ) ) {
		return new WP_Error( 'dipe_contact_unavailable', 'No se ha podido enviar el mensaje. Inténtalo de nuevo.', array( 'status' => 500 ) );
	}

	set_transient( $rate_key, (int) get_transient( $rate_key ) + 1, 15 * MINUTE_IN_SECONDS );
	$recipients = dipe_core_mail_contact_recipients();
	$sent_count = 0;
	$message    = "Nueva solicitud de contacto\n\nPágina de origen: {$origen}\nNombre: {$nombre}\nEmail: {$email}\nTeléfono: {$telefono}\n\nMensaje:\n{$mensaje}\n\nPolítica de privacidad: aceptada";
	foreach ( $recipients as $recipient ) {
		if ( dipe_core_mail_send( 'team', $recipient, 'Nueva solicitud de contacto · ' . $nombre, $message, array( 'Reply-To: ' . $email ) ) ) {
			$sent_count++;
		}
	}
	$status = 0 === $sent_count ? 'failed' : ( count( $recipients ) === $sent_count ? 'sent' : 'partial' );
	dipe_core_set_submission_mail_status( $submission, $status );

	return new WP_REST_Response( array( 'message' => 'Gracias. Hemos recibido tu mensaje.' ), 201 );
}

function dipe_core_submission_admin_menu() {
	add_menu_page( 'Solicitudes', 'Solicitudes', 'manage_options', 'dipe-solicitudes', 'dipe_core_submission_admin_page', 'dashicons-email-alt2', 26 );
}
add_action( 'admin_menu', 'dipe_core_submission_admin_menu' );

function dipe_core_submission_admin_url( $args = array() ) {
	return add_query_arg( array_merge( array( 'page' => 'dipe-solicitudes' ), $args ), admin_url( 'admin.php' ) );
}

function dipe_core_submission_admin_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'No tienes permisos para ver las solicitudes.', 'dipe-core' ) );
	}
	$entry_id = isset( $_GET['entry'] ) ? absint( wp_unslash( $_GET['entry'] ) ) : 0;
	if ( $entry_id ) {
		dipe_core_submission_admin_detail( $entry_id );
		return;
	}

	$form_labels   = dipe_core_submission_form_labels();
	$status_labels = dipe_core_submission_status_labels();
	$form          = isset( $_GET['form_type'] ) ? sanitize_key( wp_unslash( $_GET['form_type'] ) ) : '';
	$status        = isset( $_GET['mail_status'] ) ? sanitize_key( wp_unslash( $_GET['mail_status'] ) ) : '';
	$month         = isset( $_GET['month'] ) ? sanitize_text_field( wp_unslash( $_GET['month'] ) ) : '';
	$search        = isset( $_GET['s'] ) ? sanitize_text_field( wp_unslash( $_GET['s'] ) ) : '';
	$page          = isset( $_GET['paged'] ) ? max( 1, absint( wp_unslash( $_GET['paged'] ) ) ) : 1;
	$form          = isset( $form_labels[ $form ] ) ? $form : '';
	$status        = isset( $status_labels[ $status ] ) ? $status : '';
	$month         = preg_match( '/^\d{4}-(0[1-9]|1[0-2])$/', $month ) ? $month : '';
	$query_args    = array(
		'post_type'      => 'dipe_solicitud',
		'post_status'    => 'private',
		'posts_per_page' => 20,
		'paged'          => $page,
		'orderby'        => 'date',
		'order'          => 'DESC',
		's'              => $search,
	);
	$meta_query    = array();
	if ( $form ) {
		$meta_query[] = array( 'key' => '_dipe_form_type', 'value' => $form );
	}
	if ( $status ) {
		$meta_query[] = array( 'key' => '_dipe_mail_status', 'value' => $status );
	}
	if ( $meta_query ) {
		$query_args['meta_query'] = $meta_query;
	}
	if ( $month ) {
		$query_args['date_query'] = array( array( 'year' => (int) substr( $month, 0, 4 ), 'month' => (int) substr( $month, 5, 2 ) ) );
	}
	$entries = new WP_Query( $query_args );
	$filters = array_filter( array( 'form_type' => $form, 'mail_status' => $status, 'month' => $month, 's' => $search ) );
	?>
	<div class="wrap">
		<h1>Solicitudes</h1>
		<p>Envíos recibidos desde los formularios de Dipe. El estado del correo indica la aceptación del servidor de salida; comprueba la recepción en el buzón si hay dudas.</p>
		<form method="get" action="<?php echo esc_url( admin_url( 'admin.php' ) ); ?>">
			<input type="hidden" name="page" value="dipe-solicitudes">
			<label class="screen-reader-text" for="dipe-filter-form">Formulario</label>
			<select id="dipe-filter-form" name="form_type"><option value="">Todos los formularios</option><?php foreach ( $form_labels as $key => $label ) : ?><option value="<?php echo esc_attr( $key ); ?>" <?php selected( $form, $key ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select>
			<label class="screen-reader-text" for="dipe-filter-status">Estado del correo</label>
			<select id="dipe-filter-status" name="mail_status"><option value="">Todos los estados</option><?php foreach ( $status_labels as $key => $label ) : ?><option value="<?php echo esc_attr( $key ); ?>" <?php selected( $status, $key ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select>
			<label for="dipe-filter-month">Mes</label> <input id="dipe-filter-month" type="month" name="month" value="<?php echo esc_attr( $month ); ?>">
			<label class="screen-reader-text" for="dipe-filter-search">Buscar solicitudes</label>
			<input id="dipe-filter-search" type="search" name="s" placeholder="Nombre, correo o texto" value="<?php echo esc_attr( $search ); ?>">
			<?php submit_button( 'Filtrar', 'secondary', 'submit', false ); ?>
			<a class="button" href="<?php echo esc_url( dipe_core_submission_admin_url() ); ?>">Limpiar</a>
		</form>
		<p><?php echo esc_html( number_format_i18n( $entries->found_posts ) ); ?> solicitudes</p>
		<table class="wp-list-table widefat fixed striped">
			<thead><tr><th scope="col">Fecha</th><th scope="col">Formulario</th><th scope="col">Solicitud</th><th scope="col">Correo</th><th scope="col">Estado del aviso</th></tr></thead>
			<tbody>
			<?php if ( ! $entries->have_posts() ) : ?>
				<tr><td colspan="5">No hay solicitudes para estos filtros.</td></tr>
			<?php else : foreach ( $entries->posts as $entry ) :
				$type = get_post_meta( $entry->ID, '_dipe_form_type', true );
				$mail = get_post_meta( $entry->ID, '_dipe_mail_status', true );
				$email = get_post_meta( $entry->ID, '_dipe_form_email', true );
				?>
				<tr>
					<td><?php echo esc_html( get_the_date( 'd/m/Y H:i', $entry ) ); ?></td>
					<td><?php echo esc_html( $form_labels[ $type ] ?? $type ); ?></td>
					<td><a href="<?php echo esc_url( dipe_core_submission_admin_url( array( 'entry' => $entry->ID ) ) ); ?>"><?php echo esc_html( get_the_title( $entry ) ); ?></a></td>
					<td><?php echo esc_html( $email ); ?></td>
					<td><?php echo esc_html( $status_labels[ $mail ] ?? $status_labels['pending'] ); ?></td>
				</tr>
			<?php endforeach; endif; ?>
			</tbody>
		</table>
		<?php if ( $entries->max_num_pages > 1 ) :
			$base = str_replace( '999999999', '%#%', esc_url_raw( add_query_arg( array_merge( $filters, array( 'paged' => 999999999 ) ), dipe_core_submission_admin_url() ) ) );
			?>
			<div class="tablenav"><div class="tablenav-pages">
				<?php echo wp_kses_post( paginate_links( array( 'base' => $base, 'format' => '', 'current' => $page, 'total' => $entries->max_num_pages ) ) ); ?>
			</div></div>
		<?php endif; ?>
	</div>
	<?php
}

function dipe_core_submission_admin_detail( $id ) {
	$entry = get_post( $id );
	if ( ! $entry || 'dipe_solicitud' !== $entry->post_type || 'private' !== $entry->post_status ) {
		wp_die( esc_html__( 'Solicitud no encontrada.', 'dipe-core' ) );
	}
	$form_labels   = dipe_core_submission_form_labels();
	$status_labels = dipe_core_submission_status_labels();
	$type          = get_post_meta( $id, '_dipe_form_type', true );
	$status        = get_post_meta( $id, '_dipe_mail_status', true );
	$fields        = json_decode( $entry->post_content, true );
	?>
	<div class="wrap">
		<a href="<?php echo esc_url( dipe_core_submission_admin_url() ); ?>">← Volver a solicitudes</a>
		<h1><?php echo esc_html( get_the_title( $entry ) ); ?></h1>
		<p><strong>Formulario:</strong> <?php echo esc_html( $form_labels[ $type ] ?? $type ); ?> · <strong>Fecha:</strong> <?php echo esc_html( get_the_date( 'd/m/Y H:i', $entry ) ); ?> · <strong>Estado del aviso:</strong> <?php echo esc_html( $status_labels[ $status ] ?? $status_labels['pending'] ); ?></p>
		<table class="widefat striped"><tbody>
		<?php if ( is_array( $fields ) ) : foreach ( $fields as $key => $value ) : ?>
			<tr><th scope="row" style="width: 220px;"><?php echo esc_html( ucwords( str_replace( '_', ' ', $key ) ) ); ?></th><td><?php echo nl2br( esc_html( is_scalar( $value ) ? (string) $value : '' ) ); ?></td></tr>
		<?php endforeach; endif; ?>
		</tbody></table>
	</div>
	<?php
}
