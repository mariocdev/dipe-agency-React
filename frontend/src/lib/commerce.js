import { siteConfig, sitePath } from './site';
import { plainText } from './api';

export const commerceConfig = siteConfig.commerce || {};
export const shopUrl = commerceConfig.shopUrl || sitePath('tienda/');
export const shopQueryKeys = ['q', 'desde', 'hasta', 'stock', 'color', 'talla', 'orden', 'pagina', 'favoritos'];
const sortOptions = { collection: ['menu_order', 'asc'], newest: ['date', 'desc'], price: ['price', 'asc'], 'price-desc': ['price', 'desc'] };
let cartNonce = '';
let cartQueue = Promise.resolve();

export function readShopFilters() {
  const params = new URLSearchParams(window.location.search);
  const price = (key) => /^\d+(?:[.,]\d{1,6})?$/.test(params.get(key) || '') ? params.get(key).replace(',', '.') : '';
  const terms = (key) => [...new Set((params.get(key) || '').split(',').filter(Boolean))];
  return {
    search: (params.get('q') || '').slice(0, 200), min: price('desde'), max: price('hasta'),
    stock: params.get('stock') === '1', colors: terms('color'), sizes: terms('talla'),
    favorites: params.get('favoritos') === '1',
    order: Object.hasOwn(sortOptions, params.get('orden')) ? params.get('orden') : 'collection',
    page: Math.max(1, Math.min(10000, Number.parseInt(params.get('pagina'), 10) || 1)),
  };
}

export function shopFilterUrl(filters, base = window.location.href) {
  const url = new URL(base, window.location.href);
  shopQueryKeys.forEach((key) => url.searchParams.delete(key));
  const values = { q: filters.search.trim(), desde: filters.min, hasta: filters.max, stock: filters.stock ? '1' : '', color: filters.colors.join(','), talla: filters.sizes.join(','), orden: filters.order === 'collection' ? '' : filters.order, pagina: filters.page > 1 ? String(filters.page) : '', favoritos: filters.favorites ? '1' : '' };
  Object.entries(values).forEach(([key, value]) => { if (value) url.searchParams.set(key, value); });
  return url;
}

// Los filtros se aplican a toda la colección en WooCommerce, antes de paginar.
export function productQuery(filters, context = {}, wishlistIds = []) {
  const [orderby, order] = sortOptions[filters.order] || sortOptions.collection;
  const params = new URLSearchParams({ per_page: '12', page: String(filters.page), orderby, order, catalog_visibility: 'catalog' });
  if (context.type === 'category') params.set('category', String(context.id));
  if (context.type === 'tag') params.set('tag', String(context.id));
  if (filters.search.trim()) params.set('search', filters.search.trim());
  const precision = Number(commerceConfig.priceDecimals ?? 2);
  if (filters.min !== '') params.set('min_price', String(Math.round(Number(filters.min) * 10 ** precision)));
  if (filters.max !== '') params.set('max_price', String(Math.round(Number(filters.max) * 10 ** precision)));
  if (filters.stock) params.set('stock_status[0]', 'instock');
  if (filters.favorites) wishlistIds.forEach((id, index) => params.set(`include[${index}]`, String(id)));
  let index = 0;
  for (const [taxonomy, values] of [['pa_color', filters.colors], ['pa_talla', filters.sizes]]) {
    if (!values.length) continue;
    params.set(`attributes[${index}][attribute]`, taxonomy);
    params.set(`attributes[${index}][operator]`, 'in');
    values.forEach((value, position) => params.set(`attributes[${index}][slug][${position}]`, value));
    index += 1;
  }
  if (index) params.set('attribute_relation', 'and');
  return params;
}

// Conserva el apiRoot entregado por WordPress, incluido REST con rest_route.
function storeEndpoint(path, params = {}, namespace = 'wc/store/v1') {
  const root = new URL(siteConfig.apiRoot || '/wp-json/', window.location.origin);
  const route = `${namespace}/${path.replace(/^\/+/, '')}`;
  let url;
  if (root.searchParams.has('rest_route')) {
    url = root;
    url.searchParams.set('rest_route', `/${route}`);
  } else {
    if (!root.pathname.endsWith('/')) root.pathname += '/';
    url = new URL(route, root);
  }
  for (const [key, value] of new URLSearchParams(params)) url.searchParams.set(key, value);
  return url;
}

