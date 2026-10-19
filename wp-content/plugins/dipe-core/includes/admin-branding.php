<?php
/** Dipe identity for the native WordPress administration and login screens. */

defined( 'ABSPATH' ) || exit;

function dipe_core_brand_logo_url() {
	return wp_get_attachment_image_url( (int) get_theme_mod( 'custom_logo' ), 'full' ) ?: '';
}

function dipe_core_enqueue_brand_styles() {
	$path = dirname( __DIR__ ) . '/admin/branding.css';
	wp_enqueue_style(
		'dipe-admin-branding',
		plugins_url( 'admin/branding.css', dirname( __DIR__ ) . '/dipe-core.php' ),
		array(),
		(string) filemtime( $path )
	);

	$logo = dipe_core_brand_logo_url();
	if ( $logo ) {
		wp_add_inline_style( 'dipe-admin-branding', '.dipe-login #login h1 a { background-image: url("' . esc_url( $logo ) . '"); }' );
	}
}
add_action( 'admin_enqueue_scripts', 'dipe_core_enqueue_brand_styles', 100 );
add_action( 'login_enqueue_scripts', 'dipe_core_enqueue_brand_styles', 100 );

function dipe_core_brand_admin_class( $classes ) {
	return $classes . ' dipe-admin';
}
add_filter( 'admin_body_class', 'dipe_core_brand_admin_class' );

/** Compact image column for the three editorial content lists. */
function dipe_core_admin_image_column( $columns ) {
	$result = array();
	foreach ( $columns as $key => $label ) {
		if ( 'title' === $key ) {
			$result['dipe_thumbnail'] = __( 'Imagen', 'dipe-core' );
		}
		$result[ $key ] = $label;
	}
	return $result;
}

function dipe_core_admin_image_cell( $column, $post_id ) {
	if ( 'dipe_thumbnail' !== $column ) {
		return;
	}

	$post_type = get_post_type( $post_id );
	if ( 'dipe_equipo' === $post_type ) {
		$image_id = absint( get_post_meta( $post_id, 'dipe_team_image', true ) );
	} else {
		$image_id = get_post_thumbnail_id( $post_id );
		if ( ! $image_id && 'dipe_proyecto' === $post_type ) {
			$image_id = absint( get_post_meta( $post_id, 'dipe_project_home_card_image', true ) );
		}
	}

	$image = $image_id ? wp_get_attachment_image( $image_id, 'thumbnail', false, array(
		'class' => 'dipe-admin-thumbnail',
		'alt' => '',
		'loading' => 'lazy',
		'sizes' => '40px',
	) ) : '';
	if ( $image ) {
		echo $image;
	} else {
		echo '<span aria-hidden="true">—</span><span class="screen-reader-text">' . esc_html__( 'Sin imagen', 'dipe-core' ) . '</span>';
	}
}

foreach ( array( 'post', 'dipe_proyecto', 'dipe_equipo' ) as $dipe_admin_post_type ) {
	add_filter( "manage_{$dipe_admin_post_type}_posts_columns", 'dipe_core_admin_image_column' );
	add_action( "manage_{$dipe_admin_post_type}_posts_custom_column", 'dipe_core_admin_image_cell', 10, 2 );
}
unset( $dipe_admin_post_type );

function dipe_core_brand_login_classes( $classes ) {
	$classes[] = 'dipe-login';
	if ( dipe_core_brand_logo_url() ) {
		$classes[] = 'dipe-login-has-logo';
	}
	return $classes;
}
add_filter( 'login_body_class', 'dipe_core_brand_login_classes' );

function dipe_core_brand_login_url() {
	return home_url( '/' );
}
add_filter( 'login_headerurl', 'dipe_core_brand_login_url' );

function dipe_core_brand_login_text() {
	return 'Dipe Agency';
}
add_filter( 'login_headertext', 'dipe_core_brand_login_text' );

/** Replace the generic welcome, preserving notices and all dashboard widgets. */
function dipe_core_brand_dashboard_setup() {
	remove_action( 'welcome_panel', 'wp_welcome_panel' );
}
add_action( 'wp_dashboard_setup', 'dipe_core_brand_dashboard_setup' );

function dipe_core_brand_dashboard_welcome() {
	$screen = get_current_screen();
	if ( ! $screen || 'dashboard' !== $screen->id ) {
		return;
	}

	$logo = dipe_core_brand_logo_url();
	$user = wp_get_current_user();
	?>
	<section class="dipe-admin-welcome" aria-labelledby="dipe-welcome-title">
		<div class="dipe-admin-welcome__brand">
			<?php if ( $logo ) : ?>
				<img src="<?php echo esc_url( $logo ); ?>" alt="Dipe Agency" width="180" height="64">
			<?php else : ?>
				<span class="dipe-admin-wordmark">Dipe<span> Agency</span></span>
			<?php endif; ?>
			<span class="dipe-admin-eyebrow">Tu espacio de trabajo</span>
		</div>
		<h2 id="dipe-welcome-title">Hola, <?php echo esc_html( $user->display_name ); ?>.</h2>
		<p>Las buenas ideas empiezan aquí. ¿Qué vamos a crear hoy?</p>
		<nav class="dipe-admin-shortcuts" aria-label="Accesos rápidos">
			<a class="dipe-admin-shortcuts__primary" href="<?php echo esc_url( home_url( '/' ) ); ?>">Ver la web <span aria-hidden="true">↗</span></a>
			<?php if ( current_user_can( 'edit_posts' ) ) : ?>
				<a href="<?php echo esc_url( admin_url( 'edit.php?post_type=dipe_proyecto' ) ); ?>">Proyectos</a>
				<a href="<?php echo esc_url( admin_url( 'edit.php' ) ); ?>">Entradas</a>
			<?php endif; ?>
			<?php if ( current_user_can( 'manage_options' ) ) : ?>
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=dipe-solicitudes' ) ); ?>">Solicitudes</a>
			<?php endif; ?>
		</nav>
	</section>
	<?php
}
add_action( 'admin_notices', 'dipe_core_brand_dashboard_welcome', 30 );
