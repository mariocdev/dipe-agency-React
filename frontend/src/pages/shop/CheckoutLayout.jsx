import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { plainText } from '../../lib/api';
import { useShopCart } from '../../components/commerce/CartProvider';
import { CheckoutExperience } from './CheckoutExperience';

function CheckoutCoupon() {
  const { mutate, pending } = useShopCart();
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState({ message: '', error: false });
  async function apply() {
    if (!code.trim() || pending) return;
    setFeedback({ message: '', error: false });
    try {
      await mutate('apply-coupon', { code: code.trim() });
      setCode('');
      setFeedback({ message: 'Cupón aplicado. Actualizando el resumen…', error: false });
    } catch (error) { setFeedback({ message: plainText(error.message), error: true }); }
  }
  // Forma parte del formulario nativo: no anida otro form ni intercepta su envío.
  return <div className="dipe-checkout-coupon__fields">
    <label htmlFor="dipe-checkout-coupon-code">Código del cupón</label>
    <div className="dipe-checkout-coupon__row"><input id="dipe-checkout-coupon-code" type="text" autoComplete="off" value={code} disabled={pending} onChange={(event) => setCode(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); apply(); } }} /><button type="button" disabled={pending || !code.trim()} onClick={apply}>{pending ? 'Aplicando…' : 'Aplicar'}</button></div>
    {feedback.message && <p className={feedback.error ? 'dipe-checkout-coupon__error' : undefined} role={feedback.error ? 'alert' : 'status'}>{feedback.message}</p>}
  </div>;
}

// Observa las columnas reales, incluidos los cambios de altura de los fragmentos AJAX.
export function CheckoutLayout({ rootRef }) {
  const [couponTarget, setCouponTarget] = useState(null);
  const [experienceTargets, setExperienceTargets] = useState(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    setCouponTarget(root.querySelector('#dipe-checkout-coupon-slot'));
    const header = root.querySelector('#dipe-checkout-experience');
    const footer = root.querySelector('#dipe-checkout-experience-footer');
    if (header && footer && root.querySelector('form.checkout')) setExperienceTargets({ header, footer });
    if (!root.querySelector('form.checkout, .wp-block-woocommerce-checkout')) return undefined;
    let main = null;
    let sidebar = null;
    const media = window.matchMedia('(min-width: 881px)');
    let frame = 0;
    function update() {
      frame = 0;
      if (!main || !sidebar) return;
      const mode = root.querySelector('form.checkout')?.dataset.dipeCheckoutMode;
      const shorter = media.matches && (!mode || mode === 'normal') ? (main.getBoundingClientRect().height < sidebar.getBoundingClientRect().height ? main : sidebar) : null;
      main.classList.toggle('is-dipe-checkout-sticky', shorter === main);
      sidebar.classList.toggle('is-dipe-checkout-sticky', shorter === sidebar);
    }
    function schedule() { if (!frame) frame = window.requestAnimationFrame(update); }
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    // Los bloques pueden montar sus columnas después de que React mueva el contenedor.
    const pendingObserver = new MutationObserver(attach);
    function attach() {
      main = root.querySelector('form.checkout #customer_details, .wc-block-checkout__main');
      sidebar = root.querySelector('form.checkout .dipe-checkout-summary, .wc-block-checkout__sidebar');
      if (!main || !sidebar) return;
      pendingObserver.disconnect();
      root.classList.add('dipe-checkout-layout-ready');
      observer?.observe(main);
      observer?.observe(sidebar);
      schedule();
    }
    attach();
    if (!main || !sidebar) pendingObserver.observe(root, { childList: true, subtree: true });
    window.addEventListener('resize', schedule);
    root.addEventListener('dipe-checkout-layout-change', schedule);
    const nativeEvents = window.jQuery ? window.jQuery(document.body) : null;
    nativeEvents?.on('updated_checkout.dipeCheckoutLayout', schedule);
    schedule();
    return () => {
      observer?.disconnect();
      pendingObserver.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      root.removeEventListener('dipe-checkout-layout-change', schedule);
      nativeEvents?.off('updated_checkout.dipeCheckoutLayout', schedule);
      main?.classList.remove('is-dipe-checkout-sticky');
      sidebar?.classList.remove('is-dipe-checkout-sticky');
      root.classList.remove('dipe-checkout-layout-ready');
    };
  }, [rootRef]);
  return <>{couponTarget && createPortal(<CheckoutCoupon />, couponTarget)}{experienceTargets && <CheckoutExperience rootRef={rootRef} headerTarget={experienceTargets.header} footerTarget={experienceTargets.footer} />}</>;
}
