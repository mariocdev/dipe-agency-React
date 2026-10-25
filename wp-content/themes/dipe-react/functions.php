<?php
defined('ABSPATH') || exit;

const DIPE_REACT_THEME_VERSION = '0.4.1';

require_once __DIR__ . '/inc/commerce.php';

// Registra las funciones del tema y sus ubicaciones de menú.
function dipe_react_setup()
{
	add_theme_support('title-tag');
	add_theme_support('post-thumbnails');
	add_theme_support('woocommerce');
	add_theme_support('custom-logo', array('flex-height' => true, 'flex-width' => true));
	add_theme_support('html5', array('comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script'));
	register_nav_menus(
		array(
			'utility' => __('Cabecera: menú superior', 'dipe-react'),
			'primary' => __('Cabecera: menú principal', 'dipe-react'),
			'footer_web'       => __('Pie: desarrollo web', 'dipe-react'),
			'footer_digital'   => __('Pie: transformación digital', 'dipe-react'),
			'footer_marketing' => __('Pie: marketing online', 'dipe-react'),
			'footer_about'     => __('Pie: sobre Dipe', 'dipe-react'),
			'footer_legal'     => __('Pie: información legal', 'dipe-react'),
		)
	);
}
add_action('after_setup_theme', 'dipe_react_setup');

// Añade los ajustes de identidad propios del tema al personalizador.
function dipe_react_customize_register($wp_customize)
{
	$wp_customize->add_setting(
		'dipe_react_footer_logo',
		array(
			'sanitize_callback' => 'absint',
		)
	);

	$wp_customize->add_control(
		new WP_Customize_Media_Control(
			$wp_customize,
			'dipe_react_footer_logo',
			array(
				'label'       => __('Logo del pie', 'dipe-react'),
				'description' => __('Logo exclusivo para el pie de página.', 'dipe-react'),
				'section'     => 'title_tagline',
				'mime_type'   => 'image',
				'priority'    => 9,
			)
		)
	);
}
add_action('customize_register', 'dipe_react_customize_register');

// Permitir subir archivos SVG en WordPress.
add_filter('upload_mimes', function ($mimes) {
	if (current_user_can('manage_options')) {
		$mimes['svg'] = 'image/svg+xml';
	}

	return $mimes;
});

// Define la estructura inicial de los menús de la web.
function dipe_react_navigation_definitions()
{
	return array(
		'utility' => array(
			'name'  => 'Dipe — cabecera superior',
			'items' => array(
				array('title' => 'Agencia Desarrollo Web'),
				array('title' => 'Proyectos Web'),
				array('title' => 'Blog'),
			),
		),
		'primary' => array(
			'name'  => 'Dipe — cabecera principal',
			'items' => array(
				array(
					'title'    => 'Desarrollo Web',
					'children' => array(
						array('title' => 'Desarrollo web con WordPress'),
						array('title' => 'Desarrollo web con PrestaShop'),
						array('title' => 'Desarrollo de aplicaciones web (custom)'),
						array('title' => 'Apps móviles (iOS · Android · PWA)'),
					),
				),
				array(
					'title'    => 'Transformación Digital',
					'children' => array(
						array('title' => 'Odoo'),
						array('title' => 'Integraciones y automatizaciones'),
						array('title' => 'Consultoría tecnológica'),
					),
				),
				array(
					'title'    => 'Marketing Online',
					'children' => array(
						array('title' => 'SEO: estrategia, técnica y contenidos'),
						array('title' => 'SEM: Google Ads & Social Ads'),
						array('title' => 'Gestión de redes sociales para empresas'),
						array('title' => 'Inbound Marketing & automatización'),
					),
				),
				array('title' => 'Contacto'),
				array('title' => '¿Hablamos?', 'classes' => array('menu-cta')),
			),
		),
		'footer_web' => array(
			'name'  => 'Dipe — pie: desarrollo web',
			'items' => array(
				array('title' => 'Desarrollo web con WordPress'),
				array('title' => 'Desarrollo web con PrestaShop'),
				array('title' => 'Desarrollo de aplicaciones web (custom)'),
				array('title' => 'Apps móviles (iOS · Android · PWA)'),
			),
		),
		'footer_digital' => array(
			'name'  => 'Dipe — pie: transformación digital',
			'items' => array(
				array('title' => 'Odoo'),
				array('title' => 'Integraciones y automatizaciones'),
				array('title' => 'Consultoría tecnológica'),
			),
		),
		'footer_marketing' => array(
			'name'  => 'Dipe — pie: marketing online',
			'items' => array(
				array('title' => 'SEO: estrategia, técnica y contenidos'),
				array('title' => 'SEM: Google Ads & Social Ads'),
				array('title' => 'Gestión de redes sociales para empresas'),
				array('title' => 'Inbound Marketing & automatización'),
			),
		),
		'footer_about' => array(
			'name'  => 'Dipe — pie: sobre Dipe',
			'items' => array(
				array('title' => 'Agencia de desarrollo web'),
				array('title' => 'Blog'),
				array('title' => 'Contacto'),
			),
		),
		'footer_legal' => array(
			'name'  => 'Dipe — pie: información legal',
			'items' => array(
				array('title' => 'Aviso legal'),
				array('title' => 'Política de privacidad'),
				array('title' => 'Política de cookies'),
			),
		),
	);
}

