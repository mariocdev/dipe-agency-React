<?php
/** Private form submissions and the administrator inbox. */

defined( 'ABSPATH' ) || exit;

// Registra las solicitudes como contenido privado y fuera de REST público.
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
			'map_meta_cap'        => true,
			'rewrite'             => false,
			'query_var'           => false,
			'supports'            => array( 'title', 'editor' ),
		)
	);
}
add_action( 'init', 'dipe_core_register_submission_type' );

function dipe_core_submission_form_labels() {
	return array(
		'contacto'             => 'Contacto internas',
		'contacto-general'     => 'Contacto principal',
		'contacto-servicios'   => 'Contacto Servicios',
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
 * Called by a validated form handler. Never pass an unvalidated REST body
 * directly to this function. A saved submission survives a mail transport failure.
 */
function dipe_core_record_submission( $form_type, $fields, $source_url = '' ) {
	$form_type  = sanitize_key( $form_type );
	$source_url = dipe_core_submission_source_url( $source_url );
	$labels     = dipe_core_submission_form_labels();
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
				'_dipe_source_url'  => $source_url,
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

// Lee un campo escalar sin aceptar arrays u objetos como texto.
function dipe_core_contact_request_value( $params, $key ) {
	return isset( $params[ $key ] ) && is_scalar( $params[ $key ] ) ? (string) $params[ $key ] : '';
}

// Traduce el origen permitido del formulario a su etiqueta legible.
function dipe_core_contact_origin_label( $params ) {
	$origins = array(
		'home'      => 'Home',
		'proyectos' => 'Proyectos',
		'desarrollo-web' => 'Desarrollo web',
		'agencia' => 'Agencia / Quiénes somos',
		'contacto-principal' => 'Contacto principal',
	);
	$origin  = sanitize_key( dipe_core_contact_request_value( $params, 'origen' ) );
	return $origins[ $origin ] ?? 'No indicado';
}

/** Keep only a URL on this site, without query parameters or fragments. */
function dipe_core_submission_source_url( $url ) {
	$url   = trim( (string) $url );
	$parts = wp_parse_url( $url );
	$site  = wp_parse_url( home_url( '/' ) );
	if ( ! is_array( $parts ) || ! is_array( $site )
		|| ! in_array( strtolower( $parts['scheme'] ?? '' ), array( 'http', 'https' ), true )
		|| strtolower( $parts['host'] ?? '' ) !== strtolower( $site['host'] ?? '' )
		|| isset( $parts['user'] ) || isset( $parts['pass'] ) ) {
		return '';
	}

	$port      = (int) ( $parts['port'] ?? ( 'https' === strtolower( $parts['scheme'] ) ? 443 : 80 ) );
	$site_port = (int) ( $site['port'] ?? ( 'https' === strtolower( $site['scheme'] ?? '' ) ? 443 : 80 ) );
	if ( $port !== $site_port ) {
		return '';
	}

	$path = $parts['path'] ?? '/';
	return esc_url_raw( strtolower( $parts['scheme'] ) . '://' . $parts['host'] . ( isset( $parts['port'] ) ? ':' . $parts['port'] : '' ) . $path );
}

// Genera la clave del límite de envíos a partir de la IP de conexión.
function dipe_core_contact_rate_limit_key() {
	$address = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	return 'dipe_contact_rate_' . hash( 'sha256', $address ?: 'unknown' );
}

// Registra las tres rutas públicas de contacto admitidas.
function dipe_core_register_contact_form_route() {
	foreach ( array( 'contacto', 'contacto-servicios', 'contacto-general' ) as $form_type ) {
		register_rest_route(
			'dipe/v1',
			'/forms/' . $form_type,
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => 'dipe_core_submit_contact_form',
				'permission_callback' => '__return_true',
			)
		);
	}
}
add_action( 'rest_api_init', 'dipe_core_register_contact_form_route' );

// Valida el envío, aplica antispam, guarda la solicitud e intenta sus avisos.
function dipe_core_submit_contact_form( WP_REST_Request $request ) {
	// El tipo lo determina la ruta registrada, nunca un campo del visitante.
	$route_types = array(
		'/dipe/v1/forms/contacto' => 'contacto',
		'/dipe/v1/forms/contacto-servicios' => 'contacto-servicios',
		'/dipe/v1/forms/contacto-general' => 'contacto-general',
	);
	$form_type = $route_types[ untrailingslashit( $request->get_route() ) ] ?? '';
	if ( '' === $form_type ) {
		return new WP_Error( 'dipe_invalid_form', 'Formulario no disponible.', array( 'status' => 404 ) );
	}
	$is_main    = 'contacto-general' === $form_type;
	$form_label = dipe_core_submission_form_labels()[ $form_type ];
	$params  = $request->get_json_params();
	$params  = is_array( $params ) ? $params : $request->get_params();
	$company = trim( dipe_core_contact_request_value( $params, 'company' ) );
	if ( '' !== $company ) {
		return new WP_REST_Response( array(
			'message' => 'Gracias. Hemos recibido tu mensaje.',
			'redirect_url' => dipe_core_mail_form_redirect_url( $form_type ),
		), 201 );
	}

	$nombre     = sanitize_text_field( dipe_core_contact_request_value( $params, 'nombre' ) );
	$email      = sanitize_email( dipe_core_contact_request_value( $params, 'email' ) );
	$telefono   = sanitize_text_field( dipe_core_contact_request_value( $params, 'telefono' ) );
	$mensaje    = sanitize_textarea_field( dipe_core_contact_request_value( $params, 'mensaje' ) );
	$origen     = $is_main ? 'Contacto principal' : dipe_core_contact_origin_label( $params );
	$source_url = dipe_core_submission_source_url( dipe_core_contact_request_value( $params, 'url_origen' ) );
	if ( ! $source_url ) {
		$source_url = dipe_core_submission_source_url( $request->get_header( 'referer' ) );
	}
	$privacidad = filter_var( $params['privacidad'] ?? false, FILTER_VALIDATE_BOOLEAN );
	$errors    = array();
	if ( strlen( $nombre ) < 2 || strlen( $nombre ) > 160 ) {
		$errors['nombre'] = 'Indica tu nombre.';
	}
	if ( ! is_email( $email ) || ( $is_main && strlen( $email ) > 254 ) ) {
		$errors['email'] = 'Indica un email válido.';
	}
	if ( ( ! $is_main || '' !== $telefono ) && ( strlen( $telefono ) < 3 || strlen( $telefono ) > 50 ) ) {
		$errors['telefono'] = 'Indica tu teléfono.';
	}
	if ( ( ! $is_main && '' === $mensaje ) || strlen( $mensaje ) > 5000 ) {
		$errors['mensaje'] = 'Escribe tu mensaje.';
	}
	if ( ! $privacidad ) {
		$errors['privacidad'] = 'Debes aceptar la política de privacidad.';
	}
	$extra_fields  = array();
	$extra_message = '';
	if ( $is_main ) {
		$empresa_sector = sanitize_text_field( dipe_core_contact_request_value( $params, 'empresa_sector' ) );
		$objetivos      = sanitize_textarea_field( dipe_core_contact_request_value( $params, 'objetivos' ) );
		$interest_id    = trim( dipe_core_contact_request_value( $params, 'interes' ) );
		$budget_key     = trim( dipe_core_contact_request_value( $params, 'presupuesto' ) );
		$interest_name  = '';
		$budget_label   = '';
		if ( strlen( $empresa_sector ) > 250 ) {
			$errors['empresa_sector'] = 'Empresa y sector debe tener como máximo 250 caracteres.';
		}
		if ( strlen( $objetivos ) > 5000 ) {
			$errors['objetivos'] = 'Objetivos/KPIs debe tener como máximo 5.000 caracteres.';
		}
		if ( '' !== $interest_id ) {
			$term = ctype_digit( $interest_id ) ? get_term( (int) $interest_id, 'dipe_related_service' ) : null;
			if ( ! $term || is_wp_error( $term ) ) {
				$errors['interes'] = 'Selecciona un servicio disponible.';
			} else {
				$interest_id   = (string) $term->term_id;
				$interest_name = sanitize_text_field( html_entity_decode( $term->name, ENT_QUOTES, 'UTF-8' ) );
			}
		}
		$budgets = array();
		for ( $min = 0; $min < 20000; $min += 2000 ) {
			$max = $min + 2000;
			$budgets[ $min . '-' . $max ] = number_format( $min, 0, ',', '.' ) . ' – ' . number_format( $max, 0, ',', '.' ) . ' €';
		}
		$budgets['20000+'] = '20.000 € o más';
		if ( '' !== $budget_key ) {
			if ( ! isset( $budgets[ $budget_key ] ) ) {
				$errors['presupuesto'] = 'Selecciona un tramo de presupuesto válido.';
			} else {
				$budget_label = $budgets[ $budget_key ];
			}
		}
		foreach ( array( 'nombre', 'email', 'telefono', 'empresa_sector', 'interes', 'presupuesto', 'objetivos', 'mensaje' ) as $field ) {
			if ( isset( $params[ $field ] ) && ! is_scalar( $params[ $field ] ) ) {
				$errors[ $field ] = 'Revisa este campo.';
			}
		}
		$extra_fields = array(
			'empresa_sector'    => $empresa_sector,
			'interes_id'        => $interest_id,
			'interes'           => $interest_name,
			'presupuesto_tramo' => $budget_key,
			'presupuesto'       => $budget_label,
			'objetivos'         => $objetivos,
		);
		$extra_message = "\nEmpresa y sector: {$empresa_sector}\nServicio de interés: {$interest_name}\nPresupuesto estimado: {$budget_label}\n\nObjetivos/KPIs:\n{$objetivos}";
	}
	if ( $errors ) {
		return new WP_Error( 'dipe_invalid_contact', 'Revisa los campos marcados.', array( 'status' => 422, 'fields' => $errors ) );
	}

	$rate_key = dipe_core_contact_rate_limit_key();
	if ( (int) get_transient( $rate_key ) >= 5 ) {
		return new WP_Error( 'dipe_contact_rate_limited', 'Has realizado demasiados envíos. Inténtalo de nuevo más tarde.', array( 'status' => 429 ) );
	}

	$submission = dipe_core_record_submission(
		$form_type,
		array_merge( array(
			'nombre'     => $nombre,
			'email'      => $email,
			'telefono'   => $telefono,
			'mensaje'    => $mensaje,
			'origen'     => $origen,
			'privacidad' => 'aceptada',
		), $extra_fields ),
		$source_url
	);
	if ( is_wp_error( $submission ) ) {
		return new WP_Error( 'dipe_contact_unavailable', 'No se ha podido enviar el mensaje. Inténtalo de nuevo.', array( 'status' => 500 ) );
	}

	set_transient( $rate_key, (int) get_transient( $rate_key ) + 1, 15 * MINUTE_IN_SECONDS );
	$settings   = dipe_core_mail_settings();
	$recipient_keys = array(
		'contacto' => 'contact_recipients',
		'contacto-servicios' => 'services_recipients',
		'contacto-general' => 'main_recipients',
	);
	$recipients = dipe_core_mail_contact_recipients( $settings[ $recipient_keys[ $form_type ] ] );
	$sent_count = 0;
	$message    = "Nueva solicitud de {$form_label}\n\nSección: {$origen}\nURL de origen: " . ( $source_url ?: 'No disponible' ) . "\nNombre: {$nombre}\nEmail: {$email}\nTeléfono: {$telefono}{$extra_message}\n\nMensaje:\n{$mensaje}\n\nPolítica de privacidad: aceptada";
	foreach ( $recipients as $recipient ) {
		if ( dipe_core_mail_send( 'team', $recipient, 'Nueva solicitud de ' . $form_label . ' · ' . $nombre, $message, array( 'Reply-To: ' . $email ) ) ) {
			$sent_count++;
		}
	}
	$status = 0 === $sent_count ? 'failed' : ( count( $recipients ) === $sent_count ? 'sent' : 'partial' );
	dipe_core_set_submission_mail_status( $submission, $status );

	return new WP_REST_Response( array(
		'message' => 'Gracias. Hemos recibido tu mensaje.',
		'redirect_url' => dipe_core_mail_form_redirect_url( $form_type, $settings ),
	), 201 );
}

function dipe_core_submission_admin_menu() {
	add_menu_page( 'Solicitudes', 'Solicitudes', 'manage_options', 'dipe-solicitudes', 'dipe_core_submission_admin_page', 'dashicons-email-alt2', 26 );
}
add_action( 'admin_menu', 'dipe_core_submission_admin_menu' );

function dipe_core_submission_admin_url( $args = array() ) {
	return add_query_arg( array_merge( array( 'page' => 'dipe-solicitudes' ), $args ), admin_url( 'admin.php' ) );
}

// Acepta únicamente fechas válidas para los filtros de la bandeja.
function dipe_core_submission_filter_date( $value ) {
	if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $value ) ) {
		return '';
	}
	list( $year, $month, $day ) = array_map( 'intval', explode( '-', $value ) );
	return checkdate( $month, $day, $year ) ? $value : '';
}

