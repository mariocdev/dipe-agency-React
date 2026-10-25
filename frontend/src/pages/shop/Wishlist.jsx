import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { commerceConfig, shopFeatureRequest } from '../../lib/commerce';
import { plainText } from '../../lib/api';

const storageKey = 'dipe-shop-wishlist-session-v1';
const WishlistContext = createContext(null);
const signedIn = Boolean(commerceConfig.restNonce);
let accountLoad = null;

function guestIds() {
  try {
    const ids = JSON.parse(window.sessionStorage.getItem(storageKey) || '[]');
    return Array.isArray(ids) ? [...new Set(ids.map(Number).filter((id) => Number.isSafeInteger(id) && id > 0))].slice(0, 100) : [];
  } catch { return []; }
}

function saveGuest(ids) {
  if (ids.length) window.sessionStorage.setItem(storageKey, JSON.stringify(ids));
  else window.sessionStorage.removeItem(storageKey);
}

// Comparte la petición inicial entre montajes, sin duplicar la unión al acceder.
function loadAccountFavorites() {
  if (!accountLoad) {
    accountLoad = (async () => {
      const guest = guestIds();
      const result = await shopFeatureRequest('wishlist', guest.length ? { method: 'POST', body: { product_ids: guest } } : {});
      let storageError = null;
      if (guest.length) {
        try { saveGuest(guest.filter((id) => !result.ids.includes(id))); }
        catch { storageError = 'Tu lista está guardada en la cuenta, pero el navegador no ha podido actualizar los favoritos de esta sesión.'; }
      }
      return { ids: result.ids, storageError };
    })().finally(() => { accountLoad = null; });
  }
  return accountLoad;
}

export function WishlistIcon(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /></svg>;
}

export function WishlistProvider({ children }) {
  const [state, setState] = useState(() => ({ ids: signedIn ? [] : guestIds(), loading: signedIn, pending: false, error: null, message: '' }));
  const [revision, setRevision] = useState(0);
  const busy = useRef(false);
  const currentIds = useRef(state.ids);
  currentIds.current = state.ids;
  useEffect(() => {
    const restore = (event) => {
      if (!event.persisted) return;
      if (signedIn) setRevision((value) => value + 1);
      else setState((current) => ({ ...current, ids: guestIds() }));
    };
    window.addEventListener('pageshow', restore);
    return () => window.removeEventListener('pageshow', restore);
  }, []);
  useEffect(() => {
    if (!signedIn) return undefined;
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));
    const load = async () => {
      const result = await loadAccountFavorites();
      if (active) setState({ ids: result.ids, loading: false, pending: false, error: result.storageError, message: '' });
    };
    load().catch((error) => { if (active) setState((current) => ({ ...current, ids: [], loading: false, error: error.message })); });
    return () => { active = false; };
  }, [revision]);

  async function toggle(id) {
    if (busy.current || state.loading) return;
    busy.current = true;
    const saved = !currentIds.current.includes(id);
    setState((current) => ({ ...current, pending: true, error: null, message: '' }));
    try {
      let ids;
      if (signedIn) ids = (await shopFeatureRequest(`wishlist/${id}`, { method: 'POST', body: { saved } })).ids;
      else {
        ids = currentIds.current.filter((value) => value !== id);
        if (saved) {
          if (ids.length >= 100) throw new Error('Puedes guardar hasta 100 productos en tu lista.');
          ids.push(id);
        }
      }
      let storageError = null;
      if (!signedIn) {
        try { saveGuest(ids); }
        catch { storageError = 'El navegador no permite conservar los favoritos al cambiar de página.'; }
      }
      setState({ ids, loading: false, pending: false, error: storageError, message: saved ? 'Producto guardado en tu lista de deseos.' : 'Producto eliminado de tu lista de deseos.' });
    } catch (error) { setState((current) => ({ ...current, ...(error.status === 401 || error.status === 403 ? { ids: [] } : {}), pending: false, error: error.message })); }
    finally { busy.current = false; }
  }

  return <WishlistContext.Provider value={{ ...state, signedIn, toggle, refresh: () => setRevision((value) => value + 1) }}>
    {state.error && <div className="dipe-wishlist-notice dipe-shop__container" role="alert"><p>{state.error}</p>{signedIn && <button className="dipe-shop__text-button" type="button" disabled={state.pending || state.loading} onClick={() => setRevision((value) => value + 1)}>Recargar lista</button>}<button className="dipe-shop__text-button" type="button" onClick={() => setState((current) => ({ ...current, error: null }))}>Cerrar aviso</button></div>}
    <span className="visually-hidden" role="status">{state.message}</span>
    {children}
  </WishlistContext.Provider>;
}

export function useWishlist() { return useContext(WishlistContext); }

export function WishlistButton({ product }) {
  const { ids, loading, pending, toggle } = useWishlist();
  const saved = ids.includes(product.id);
  const label = `${saved ? 'Quitar de' : 'Guardar en'} la lista de deseos: ${plainText(product.name)}`;
  return <button className="dipe-wishlist-button" type="button" aria-label={label} title={label} aria-pressed={saved} disabled={loading || pending} onClick={() => toggle(product.id)}><WishlistIcon /></button>;
}
