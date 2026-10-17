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

export function getProjects(perPage = 24) {
  return request(`wp/v2/dipe-proyectos?status=publish&per_page=${perPage}`);
}

export async function getProject(slug) {
  const items = await request(`wp/v2/dipe-proyectos?status=publish&slug=${encodeURIComponent(slug)}`);
  return items?.[0] || null;
}

export function rendered(value = '') {
  return value || '';
}

export function projectHomeCardImage(item) {
  const image = item?.acf?.dipe_project_home_card_image;

  if (!image) return null;
  if (typeof image === 'string') return { url: image, alt: '' };
  if (image.url) return { url: image.url, alt: image.alt || '' };
  return null;
}