/** Accept only inbox filters, never a caller-supplied return URL. */
function dipe_core_submission_list_filters( $params ) {
	$form = sanitize_key( dipe_core_contact_request_value( $params, 'form_type' ) );
	$status = sanitize_key( dipe_core_contact_request_value( $params, 'mail_status' ) );
	return array_filter( array(
		'form_type' => isset( dipe_core_submission_form_labels()[ $form ] ) ? $form : '',
		'mail_status' => isset( dipe_core_submission_status_labels()[ $status ] ) ? $status : '',
		'date_from' => dipe_core_submission_filter_date( dipe_core_contact_request_value( $params, 'date_from' ) ),
		'date_to' => dipe_core_submission_filter_date( dipe_core_contact_request_value( $params, 'date_to' ) ),
		's' => sanitize_text_field( dipe_core_contact_request_value( $params, 's' ) ),
		'view' => 'trash' === dipe_core_contact_request_value( $params, 'view' ) ? 'trash' : '',
	), static function ( $value ) { return '' !== $value; } );
}

// Carga los controles de gestión solo en la bandeja de solicitudes.
function dipe_core_submission_admin_assets( $hook ) {
	if ( 'toplevel_page_dipe-solicitudes' !== $hook || ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$root = dirname( __DIR__ );
	wp_enqueue_script( 'dipe-submissions-admin', plugins_url( 'admin/submissions.js', $root . '/dipe-core.php' ), array(), DIPE_CORE_VERSION, true );
}
add_action( 'admin_enqueue_scripts', 'dipe_core_submission_admin_assets' );

/** Restored submissions must stay private, regardless of WP's draft default. */
function dipe_core_submission_restore_status( $status, $post_id ) {
	return 'dipe_solicitud' === get_post_type( $post_id ) ? 'private' : $status;
}
add_filter( 'wp_untrash_post_status', 'dipe_core_submission_restore_status', 10, 2 );

// Conserva los filtros y añade el nonce a las acciones de gestión.
function dipe_core_submission_action_fields( $filters ) {
	?>
	<input type="hidden" name="action" value="dipe_core_manage_submissions">
	<?php wp_nonce_field( 'dipe_core_manage_submissions' ); ?>
	<?php foreach ( $filters as $key => $value ) : ?>
		<input type="hidden" name="return_filters[<?php echo esc_attr( $key ); ?>]" value="<?php echo esc_attr( $value ); ?>">
	<?php endforeach;
}

// Procesa papelera, restauración o borrado con permisos y nonce.
function dipe_core_submission_manage() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'No tienes permisos para gestionar las solicitudes.', 'dipe-core' ), '', array( 'response' => 403 ) );
	}
	if ( 'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
		wp_die( esc_html__( 'Método no permitido.', 'dipe-core' ), '', array( 'response' => 405 ) );
	}
	check_admin_referer( 'dipe_core_manage_submissions' );
	$posted = wp_unslash( $_POST );
	$single = dipe_core_contact_request_value( $posted, 'single_action' );
	$operation = sanitize_key( dipe_core_contact_request_value( $posted, 'bulk_action' ) );
	$ids = isset( $posted['submission_ids'] ) && is_array( $posted['submission_ids'] ) ? $posted['submission_ids'] : array();
	if ( '' !== $single ) {
		if ( ! preg_match( '/^(trash|restore|delete):([1-9][0-9]*)$/', $single, $matches ) ) {
			wp_die( esc_html__( 'Acción no válida.', 'dipe-core' ), '', array( 'response' => 400 ) );
		}
		$operation = $matches[1];
		$ids = array( $matches[2] );
	}
	$ids = array_values( array_unique( array_filter( array_map( static function ( $id ) {
		return is_scalar( $id ) && ctype_digit( (string) $id ) ? absint( $id ) : 0;
	}, $ids ) ) ) );
	if ( count( $ids ) > 200 ) {
		wp_die( esc_html__( 'Selecciona como máximo 200 solicitudes por acción.', 'dipe-core' ), '', array( 'response' => 400 ) );
	}
	$filters = dipe_core_submission_list_filters( isset( $posted['return_filters'] ) && is_array( $posted['return_filters'] ) ? $posted['return_filters'] : array() );
	if ( ! $ids || ! in_array( $operation, array( 'trash', 'restore', 'delete' ), true ) ) {
		wp_safe_redirect( dipe_core_submission_admin_url( array_merge( $filters, array( 'notice' => 'empty' ) ) ) );
		exit;
	}
	$changed = 0;
	foreach ( $ids as $id ) {
		$entry = get_post( $id );
		$capability = 'restore' === $operation ? 'edit_post' : 'delete_post';
		if ( ! $entry || 'dipe_solicitud' !== $entry->post_type || ! current_user_can( $capability, $id ) ) {
			continue;
		}
		$result = false;
		if ( 'trash' === $operation && 'private' === $entry->post_status && EMPTY_TRASH_DAYS ) {
			$result = wp_trash_post( $id );
		} elseif ( 'restore' === $operation && 'trash' === $entry->post_status ) {
			$result = wp_untrash_post( $id );
		} elseif ( 'delete' === $operation && ( 'trash' === $entry->post_status || ( ! EMPTY_TRASH_DAYS && 'private' === $entry->post_status ) ) ) {
			$result = wp_delete_post( $id, true );
		}
		if ( $result && ! is_wp_error( $result ) ) {
			$changed++;
		}
	}
	wp_safe_redirect( dipe_core_submission_admin_url( array_merge( $filters, array(
		'notice' => $operation,
		'changed' => $changed,
		'skipped' => count( $ids ) - $changed,
	) ) ) );
	exit;
}
add_action( 'admin_post_dipe_core_manage_submissions', 'dipe_core_submission_manage' );

