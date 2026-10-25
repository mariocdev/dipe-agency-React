<?php
defined('ABSPATH') || exit;

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

// Vite puede extraer CSS a dependencias estáticas compartidas entre varias páginas.
// No recorrer dynamicImports: cada vista carga sus propios estilos al importarse.
function dipe_react_asset_css($manifest, $key, &$visited)
{
	if (isset($visited[$key]) || empty($manifest[$key])) {
		return array();
	}
	$visited[$key] = true;
	$chunk = $manifest[$key];
	$styles = $chunk['css'] ?? array();
	foreach ($chunk['imports'] ?? array() as $dependency) {
		$styles = array_merge($styles, dipe_react_asset_css($manifest, $dependency, $visited));
	}
	return array_values(array_unique($styles));
}

// Carga la entrada y todo su CSS estático; las vistas se resuelven en React.
function dipe_react_enqueue_assets()
{
	$manifest = dipe_react_manifest();
	$entry    = $manifest['src/main.jsx'] ?? null;

	if (! $entry || empty($entry['file'])) {
		return;
	}

	$script = get_theme_file_uri('assets/' . $entry['file']);
	wp_enqueue_script('dipe-react-app', $script, array(), null, true);

	$visited = array();
	foreach (dipe_react_asset_css($manifest, 'src/main.jsx', $visited) as $index => $css) {
		wp_enqueue_style('dipe-react-' . $index, get_theme_file_uri('assets/' . $css), array(), null);
	}
}
add_action('wp_enqueue_scripts', 'dipe_react_enqueue_assets');