// Crea un elemento de menú y sus hijos en WordPress.
function dipe_react_add_navigation_item($menu_id, $item, $parent_id = 0)
{
	$item_id = wp_update_nav_menu_item(
		$menu_id,
		0,
		array(
			'menu-item-title'     => $item['title'],
			'menu-item-url'       => '#',
			'menu-item-status'    => 'publish',
			'menu-item-parent-id' => $parent_id,
			'menu-item-classes'   => implode(' ', $item['classes'] ?? array()),
		)
	);

	if (is_wp_error($item_id) || empty($item['children'])) {
		return;
	}

	foreach ($item['children'] as $child) {
		dipe_react_add_navigation_item($menu_id, $child, $item_id);
	}
}

// Repone la clase visual del CTA en el menú inicial.
function dipe_react_repair_default_cta($menu)
{
	// Correct the initial demo menu created before classes were passed as a string.
	if (! $menu || 'Dipe — cabecera principal' !== $menu->name) {
		return;
	}

	$items = wp_get_nav_menu_items($menu->term_id);
	if (! is_array($items)) {
		return;
	}

	foreach ($items as $item) {
		if ('¿Hablamos?' !== $item->title || '#' !== $item->url) {
			continue;
		}

		$classes = array_values(array_filter((array) $item->classes));
		if (! in_array('menu-cta', $classes, true)) {
			$classes[] = 'menu-cta';
			update_post_meta($item->ID, '_menu_item_classes', $classes);
		}
	}
}

// Prepara los menús iniciales sin sustituir los ya configurados.
function dipe_react_seed_navigation()
{
	if (DIPE_REACT_THEME_VERSION === get_option('dipe_react_navigation_version')) {
		return;
	}

	$locations   = get_nav_menu_locations();
	$definitions = dipe_react_navigation_definitions();

	foreach ($definitions as $location => $definition) {
		$menu    = wp_get_nav_menu_object($definition['name']);
		$created = false;

		if (! $menu) {
			$menu_id = wp_create_nav_menu($definition['name']);
			if (is_wp_error($menu_id)) {
				continue;
			}
			$menu    = wp_get_nav_menu_object($menu_id);
			$created = true;
		}

		if ($created) {
			foreach ($definition['items'] as $item) {
				dipe_react_add_navigation_item($menu->term_id, $item);
			}
		}
		if ('primary' === $location) {
			dipe_react_repair_default_cta($menu);
		}

		if (empty($locations[$location])) {
			$locations[$location] = $menu->term_id;
		}
	}

	set_theme_mod('nav_menu_locations', $locations);
	update_option('dipe_react_navigation_version', DIPE_REACT_THEME_VERSION);
}
add_action('admin_init', 'dipe_react_seed_navigation');
add_action('after_switch_theme', 'dipe_react_seed_navigation');

// Filtra los protocolos permitidos en los enlaces que recibe React.
function dipe_react_safe_navigation_url($url)
{
	$url = trim((string) $url);
	if ('#' === $url) {
		return '#';
	}

	$scheme  = wp_parse_url($url, PHP_URL_SCHEME);
	$allowed = array('http', 'https', 'mailto', 'tel');
	if ($scheme && ! in_array(strtolower($scheme), $allowed, true)) {
		return '#';
	}

	return esc_url_raw($url, $allowed);
}

