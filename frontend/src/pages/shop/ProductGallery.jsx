import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { plainText } from '../../lib/api';
import { ShopIcon, ShopProductImage } from './ShopShared';
import { WishlistButton } from './Wishlist';
import './ProductGallery.css';

export function ProductGallery({ product, variation }) {
  const images = variation?.images?.length ? variation.images : product.images || [];
  const signature = images.map((item) => item.id || item.src).join(',');
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [originalView, setOriginalView] = useState(false);
  const [original, setOriginal] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const image = images[selected] || images[0];
  const source = image?.src;
  const title = plainText(product.name);
  const dialogId = useId();
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const spaceRef = useRef(null);
  const pointerFrame = useRef(0);

  useEffect(() => {
    setSelected(0);
    setHovered(false);
    setOriginalView(false);
    setViewerOpen(false);
  }, [signature]);
  useEffect(() => { setOriginalView(false); setImageError(false); }, [source]);
  useEffect(() => {
    const element = spaceRef.current;
    const measure = () => {
      if (element) setBox({ width: element.clientWidth, height: element.clientHeight });
    };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    if (element) observer?.observe(element);
    window.addEventListener('resize', measure);
    measure();
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); cancelAnimationFrame(pointerFrame.current); };
  }, []);

  // La versión original se solicita al acercar el puntero, no para toda la galería.
  useEffect(() => {
    if (!hovered || !source || original?.src === source) return undefined;
    let active = true;
    const asset = new Image();
    asset.onload = () => { if (active && asset.naturalWidth && asset.naturalHeight) setOriginal({ src: source, width: asset.naturalWidth, height: asset.naturalHeight }); };
    asset.src = source;
    return () => { active = false; asset.onload = null; };
  }, [hovered, source, original?.src]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!viewerOpen || !dialog) return undefined;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    dialog.showModal();
    root.style.overflow = 'hidden';
    return () => {
      if (dialog.open) dialog.close();
      root.style.overflow = previousOverflow;
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [viewerOpen]);

  const native = original?.src === source ? original : null;
  const density = Math.max(1, window.devicePixelRatio || 1);
  let scale = 1;
  if (native && box.width && box.height) {
    const fit = Math.min(box.width / native.width, box.height / native.height);
    // Un píxel del original por píxel físico como límite de ampliación.
    scale = Math.max(1, Math.min(2.5, 1 / (fit * density)));
  }

  function movePointer(event) {
    if (event.pointerType !== 'mouse' || !spaceRef.current) return;
    const rect = spaceRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, (event.clientX - rect.left) / Math.max(1, rect.width) * 100));
    const y = Math.max(0, Math.min(100, (event.clientY - rect.top) / Math.max(1, rect.height) * 100));
    cancelAnimationFrame(pointerFrame.current);
    pointerFrame.current = requestAnimationFrame(() => {
      spaceRef.current?.style.setProperty('--zoom-x', `${x}%`);
      spaceRef.current?.style.setProperty('--zoom-y', `${y}%`);
    });
  }

  function navigate(direction) {
    setSelected((current) => (current + direction + images.length) % images.length);
    setHovered(false);
    setOriginalView(false);
  }

  function rememberOriginal(event) {
    const asset = event.currentTarget;
    if (asset.naturalWidth && asset.naturalHeight) setOriginal({ src: source, width: asset.naturalWidth, height: asset.naturalHeight });
    else setImageError(true);
  }

  const fitStyle = native ? { maxWidth: `min(100%, ${native.width / density}px)`, maxHeight: `min(100%, ${native.height / density}px)` } : undefined;
  const originalStyle = native ? { width: native.width / density, height: native.height / density, maxWidth: 'none', maxHeight: 'none' } : undefined;

  return <div className="dipe-product-gallery">
    <div className="dipe-product-gallery__main">
      <button className="dipe-product-gallery__trigger" type="button" ref={triggerRef} disabled={!source} aria-label={`Ampliar imágenes de ${title}`} aria-haspopup="dialog" aria-controls={dialogId}
        onClick={() => { setHovered(false); setViewerOpen(true); }}
        onPointerEnter={(event) => { if (event.pointerType === 'mouse' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) { setHovered(true); movePointer(event); } }}
        onPointerMove={movePointer} onPointerLeave={() => setHovered(false)} onBlur={() => setHovered(false)}>
        <span className={`dipe-product-gallery__image-space${hovered && scale > 1 ? ' is-zooming' : ''}`} ref={spaceRef} style={{ '--zoom-scale': scale }}>
          <ShopProductImage image={image} name={title} eager sizes="(max-width: 880px) 90vw, 44vw" />
          {native && <img className={`dipe-product-gallery__zoom${hovered && scale > 1 ? ' is-visible' : ''}`} src={source} alt="" aria-hidden="true" />}
        </span>
      </button>
      {product.on_sale && <span className="dipe-shop__badge">Oferta</span>}
      <WishlistButton product={product} />
    </div>
    {images.length > 1 && <div className="dipe-product-gallery__thumbnails" role="group" aria-label="Imágenes del producto">{images.map((item, index) => <button type="button" key={item.id || item.src} aria-label={`Ver imagen ${index + 1}`} aria-pressed={selected === index} onClick={() => setSelected(index)}><ShopProductImage image={item} name={title} sizes="100px" /></button>)}</div>}

    <dialog className="dipe-product-lightbox" id={dialogId} ref={dialogRef} aria-label={`Imágenes de ${title}`}
      onCancel={(event) => { event.preventDefault(); setViewerOpen(false); }} onClose={() => setViewerOpen(false)}
      onClick={(event) => { if (event.target === event.currentTarget) setViewerOpen(false); }}
      onKeyDown={(event) => {
        if (!viewerOpen || images.length < 2 || event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); navigate(event.key === 'ArrowLeft' ? -1 : 1); }
      }}>
      {viewerOpen && <div className="dipe-product-lightbox__inner">
        <div className="dipe-product-lightbox__toolbar"><div><p>{title}</p><span role="status">{selected + 1} / {images.length}</span></div><div className="dipe-product-lightbox__tools">
          <button type="button" disabled={!native || imageError} aria-label={originalView ? 'Ajustar imagen a la ventana' : 'Ver imagen a resolución original'} aria-pressed={originalView} title={originalView ? 'Ajustar imagen' : 'Resolución original'} onClick={() => setOriginalView((value) => !value)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5M7 10h6" />{!originalView && <path d="M10 7v6" />}</svg></button>
          <button type="button" aria-label="Cerrar galería" autoFocus onClick={() => setViewerOpen(false)}><ShopIcon name="close" /></button>
        </div></div>
        <div className="dipe-product-lightbox__stage">
          {images.length > 1 && <button className="dipe-product-lightbox__previous" type="button" aria-label="Imagen anterior" onClick={() => navigate(-1)}><ShopIcon /></button>}
          <div className="dipe-product-lightbox__viewport">
            {imageError ? <p className="dipe-product-lightbox__error" role="alert">No se ha podido cargar esta imagen.</p> : <button className={`dipe-product-lightbox__image-button${originalView && native ? ' is-original' : ''}`} type="button" aria-label={originalView ? 'Ajustar imagen a la ventana' : 'Ver imagen a resolución original'} onClick={() => { if (native) setOriginalView((value) => !value); }}><img src={source} alt={image?.alt || title} onLoad={rememberOriginal} onError={() => setImageError(true)} style={originalView ? originalStyle : fitStyle} /></button>}
          </div>
          {images.length > 1 && <button className="dipe-product-lightbox__next" type="button" aria-label="Imagen siguiente" onClick={() => navigate(1)}><ShopIcon /></button>}
        </div>
        {images.length > 1 && <div className="dipe-product-lightbox__thumbnails" role="group" aria-label="Seleccionar imagen ampliada">{images.map((item, index) => <button type="button" key={item.id || item.src} aria-label={`Ver imagen ${index + 1}`} aria-pressed={selected === index} onClick={() => setSelected(index)}><img src={item.thumbnail || item.src} alt="" loading="lazy" decoding="async" /></button>)}</div>}
      </div>}
    </dialog>
  </div>;
}
