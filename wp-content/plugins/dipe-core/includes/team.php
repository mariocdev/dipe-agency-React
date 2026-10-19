<?php
/** Equipo DIPE: administration-only profiles and a published carousel feed. */

defined( 'ABSPATH' ) || exit;

// Registra los perfiles del equipo sin crear fichas públicas individuales.
function dipe_core_register_team() {
	register_post_type(
		'dipe_equipo',
		array(
			'labels' => array(
				'name' => 'Equipo DIPE',
				'singular_name' => 'Persona del equipo',
				'add_new' => 'Añadir persona',
				'add_new_item' => 'Añadir persona al equipo',
				'edit_item' => 'Editar persona',
				'new_item' => 'Nueva persona',
				'all_items' => 'Todas las personas',
				'search_items' => 'Buscar personas',
				'not_found' => 'No se han encontrado personas.',
			),
			'public' => false,
			'publicly_queryable' => false,
			'exclude_from_search' => true,
			'show_ui' => true,
			'show_in_menu' => true,
			'show_in_nav_menus' => false,
			'show_in_rest' => false,
			'has_archive' => false,
			'rewrite' => false,
			'query_var' => false,
			'supports' => array( 'title', 'page-attributes' ),
			'menu_icon' => get_site_icon_url( 32 ) ?: 'dashicons-groups',
		)
	);
}
add_action( 'init', 'dipe_core_register_team' );

function dipe_core_team_title_placeholder( $placeholder, $post ) {
	return 'dipe_equipo' === $post->post_type ? 'Nombre' : $placeholder;
}
add_filter( 'enter_title_here', 'dipe_core_team_title_placeholder', 10, 2 );

function dipe_core_team_row_actions( $actions, $post ) {
	if ( 'dipe_equipo' === $post->post_type ) {
		unset( $actions['view'], $actions['preview'] );
	}
	return $actions;
}
add_filter( 'post_row_actions', 'dipe_core_team_row_actions', 10, 2 );

// Define los campos ACF de los perfiles del equipo.
function dipe_core_team_fields() {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	acf_add_local_field_group(
		array(
			'key' => 'group_dipe_team',
			'title' => 'Datos de la persona',
			'fields' => array(
				array(
					'key' => 'field_dipe_team_image',
					'label' => 'Imagen',
					'name' => 'dipe_team_image',
					'type' => 'image',
					'required' => 1,
					'return_format' => 'id',
					'preview_size' => 'medium',
					'library' => 'all',
					'instructions' => 'Una persona por ficha. Escribe su nombre en el campo superior.',
				),
				array(
					'key' => 'field_dipe_team_role',
					'label' => 'Cargo',
					'name' => 'dipe_team_role',
					'type' => 'text',
					'required' => 1,
				),
				array(
					'key' => 'field_dipe_team_quote',
					'label' => 'Frase',
					'name' => 'dipe_team_quote',
					'type' => 'textarea',
					'rows' => 2,
					'new_lines' => '',
					'instructions' => 'Una frase personal breve. Puedes dejarla vacía.',
				),
			),
			'location' => array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'dipe_equipo' ) ) ),
			'show_in_rest' => 0,
		)
	);
}
add_action( 'acf/init', 'dipe_core_team_fields' );

// Prepara la imagen y su texto alternativo para el carrusel.
function dipe_core_team_image( $post_id ) {
	$image_id = absint( get_post_meta( $post_id, 'dipe_team_image', true ) );
	$image = $image_id ? wp_get_attachment_image_src( $image_id, 'medium_large' ) : false;
	if ( ! $image ) {
		return null;
	}
	return array(
		'url' => esc_url_raw( $image[0] ),
		'width' => (int) $image[1],
		'height' => (int) $image[2],
		'alt' => sanitize_text_field( get_post_meta( $image_id, '_wp_attachment_image_alt', true ) ),
	);
}

