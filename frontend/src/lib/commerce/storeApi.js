import { siteConfig } from '../site';
import { plainText } from '../api';
import { commerceConfig } from './config';

let cartNonce = '';
let cartQueue = Promise.resolve();

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
