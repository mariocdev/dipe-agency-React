import { useLayoutEffect, useRef, useState } from 'react';
import { plainText } from '../../lib/api';
import { commerceConfig, formatShopMoney, shopUrl } from '../../lib/commerce';
import { useShopCart } from './CartProvider';
import './FloatingCart.css';

function CartIcon({ name }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{name === 'close' ? <path d="m6 6 12 12M6 18 18 6" /> : name === 'minus' ? <path d="M5 12h14" /> : name === 'plus' ? <path d="M5 12h14M12 5v14" /> : <path d="M5 12h14m-6-6 6 6-6 6" />}</svg>;
}

function CartItem({ item }) {
  const { mutate, pending, loading } = useShopCart();
  const limits = item.quantity_limits || {};
  const minimum = Math.max(1, Number(limits.minimum) || 1);
  const step = Math.max(1, Number(limits.multiple_of) || 1);
  const maximum = Number(limits.maximum) > 0 ? Number(limits.maximum) : Infinity;
  const disabled = pending || loading || limits.editable === false;
  const name = plainText(item.name);
  const image = item.images?.[0];
  const change = async (operation, body) => { try { await mutate(operation, body); } catch { /* El panel presenta el error del servidor. */ } };
  return <li className="dipe-floating-cart__item">
    <a href={item.permalink} tabIndex={-1} aria-hidden="true"><img src={image?.thumbnail || image?.src || commerceConfig.placeholder} alt="" width="80" height="96" loading="lazy" /></a>
    <div className="dipe-floating-cart__item-info">
      <a className="dipe-floating-cart__name" href={item.permalink}>{name}</a>
      {item.variation?.length > 0 && <p className="dipe-floating-cart__variation">{item.variation.map((value) => `${plainText(value.attribute)}: ${plainText(value.value)}`).join(' · ')}</p>}
      <p className="dipe-floating-cart__price">{formatShopMoney(Number(item.totals.line_total) + Number(item.totals.line_total_tax || 0), item.totals)}</p>
      <div className="dipe-floating-cart__item-actions">
        <div className="dipe-floating-cart__quantity" role="group" aria-label={`Cantidad de ${name}`}>
          <button type="button" disabled={disabled || item.quantity - step < minimum} aria-label={`Reducir cantidad de ${name}`} onClick={() => change('update-item', { key: item.key, quantity: item.quantity - step })}><CartIcon name="minus" /></button>
          <span>{item.quantity}</span>
          <button type="button" disabled={disabled || item.quantity + step > maximum} aria-label={`Aumentar cantidad de ${name}`} onClick={() => change('update-item', { key: item.key, quantity: item.quantity + step })}><CartIcon name="plus" /></button>
        </div>
        <button className="dipe-floating-cart__remove" type="button" disabled={pending || loading} aria-label={`Eliminar ${name}`} onClick={() => change('remove-item', { key: item.key })}>Eliminar</button>
      </div>
    </div>
  </li>;
}

function CartCoupon() {
  const { cart, mutate, pending, loading } = useShopCart();
  const [code, setCode] = useState('');
  async function apply(event) {
    event.preventDefault();
    if (!code.trim() || pending || loading) return;
    try { await mutate('apply-coupon', { code: code.trim() }); setCode(''); } catch { /* Error del panel. */ }
  }
  return <details className="dipe-floating-cart__coupon"><summary>¿Tienes un cupón?</summary>
    <form onSubmit={apply}><label className="visually-hidden" htmlFor="dipe-cart-coupon">Código del cupón</label><input id="dipe-cart-coupon" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Código del cupón" autoComplete="off" disabled={pending || loading} /><button type="submit" disabled={pending || loading || !code.trim()}>Aplicar</button></form>
    {cart.coupons?.map((coupon) => <p key={coupon.code}>{plainText(coupon.code)} <button type="button" disabled={pending || loading} onClick={async () => { try { await mutate('remove-coupon', { code: coupon.code }); } catch { /* Error del panel. */ } }}>Quitar</button></p>)}
  </details>;
}