// Muestra el resultado de las acciones realizadas en la bandeja.
function dipe_core_submission_action_notice() {
	$notice = sanitize_key( dipe_core_contact_request_value( $_GET, 'notice' ) );
	if ( 'empty' === $notice ) {
		echo '<div class="notice notice-warning"><p>Selecciona una acción y al menos una solicitud.</p></div>';
		return;
	}
	$labels = array( 'trash' => 'enviadas a la papelera', 'restore' => 'restauradas', 'delete' => 'eliminadas definitivamente' );
	if ( ! isset( $labels[ $notice ] ) ) {
		return;
	}
	$changed = absint( dipe_core_contact_request_value( $_GET, 'changed' ) );
	$skipped = absint( dipe_core_contact_request_value( $_GET, 'skipped' ) );
	$message = $changed ? sprintf( 'Solicitudes %s: %s.', $labels[ $notice ], number_format_i18n( $changed ) ) : 'No se ha cambiado ninguna solicitud.';
	if ( $skipped ) {
		$message .= sprintf( ' No se pudieron procesar %s solicitudes; pueden haber cambiado de estado o no estar disponibles.', number_format_i18n( $skipped ) );
	}
	echo '<div class="notice ' . ( $skipped || ! $changed ? 'notice-warning' : 'notice-success' ) . '"><p>' . esc_html( $message ) . '</p></div>';
}

