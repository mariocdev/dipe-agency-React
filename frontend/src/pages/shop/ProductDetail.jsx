import { useEffect, useRef, useState } from 'react';
import { EditorialContent } from '../../components/content/EditorialContent';
import { plainText } from '../../lib/api';
import { getShopProduct, storeRequest, attributeKey, selectedVariation } from '../../lib/commerce';
import { ProductTabs } from './ProductTabs';
import { ProductGallery } from './ProductGallery';
import { RelatedProducts } from './RelatedProducts';
import { ShopHero, ShopBreadcrumbs, ShopPrice, ShopMessage, ShopIcon, useShopCart } from './ShopShared';
import './ProductDetail.css';

function ProductPurchase({ product, variation, selection, complete, loading, onSelectionChange }) {
  const { pending, mutate, openCart } = useShopCart();
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState({ success: false, error: null });
  const variable = product.type === 'variable';
  const active = variable ? variation : product;
  const purchasableType = ['simple', 'variable'].includes(product.type);
  const limits = active?.add_to_cart || {};
  const minimum = Math.max(1, Number(limits.minimum) || 1);
  const maximum = Number(limits.maximum) > 0 ? Number(limits.maximum) : undefined;
  const multiple = Number(limits.multiple_of) > 0 ? Number(limits.multiple_of) : 1;
  const ready = purchasableType && active?.is_in_stock && active?.is_purchasable && (!variable || complete) && !loading;
  useEffect(() => { setQuantity(minimum); setFeedback({ success: false, error: null }); }, [active?.id, minimum]);

  async function add(event) {
    event.preventDefault();
    if (!ready || pending || quantity < minimum || (maximum && quantity > maximum)) return;
    setFeedback({ success: false, error: null });
    try {
      const attributes = (product.attributes || []).filter((attribute) => attribute.has_variations).map((attribute) => ({ attribute: attribute.taxonomy || attribute.name, value: selection[attributeKey(attribute)] }));
      await mutate('add-item', { id: active.id, quantity, ...(variable ? { variation: attributes } : {}) });
      setFeedback({ success: true, error: null });
    } catch (error) { setFeedback({ success: false, error }); }
  }

  return <form className="dipe-product-purchase" onSubmit={add}>
    {(product.attributes || []).filter((attribute) => attribute.has_variations).map((attribute) => <fieldset key={attributeKey(attribute)} className="dipe-product-purchase__attribute"><legend>{plainText(attribute.name)}{selection[attributeKey(attribute)] && <span> · {plainText(attribute.terms.find((term) => term.slug === selection[attributeKey(attribute)])?.name)}</span>}</legend><div>{attribute.terms.map((term) => <button type="button" key={term.slug} aria-pressed={selection[attributeKey(attribute)] === term.slug} onClick={() => { setFeedback({ success: false, error: null }); onSelectionChange(attributeKey(attribute), term.slug); }}>{plainText(term.name)}</button>)}</div></fieldset>)}
    <p className={`dipe-product-purchase__stock${active?.is_in_stock ? ' is-available' : ''}`} role="status">{loading ? 'Consultando disponibilidad…' : variable && !complete ? 'Selecciona tus opciones para consultar disponibilidad.' : !active ? 'Esta combinación no está disponible.' : active.is_in_stock ? 'Disponible' : 'Agotado'}</p>
    {purchasableType ? <div className="dipe-product-purchase__actions"><label className="dipe-product-purchase__quantity"><span className="visually-hidden">Cantidad</span><input type="number" min={minimum} max={maximum} step={multiple} required value={quantity} onChange={(event) => setQuantity(event.target.value === '' ? '' : Number(event.target.value))} disabled={!ready || pending} /></label><button className="dipe-shop-button" type="submit" disabled={!ready || pending}>{pending ? 'Añadiendo…' : active && !active.is_in_stock ? 'Agotado' : 'Añadir al carrito'}<ShopIcon name="bag" /></button></div> : <p>Este producto requiere una modalidad de compra diferente.</p>}
    {feedback.error && <p className="dipe-shop__error" role="alert">{feedback.error.message}</p>}
    {feedback.success && <p className="dipe-product-purchase__success" role="status">Producto añadido. <button type="button" onClick={(event) => openCart(event.currentTarget)}>Ver carrito<ShopIcon /></button></p>}
  </form>;
}

