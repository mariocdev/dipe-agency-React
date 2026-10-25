import { useId, useLayoutEffect, useRef, useState } from 'react';
import { EditorialContent } from '../../components/content/EditorialContent';
import { plainText } from '../../lib/api';
import { attributeKey } from '../../lib/commerce';
import { NativeCommerceSlot } from './NativeCommerceSlot';
import { ProductQuestions } from './ProductQuestions';

export function ProductTabs({ product, active, onChange, questionCount, onQuestionCountChange, containerRef }) {
  const id = useId();
  const [useSelector, setUseSelector] = useState(true);
  const navigationRef = useRef(null);
  const tabListRef = useRef(null);
  const selectorRef = useRef(null);
  const restoreFocusRef = useRef(false);
  const tabs = [
    { key: 'description', label: 'Descripción' }, { key: 'details', label: 'Detalles' },
    { key: 'reviews', label: `Opiniones (${product.review_count || 0})` },
    { key: 'questions', label: `Preguntas y respuestas${questionCount === null ? '' : ` (${questionCount})`}` },
  ];
  useLayoutEffect(() => {
    const navigation = navigationRef.current;
    const tabList = tabListRef.current;
    if (!navigation || !tabList) return undefined;
    let frame = 0;
    let disposed = false;
    function measure() {
      const available = navigation.getBoundingClientRect().width;
      if (!available) return;
      // La fila conserva su ancho natural aunque el selector esté visible.
      const compact = tabList.getBoundingClientRect().width > available;
      const focused = document.activeElement;
      if ((compact && tabList.contains(focused)) || (!compact && focused === selectorRef.current)) restoreFocusRef.current = true;
      setUseSelector(compact);
    }
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(() => { frame = 0; measure(); });
    }
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    observer?.observe(navigation);
    observer?.observe(tabList);
    window.addEventListener('resize', schedule);
    const fonts = document.fonts;
    fonts?.addEventListener('loadingdone', schedule);
    fonts?.ready.then(() => { if (!disposed) schedule(); });
    measure();
    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener('resize', schedule);
      fonts?.removeEventListener('loadingdone', schedule);
      window.cancelAnimationFrame(frame);
    };
  }, [product.review_count, questionCount]);

  useLayoutEffect(() => {
    if (!restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    const control = useSelector ? selectorRef.current : tabListRef.current?.querySelector('[aria-selected="true"]');
    control?.focus({ preventScroll: true });
  }, [useSelector]);

  function onKeyDown(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    onChange(tabs[next].key);
    event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus();
  }
  return <div className="dipe-product__information" ref={containerRef}>
    <div className={`dipe-product-tab-navigation${useSelector ? ' dipe-product-tab-navigation--select' : ''}`} ref={navigationRef}>
      <div className="dipe-product-tabs" ref={tabListRef} role="tablist" aria-label="Información del producto" aria-hidden={useSelector || undefined}>{tabs.map((tab, index) => <button type="button" key={tab.key} role="tab" id={`${id}-tab-${tab.key}`} aria-controls={`${id}-panel-${tab.key}`} aria-selected={active === tab.key} tabIndex={!useSelector && active === tab.key ? 0 : -1} onKeyDown={(event) => onKeyDown(event, index)} onClick={() => onChange(tab.key)}>{tab.label}</button>)}</div>
      {useSelector && <div className="dipe-product-tab-selector">
        <label htmlFor={`${id}-selector`}>Información del producto</label>
        <div className="dipe-product-tab-selector__control">
          <select id={`${id}-selector`} ref={selectorRef} value={active} aria-controls={`${id}-panel-${active}`} onChange={(event) => onChange(event.target.value)}>{tabs.map((tab) => <option key={tab.key} value={tab.key}>{tab.label}</option>)}</select>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>}
    </div>
    {tabs.map((tab) => <section key={tab.key} className="dipe-product-tabpanel" role={useSelector ? 'region' : 'tabpanel'} tabIndex={0} id={`${id}-panel-${tab.key}`} aria-labelledby={useSelector ? undefined : `${id}-tab-${tab.key}`} aria-label={useSelector ? tab.label : undefined} hidden={active !== tab.key}>
      {tab.key === 'description' && (product.description ? <EditorialContent html={product.description} /> : <p>Consulta sus características y opciones disponibles.</p>)}
      {tab.key === 'details' && <dl>{(product.attributes || []).map((attribute) => <div key={attributeKey(attribute)}><dt>{plainText(attribute.name)}</dt><dd>{attribute.terms.map((term) => plainText(term.name)).join(', ')}</dd></div>)}{!product.attributes?.length && <div><dt>Referencia</dt><dd>{product.sku || 'Sin referencia'}</dd></div>}</dl>}
      {tab.key === 'reviews' && <NativeCommerceSlot sourceId="dipe-native-product-reviews" fallback="No hay reseñas disponibles para este producto." />}
      {tab.key === 'questions' && <ProductQuestions productId={product.id} onCountChange={onQuestionCountChange} />}
    </section>)}
  </div>;
}
