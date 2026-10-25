import { useLayoutEffect, useRef, useState } from 'react';
import { ShopHero, ShopBreadcrumbs } from './ShopShared';
import { CheckoutLayout } from './CheckoutLayout';
import './NativeCommerce.css';

// Mueve el nodo original: conserva formularios, eventos y bloques de WooCommerce.
export function NativeCommerceSlot({ sourceId = 'dipe-native-commerce', fallback = 'Esta sección no está disponible ahora.', checkout = false }) {
  const targetRef = useRef(null);
  const [missing, setMissing] = useState(false);
  useLayoutEffect(() => {
    const node = document.getElementById(sourceId);
    if (!node || !targetRef.current) { setMissing(true); return undefined; }
    setMissing(false);
    const marker = document.createComment('dipe-commerce-origin');
    node.parentNode.insertBefore(marker, node);
    targetRef.current.appendChild(node);
    node.hidden = false;
    return () => {
      if (marker.parentNode) { marker.parentNode.insertBefore(node, marker); marker.remove(); }
    };
  }, [sourceId]);
  return <div className="dipe-shop-native" ref={targetRef}>{missing && <p role="status">{fallback}</p>}{checkout && <CheckoutLayout rootRef={targetRef} />}</div>;
}

export function NativeCommercePage({ context }) {
  return <>
    <ShopHero title={context.name} description={context.type === 'account' ? 'Tu espacio. Tus pedidos. Todo a mano.' : 'Un paso más para completar tu pedido.'} compact />
    <section className={`dipe-shop__container dipe-shop__native-section dipe-shop__native-section--${context.type}`}>
      <ShopBreadcrumbs items={[{ label: context.name }]} />
      <NativeCommerceSlot checkout={context.type === 'checkout'} />
    </section>
  </>;
}
