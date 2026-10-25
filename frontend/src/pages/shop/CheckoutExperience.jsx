import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { preserveScrollHeight, scrollToContent } from '../../lib/scroll';
import './CheckoutExperience.css';

const modeParameter = 'vista_checkout';
const allSteps = [
  { key: 'details', label: 'Tus datos', description: 'Contacto, dirección y facturación.' },
  { key: 'shipping', label: 'Envío', description: 'Elige cómo quieres recibir tu pedido.' },
  { key: 'review', label: 'Revisa tu pedido', navigationLabel: 'Revisión', description: 'Comprueba tus datos, productos e importe.' },
  { key: 'payment', label: 'Pago', description: 'Elige tu forma de pago y confirma el pedido.' },
];

function requestedMode() {
  const value = new URL(window.location.href).searchParams.get(modeParameter);
  return ['normal', 'pasos'].includes(value) ? value : null;
}

function readSummary(form) {
  const value = (name) => {
    const field = form.querySelector(`[name="${name}"]`);
    if (!field?.value) return '';
    return field.tagName === 'SELECT' ? field.selectedOptions[0]?.textContent.trim() || '' : field.value.trim();
  };
  const fields = (prefix, definitions) => definitions.map(([key, label]) => ({
    key, label, value: value(`${prefix}_${key}`),
  })).filter((field) => field.value);
  const address = (prefix) => fields(prefix, [
    ['first_name', 'Nombre'], ['last_name', 'Apellidos'], ['company', 'Empresa'],
    ['address_1', 'Dirección'], ['address_2', 'Piso, puerta, etc.'],
    ['postcode', 'Código postal'], ['city', 'Localidad'],
    ['state', 'Provincia / Región'], ['country', 'País'],
  ]);
  const different = Boolean(form.querySelector('#ship-to-different-address-checkbox')?.checked);
  const methods = [];
  const labels = Array.from(form.querySelectorAll('.dipe-checkout-shipping label'));
  form.querySelectorAll('.dipe-checkout-shipping [name^="shipping_method"]').forEach((field) => {
    if (!field.value || (field.type === 'radio' && !field.checked)) return;
    const label = labels.find((item) => item.htmlFor === field.id);
    const text = label?.textContent.trim() || (field.tagName === 'SELECT' ? field.selectedOptions[0]?.textContent.trim() : 'Envío seleccionado');
    if (text) methods.push(text.replace(/\s+/g, ' '));
  });
  return {
    contact: fields('billing', [['email', 'Correo electrónico'], ['phone', 'Teléfono']]),
    billing: address('billing'), delivery: address(different ? 'shipping' : 'billing'), different, methods,
    total: form.querySelector('.order-total td')?.textContent.replace(/\s+/g, ' ').trim() || '',
  };
}

function SummaryFields({ fields }) {
  return <dl className="dipe-checkout-experience__fields">{fields.map((field) => (
    <div key={field.key}><dt>{field.label}</dt><dd>{field.value}</dd></div>
  ))}</dl>;
}

function focusField(field, releaseHeight) {
  const target = field?.classList.contains('select2-hidden-accessible') ? field.closest('.form-row')?.querySelector('.select2-selection') : field;
  if (!target) { releaseHeight(); return () => {}; }
  target.focus({ preventScroll: true });
  return scrollToContent(target, { block: 'center', onFinish: releaseHeight });
}

// Comprueba las filas nativas aplicables; WooCommerce mantiene la validación definitiva.
function validateDetails(form) {
  const previous = form.dataset.dipeCheckoutStep;
  form.dataset.dipeCheckoutStep = 'details';
  let invalid = null;
  try {
    form.querySelectorAll('#customer_details .form-row').forEach((row) => {
      if (!row.getClientRects().length) return;
      const controls = Array.from(row.querySelectorAll('input:not([type="hidden"]), select, textarea')).filter((field) => !field.disabled);
      if (!controls.length) return;
      if (window.jQuery) window.jQuery(controls).trigger('validate');
      const required = row.classList.contains('validate-required');
      const missing = required && controls.every((field) => field.type === 'checkbox' || field.type === 'radio' ? !field.checked : !field.value.trim());
      const invalidFormat = controls.some((field) => !field.checkValidity());
      if (missing || invalidFormat || row.classList.contains('woocommerce-invalid')) {
        row.classList.add('woocommerce-invalid');
        controls[0].setAttribute('aria-invalid', 'true');
        invalid ||= controls[0];
      } else controls.forEach((field) => field.removeAttribute('aria-invalid'));
    });
  } finally { form.dataset.dipeCheckoutStep = previous || 'details'; }
  return invalid;
}

