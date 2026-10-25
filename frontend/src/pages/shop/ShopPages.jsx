import { useEffect } from 'react';
import { commerceConfig } from '../../lib/commerce';
import { ShopLayout } from './ShopShared';

// Respaldo para HTML antiguo: la URL heredada redirige normalmente desde PHP.
function LegacyCartRedirect() {
  useEffect(() => { window.location.replace(commerceConfig.checkoutUrl); }, []);
  return <p role="status">Abriendo finalizar compra… <a href={commerceConfig.checkoutUrl}>Continuar</a></p>;
}

// Resolver antes del montaje evita cargar ficha, catálogo y checkout a la vez.
// WordPress conserva el tipo de vista y sus enlaces permanentes.
export async function loadShopPage(context, onNotFound) {
  let content;
  if (context.type === 'product') {
    const { ProductDetail } = await import('./ProductDetail');
    content = <ProductDetail context={context} onNotFound={onNotFound} />;
  } else if (context.type === 'cart') content = <LegacyCartRedirect />;
  else if (['checkout', 'account'].includes(context.type)) {
    const [{ NativeCommercePage }, checkout] = await Promise.all([
      import('./NativeCommerce'),
      context.type === 'checkout' ? import('./CheckoutLayout') : Promise.resolve(null),
    ]);
    content = <NativeCommercePage context={context} checkoutLayout={checkout?.CheckoutLayout} />;
  } else {
    const { ShopArchive } = await import('./ShopArchive');
    content = <ShopArchive context={context} />;
  }
  return <ShopLayout>{content}</ShopLayout>;
}
