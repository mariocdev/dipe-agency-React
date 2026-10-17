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
  return request(`wp/v2/dipe-proyectos?status=publish&per_page=${perPage}&acf_format=standard`);
}

export function getPosts(perPage = 3) {
  return request(`wp/v2/posts?status=publish&per_page=${perPage}&orderby=date&order=desc&_embed`);
}

export async function getPostArchive({ page = 1, categoryId = null, perPage = 12 } = {}) {
  const params = new URLSearchParams({
    status: 'publish',
    page: String(page),
    per_page: String(perPage),
    orderby: 'date',
    order: 'desc',
    _embed: '1',
  });
  if (categoryId) params.set('categories', String(categoryId));

  const response = await fetch(endpoint(`wp/v2/posts?${params}`), { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`La API respondió ${response.status}.`);
  return {
    posts: await response.json(),
    totalPages: Number(response.headers.get('X-WP-TotalPages')) || 1,
  };
}

export async function getPost(slug) {
  const posts = await request(`wp/v2/posts?status=publish&slug=${encodeURIComponent(slug)}&_embed`);
  return posts?.[0] || null;
}

export async function getCategory(slug) {
  const categories = await request(`wp/v2/categories?slug=${encodeURIComponent(slug)}&per_page=1`);
  return categories?.[0] || null;
}

export async function getFeaturedProjects(perPage = 6) {
  const terms = await request('wp/v2/dipe-project-tags?slug=destacados&per_page=1');
  const featuredTerm = terms?.[0];

  if (!featuredTerm) return [];

  return request(`wp/v2/dipe-proyectos?status=publish&per_page=${perPage}&orderby=date&order=desc&dipe_project_tag=${featuredTerm.id}&acf_format=standard`);
}

export async function getProject(slug) {
  const items = await request(`wp/v2/dipe-proyectos?status=publish&slug=${encodeURIComponent(slug)}&acf_format=standard`);
  return items?.[0] || null;
}

export async function submitContactForm(fields) {
  const response = await fetch(endpoint('dipe/v1/forms/contacto'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fields),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'No se ha podido enviar el mensaje. Inténtalo de nuevo.');
    error.fields = data?.data?.fields || {};
    throw error;
  }

  return data;
}

export function rendered(value = '') {
  return value || '';
}

export function plainText(value = '') {
  const template = document.createElement('template');
  template.innerHTML = value;
  return template.content.textContent?.trim() || '';
}

function normalizeProjectImage(image) {
  if (typeof image === 'string' && /^(https?:\/\/|\/)/i.test(image)) {
    return { url: image, alt: '' };
  }
  if (image && typeof image === 'object' && typeof image.url === 'string' && image.url) {
    return { url: image.url, alt: image.alt || '' };
  }
  return null;
}

export function projectHomeCardImage(item) {
  return normalizeProjectImage(item?.acf?.dipe_project_home_card_image)
    || normalizeProjectImage(item?.dipe_project_card_image);
}

export function postCardImage(item) {
  const image = item?._embedded?.['wp:featuredmedia']?.[0];
  return normalizeProjectImage(image && { url: image.source_url, alt: image.alt_text });
}

export function postPrimaryCategory(item) {
  const terms = item?._embedded?.['wp:term']?.flat() || [];
  return terms.find((term) => term.taxonomy === 'category') || null;
}