// Devuelve los perfiles publicados en el orden configurado.
function dipe_core_team_rest() {
	$posts = get_posts(
		array(
			'post_type' => 'dipe_equipo',
			'post_status' => 'publish',
			'has_password' => false,
			'posts_per_page' => -1,
			'orderby' => array( 'menu_order' => 'ASC', 'ID' => 'ASC' ),
		)
	);
	$members = array();
	foreach ( $posts as $post ) {
		$name = sanitize_text_field( $post->post_title );
		if ( '' === $name ) {
			continue;
		}
		$members[] = array(
			'id' => $post->ID,
			'name' => $name,
			'image' => dipe_core_team_image( $post->ID ),
			'role' => sanitize_text_field( get_post_meta( $post->ID, 'dipe_team_role', true ) ),
			'quote' => sanitize_textarea_field( get_post_meta( $post->ID, 'dipe_team_quote', true ) ),
		);
	}
	return rest_ensure_response( $members );
}

// Expone el listado público del equipo para React.
function dipe_core_register_team_route() {
	register_rest_route( 'dipe/v1', '/equipo', array(
		'methods' => WP_REST_Server::READABLE,
		'callback' => 'dipe_core_team_rest',
		'permission_callback' => '__return_true',
	) );
}
add_action( 'rest_api_init', 'dipe_core_register_team_route' );

function dipe_core_team_order_menu() {
	$GLOBALS['dipe_core_team_order_hook'] = add_submenu_page( 'edit.php?post_type=dipe_equipo', 'Ordenar carrusel', 'Ordenar carrusel', 'edit_others_posts', 'dipe-equipo-orden', 'dipe_core_team_order_page' );
}
add_action( 'admin_menu', 'dipe_core_team_order_menu' );

// Recupera los perfiles que se pueden ordenar en administración.
function dipe_core_team_order_posts() {
	return get_posts( array(
		'post_type' => 'dipe_equipo',
		'post_status' => array( 'publish', 'draft', 'pending', 'private', 'future' ),
		'posts_per_page' => -1,
		'orderby' => array( 'menu_order' => 'ASC', 'ID' => 'ASC' ),
	) );
}

// Muestra la pantalla para reordenar los perfiles del equipo.
function dipe_core_team_order_page() {
	if ( ! current_user_can( 'edit_others_posts' ) ) {
		wp_die( 'No tienes permisos para ordenar el equipo.' );
	}
	$posts = dipe_core_team_order_posts();
	$status = isset( $_GET['team_order_status'] ) && is_string( $_GET['team_order_status'] ) ? sanitize_key( wp_unslash( $_GET['team_order_status'] ) ) : '';
	?>
	<div class="wrap dipe-team-order">
		<h1>Ordenar carrusel de Equipo DIPE</h1>
		<p>Arrastra las personas o utiliza las flechas. Después pulsa Guardar orden. Solo las fichas publicadas aparecen en la web.</p>
		<?php if ( 'saved' === $status ) : ?>
			<div class="notice notice-success"><p>Orden guardado.</p></div>
		<?php elseif ( 'error' === $status ) : ?>
			<div class="notice notice-error"><p>No se ha podido guardar todo el orden. Recarga la lista y vuelve a guardarlo.</p></div>
		<?php endif; ?>
		<?php if ( ! $posts ) : ?>
			<p>Añade primero las personas en Equipo DIPE.</p>
		<?php else : ?>
			<form action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" method="post">
				<input type="hidden" name="action" value="dipe_team_order">
				<?php wp_nonce_field( 'dipe_team_order' ); ?>
				<ul class="dipe-team-order__list" id="dipe-team-order-list">
					<?php foreach ( $posts as $index => $person ) : ?>
						<li class="dipe-team-order__person">
							<span class="dipe-team-order__drag" aria-hidden="true">☰</span>
							<span class="dipe-team-order__position"><?php echo (int) $index + 1; ?></span>
							<span class="dipe-team-order__name"><?php echo esc_html( $person->post_title ?: '(Sin nombre)' ); ?></span>
							<span class="dipe-team-order__status"><?php echo esc_html( get_post_status_object( $person->post_status )->label ); ?></span>
							<input type="hidden" name="team_order[]" value="<?php echo (int) $person->ID; ?>">
							<button class="button dipe-team-order__move" type="button" data-direction="up" aria-label="<?php echo esc_attr( 'Subir a ' . $person->post_title ); ?>">↑</button>
							<button class="button dipe-team-order__move" type="button" data-direction="down" aria-label="<?php echo esc_attr( 'Bajar a ' . $person->post_title ); ?>">↓</button>
						</li>
					<?php endforeach; ?>
				</ul>
				<p class="screen-reader-text" id="dipe-team-order-feedback" role="status" aria-live="polite"></p>
				<?php submit_button( 'Guardar orden' ); ?>
			</form>
		<?php endif; ?>
	</div>
	<?php
}

