const config = typeof window !== 'undefined' ? (window.dipeSite || {}) : {};
const apiRoot = config.apiRoot || '/wp-json/';

function endpoint(path) {
  const cleanPath = path.replace(/^\/+/, '');
  const base = /^https?:\/\//i.test(apiRoot)
    ? apiRoot
    : (typeof window !== 'undefined' && window.location?.origin ? `${window.location.origin}${apiRoot.startsWith('/') ? '' : '/'}${apiRoot}` : apiRoot);
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;

  if (typeof window === 'undefined') {
    return `${normalizedBase}${cleanPath}`.replace(/\/\/{2,}/g, '/');
  }

  try {
    return new URL(cleanPath, normalizedBase).toString();
  } catch {
    return `${normalizedBase}${cleanPath}`.replace(/\/\/{2,}/g, '/');
  }
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

export async function getTeamMembers() {
  const members = await request('dipe/v1/equipo');
  if (!Array.isArray(members)) throw new Error('No se ha podido cargar el equipo.');
  return members;
}

export function getProjectsByCategory(categoryId, perPage = 24) {
  return request(`wp/v2/dipe-proyectos?status=publish&per_page=${perPage}&dipe-project-categories=${encodeURIComponent(categoryId)}&acf_format=standard`);
}

export async function getProjectArchive({ page = 1, categoryId = null, perPage = 12 } = {}) {
  const params = new URLSearchParams({
    status: 'publish',
    page: String(page),
    per_page: String(perPage),
    orderby: 'date',
    order: 'desc',
    _embed: '1',
    acf_format: 'standard',
  });
  if (categoryId) params.set('dipe-project-categories', String(categoryId));

  const response = await fetch(endpoint(`wp/v2/dipe-proyectos?${params}`), { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`La API respondió ${response.status}.`);
  return {
    projects: await response.json(),
    totalPages: Number(response.headers.get('X-WP-TotalPages')) || 1,
  };
}

export async function getProjectCategory(slug) {
  const categories = await request(`wp/v2/dipe-project-categories?slug=${encodeURIComponent(slug)}&per_page=1`);
  return categories?.[0] || null;
}

async function getProjectCategoryById(id) {
	return request(`wp/v2/dipe-project-categories/${encodeURIComponent(id)}`);
}

export function getPosts(perPage = 3, excludeId = null) {
  const params = new URLSearchParams({ status: 'publish', per_page: String(perPage), orderby: 'date', order: 'desc', _embed: '1' });
  if (excludeId) params.set('exclude', String(excludeId));
  return request(`wp/v2/posts?${params}`);
}

export async function getPostArchive({ page = 1, categoryId = null, perPage = 12, search = '', after = '', before = '', signal } = {}) {
  const params = new URLSearchParams({
    status: 'publish',
    page: String(page),
    per_page: String(perPage),
    orderby: 'date',
    order: 'desc',
    _embed: '1',
  });
  if (categoryId) params.set('categories', String(categoryId));
  if (search) params.set('search', search);
  if (after) params.set('after', after);
  if (before) params.set('before', before);

  const response = await fetch(endpoint(`wp/v2/posts?${params}`), { headers: { Accept: 'application/json' }, signal });
  if (!response.ok) throw new Error(`La API respondió ${response.status}.`);
  return {
    posts: await response.json(),
    totalPages: Number(response.headers.get('X-WP-TotalPages')) || 1,
  };
}

export async function getPost(slug) {
  const posts = await request(`wp/v2/posts?status=publish&slug=${encodeURIComponent(slug)}&_embed=1&acf_format=standard`);
  return posts?.[0] || null;
}

export function getPostNavigation(id) {
  return request(`dipe/v1/posts/${encodeURIComponent(id)}/navigation`);
}

export async function getCategory(slug) {
  const categories = await request(`wp/v2/categories?slug=${encodeURIComponent(slug)}&per_page=1`);
  return categories?.[0] || null;
}

export async function getPostCategories() {
  const categories = [];
  let totalPages = 1;

  for (let page = 1; page <= totalPages; page += 1) {
    const params = new URLSearchParams({
      per_page: '100',
      page: String(page),
      hide_empty: 'true',
      orderby: 'name',
      order: 'asc',
      _fields: 'id,name,slug,link',
    });
    const response = await fetch(endpoint(`wp/v2/categories?${params}`), { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`La API respondió ${response.status}.`);
    categories.push(...await response.json());
    totalPages = Number(response.headers.get('X-WP-TotalPages')) || 1;
  }

  return categories;
}

export async function getFeaturedProjects(perPage = 6) {
  const terms = await request('wp/v2/dipe-project-tags?slug=destacados&per_page=1');
  const featuredTerm = terms?.[0];

  if (!featuredTerm) return [];

  return request(`wp/v2/dipe-proyectos?status=publish&per_page=${perPage}&orderby=date&order=desc&dipe_project_tag=${featuredTerm.id}&acf_format=standard`);
}

export async function getProject(slug) {
	const items = await request(`wp/v2/dipe-proyectos?status=publish&slug=${encodeURIComponent(slug)}&_embed=1&acf_format=standard`);
	const project = items?.[0] || null;

	if (!project) return null;

	return {
		...project,
		projectCategoryHierarchy: await getProjectCategoryHierarchy(project),
	};
}

export async function getRelatedProjects(project) {
  const selected = project?.acf?.dipe_project_featured_projects;
  if (!Array.isArray(selected)) return [];

  const ids = [...new Set(selected.map((item) => Number(item?.ID || item?.id || item)))]
    .filter((id) => Number.isInteger(id) && id > 0 && id !== Number(project.id));
  const batches = [];
  for (let offset = 0; offset < ids.length; offset += 100) {
    const batch = ids.slice(offset, offset + 100);
    const params = new URLSearchParams({
      status: 'publish',
      include: batch.join(','),
      orderby: 'include',
      per_page: String(batch.length),
      _embed: '1',
    });
    batches.push(request(`wp/v2/dipe-proyectos?${params}`));
  }
  return (await Promise.all(batches)).flatMap((items) => items || []);
}

export async function submitContactForm(fields, formType = 'contacto') {
  if (!['contacto', 'contacto-servicios'].includes(formType)) {
    throw new Error('Formulario no disponible.');
  }
  const response = await fetch(endpoint(`dipe/v1/forms/${formType}`), {
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
  const raw = String(value ?? '');
  if (!raw) return '';

  if (typeof document === 'undefined') {
    return raw.replace(/<[^>]*>/g, '').trim();
  }

  const template = document.createElement('template');
  template.innerHTML = raw;
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

export function projectBannerImage(item) {
	return normalizeProjectImage(item?.acf?.dipe_project_banner_image);
}

export function projectGalleryMedia(item) {
	const gallery = Array.isArray(item?.acf?.dipe_project_gallery) ? item.acf.dipe_project_gallery : [];

	return gallery.map((row, index) => {
		const media = row?.media;
		const normalized = normalizeProjectImage(media);
		if (!normalized) return null;

		return {
			id: media?.id || media?.ID || `${normalized.url}-${index}`,
			url: normalized.url,
			alt: normalized.alt || media?.title || '',
			mimeType: media?.mime_type || media?.mime || '',
		};
	}).filter(Boolean);
}

export function projectHomeCardImage(item) {
  return normalizeProjectImage(item?.acf?.dipe_project_home_card_image)
    || normalizeProjectImage(item?.dipe_project_card_image);
}

export function projectArchiveCardImage(item) {
  const image = item?._embedded?.['wp:featuredmedia']?.[0];
  return normalizeProjectImage(image && { url: image.source_url, alt: image.alt_text });
}

export function projectPrimaryCategory(item) {
  const terms = item?._embedded?.['wp:term']?.flat() || [];
  return terms.find((term) => term.taxonomy === 'dipe_project_category') || null;
}

function projectCategories(item) {
	const terms = item?._embedded?.['wp:term']?.flat() || [];
	return terms.filter((term) => term.taxonomy === 'dipe_project_category');
}

async function getProjectCategoryHierarchy(item) {
	const embeddedCategories = projectCategories(item);
	const assignedIds = [...new Set([
		...embeddedCategories.map((category) => category.id),
		...(Array.isArray(item?.dipe_project_category) ? item.dipe_project_category : []),
	])];
	const assigned = (await Promise.all(assignedIds.map((id) => getProjectCategoryById(id)))).filter(Boolean);
	const knownCategories = new Map(assigned.map((category) => [category.id, category]));

	async function findRoot(category) {
		let current = category;
		const seen = new Set([current.id]);

		while (current.parent && !seen.has(current.parent)) {
			seen.add(current.parent);
			let parent = knownCategories.get(current.parent);
			if (!parent) {
				parent = await getProjectCategoryById(current.parent);
				if (!parent) break;
				knownCategories.set(parent.id, parent);
			}
			current = parent;
		}

		return current;
	}

	const children = assigned.filter((category) => category.parent);
	const categoriesForService = children.length > 0 ? children : assigned;
	const roots = [];
	for (const category of categoriesForService) {
		const root = await findRoot(category);
		if (!roots.some((item) => item.id === root.id)) roots.push(root);
	}

	return {
		roots,
		children,
	};
}

export function postCardImage(item) {
  const image = item?._embedded?.['wp:featuredmedia']?.[0];
  return normalizeProjectImage(image && { url: image.source_url, alt: image.alt_text });
}

export function postBannerMedia(item) {
  const media = item?.acf?.dipe_post_banner_media;
  const image = normalizeProjectImage(media) || postCardImage(item);
  if (!image) return null;
  return { ...image, mimeType: media?.mime_type || media?.mime || '' };
}

export function postPrimaryCategory(item) {
  const terms = item?._embedded?.['wp:term']?.flat() || [];
  return terms.find((term) => term.taxonomy === 'category') || null;
}
