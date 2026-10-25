import { ShopHero, ShopBreadcrumbs } from './ShopShared';
import { NativeCommerceSlot } from './NativeCommerceSlot';

export function NativeCommercePage({ context, checkoutLayout }) {
  return <>
    <ShopHero title={context.name} description={context.type === 'account' ? 'Tu espacio. Tus pedidos. Todo a mano.' : 'Un paso más para completar tu pedido.'} compact />
    <section className={`dipe-shop__container dipe-shop__native-section dipe-shop__native-section--${context.type}`}>
      <ShopBreadcrumbs items={[{ label: context.name }]} />
      <NativeCommerceSlot enhancement={checkoutLayout} />
    </section>
  </>;
}
