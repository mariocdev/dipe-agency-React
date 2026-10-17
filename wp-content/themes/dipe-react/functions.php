<?php
defined( 'ABSPATH' ) || exit;

function dipe_react_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
}
add_action( 'after_setup_theme', 'dipe_react_setup' );

function dipe_react_manifest() {
	static $manifest = null;

	if ( null !== $manifest ) {
		return $manifest;
	}

	$path = get_theme_file_path( 'assets/.vite/manifest.json' );
	if ( ! is_readable( $path ) ) {
		$manifest = array();
		return $manifest;
	}

	$decoded = json_decode( file_get_contents( $path ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	$manifest = is_array( $decoded ) ? $decoded : array();
	return $manifest;
}

function dipe_react_enqueue_assets() {
	$manifest = dipe_react_manifest();
	$entry    = $manifest['src/main.jsx'] ?? null;

	if ( ! $entry || empty( $entry['file'] ) ) {
		return;
	}

	$script = get_theme_file_uri( 'assets/' . $entry['file'] );
	wp_enqueue_script( 'dipe-react-app', $script, array(), null, true );

	if ( ! empty( $entry['css'] ) && is_array( $entry['css'] ) ) {
		foreach ( $entry['css'] as $index => $css ) {
			wp_enqueue_style( 'dipe-react-' . $index, get_theme_file_uri( 'assets/' . $css ), array(), null );
		}
	}

	wp_add_inline_script(
		'dipe-react-app',
		'window.dipeSite = ' . wp_json_encode(
			array(
				'apiRoot' => esc_url_raw( rest_url() ),
				'homeUrl' => esc_url_raw( home_url( '/' ) ),
				'basePath' => wp_parse_url( home_url( '/' ), PHP_URL_PATH ) ?: '/',
			)
		) . ';',
		'before'
	);
}
add_action( 'wp_enqueue_scripts', 'dipe_react_enqueue_assets' );

function dipe_react_document_description() {
	if ( is_singular() && has_excerpt() ) {
		return wp_strip_all_tags( get_the_excerpt(), true );
	}
	return get_bloginfo( 'description', 'display' );
}

function dipe_react_meta_tags() {
	$description = dipe_react_document_description();
	$request     = $GLOBALS['wp']->request ?? '';
	$canonical   = is_singular() ? get_permalink() : home_url( trailingslashit( $request ) );
	echo '<meta name="description" content="' . esc_attr( $description ) . '">' . "\n";
	echo '<link rel="canonical" href="' . esc_url( $canonical ) . '">' . "\n";
	echo '<meta property="og:title" content="' . esc_attr( wp_get_document_title() ) . '">' . "\n";
	echo '<meta property="og:description" content="' . esc_attr( $description ) . '">' . "\n";
	echo '<meta property="og:url" content="' . esc_url( $canonical ) . '">' . "\n";
	if ( is_singular() && has_post_thumbnail() ) {
		echo '<meta property="og:image" content="' . esc_url( get_the_post_thumbnail_url( get_the_ID(), 'full' ) ) . '">' . "\n";
	}
}
add_action( 'wp_head', 'dipe_react_meta_tags', 5 );
