import { commerceConfig } from './config';

export const shopQueryKeys = ['q', 'desde', 'hasta', 'stock', 'color', 'talla', 'orden', 'pagina', 'favoritos'];
const sortOptions = { collection: ['menu_order', 'asc'], newest: ['date', 'desc'], price: ['price', 'asc'], 'price-desc': ['price', 'desc'] };

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
