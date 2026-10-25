import { useLayoutEffect, useRef, useState } from 'react';
import './NativeCommerce.css';

// Mueve el nodo original: conserva formularios, eventos y bloques de WooCommerce.
// Las reseñas no necesitan importar ni inicializar las mejoras del checkout.
export function NativeCommerceSlot({ sourceId = 'dipe-native-commerce', fallback = 'Esta sección no está disponible ahora.', enhancement: Enhancement }) {
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
  return <div className="dipe-shop-native" ref={targetRef}>{missing && <p role="status">{fallback}</p>}{Enhancement && <Enhancement rootRef={targetRef} />}</div>;
}
