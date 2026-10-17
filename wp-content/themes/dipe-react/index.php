<?php get_header(); ?>
<div id="dipe-react-root"></div>
<?php if ( ! dipe_react_manifest() ) : ?>
	<noscript><?php esc_html_e( 'Este sitio requiere JavaScript.', 'dipe-react' ); ?></noscript>
	<div class="notice notice-warning"><p><?php esc_html_e( 'El bundle de React todavía no se ha compilado. Ejecuta npm run build antes de subir el tema.', 'dipe-react' ); ?></p></div>
<?php endif; ?>
<?php get_footer(); ?>