// Convierte un menú de WordPress en una estructura con hijos para React.
function dipe_react_menu_tree($location)
{
	$locations = get_nav_menu_locations();
	$menu_id   = $locations[$location] ?? 0;
	if (! $menu_id) {
		return array();
	}

	$items = wp_get_nav_menu_items($menu_id);
	if (! is_array($items)) {
		return array();
	}

	$nodes = array();
	foreach ($items as $item) {
		$nodes[$item->ID] = array(
			'id'       => (int) $item->ID,
			'title'    => wp_strip_all_tags($item->title, true),
			'url'      => dipe_react_safe_navigation_url($item->url),
			'target'   => '_blank' === $item->target ? '_blank' : '',
			'classes'  => array_values(array_filter(array_map('sanitize_html_class', (array) $item->classes))),
			'children' => array(),
		);
	}

	$children_by_parent = array();
	$root_ids           = array();
	foreach ($items as $item) {
		$node_id   = (int) $item->ID;
		$parent_id = (int) $item->menu_item_parent;
		if ($parent_id && $parent_id !== $node_id && isset($nodes[$parent_id])) {
			$children_by_parent[$parent_id][] = $node_id;
		} else {
			$root_ids[] = $node_id;
		}
	}

	$build_branch = function ($node_id, $ancestors = array()) use (&$build_branch, $nodes, $children_by_parent) {
		if (isset($ancestors[$node_id])) {
			return null;
		}
		$ancestors[$node_id] = true;
		$node                  = $nodes[$node_id];
		foreach ($children_by_parent[$node_id] ?? array() as $child_id) {
			$child = $build_branch($child_id, $ancestors);
			if (null !== $child) {
				$node['children'][] = $child;
			}
		}
		return $node;
	};

	$tree = array();
	foreach ($root_ids as $root_id) {
		$tree[] = $build_branch($root_id);
	}

	return $tree;
}

// Expone la URL y los datos del logo principal configurado.
function dipe_react_logo_data()
{
	$logo_id = (int) get_theme_mod('custom_logo');
	$alt     = get_bloginfo('name', 'display');
	$url     = '';

	if ($logo_id) {
		$url        = wp_get_attachment_image_url($logo_id, 'full') ?: '';
		$stored_alt = get_post_meta($logo_id, '_wp_attachment_image_alt', true);
		$alt        = $stored_alt ? $stored_alt : $alt;
	}

	return array(
		'url' => esc_url_raw($url),
		'alt' => wp_strip_all_tags($alt, true),
	);
}

// Obtiene el logo del pie y su alternativa cuando no está configurado.
function dipe_react_footer_logo_data()
{
	$logo_id = (int) get_theme_mod('dipe_react_footer_logo');
	$alt     = get_bloginfo('name', 'display');
	$url     = '';

	if ($logo_id) {
		$url        = wp_get_attachment_image_url($logo_id, 'full') ?: '';
		$stored_alt = get_post_meta($logo_id, '_wp_attachment_image_alt', true);
		$alt        = $stored_alt ? $stored_alt : $alt;
	}

	return array(
		'url' => esc_url_raw($url),
		'alt' => wp_strip_all_tags($alt, true),
	);
}

// Lee una sola vez por petición el manifiesto de assets de Vite.
function dipe_react_manifest()
{
	static $manifest = null;

	if (null !== $manifest) {
		return $manifest;
	}

	$path = get_theme_file_path('assets/.vite/manifest.json');
	if (! is_readable($path)) {
		$manifest = array();
		return $manifest;
	}

	$decoded = json_decode(file_get_contents($path), true); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	$manifest = is_array($decoded) ? $decoded : array();
	return $manifest;
}

// Carga el JavaScript y el CSS indicados por el manifiesto del tema.
function dipe_react_enqueue_assets()
{
	$manifest = dipe_react_manifest();
	$entry    = $manifest['src/main.jsx'] ?? null;

	if (! $entry || empty($entry['file'])) {
		return;
	}

	$script = get_theme_file_uri('assets/' . $entry['file']);
	wp_enqueue_script('dipe-react-app', $script, array(), null, true);

	if (! empty($entry['css']) && is_array($entry['css'])) {
		foreach ($entry['css'] as $index => $css) {
			wp_enqueue_style('dipe-react-' . $index, get_theme_file_uri('assets/' . $css), array(), null);
		}
	}
}
add_action('wp_enqueue_scripts', 'dipe_react_enqueue_assets');

// Entrega a React la configuración pública, los logos y los menús del sitio.
function dipe_react_print_client_config()
{
	if (! wp_script_is('dipe-react-app', 'enqueued')) {
		return;
	}

	$blog_category = null;
	if (is_category()) {
		$term = get_queried_object();
		if ($term instanceof WP_Term) {
			$blog_category = array(
				'id'   => (int) $term->term_id,
				'slug' => $term->slug,
				'name' => wp_strip_all_tags($term->name, true),
			);
		}
	}

	echo '<script id="dipe-react-config">window.dipeSite = ' . wp_json_encode(
		array(
			'apiRoot'    => esc_url_raw(rest_url()),
			'blogCategory' => $blog_category,
			'commerce' => dipe_react_commerce_config(),
			'language' => get_bloginfo('language'),
			'loaderEnabled' => (bool) get_option('dipe_core_loader_enabled', 1),
			'homeUrl'    => esc_url_raw(home_url('/')),
			'basePath'   => wp_parse_url(home_url('/'), PHP_URL_PATH) ?: '/',
			'logo'       => dipe_react_logo_data(),
			'footerLogo' => dipe_react_footer_logo_data(),
			'navigation' => array(
				'utility' => dipe_react_menu_tree('utility'),
				'primary' => dipe_react_menu_tree('primary'),
				'footer'  => array(
					'web'       => dipe_react_menu_tree('footer_web'),
					'digital'   => dipe_react_menu_tree('footer_digital'),
					'marketing' => dipe_react_menu_tree('footer_marketing'),
					'about'     => dipe_react_menu_tree('footer_about'),
					'legal'     => dipe_react_menu_tree('footer_legal'),
				),
			),
		)
	) . ';</script>' . "\n";
}
add_action('wp_footer', 'dipe_react_print_client_config', 5);

