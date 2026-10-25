import { ShopLayout } from './ShopShared';
import { ShopArchive } from './ShopArchive';
import { ProductDetail } from './ProductDetail';
import { NativeCommercePage } from './NativeCommerce';

// Respaldo para HTML antiguo: la URL heredada redirige normalmente desde PHP.
function LegacyCartRedirect() {
  useEffect(() => { window.location.replace(commerceConfig.checkoutUrl); }, []);
  return <p role="status">Abriendo finalizar compra… <a href={commerceConfig.checkoutUrl}>Continuar</a></p>;
}

// WordPress entrega el tipo de vista; sus enlaces permanentes no se duplican aquí.
export function ShopPages({ context, onNotFound }) {
  let content;
  if (context.type === 'product') content = <ProductDetail context={context} onNotFound={onNotFound} />;
  else if (context.type === 'cart') content = <LegacyCartRedirect />;
  else if (['checkout', 'account'].includes(context.type)) content = <NativeCommercePage context={context} />;
  else content = <ShopArchive context={context} />;
  return <ShopLayout>{content}</ShopLayout>;
}
import { useEffect } from 'react';
import { commerceConfig } from '../../lib/commerce';
