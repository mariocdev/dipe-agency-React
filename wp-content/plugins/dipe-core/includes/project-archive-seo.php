<?php
/** A project-menu editor for Yoast's native post type archive settings. */

defined( 'ABSPATH' ) || exit;

// Añade al menú de proyectos la edición SEO de su archivo.
function dipe_core_register_project_archive_seo() {
	add_submenu_page(
		'edit.php?post_type=dipe_proyecto',
		__( 'SEO del archivo de proyectos', 'dipe-core' ),
		__( 'SEO del archivo', 'dipe-core' ),
		'manage_options',
		'dipe-project-archive-seo',
		'dipe_core_render_project_archive_seo'
	);
}
add_action( 'admin_menu', 'dipe_core_register_project_archive_seo' );

/** Refuse writes when the installed Yoast cannot provide these native options. */
function dipe_core_project_archive_seo_available() {
	if ( ! defined( 'WPSEO_VERSION' ) || ! class_exists( 'WPSEO_Options' ) || ! class_exists( 'WPSEO_Utils' ) ) {
		return false;
	}
	$options = WPSEO_Options::get_all();
	return isset( $options['title-ptarchive-dipe_proyecto'], $options['metadesc-ptarchive-dipe_proyecto'], $options['noindex-ptarchive-dipe_proyecto'] );
}

// Muestra los ajustes del archivo guardados en las opciones de Yoast.
function dipe_core_render_project_archive_seo() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$available = dipe_core_project_archive_seo_available();
	$saved = isset( $_GET['saved'] ) && is_string( $_GET['saved'] ) ? sanitize_key( wp_unslash( $_GET['saved'] ) ) : '';
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'SEO del archivo de proyectos', 'dipe-core' ); ?></h1>
		<p><?php esc_html_e( 'Edita el SEO del listado general de proyectos. El título visible y el diseño de la página se conservan.', 'dipe-core' ); ?></p>
		<p><a href="<?php echo esc_url( get_post_type_archive_link( 'dipe_proyecto' ) ); ?>"><?php esc_html_e( 'Ver archivo de proyectos', 'dipe-core' ); ?></a></p>
		<?php if ( ! $available ) : ?>
			<div class="notice notice-warning inline"><p><?php esc_html_e( 'Activa Yoast SEO para editar los ajustes del archivo de proyectos.', 'dipe-core' ); ?></p></div>
		<?php else : ?>
			<?php if ( '1' === $saved ) : ?>
				<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'SEO del archivo guardado.', 'dipe-core' ); ?></p></div>
			<?php elseif ( '0' === $saved ) : ?>
				<div class="notice notice-error"><p><?php esc_html_e( 'No se han podido guardar todos los ajustes. Revisa los valores y vuelve a intentarlo.', 'dipe-core' ); ?></p></div>
			<?php endif; ?>
			<form action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" method="post">
				<input type="hidden" name="action" value="dipe_core_save_project_archive_seo">
				<?php wp_nonce_field( 'dipe_core_save_project_archive_seo' ); ?>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="dipe-archive-seo-title"><?php esc_html_e( 'Título SEO', 'dipe-core' ); ?></label></th>
						<td><input type="text" class="large-text" id="dipe-archive-seo-title" name="seo_title" value="<?php echo esc_attr( WPSEO_Options::get( 'title-ptarchive-dipe_proyecto', '' ) ); ?>" aria-describedby="dipe-archive-seo-variables">
							<p class="description" id="dipe-archive-seo-variables"><?php esc_html_e( 'Puedes escribir texto o usar variables de Yoast como %%sitename%%, %%sep%% y %%page%%.', 'dipe-core' ); ?></p></td>
					</tr>
					<tr>
						<th scope="row"><label for="dipe-archive-seo-description"><?php esc_html_e( 'Metadescripción', 'dipe-core' ); ?></label></th>
						<td><textarea class="large-text" rows="4" id="dipe-archive-seo-description" name="seo_description"><?php echo esc_textarea( WPSEO_Options::get( 'metadesc-ptarchive-dipe_proyecto', '' ) ); ?></textarea></td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Indexación del archivo', 'dipe-core' ); ?></th>
						<td><label for="dipe-archive-seo-indexable"><input type="checkbox" id="dipe-archive-seo-indexable" name="seo_indexable" value="1" <?php checked( ! (bool) WPSEO_Options::get( 'noindex-ptarchive-dipe_proyecto', false ) ); ?>> <?php esc_html_e( 'Permitir que el archivo aparezca en los resultados de búsqueda', 'dipe-core' ); ?></label>
							<p class="description"><?php esc_html_e( 'Las páginas posteriores a la primera mantienen noindex, follow y ausencia de canonical. Se respeta también la visibilidad general de WordPress.', 'dipe-core' ); ?></p></td>
					</tr>
				</table>
				<?php submit_button( __( 'Guardar SEO del archivo', 'dipe-core' ) ); ?>
			</form>
		<?php endif; ?>
	</div>
	<?php
}

// Guarda los metadatos en Yoast y purga la caché tras validar la petición.
function dipe_core_save_project_archive_seo() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'No tienes permisos para editar estos ajustes.', 'dipe-core' ), '', array( 'response' => 403 ) );
	}
	if ( 'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
		wp_die( esc_html__( 'Método no permitido.', 'dipe-core' ), '', array( 'response' => 405 ) );
	}
	check_admin_referer( 'dipe_core_save_project_archive_seo' );
	if ( ! dipe_core_project_archive_seo_available() ) {
		wp_die( esc_html__( 'Yoast SEO no está disponible para guardar estos ajustes.', 'dipe-core' ), '', array( 'response' => 400 ) );
	}
	foreach ( array( 'seo_title', 'seo_description' ) as $field ) {
		if ( ! isset( $_POST[ $field ] ) || ! is_string( $_POST[ $field ] ) ) {
			wp_die( esc_html__( 'Los campos SEO no son válidos.', 'dipe-core' ), '', array( 'response' => 400 ) );
		}
	}
	// Yoast's sanitizer preserves its %%variables%% while removing markup.
	$settings = array(
		'title-ptarchive-dipe_proyecto' => WPSEO_Utils::sanitize_text_field( wp_unslash( $_POST['seo_title'] ) ),
		'metadesc-ptarchive-dipe_proyecto' => WPSEO_Utils::sanitize_text_field( wp_unslash( $_POST['seo_description'] ) ),
		'noindex-ptarchive-dipe_proyecto' => isset( $_POST['seo_indexable'] ) && '1' === $_POST['seo_indexable'] ? false : true,
	);
	foreach ( $settings as $key => $value ) {
		if ( WPSEO_Options::get( $key ) !== $value ) {
			WPSEO_Options::set( $key, $value );
		}
	}
	WPSEO_Options::clear_cache();
	$saved = true;
	foreach ( $settings as $key => $value ) {
		if ( WPSEO_Options::get( $key ) !== $value ) {
			$saved = false;
		}
	}
	wp_safe_redirect( add_query_arg( array(
		'post_type' => 'dipe_proyecto',
		'page' => 'dipe-project-archive-seo',
		'saved' => $saved ? '1' : '0',
	), admin_url( 'edit.php' ) ) );
	exit;
}
add_action( 'admin_post_dipe_core_save_project_archive_seo', 'dipe_core_save_project_archive_seo' );