// Dibuja la bandeja con búsqueda, filtros y paginación.
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
	$filters       = dipe_core_submission_list_filters( wp_unslash( $_GET ) );
	$form          = $filters['form_type'] ?? '';
	$status        = $filters['mail_status'] ?? '';
	$date_from     = $filters['date_from'] ?? '';
	$date_to       = $filters['date_to'] ?? '';
	$search        = $filters['s'] ?? '';
	$page          = max( 1, absint( dipe_core_contact_request_value( $_GET, 'paged' ) ) );
	$is_trash      = 'trash' === ( $filters['view'] ?? '' );
	$normal_action = EMPTY_TRASH_DAYS ? 'trash' : 'delete';
	$query_args    = array(
		'post_type'      => 'dipe_solicitud',
		'post_status'    => $is_trash ? 'trash' : 'private',
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
	if ( $date_from ) {
		list( $year, $month, $day ) = array_map( 'intval', explode( '-', $date_from ) );
		$query_args['date_query'][] = array( 'after' => array( 'year' => $year, 'month' => $month, 'day' => $day ), 'inclusive' => true );
	}
	if ( $date_to ) {
		list( $year, $month, $day ) = array_map( 'intval', explode( '-', $date_to ) );
		$query_args['date_query'][] = array( 'before' => array( 'year' => $year, 'month' => $month, 'day' => $day ), 'inclusive' => true );
	}
	$entries = new WP_Query( $query_args );
	$counts = wp_count_posts( 'dipe_solicitud' );
	$active_filters = $filters;
	unset( $active_filters['view'] );
	?>
	<div class="wrap">
		<h1>Solicitudes</h1>
		<?php dipe_core_submission_action_notice(); ?>
		<p>Envíos recibidos desde los formularios de Dipe. El estado del correo indica la aceptación del servidor de salida; comprueba la recepción en el buzón si hay dudas.</p>
		<ul class="subsubsub">
			<li><a href="<?php echo esc_url( dipe_core_submission_admin_url( $active_filters ) ); ?>"<?php if ( ! $is_trash ) echo ' class="current" aria-current="page"'; ?>>Recibidas (<?php echo esc_html( number_format_i18n( $counts->private ?? 0 ) ); ?>)</a> | </li>
			<li><a href="<?php echo esc_url( dipe_core_submission_admin_url( array_merge( $active_filters, array( 'view' => 'trash' ) ) ) ); ?>"<?php if ( $is_trash ) echo ' class="current" aria-current="page"'; ?>>Papelera (<?php echo esc_html( number_format_i18n( $counts->trash ?? 0 ) ); ?>)</a></li>
		</ul>
		<br class="clear">
		<form method="get" action="<?php echo esc_url( admin_url( 'admin.php' ) ); ?>">
			<input type="hidden" name="page" value="dipe-solicitudes">
			<?php if ( $is_trash ) : ?><input type="hidden" name="view" value="trash"><?php endif; ?>
			<label class="screen-reader-text" for="dipe-filter-form">Formulario</label>
			<select id="dipe-filter-form" name="form_type"><option value="">Todos los formularios</option><?php foreach ( $form_labels as $key => $label ) : ?><option value="<?php echo esc_attr( $key ); ?>" <?php selected( $form, $key ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select>
			<label class="screen-reader-text" for="dipe-filter-status">Estado del correo</label>
			<select id="dipe-filter-status" name="mail_status"><option value="">Todos los estados</option><?php foreach ( $status_labels as $key => $label ) : ?><option value="<?php echo esc_attr( $key ); ?>" <?php selected( $status, $key ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select>
			<label for="dipe-filter-from">Desde</label> <input id="dipe-filter-from" type="date" name="date_from" value="<?php echo esc_attr( $date_from ); ?>">
			<label for="dipe-filter-to">Hasta</label> <input id="dipe-filter-to" type="date" name="date_to" value="<?php echo esc_attr( $date_to ); ?>">
			<label class="screen-reader-text" for="dipe-filter-search">Buscar solicitudes</label>
			<input id="dipe-filter-search" type="search" name="s" placeholder="Nombre, correo o texto" value="<?php echo esc_attr( $search ); ?>">
			<?php submit_button( 'Filtrar', 'secondary', 'submit', false ); ?>
			<a class="button" href="<?php echo esc_url( dipe_core_submission_admin_url( $is_trash ? array( 'view' => 'trash' ) : array() ) ); ?>">Limpiar</a>
		</form>
		<p><?php echo esc_html( number_format_i18n( $entries->found_posts ) ); ?> solicitudes</p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" data-dipe-submissions>
		<?php dipe_core_submission_action_fields( $filters ); ?>
		<div class="tablenav top"><div class="alignleft actions bulkactions">
			<label class="screen-reader-text" for="dipe-bulk-action">Acciones en lote</label>
			<select name="bulk_action" id="dipe-bulk-action">
				<option value="">Acciones en lote</option>
				<?php if ( $is_trash ) : ?>
					<option value="restore">Restaurar</option>
					<option value="delete">Eliminar definitivamente</option>
				<?php else : ?>
					<option value="<?php echo esc_attr( $normal_action ); ?>"><?php echo 'trash' === $normal_action ? 'Mover a la papelera' : 'Eliminar definitivamente'; ?></option>
				<?php endif; ?>
			</select>
			<?php submit_button( 'Aplicar', 'secondary', 'submit', false ); ?>
		</div></div>
		<table class="wp-list-table widefat fixed striped">
			<thead><tr><td class="manage-column column-cb check-column"><input type="checkbox" id="dipe-select-all" data-dipe-select-all><label class="screen-reader-text" for="dipe-select-all">Seleccionar todas las solicitudes de esta página</label></td><th scope="col">Fecha</th><th scope="col">Formulario</th><th scope="col">Solicitud</th><th scope="col">Origen</th><th scope="col">Correo</th><th scope="col">Estado del aviso</th></tr></thead>
			<tbody>
			<?php if ( ! $entries->have_posts() ) : ?>
				<tr><td colspan="7">No hay solicitudes para estos filtros.</td></tr>
			<?php else : foreach ( $entries->posts as $entry ) :
				$type = get_post_meta( $entry->ID, '_dipe_form_type', true );
				$mail = get_post_meta( $entry->ID, '_dipe_mail_status', true );
				$email = get_post_meta( $entry->ID, '_dipe_form_email', true );
				$source_url = get_post_meta( $entry->ID, '_dipe_source_url', true );
				$fields = json_decode( $entry->post_content, true );
				$origin = is_array( $fields ) && isset( $fields['origen'] ) && is_scalar( $fields['origen'] ) ? (string) $fields['origen'] : '';
				?>
				<tr>
					<th scope="row" class="check-column"><input type="checkbox" id="dipe-entry-<?php echo esc_attr( $entry->ID ); ?>" name="submission_ids[]" value="<?php echo esc_attr( $entry->ID ); ?>" <?php disabled( ! current_user_can( 'delete_post', $entry->ID ) && ! ( $is_trash && current_user_can( 'edit_post', $entry->ID ) ) ); ?>><label class="screen-reader-text" for="dipe-entry-<?php echo esc_attr( $entry->ID ); ?>"><?php echo esc_html( 'Seleccionar ' . get_the_title( $entry ) ); ?></label></th>
					<td><?php echo esc_html( get_the_date( 'd/m/Y H:i', $entry ) ); ?></td>
					<td><?php echo esc_html( $form_labels[ $type ] ?? $type ); ?></td>
					<td>
						<a href="<?php echo esc_url( dipe_core_submission_admin_url( array_merge( $filters, array( 'entry' => $entry->ID ) ) ) ); ?>"><?php echo esc_html( get_the_title( $entry ) ); ?></a>
						<div class="row-actions">
							<?php if ( $is_trash ) : ?>
								<?php if ( current_user_can( 'edit_post', $entry->ID ) ) : ?><button type="submit" class="button-link" name="single_action" value="restore:<?php echo esc_attr( $entry->ID ); ?>">Restaurar</button> | <?php endif; ?>
								<?php if ( current_user_can( 'delete_post', $entry->ID ) ) : ?><button type="submit" class="button-link-delete" name="single_action" value="delete:<?php echo esc_attr( $entry->ID ); ?>">Eliminar definitivamente</button><?php endif; ?>
							<?php elseif ( current_user_can( 'delete_post', $entry->ID ) ) : ?>
								<button type="submit" class="button-link-delete" name="single_action" value="<?php echo esc_attr( $normal_action . ':' . $entry->ID ); ?>"><?php echo 'trash' === $normal_action ? 'Mover a la papelera' : 'Eliminar definitivamente'; ?></button>
							<?php endif; ?>
						</div>
					</td>
					<td><?php echo esc_html( $origin ?: '—' ); ?><?php if ( $source_url ) : ?><br><a style="overflow-wrap: anywhere;" href="<?php echo esc_url( $source_url ); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $source_url ); ?></a><?php endif; ?></td>
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
		</form>
	</div>
	<?php
}

// Muestra los campos y el estado del aviso de una solicitud.
function dipe_core_submission_admin_detail( $id ) {
	$entry = get_post( $id );
	if ( ! $entry || 'dipe_solicitud' !== $entry->post_type || ! in_array( $entry->post_status, array( 'private', 'trash' ), true ) ) {
		wp_die( esc_html__( 'Solicitud no encontrada.', 'dipe-core' ) );
	}
	$form_labels   = dipe_core_submission_form_labels();
	$status_labels = dipe_core_submission_status_labels();
	$type          = get_post_meta( $id, '_dipe_form_type', true );
	$status        = get_post_meta( $id, '_dipe_mail_status', true );
	$source_url    = get_post_meta( $id, '_dipe_source_url', true );
	$fields        = json_decode( $entry->post_content, true );
	$is_trash      = 'trash' === $entry->post_status;
	$filters       = dipe_core_submission_list_filters( wp_unslash( $_GET ) );
	if ( $is_trash ) {
		$filters['view'] = 'trash';
	} else {
		unset( $filters['view'] );
	}
	?>
	<div class="wrap">
		<a href="<?php echo esc_url( dipe_core_submission_admin_url( $filters ) ); ?>">← Volver a solicitudes</a>
		<h1><?php echo esc_html( get_the_title( $entry ) ); ?></h1>
		<?php if ( $is_trash ) : ?><p><strong>Esta solicitud está en la papelera.</strong></p><?php endif; ?>
		<p><strong>Formulario:</strong> <?php echo esc_html( $form_labels[ $type ] ?? $type ); ?> · <strong>Fecha:</strong> <?php echo esc_html( get_the_date( 'd/m/Y H:i', $entry ) ); ?> · <strong>Estado del aviso:</strong> <?php echo esc_html( $status_labels[ $status ] ?? $status_labels['pending'] ); ?></p>
		<p><strong>URL de origen:</strong> <?php if ( $source_url ) : ?><a href="<?php echo esc_url( $source_url ); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $source_url ); ?></a><?php else : ?>No disponible<?php endif; ?></p>
		<table class="widefat striped"><tbody>
		<?php if ( is_array( $fields ) ) : foreach ( $fields as $key => $value ) : ?>
			<tr><th scope="row" style="width: 220px;"><?php echo esc_html( ucwords( str_replace( '_', ' ', $key ) ) ); ?></th><td><?php echo nl2br( esc_html( is_scalar( $value ) ? (string) $value : '' ) ); ?></td></tr>
		<?php endforeach; endif; ?>
		</tbody></table>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" data-dipe-submissions>
			<?php dipe_core_submission_action_fields( $filters ); ?>
			<p>
			<?php if ( $is_trash ) : ?>
				<?php if ( current_user_can( 'edit_post', $id ) ) : ?><button type="submit" class="button button-secondary" name="single_action" value="restore:<?php echo esc_attr( $id ); ?>">Restaurar solicitud</button> <?php endif; ?>
				<?php if ( current_user_can( 'delete_post', $id ) ) : ?><button type="submit" class="button-link-delete" name="single_action" value="delete:<?php echo esc_attr( $id ); ?>">Eliminar definitivamente</button><?php endif; ?>
			<?php elseif ( current_user_can( 'delete_post', $id ) ) : ?>
				<button type="submit" class="button-link-delete" name="single_action" value="<?php echo esc_attr( ( EMPTY_TRASH_DAYS ? 'trash' : 'delete' ) . ':' . $id ); ?>"><?php echo EMPTY_TRASH_DAYS ? 'Mover a la papelera' : 'Eliminar definitivamente'; ?></button>
			<?php endif; ?>
			</p>
		</form>
	</div>
	<?php
}
