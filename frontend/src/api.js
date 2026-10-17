const config = window.dipeSite || {};
const apiRoot = config.apiRoot || '/wp-json/';

function endpoint(path) {
  return new URL(path.replace(/^\//, ''), apiRoot).toString();
}

async function request(path) {
  const response = await fetch(endpoint(path), { headers: { Accept: 'application/json' } });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`La API respondió ${response.status}.`);
  return response.json();
}

export function getSamples() {
  return request('wp/v2/dipe-items?status=publish&per_page=24&_embed=wp:featuredmedia');
}

export async function getSample(slug) {
  const items = await request(`wp/v2/dipe-items?status=publish&slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia`);
  return items?.[0] || null;
}

export function rendered(value = '') {
  return value || '';
}

export function featuredImage(item) {
  return item?._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
}