function LoadedProduct({ product }) {
  const [activeTab, setActiveTab] = useState(() => /^(#comment|#respond|#reviews|#producto-opiniones)/.test(window.location.hash) ? 'reviews' : 'description');
  const [questionCount, setQuestionCount] = useState(null);
  const tabsRef = useRef(null);
  const [selection, setSelection] = useState(() => Object.fromEntries((product.attributes || []).filter((attribute) => attribute.has_variations).map((attribute) => [attributeKey(attribute), attribute.terms.find((term) => term.default)?.slug || ''])));
  const [variant, setVariant] = useState({ id: null, data: null, loading: false, error: null });
  const [variantRevision, setVariantRevision] = useState(0);
  const [related, setRelated] = useState([]);
  const attributes = (product.attributes || []).filter((attribute) => attribute.has_variations);
  const complete = attributes.every((attribute) => Boolean(selection[attributeKey(attribute)]));
  const match = product.type === 'variable' && complete ? selectedVariation(product, selection) : null;
  const variationId = match?.id || null;
  const activeVariation = variant.id === variationId ? variant.data : null;
  const loadingVariation = product.type === 'variable' && variationId && (variant.id !== variationId || variant.loading);
  const category = product.categories?.[0];

  useEffect(() => {
    const revealComment = () => { if (/^(#comment|#respond|#reviews|#producto-opiniones)/.test(window.location.hash)) setActiveTab('reviews'); };
    window.addEventListener('hashchange', revealComment);
    return () => window.removeEventListener('hashchange', revealComment);
  }, []);

  function openReviews() {
    setActiveTab('reviews');
    requestAnimationFrame(() => tabsRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }));
  }

  useEffect(() => {
    const controller = new AbortController();
    if (!variationId) { setVariant({ id: null, data: null, loading: false, error: null }); return () => controller.abort(); }
    setVariant({ id: variationId, data: null, loading: true, error: null });
    storeRequest(`products/${variationId}`, { signal: controller.signal }).then(
      ({ data }) => { if (!controller.signal.aborted) setVariant({ id: variationId, data, loading: false, error: null }); },
      (error) => { if (!controller.signal.aborted) setVariant({ id: variationId, data: null, loading: false, error }); },
    );
    return () => controller.abort();
  }, [variationId, variantRevision]);
  useEffect(() => {
    const controller = new AbortController();
    const params = { per_page: '12', exclude: String(product.id), catalog_visibility: 'catalog', ...(category ? { category: String(category.id) } : {}) };
    storeRequest('products', { params, signal: controller.signal }).then(({ data }) => { if (!controller.signal.aborted) setRelated(data); }, () => {});
    return () => controller.abort();
  }, [product.id, category?.id]);

  return <>
    <ShopHero title="La colección Dipe" description="Pequeños objetos. Grandes ideas." compact heading={false} />
    <article className="dipe-product dipe-shop__container">
      <ShopBreadcrumbs items={[...(category ? [{ label: plainText(category.name), href: category.link }] : []), { label: plainText(product.name) }]} />
      <div className="dipe-product__main">
        <ProductGallery product={product} variation={activeVariation} />
        <div className="dipe-product__summary">
          {category && <a className="dipe-product__category" href={category.link}>{plainText(category.name)}</a>}
          <h1>{plainText(product.name)}</h1>
          <button type="button" className="dipe-product__rating" onClick={openReviews}>{Number(product.review_count) > 0 ? <><span className="dipe-product__rating-stars" role="img" aria-label={`${product.average_rating} de 5 estrellas`}><span aria-hidden="true">★★★★★</span><span aria-hidden="true" style={{ width: `${Math.min(100, Number(product.average_rating) * 20)}%` }}>★★★★★</span></span><span>{product.review_count} {product.review_count === 1 ? 'opinión' : 'opiniones'}</span></> : 'Aún no hay opiniones'}</button>
          <ShopPrice product={activeVariation || product} className="dipe-product__price" />
          {product.short_description && <div className="dipe-product__excerpt"><EditorialContent html={product.short_description} /></div>}
          <ProductPurchase product={product} variation={activeVariation} selection={selection} complete={complete} loading={Boolean(loadingVariation)} onSelectionChange={(key, value) => setSelection((current) => ({ ...current, [key]: value }))} />
          {variant.error && <div className="dipe-shop__error" role="alert"><p>No se ha podido consultar esta opción.</p><button type="button" className="dipe-shop__text-button" onClick={() => setVariantRevision((value) => value + 1)}>Volver a consultar</button></div>}
          <div className="dipe-product__meta">{(activeVariation?.sku || product.sku) && <p><span>Referencia</span>{activeVariation?.sku || product.sku}</p>}{product.tags?.length > 0 && <p><span>Etiquetas</span>{product.tags.map((tag) => plainText(tag.name)).join(', ')}</p>}</div>
        </div>
      </div>
      <ProductTabs product={product} active={activeTab} onChange={setActiveTab} questionCount={questionCount} onQuestionCountChange={setQuestionCount} containerRef={tabsRef} />
    </article>
    {related.length > 0 && <RelatedProducts products={related} />}
  </>;
}

export function ProductDetail({ context, onNotFound: NotFound }) {
  const [state, setState] = useState({ loading: true, product: null, error: null });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true, product: null, error: null });
    getShopProduct(context, controller.signal).then(
      (product) => { if (!controller.signal.aborted) setState({ loading: false, product, error: null }); },
      (error) => { if (!controller.signal.aborted) setState({ loading: false, product: null, error }); },
    );
    return () => controller.abort();
  }, [context.id, context.slug, revision]);
  if (state.loading) return <><ShopHero title="La colección Dipe" compact heading={false} description="" /><div className="dipe-shop__container dipe-product__loading" role="status">Cargando producto…</div></>;
  if (state.error) return <div className="dipe-shop__container"><ShopMessage title="No hemos podido cargar este producto" retry={() => setRevision((value) => value + 1)}><p>Vuelve a intentarlo en unos instantes.</p></ShopMessage></div>;
  if (!state.product) return <NotFound />;
  return <LoadedProduct key={state.product.id} product={state.product} />;
}