export async function storeRequest(path, { params, signal, method = 'GET', body, namespace = 'wc/store/v1' } = {}) {
  const headers = { Accept: 'application/json' };
  if (commerceConfig.restNonce) headers['X-WP-Nonce'] = commerceConfig.restNonce;
  if (method !== 'GET') {
    headers['Content-Type'] = 'application/json';
    if (namespace === 'wc/store/v1') headers.Nonce = cartNonce;
  }
  const response = await fetch(storeEndpoint(path, params, namespace), { signal, credentials: 'same-origin', cache: path.startsWith('cart') || namespace !== 'wc/store/v1' ? 'no-store' : 'default', method, headers, ...(body ? { body: JSON.stringify(body) } : {}) });
  if (response.headers.get('Nonce')) cartNonce = response.headers.get('Nonce');
  let data;
  try { data = await response.json(); } catch { throw new Error('La tienda no ha podido responder. Vuelve a intentarlo.'); }
  if (!response.ok) {
    const error = new Error(plainText(data?.message) || 'No se ha podido cargar la tienda.');
    error.status = response.status;
    throw error;
  }
  return { data, total: Number(response.headers.get('X-WP-Total') || 0), pages: Math.max(1, Number(response.headers.get('X-WP-TotalPages') || 1)) };
}

export async function shopFeatureRequest(path, options = {}) {
  return (await storeRequest(path, { ...options, namespace: 'dipe/v1/shop' })).data;
}

export async function getShopCart(signal) {
  return (await storeRequest('cart', { signal })).data;
}

// Cookies del mismo origen: el checkout nativo recibe el mismo carrito que React.
export function changeShopCart(operation, body) {
  const run = async () => {
    if (!cartNonce) await getShopCart();
    try { return (await storeRequest(`cart/${operation}`, { method: 'POST', body })).data; }
    catch (error) {
      if (error.status !== 401 && error.status !== 403) throw error;
      await getShopCart();
      return (await storeRequest(`cart/${operation}`, { method: 'POST', body })).data;
    }
  };
  const next = cartQueue.then(run, run);
  cartQueue = next.catch(() => {});
  return next;
}

async function allTerms(path, signal) {
  const first = await storeRequest(path, { params: { per_page: '100' }, signal });
  const items = [...first.data];
  for (let page = 2; page <= first.pages; page += 1) {
    const result = await storeRequest(path, { params: { per_page: '100', page: String(page) }, signal });
    items.push(...result.data);
  }
  return items;
}

export async function getShopFilters(signal, context = {}) {
  const priceParams = new URLSearchParams({ calculate_price_range: 'true', catalog_visibility: 'catalog' });
  if (context.type === 'category') priceParams.set('category', String(context.id));
  if (context.type === 'tag') priceParams.set('tag', String(context.id));
  const [categoriesResult, attributesResult, priceResult] = await Promise.allSettled([
    allTerms('products/categories', signal), allTerms('products/attributes', signal),
    storeRequest('products/collection-data', { params: priceParams, signal }),
  ]);
  if (signal.aborted) throw new DOMException('Petición cancelada', 'AbortError');
  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value.filter((item) => item.count > 0) : [];
  const attributes = attributesResult.status === 'fulfilled' ? attributesResult.value.filter((item) => ['pa_color', 'pa_talla'].includes(item.taxonomy)) : [];
  const terms = await Promise.allSettled(attributes.map(async (attribute) => ({ ...attribute, terms: await allTerms(`products/attributes/${attribute.id}/terms`, signal) })));
  return {
    categories, attributes: terms.filter((item) => item.status === 'fulfilled').map((item) => item.value),
    priceRange: priceResult.status === 'fulfilled' ? priceResult.value.data.price_range : null,
    partial: categoriesResult.status === 'rejected' || attributesResult.status === 'rejected' || priceResult.status === 'rejected' || terms.some((item) => item.status === 'rejected'),
  };
}

export async function getShopProduct(context, signal) {
  if (context?.id) {
    try { return (await storeRequest(`products/${context.id}`, { signal })).data; }
    catch (error) { if (error.status === 404) return null; throw error; }
  }
  const result = await storeRequest('products', { params: { slug: context.slug, per_page: '1' }, signal });
  return result.data[0] || null;
}

export function formatShopMoney(value, prices = {}) {
  const precision = Number(prices.currency_minor_unit ?? commerceConfig.priceDecimals ?? 2);
  const amount = Number(value) / 10 ** precision;
  if (!Number.isFinite(amount)) return '';
  try {
    return new Intl.NumberFormat((siteConfig.language || 'es-ES').replace('_', '-'), { style: 'currency', currency: prices.currency_code || commerceConfig.currency || 'EUR', minimumFractionDigits: precision, maximumFractionDigits: precision }).format(amount);
  } catch {
    return `${amount.toFixed(precision)} ${plainText(prices.currency_symbol || prices.currency_code || '')}`;
  }
}

export function attributeKey(attribute) { return attribute.taxonomy || attribute.name; }

// Las variaciones identifican los atributos con su etiqueta y sus valores con slug.
export function selectedVariation(product, selection) {
  const attributes = (product.attributes || []).filter((attribute) => attribute.has_variations);
  if (!attributes.length || attributes.some((attribute) => !selection[attributeKey(attribute)])) return null;
  return (product.variations || []).find((variation) => attributes.every((attribute) => {
    const value = variation.attributes.find((item) => plainText(item.name).toLowerCase() === plainText(attribute.name).toLowerCase());
    return value && (value.value === null || value.value === '' || value.value === selection[attributeKey(attribute)]);
  })) || null;
}