function validShipping(form) {
  const groups = new Map();
  form.querySelectorAll('.dipe-checkout-shipping [name^="shipping_method"]').forEach((field) => {
    if (field.disabled) return;
    const chosen = Boolean(field.value) && (field.type !== 'radio' || field.checked);
    groups.set(field.name, groups.get(field.name) || chosen);
  });
  return groups.size > 0 && [...groups.values()].every(Boolean);
}

export function CheckoutExperience({ rootRef, headerTarget, footerTarget }) {
  const [mode, setMode] = useState(requestedMode);
  const [step, setStep] = useState('details');
  const [completed, setCompleted] = useState([]);
  const [needsShipping, setNeedsShipping] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({ contact: [], billing: [], delivery: [], methods: [], total: '' });
  const formRef = useRef(null);
  const busyRef = useRef(false);
  const restoreValidation = useRef(null);
  const titleRef = useRef(null);
  const focusFrameRef = useRef(0);
  const scrollCleanupRef = useRef(() => {});
  const previousViewRef = useRef(null);
  const actionsRef = useRef(null);
  const stateRef = useRef(null);
  stateRef.current = { mode, step, needsShipping };
  const steps = allSteps.filter((item) => needsShipping || item.key !== 'shipping');
  const index = steps.findIndex((item) => item.key === step);

  function moveTo(next, field, changeMode) {
    window.cancelAnimationFrame(focusFrameRef.current);
    scrollCleanupRef.current();
    setError('');
    function showNext() {
      if (!formRef.current) return;
      const releaseHeight = preserveScrollHeight(rootRef.current);
      scrollCleanupRef.current = releaseHeight;
      changeMode?.();
      setStep(next);
      formRef.current.dataset.dipeCheckoutStep = next;
      focusFrameRef.current = window.requestAnimationFrame(() => {
        releaseHeight();
        if (field) scrollCleanupRef.current = focusField(field, () => {});
        else titleRef.current?.focus({ preventScroll: true });
      });
    }
    // Conserva el paso actual durante la subida; la entrada se anima ya en pantalla.
    if (next !== stateRef.current.step || changeMode) {
      scrollCleanupRef.current = scrollToContent(headerTarget, { onComplete: showNext });
    } else showNext();
  }

  function checkDetails() {
    const invalid = validateDetails(formRef.current);
    if (!invalid) return true;
    moveTo('details', invalid);
    setError('Revisa los campos marcados antes de continuar.');
    return false;
  }

  function checkShipping() {
    if (!needsShipping || validShipping(formRef.current)) return true;
    moveTo('shipping');
    setError('No hay un método de envío seleccionado. Comprueba tu dirección y las opciones disponibles.');
    return false;
  }

  function goTo(next) {
    if (!formRef.current) return;
    const nextIndex = steps.findIndex((item) => item.key === next);
    if (nextIndex > index) {
      if (busyRef.current) return;
      if (!checkDetails() || (next !== 'shipping' && !checkShipping())) return;
    }
    setSummary(readSummary(formRef.current));
    moveTo(next);
  }

  function advance() {
    if (busyRef.current || !formRef.current) return;
    if (step === 'details' && !checkDetails()) return;
    if ((step === 'shipping' || step === 'review') && (!checkDetails() || !checkShipping())) return;
    if (step === 'details' && !window.jQuery) { setError('La compra todavía se está preparando. Espera un momento y vuelve a intentarlo.'); return; }
    setCompleted((current) => [...new Set([...current, step])]);
    setSummary(readSummary(formRef.current));
    const next = steps[index + 1];
    if (next) moveTo(next.key);
    if (step === 'details') window.jQuery(document.body).trigger('update_checkout');
  }

  actionsRef.current = { advance, checkDetails, checkShipping, moveTo };

  function choose(nextMode) {
    const url = new URL(window.location.href);
    if (nextMode) url.searchParams.set(modeParameter, nextMode);
    else url.searchParams.delete(modeParameter);
    moveTo('details', null, () => {
      window.history.pushState(window.history.state, '', url);
      setMode(nextMode);
      setCompleted([]);
    });
  }

  useLayoutEffect(() => {
    const root = rootRef.current;
    const form = root?.querySelector('form.checkout');
    if (!form) return undefined;
    formRef.current = form;
    const nativeEvents = window.jQuery ? window.jQuery(document.body) : null;
    function sync() {
      busyRef.current = false;
      setBusy(false);
      const shipping = form.querySelector('.dipe-checkout-shipping');
      const required = Boolean(shipping && !shipping.hidden);
      if (required !== stateRef.current.needsShipping) {
        window.cancelAnimationFrame(focusFrameRef.current);
        scrollCleanupRef.current();
        setCompleted([]);
        setStep('details');
      }
      setNeedsShipping(required);
      setSummary(readSummary(form));
    }
    function updating() { busyRef.current = true; setBusy(true); }
    function failed() {
      busyRef.current = false;
      setBusy(false);
      if (stateRef.current.mode !== 'pasos') return;
      let target = null;
      root.querySelectorAll('.woocommerce-error [data-id]').forEach((item) => {
        const field = document.getElementById(item.dataset.id);
        if (!target && field && form.contains(field)) target = field;
      });
      const invalid = target || form.querySelector('#customer_details .woocommerce-invalid input, #customer_details .woocommerce-invalid select');
      const next = invalid?.closest('#customer_details') ? 'details' : target?.closest('.dipe-checkout-shipping') ? 'shipping' : 'payment';
      actionsRef.current.moveTo(next, invalid);
      setError('Revisa los avisos de WooCommerce antes de volver a confirmar.');
    }
    function changed(event) {
      if (event.target.closest('#customer_details')) setCompleted([]);
    }
    function submit(event) {
      const current = stateRef.current;
      if (current.mode === 'normal') return;
      if (current.mode === 'pasos' && current.step === 'payment') {
        if (!busyRef.current && actionsRef.current.checkDetails() && actionsRef.current.checkShipping()) {
          const terms = form.querySelector('#terms');
          if (!terms || terms.checked) return;
          actionsRef.current.moveTo('payment', terms);
          setError('Debes aceptar las políticas para confirmar el pedido.');
        }
      } else if (current.mode === 'pasos') actionsRef.current.advance();
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    // También cubre el envío sintético utilizado por los botones de las pasarelas.
    function allowOrder() {
      const current = stateRef.current;
      if (current.mode === 'normal') return;
      if (current.mode !== 'pasos' || current.step !== 'payment' || busyRef.current) return false;
      if (!actionsRef.current.checkDetails() || !actionsRef.current.checkShipping()) return false;
      const terms = form.querySelector('#terms');
      if (terms && !terms.checked) {
        actionsRef.current.moveTo('payment', terms);
        setError('Debes aceptar las políticas para confirmar el pedido.');
        return false;
      }
      // No devuelve true: conserva un posible false de otros validadores nativos.
      return;
    }
    function popstate() {
      window.cancelAnimationFrame(focusFrameRef.current);
      scrollCleanupRef.current();
      setMode(requestedMode()); setStep('details'); setCompleted([]); setError('');
    }
    form.addEventListener('submit', submit, true);
    form.addEventListener('input', changed);
    form.addEventListener('change', changed);
    window.addEventListener('popstate', popstate);
    nativeEvents?.on('update_checkout.dipeExperience', updating);
    nativeEvents?.on('updated_checkout.dipeExperience', sync);
    nativeEvents?.on('checkout_error.dipeExperience', failed);
    if (window.jQuery) window.jQuery(form).on('checkout_place_order.dipeExperience', allowOrder);
    sync();
    return () => {
      form.removeEventListener('submit', submit, true);
      form.removeEventListener('input', changed);
      form.removeEventListener('change', changed);
      window.removeEventListener('popstate', popstate);
      nativeEvents?.off('.dipeExperience');
      if (window.jQuery) window.jQuery(form).off('.dipeExperience');
      if (restoreValidation.current !== null) form.noValidate = restoreValidation.current;
      restoreValidation.current = null;
      form.removeAttribute('data-dipe-checkout-mode');
      form.removeAttribute('data-dipe-checkout-step');
      root.removeAttribute('data-dipe-checkout-mode');
      window.cancelAnimationFrame(focusFrameRef.current);
      scrollCleanupRef.current();
      previousViewRef.current = null;
      formRef.current = null;
    };
  }, [rootRef]);

  useLayoutEffect(() => {
    const form = formRef.current;
    if (!form) return;
    form.dataset.dipeCheckoutMode = mode || 'choose';
    form.dataset.dipeCheckoutStep = step;
    rootRef.current.dataset.dipeCheckoutMode = mode || 'choose';
    if (mode === 'pasos') {
      if (restoreValidation.current === null) restoreValidation.current = form.noValidate;
      form.noValidate = true;
    } else if (restoreValidation.current !== null) {
      form.noValidate = restoreValidation.current;
      restoreValidation.current = null;
    }
    rootRef.current.dispatchEvent(new Event('dipe-checkout-layout-change'));
    if (mode === 'pasos' && step === 'payment') {
      const selected = form.querySelector('input[name="payment_method"]:checked');
      if (selected && window.jQuery) window.jQuery(selected).trigger('click');
      window.dispatchEvent(new Event('resize'));
    }
    const previous = previousViewRef.current;
    previousViewRef.current = { mode, step };
    if (mode !== 'pasos' || (previous?.mode === mode && previous.step === step)
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof form.animate !== 'function') return undefined;
    const direction = previous?.mode === mode && allSteps.findIndex((item) => item.key === step) < allSteps.findIndex((item) => item.key === previous.step) ? -1 : 1;
    const nativeTargets = {
      details: '#customer_details', shipping: '.dipe-checkout-shipping',
      review: '.dipe-checkout-order-card, .dipe-checkout-coupon', payment: '.dipe-checkout-payment-card',
    };
    // Anima los contenedores existentes: no remonta campos ni interfaces de pago.
    const targets = [
      headerTarget.querySelector('.dipe-checkout-experience__stage'),
      headerTarget.querySelector('.dipe-checkout-experience__review'),
      ...form.querySelectorAll(nativeTargets[step]),
    ].filter((element) => element && element.getClientRects().length);
    const animations = targets.map((element, position) => {
      const frames = element.classList.contains('dipe-checkout-payment-card')
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ opacity: 0, transform: `translateX(${direction * 12}px)` }, { opacity: 1, transform: 'translateX(0)' }];
      return element.animate(frames, { duration: 260, delay: position * 25, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    });
    return () => animations.forEach((animation) => animation.cancel());
  }, [mode, step, rootRef, headerTarget]);

  const stage = steps[index] || steps[0];
  const buttonLabels = { details: needsShipping ? 'Elegir envío' : 'Revisar pedido', shipping: 'Revisar pedido', review: 'Continuar al pago' };
  const top = <div className="dipe-checkout-experience">
    {!mode ? <>
      <p className="dipe-checkout-experience__eyebrow">A tu manera</p><h2 ref={titleRef} tabIndex={-1}>¿Cómo quieres finalizar tu compra?</h2>
      <div className="dipe-checkout-experience__choices">
        <button type="button" onClick={() => choose('normal')}><span className="dipe-checkout-experience__choice-icon" aria-hidden="true">01</span><strong>Checkout normal</strong><span>Todos tus datos, el envío y el pago en una sola página.</span><span className="dipe-checkout-experience__choice-action">Continuar <span aria-hidden="true">→</span></span></button>
        <button type="button" onClick={() => choose('pasos')}><span className="dipe-checkout-experience__choice-icon" aria-hidden="true">02</span><strong>Checkout por pasos</strong><span>Completa tus datos, elige el envío y revisa tu pedido antes de pagar.</span><span className="dipe-checkout-experience__choice-action">Empezar <span aria-hidden="true">→</span></span></button>
      </div>
    </> : <>
      <div className="dipe-checkout-experience__mode"><span>{mode === 'normal' ? 'Todo en una página' : 'Paso a paso'}</span><button type="button" onClick={() => choose(null)}>Cambiar formato</button></div>
      {mode === 'normal' && <><h2 ref={titleRef} tabIndex={-1}>Datos y pago</h2><p>Completa tus datos, elige el envío y confirma tu pedido.</p></>}
      {mode === 'pasos' && <>
        <nav className="dipe-checkout-experience__navigation" aria-label="Pasos de la compra"><ol className="dipe-checkout-experience__steps">{steps.map((item, position) => {
          const reachable = position <= index || steps.slice(0, position).every((previous) => completed.includes(previous.key));
          return <li key={item.key} className={`${position === index ? 'is-current' : ''} ${completed.includes(item.key) ? 'is-complete' : ''}`}><button type="button" aria-current={position === index ? 'step' : undefined} aria-label={completed.includes(item.key) && position !== index ? `${item.label}, completado` : item.label} disabled={!reachable || (busy && position > index)} onClick={() => goTo(item.key)}><span className="dipe-checkout-experience__step-number" aria-hidden="true">{completed.includes(item.key) && position !== index ? '✓' : position + 1}</span><span className="dipe-checkout-experience__step-label">{item.navigationLabel || item.label}</span></button></li>;
        })}</ol><div className="dipe-checkout-experience__progress" aria-hidden="true"><span style={{ transform: `scaleX(${Math.max(0, index) / (steps.length - 1)})` }} /></div></nav>
        <div className="dipe-checkout-experience__stage" aria-busy={busy}><div><p className="dipe-checkout-experience__eyebrow">Paso {index + 1} de {steps.length}</p><h2 ref={titleRef} tabIndex={-1}>{stage.label}</h2><p>{stage.description}</p></div>{summary.total && <p className="dipe-checkout-experience__amount"><span>{['details', 'shipping'].includes(step) ? 'Importe actual' : 'Total del pedido'}</span><strong>{busy ? 'Actualizando…' : summary.total}</strong></p>}</div>
        {step === 'review' && <div className="dipe-checkout-experience__review">
          <div className="dipe-checkout-experience__review-column">
            <section><div><h3>Contacto</h3><button type="button" onClick={() => moveTo('details')}>Editar</button></div><SummaryFields fields={summary.contact} /></section>
            {needsShipping && <section><div><h3>Envío seleccionado</h3><button type="button" onClick={() => moveTo('shipping')}>Cambiar</button></div>{summary.methods.map((line, number) => <p key={number}>{line}</p>)}</section>}
          </div>
          <div className="dipe-checkout-experience__review-column">
            <section><div><h3>{needsShipping ? 'Dirección de envío' : 'Facturación'}</h3><button type="button" onClick={() => moveTo('details')}>Editar</button></div><SummaryFields fields={needsShipping ? summary.delivery : summary.billing} /></section>
            {needsShipping && summary.different && <section><div><h3>Facturación</h3><button type="button" onClick={() => moveTo('details')}>Editar</button></div><SummaryFields fields={summary.billing} /></section>}
          </div>
        </div>}
        {error && <p className="dipe-checkout-experience__error" role="alert">{error}</p>}
      </>}
    </>}
  </div>;
  const bottom = mode === 'pasos' && <div className="dipe-checkout-experience__actions">
    {index > 0 ? <button type="button" className="dipe-checkout-experience__back" onClick={() => moveTo(steps[index - 1].key)}>← Volver a {steps[index - 1].label.toLowerCase()}</button> : <span />}
    <p role="status">{busy ? 'Actualizando envío e importe…' : ''}</p>
    {step !== 'payment' && <button type="button" className="dipe-shop-button" disabled={busy} onClick={advance}>{buttonLabels[step]}<span aria-hidden="true">→</span></button>}
  </div>;
  return <>{createPortal(top, headerTarget)}{createPortal(bottom, footerTarget)}</>;
}