// Guarda el orden solicitado tras comprobar permisos y nonce.
function dipe_core_team_save_order() {
	if ( ! current_user_can( 'edit_others_posts' ) ) {
		wp_die( 'No tienes permisos para ordenar el equipo.' );
	}
	check_admin_referer( 'dipe_team_order' );
	$raw_ids = isset( $_POST['team_order'] ) && is_array( $_POST['team_order'] ) ? wp_unslash( $_POST['team_order'] ) : array();
	$ids = array();
	foreach ( $raw_ids as $value ) {
		if ( ! is_scalar( $value ) || ! absint( $value ) ) {
			wp_die( 'El orden recibido no es válido.' );
		}
		$ids[] = absint( $value );
	}
	$current_ids = wp_list_pluck( dipe_core_team_order_posts(), 'ID' );
	$submitted_set = $ids;
	sort( $submitted_set );
	sort( $current_ids );
	if ( ! $ids || $submitted_set !== $current_ids ) {
		wp_die( 'La lista de personas ha cambiado. Recarga la pantalla de orden y vuelve a guardarlo.' );
	}
	foreach ( $ids as $id ) {
		if ( 'dipe_equipo' !== get_post_type( $id ) || ! current_user_can( 'edit_post', $id ) ) {
			wp_die( 'No tienes permisos para ordenar todas las personas.' );
		}
	}
	$status = 'saved';
	foreach ( $ids as $position => $id ) {
		$result = wp_update_post( array( 'ID' => $id, 'menu_order' => $position ), true );
		if ( is_wp_error( $result ) || ! $result ) {
			$status = 'error';
			break;
		}
	}
	wp_safe_redirect( add_query_arg( array( 'post_type' => 'dipe_equipo', 'page' => 'dipe-equipo-orden', 'team_order_status' => $status ), admin_url( 'edit.php' ) ) );
	exit;
}
add_action( 'admin_post_dipe_team_order', 'dipe_core_team_save_order' );

function dipe_core_team_admin_assets( $hook ) {
	$root = dirname( __DIR__ );
	wp_enqueue_style( 'dipe-team-admin', plugins_url( 'admin/team.css', $root . '/dipe-core.php' ), array(), (string) filemtime( $root . '/admin/team.css' ) );
	if ( $hook === ( $GLOBALS['dipe_core_team_order_hook'] ?? null ) ) {
		wp_enqueue_script( 'dipe-team-order', plugins_url( 'admin/team-order.js', $root . '/dipe-core.php' ), array( 'jquery', 'jquery-ui-sortable' ), (string) filemtime( $root . '/admin/team-order.js' ), true );
	}
}
add_action( 'admin_enqueue_scripts', 'dipe_core_team_admin_assets' );

// Aplica el orden manual al listado administrativo del equipo.
function dipe_core_team_default_order( $query ) {
	if ( is_admin() && $query->is_main_query() && 'dipe_equipo' === $query->get( 'post_type' ) && ! $query->get( 'orderby' ) ) {
		$query->set( 'orderby', array( 'menu_order' => 'ASC', 'ID' => 'ASC' ) );
	}
}
add_action( 'pre_get_posts', 'dipe_core_team_default_order' );