// Dialog nativo: Escape, foco contenido y devolución del foco al acceso utilizado.
export function FloatingCart() {
  const { cart, loading, pending, error, isOpen, closeCart, openerRef, refresh } = useShopCart();
  const dialogRef = useRef(null);
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return undefined;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    dialog.showModal();
    root.style.overflow = 'hidden';
    return () => {
      dialog.close();
      root.style.overflow = previousOverflow;
      if (openerRef.current?.isConnected) openerRef.current.focus({ preventScroll: true });
    };
  }, [isOpen, openerRef]);
  if (!commerceConfig.enabled) return null;
  const totals = cart?.totals;
  const money = (value) => formatShopMoney(value, totals);
  const hasItems = Boolean(cart?.items?.length);
  const provisional = cart?.needs_shipping && !cart.has_calculated_shipping;
  return <dialog ref={dialogRef} id="dipe-floating-cart" className="dipe-floating-cart" aria-labelledby="dipe-floating-cart-title" onCancel={(event) => { event.preventDefault(); closeCart(); }} onClose={(event) => { if (!event.currentTarget.open) closeCart(); }} onClick={(event) => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeCart(); } }}>
    <div className="dipe-floating-cart__panel">
      <header className="dipe-floating-cart__header"><h2 id="dipe-floating-cart-title">Tu carrito{hasItems && <span> ({cart.items_count})</span>}</h2><button className="dipe-floating-cart__close" type="button" aria-label="Cerrar carrito" onClick={closeCart} autoFocus><CartIcon name="close" /></button></header>
      <div className="dipe-floating-cart__body" aria-busy={loading || pending}>
        <p className="visually-hidden" role="status">{loading ? 'Consultando carrito…' : pending ? 'Actualizando carrito…' : cart ? `${cart.items_count} unidades en el carrito.` : ''}</p>
        {loading && !cart && <p role="status">Cargando tu carrito…</p>}
        {error && <div className="dipe-floating-cart__error" role="alert"><p>{plainText(error.message)}</p><button type="button" disabled={loading || pending} onClick={refresh}>Volver a consultar</button></div>}
        {cart?.errors?.map((issue, index) => <p className="dipe-floating-cart__error" role="alert" key={`${issue.code}-${index}`}>{plainText(issue.message)}</p>)}
        {hasItems && <><ul className="dipe-floating-cart__items">{cart.items.map((item) => <CartItem key={item.key} item={item} />)}</ul><CartCoupon /></>}
        {cart && !hasItems && <div className="dipe-floating-cart__empty"><p>Tu carrito está esperando ideas.</p><a href={shopUrl}>Descubrir la colección<CartIcon /></a></div>}
      </div>
      {hasItems && totals && <footer className="dipe-floating-cart__footer">
        <dl><div><dt>Productos</dt><dd>{money(Number(totals.total_items) + Number(totals.total_items_tax || 0))}</dd></div>
          {Number(totals.total_discount) > 0 && <div><dt>Descuentos</dt><dd>−{money(Number(totals.total_discount) + Number(totals.total_discount_tax || 0))}</dd></div>}
          {Number(totals.total_fees) !== 0 && <div><dt>Cargos</dt><dd>{money(Number(totals.total_fees) + Number(totals.total_fees_tax || 0))}</dd></div>}
          {cart.needs_shipping && <div><dt>Envío</dt><dd>{provisional ? 'Al finalizar compra' : money(Number(totals.total_shipping) + Number(totals.total_shipping_tax || 0))}</dd></div>}
          <div className="dipe-floating-cart__total"><dt>{provisional ? 'Total provisional' : 'Total'}</dt><dd>{money(totals.total_price)}</dd></div>
        </dl>
        {Number(totals.total_tax) > 0 && <p className="dipe-floating-cart__tax">Incluye {money(totals.total_tax)} de impuestos.</p>}
        <a className="dipe-floating-cart__checkout" href={commerceConfig.checkoutUrl} aria-disabled={loading || pending || Boolean(error)} onClick={(event) => { if (loading || pending || error) event.preventDefault(); }}>Finalizar compra<CartIcon /></a>
        <button className="dipe-floating-cart__continue" type="button" onClick={closeCart}>Seguir comprando</button>
      </footer>}
    </div>
  </dialog>;
}