// Vite emits ES modules. Preserve any other tags generated by WordPress.
function dipe_react_module_script_tag($tag, $handle, $src)
{
	if ('dipe-react-app' !== $handle) {
		return $tag;
	}

	return preg_replace('/<script\\b([^>]*)>/', '<script type="module"$1>', $tag, 1);
}
add_filter('script_loader_tag', 'dipe_react_module_script_tag', 10, 3);

// Usa el extracto como descripción cuando está disponible.
function dipe_react_document_description()
{
	if (is_singular() && has_excerpt()) {
		return wp_strip_all_tags(get_the_excerpt(), true);
	}
	return get_bloginfo('description', 'display');
}

/** Social metadata uses the same WordPress media as the visible page. */
function dipe_react_social_attachment($attachment_id)
{
	$attachment_id = absint($attachment_id);
	if (! $attachment_id || ! wp_attachment_is_image($attachment_id)) {
		return array();
	}

	$image = wp_get_attachment_image_src($attachment_id, 'full');
	if (! $image) {
		return array();
	}

	return array(
		'url' => $image[0],
		'width' => (int) $image[1],
		'height' => (int) $image[2],
		'type' => get_post_mime_type($attachment_id),
	);
}

// Elige la imagen social de la ficha o el logo como alternativa.
function dipe_react_social_image()
{
	if (is_singular(array('post', 'dipe_proyecto')) && ! post_password_required()) {
		$post_id = get_queried_object_id();
		$field = get_post_type($post_id) === 'post' ? 'dipe_post_banner_media' : 'dipe_project_banner_image';
		// Raw ACF media meta stores attachment IDs. A video cannot be an og:image.
		foreach (array(get_post_meta($post_id, $field, true), get_post_thumbnail_id($post_id)) as $attachment_id) {
			$image = dipe_react_social_attachment($attachment_id);
			if ($image) {
				return $image;
			}
		}
	}

	return dipe_react_social_attachment(get_theme_mod('custom_logo'));
}

/** Keep exactly one native Yoast image, including its own dimensions and MIME. */
function dipe_react_yoast_social_presentation($presentation)
{
	$image = dipe_react_social_image();
	if (is_object($presentation) && $image) {
		$presentation->open_graph_images = array($image);
		$presentation->twitter_image = $image['url'];
	}
	return $presentation;
}
add_filter('wpseo_frontend_presentation', 'dipe_react_yoast_social_presentation', 20);

/** Fixed site logo requested separately from the page's sharing image. */
function dipe_react_og_logo()
{
	$logo = dipe_react_social_attachment(get_theme_mod('custom_logo'));
	if ($logo) {
		echo '<meta property="og:logo" content="' . esc_url($logo['url']) . '">' . "\n";
	}
}
add_action('wp_head', 'dipe_react_og_logo', 5);

// Publica los metadatos propios solo cuando Yoast no se encarga de ellos.
function dipe_react_meta_tags()
{
	// Yoast renders metadata through wp_head(), including HTML for each native URL.
	// Keep the existing fallback only while Yoast SEO is inactive.
	if (defined('WPSEO_VERSION')) {
		return;
	}

	$description = dipe_react_document_description();
	$request     = $GLOBALS['wp']->request ?? '';
	$canonical   = is_singular() ? get_permalink() : home_url(trailingslashit($request));
	echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
	if (!function_exists('dipe_core_is_secondary_listing') || !dipe_core_is_secondary_listing()) {
		echo '<link rel="canonical" href="' . esc_url($canonical) . '">' . "\n";
	}
	echo '<meta property="og:title" content="' . esc_attr(wp_get_document_title()) . '">' . "\n";
	echo '<meta property="og:description" content="' . esc_attr($description) . '">' . "\n";
	echo '<meta property="og:url" content="' . esc_url($canonical) . '">' . "\n";
	$image = dipe_react_social_image();
	if ($image) {
		echo '<meta property="og:image" content="' . esc_url($image['url']) . '">' . "\n";
		echo '<meta name="twitter:image" content="' . esc_url($image['url']) . '">' . "\n";
	}
}
add_action('wp_head', 'dipe_react_meta_tags', 5);
