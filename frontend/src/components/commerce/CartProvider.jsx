import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { changeShopCart, commerceConfig, getShopCart } from '../../lib/commerce';

const CartContext = createContext(null);

// Una sesión compartida por cabecera y tienda; se consulta al abrir el carrito.
export function CartProvider({ children }) {
  const [state, setState] = useState({ cart: null, loading: false, pending: false, error: null });
  const [isOpen, setIsOpen] = useState(false);
  const requestVersion = useRef(0);
  const busy = useRef(false);
  const openerRef = useRef(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; requestVersion.current += 1; };
  }, []);

  const refresh = useCallback(async () => {
    if (!commerceConfig.enabled || busy.current) return;
    const version = ++requestVersion.current;
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const cart = await getShopCart();
      if (mounted.current && version === requestVersion.current) setState((current) => ({ ...current, cart, loading: false, error: null }));
    } catch (error) {
      if (mounted.current && version === requestVersion.current) setState((current) => ({ ...current, loading: false, error }));
    }
  }, []);

  const openCart = useCallback((opener) => {
    if (!commerceConfig.enabled) return;
    openerRef.current = opener instanceof HTMLElement ? opener : document.activeElement;
    setIsOpen(true);
    refresh();
  }, [refresh]);
  const closeCart = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const restored = (event) => { if (event.persisted && isOpen) refresh(); };
    window.addEventListener('pageshow', restored);
    return () => window.removeEventListener('pageshow', restored);
  }, [isOpen, refresh]);

  const mutate = useCallback(async (operation, body) => {
    if (busy.current) throw new Error('Espera a que termine la actualización del carrito.');
    busy.current = true;
    const version = ++requestVersion.current;
    const opener = document.activeElement;
    setState((current) => ({ ...current, pending: true, error: null }));
    try {
      const cart = await changeShopCart(operation, body);
      if (mounted.current && version === requestVersion.current) {
        setState({ cart, pending: false, loading: false, error: null });
        if (operation === 'add-item') { openerRef.current = opener; setIsOpen(true); }
        // El checkout clásico recalcula sus fragmentos, envíos y pagos con la misma sesión.
        if (document.querySelector('form.checkout') && window.jQuery) window.jQuery(document.body).trigger('update_checkout');
      }
      return cart;
    } catch (error) {
      if (mounted.current && version === requestVersion.current) setState((current) => ({ ...current, pending: false, loading: false, error }));
      throw error;
    } finally { busy.current = false; }
  }, []);

  return <CartContext.Provider value={{ ...state, isOpen, openCart, closeCart, openerRef, mutate, refresh }}>{children}</CartContext.Provider>;
}

export function useShopCart() { return useContext(CartContext); }
