import { storeRequest } from './storeApi';

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
