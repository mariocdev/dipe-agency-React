<?php
/** Identidad Dipe sobre los correos nativos de WooCommerce, sin alterar sus envíos. */
defined( 'ABSPATH' ) || exit;

// El logo de correo puede elegirse en WooCommerce; por defecto usa el de WordPress.
function dipe_core_shop_email_logo( $stored ) {
	if ( is_string( $stored ) && '' !== trim( $stored ) ) return $stored;
	$id = (int) get_theme_mod( 'custom_logo' );
	$logo = $id ? wp_get_attachment_image_url( $id, 'full' ) : false;
	return $logo ?: $stored;
}
add_filter( 'option_woocommerce_email_header_image', 'dipe_core_shop_email_logo' );
add_filter( 'default_option_woocommerce_email_header_image', 'dipe_core_shop_email_logo' );

// Filtros reversibles: no sobrescriben las opciones guardadas en la base de datos.
foreach ( array(
	'base_color' => '#ff8600', 'background_color' => '#f6f6f6', 'body_background_color' => '#ffffff',
	'text_color' => '#1d1d1d', 'footer_text_color' => '#666666', 'font_family' => 'Arial',
	'header_alignment' => 'left', 'header_image_width' => '170',
) as $setting => $value ) {
	add_filter( 'pre_option_woocommerce_email_' . $setting, static function () use ( $value ) { return $value; } );
}
unset( $setting, $value );

function dipe_core_shop_email_font_css() {
	static $css = null;
	if ( null !== $css ) return $css;
	$css = '';
	// Reutiliza las fuentes emitidas por Vite; no depende de un nombre hash concreto.
	$files = glob( get_theme_file_path( 'assets/assets/Gordita*.otf' ) ) ?: array();
	$weights = array( 'regular' => 400, 'medium' => 500, 'bold' => 700 );
	foreach ( $files as $file ) {
		if ( ! preg_match( '/Gordita[ _-]*(Regular|Medium|Bold)/i', basename( $file ), $match ) ) continue;
		$url = get_theme_file_uri( 'assets/assets/' . rawurlencode( basename( $file ) ) );
		$css .= '@font-face{font-family:Gordita;font-style:normal;font-weight:' . $weights[ strtolower( $match[1] ) ] . ';src:url(' . wp_json_encode( esc_url_raw( $url ), JSON_UNESCAPED_SLASHES ) . ') format("opentype");}' . "\n";
	}
	return $css;
}

add_filter( 'woocommerce_email_styles', function ( $css ) {
	static $brand_css = null;
	if ( null === $brand_css ) {
		$path = dirname( __DIR__ ) . '/assets/shop-emails.css';
		$brand_css = is_readable( $path ) ? (string) file_get_contents( $path ) : '';
	}
	return $css . "\n" . dipe_core_shop_email_font_css() . $brand_css;
}, 30 );

// También aporta valores de identidad al editor de correos por bloques, si se usa.
add_filter( 'woocommerce_email_editor_theme_json', function ( $theme ) {
	if ( ! $theme instanceof WP_Theme_JSON ) return $theme;
	$font = "Gordita, Arial, Helvetica, sans-serif";
	$theme->merge( new WP_Theme_JSON( array(
		'version' => 2,
		'styles' => array(
			'color' => array( 'background' => '#ffffff', 'text' => '#1d1d1d' ),
			'typography' => array( 'fontFamily' => $font, 'fontSize' => '16px', 'lineHeight' => '1.65' ),
			'elements' => array(
				'heading' => array( 'color' => array( 'text' => '#1d1d1d' ), 'typography' => array( 'fontFamily' => $font, 'fontWeight' => '700' ) ),
				'link' => array( 'color' => array( 'text' => '#1d1d1d' ), 'typography' => array( 'textDecoration' => 'underline' ) ),
				'button' => array( 'color' => array( 'background' => '#ff8600', 'text' => '#1d1d1d' ), 'border' => array( 'radius' => '5px' ), 'typography' => array( 'fontFamily' => $font, 'fontWeight' => '500' ) ),
			),
			'blocks' => array( 'core/site-logo' => array( 'color' => array( 'background' => '#020202' ), 'spacing' => array( 'padding' => '24px' ) ) ),
		),
	) ) );
	return $theme;
}, 30 );

// Conserva legible el logo transparente del header en los correos por bloques.
add_filter( 'woocommerce_mail_content', function ( $html ) {
	if ( ! is_string( $html ) || ! preg_match( '~^\s*(?:<!doctype[^>]*>\s*)?<html(?:\s|>)~i', $html ) ) return $html;
	$tags = new WP_HTML_Tag_Processor( $html );
	while ( $tags->next_tag( array( 'class_name' => 'wp-block-site-logo' ) ) ) {
		$style = $tags->get_attribute( 'style' );
		$tags->set_attribute( 'style', ( is_string( $style ) ? $style : '' ) . ';background-color:#020202;padding:24px;border-bottom:4px solid #ff8600;' );
	}
	$html = $tags->get_updated_html();
	$fonts = dipe_core_shop_email_font_css();
	// Garantiza las declaraciones de fuente en head aunque el inliner las descarte.
	if ( '' !== $fonts && false === strpos( $html, 'data-dipe-email-fonts' ) ) {
		$html = preg_replace_callback( '~</head>~i', static function ( $match ) use ( $fonts ) { return '<style type="text/css" data-dipe-email-fonts="1">' . $fonts . '</style>' . $match[0]; }, $html, 1 );
	}
	return $html;
} );
