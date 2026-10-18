import { useEffect, useRef, useState } from 'react';
import './ProjectGallery.css';

function isVideo(media) {
  return media.mimeType.startsWith('video/') || /\.(mp4|webm|mov)(?:\?|$)/i.test(media.url);
}

function ZoomableImage({ media }) {
  const imageRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [point, setPoint] = useState({ x: 50, y: 50 });

  function measureZoom() {
    const image = imageRef.current;
    if (!image?.offsetWidth || !image.offsetHeight) return;
    // Never enlarge beyond the original image's pixel dimensions.
    setScale(Math.max(1, Math.min(4, image.naturalWidth / image.offsetWidth, image.naturalHeight / image.offsetHeight)));
  }

  useEffect(() => {
    measureZoom();
    const observer = new ResizeObserver(measureZoom);
    observer.observe(imageRef.current);
    return () => observer.disconnect();
  }, []);

  function followPointer(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPoint({
      x: Math.min(100, Math.max(0, (event.clientX - bounds.left) / bounds.width * 100)),
      y: Math.min(100, Math.max(0, (event.clientY - bounds.top) / bounds.height * 100)),
    });
  }

  return <button type="button" className={`dipe-project-gallery__image-zoom${zoomed && scale > 1 ? ' is-zoomed' : ''}`}
    aria-label={zoomed ? 'Reducir imagen' : 'Acercar imagen; mueve el puntero para explorar'} aria-pressed={zoomed && scale > 1}
    onPointerMove={(event) => { if (zoomed) followPointer(event); }} onBlur={() => setZoomed(false)}
    onClick={(event) => { if (event.detail === 0) setPoint({ x: 50, y: 50 }); else followPointer(event); setZoomed((current) => !current); }}>
    <img ref={imageRef} src={media.url} alt={media.alt} draggable={false} onLoad={measureZoom}
      style={{ transform: `scale(${zoomed ? scale : 1})`, transformOrigin: `${point.x}% ${point.y}%` }} />
    {scale > 1 && <span className="dipe-project-gallery__zoom-hint" aria-hidden="true"><MagnifierIcon /></span>}
  </button>;
}

function GalleryMedia({ media, expanded, onExpand, className = '' }) {
  const video = isVideo(media);

  if (expanded) {
    return <div className={`dipe-project-gallery__media ${className}`.trim()}>
      {video
        ? <video src={media.url} controls playsInline aria-label={media.alt || 'Vídeo de la galería'} />
        : <ZoomableImage key={media.id} media={media} />}
    </div>;
  }

  return <button className={`dipe-project-gallery__media ${className}`.trim()} type="button" onClick={onExpand} aria-label={`Ampliar ${media.alt || 'elemento de la galería'}`}>
    {video
      ? <video src={media.url} muted playsInline preload="metadata" aria-label={media.alt || 'Vídeo de la galería'} />
      : <img src={media.url} alt={media.alt} draggable={false} />}
    {!video && <span className="dipe-project-gallery__zoom-hint" aria-hidden="true"><MagnifierIcon /></span>}
  </button>;
}

function MagnifierIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="5.5" />
    <path d="m15 15 5 5" />
    <path d="M10.5 7.75v5.5M7.75 10.5h5.5" />
  </svg>;
}

function ArrowIcon({ previous = false }) {
  return <svg className={previous ? 'is-previous' : undefined} viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 5 7 7-7 7" />
  </svg>;
}

function GalleryLightbox({ media, activeIndex, onClose, onMove }) {
  const active = media[activeIndex];
  const canMove = media.length > 1;
  const dialogRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector('button')?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      if (['Escape', 'ArrowLeft', 'ArrowRight'].includes(event.key)) event.preventDefault();
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onMove(-1);
      if (event.key === 'ArrowRight') onMove(1);
      if (event.key === 'Tab') {
        const buttons = dialogRef.current.querySelectorAll('button');
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, onMove]);

  return <div ref={dialogRef} className="dipe-project-gallery__lightbox" role="dialog" aria-modal="true" aria-label="Vista ampliada de la galería">
    <button className="dipe-project-gallery__close" type="button" onClick={onClose} aria-label="Cerrar vista ampliada">×</button>
    {canMove && <button className="dipe-project-gallery__lightbox-nav dipe-project-gallery__lightbox-nav--previous" type="button" onClick={() => onMove(-1)} aria-label="Elemento anterior">‹</button>}
    <GalleryMedia media={active} expanded className="dipe-project-gallery__expanded-media" />
    {canMove && <button className="dipe-project-gallery__lightbox-nav dipe-project-gallery__lightbox-nav--next" type="button" onClick={() => onMove(1)} aria-label="Elemento siguiente">›</button>}
  </div>;
}

export function ProjectGallery({ media }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);
  const [slideStep, setSlideStep] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const lastScrollRef = useRef(0);
  const dragStateRef = useRef(null);
  const suppressClickRef = useRef(false);
  const maxSlide = Math.max(0, media.length - visibleItems);

  useEffect(() => {
    function updateVisibleItems() {
      setVisibleItems(window.innerWidth <= 560 ? 1 : window.innerWidth <= 860 ? 2 : 3);
    }
    updateVisibleItems();
    window.addEventListener('resize', updateVisibleItems);
    return () => window.removeEventListener('resize', updateVisibleItems);
  }, []);

  useEffect(() => {
    setActiveSlide((current) => Math.min(current, maxSlide));
  }, [maxSlide]);

  useEffect(() => {
    const item = trackRef.current?.firstElementChild;
    const track = trackRef.current;
    if (!track || !item) return undefined;

    function measureStep() {
      const gap = Number.parseFloat(window.getComputedStyle(track).gap) || 0;
      setSlideStep(item.getBoundingClientRect().width + gap);
    }

    measureStep();
    const observer = new ResizeObserver(measureStep);
    observer.observe(track);
    return () => observer.disconnect();
  }, [visibleItems, media.length]);

  useEffect(() => {
    if (maxSlide < 1) return undefined;

    function handleWheel(event) {
      if (expandedIndex !== null || dragStateRef.current?.started || activeSlide >= maxSlide || event.ctrlKey || !event.cancelable || event.deltaY <= 0 || Math.abs(event.deltaX) > Math.abs(event.deltaY) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const bounds = viewportRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const viewportHeight = window.innerHeight;
      const center = bounds.top + bounds.height / 2;
      const target = viewportHeight / 2;
      const tolerance = viewportHeight * 0.12;
      const remainingScroll = Math.max(0, document.documentElement.scrollHeight - viewportHeight - window.scrollY);
      const wheelDistance = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewportHeight : 1);
      // Catch a wheel step that crosses the center, even if it skips the activation band.
      const reachesCenter = center - Math.min(wheelDistance, remainingScroll) <= target + tolerance;
      const coversCenter = bounds.top <= target && bounds.bottom >= target;
      // A gallery at the end of a short page may never reach the exact center.
      const atPageEnd = remainingScroll <= 1 && bounds.top < viewportHeight * 0.65 && bounds.bottom > target;
      const isCarouselInUse = (reachesCenter && bounds.bottom >= target && center >= target - tolerance) || (coversCenter && center <= target) || atPageEnd;
      if (!isCarouselInUse) return;

      const now = Date.now();
      event.preventDefault();
      if (center > target + tolerance && remainingScroll > 0) {
        window.scrollBy({ top: Math.min(center - target, remainingScroll), behavior: 'instant' });
      }
      if (now - lastScrollRef.current < 600) {
        return;
      }

      lastScrollRef.current = now;
      setActiveSlide((current) => Math.min(current + 1, maxSlide));
    }

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [activeSlide, maxSlide, expandedIndex]);

  if (media.length === 0) return null;

  function moveSlide(direction) {
    setActiveSlide((current) => Math.min(Math.max(current + direction, 0), maxSlide));
  }

  function moveExpanded(direction) {
    setExpandedIndex((current) => (current + direction + media.length) % media.length);
  }

  function startDrag(event) {
    if (event.button !== 0 || !event.isPrimary || maxSlide < 1) return;
    suppressClickRef.current = false;
    dragStateRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, offset: 0, started: false };
    // Keep simple clicks on their button, even when the pointer leaves it.
    (event.target.closest('button') || event.currentTarget).setPointerCapture(event.pointerId);
  }

  function dragCarousel(event) {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const rawOffset = event.clientX - dragState.startX;
    if (!dragState.started) {
      const verticalOffset = Math.abs(event.clientY - dragState.startY);
      if (verticalOffset > 6 && verticalOffset > Math.abs(rawOffset)) {
        dragStateRef.current = null;
        return;
      }
      if (Math.abs(rawOffset) <= 6) return;
      dragState.started = true;
      suppressClickRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
    }
    const atFirstSlide = activeSlide === 0 && rawOffset > 0;
    const atLastSlide = activeSlide === maxSlide && rawOffset < 0;
    const offset = (atFirstSlide || atLastSlide) ? rawOffset * 0.18 : rawOffset;
    dragState.offset = offset;
    setDragOffset(offset);
  }

  function endDrag(event) {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    dragStateRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);
    setDragOffset(0);

    if (dragState.started && slideStep > 0 && Math.abs(dragState.offset) >= Math.min(48, slideStep * 0.12)) {
      const steps = Math.max(1, Math.round(Math.abs(dragState.offset) / slideStep));
      moveSlide(dragState.offset < 0 ? steps : -steps);
    }
  }

  function cancelDrag(event) {
    // Transferring capture from a media button to the track is not cancellation.
    if (event.type === 'lostpointercapture' && event.target !== event.currentTarget) return;
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  }

  function blockClickAfterDrag(event) {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  }

  return <section className="dipe-project-gallery" aria-labelledby="project-gallery-title">
    <h2 id="project-gallery-title">Galería del proyecto</h2>
    <div className="dipe-project-gallery__carousel" aria-roledescription="carrusel" aria-label="Galería del proyecto">
      {maxSlide > 0 && <button className="dipe-project-gallery__nav dipe-project-gallery__nav--previous" type="button" onClick={() => moveSlide(-1)} disabled={activeSlide === 0} aria-label="Diapositiva anterior"><ArrowIcon previous /></button>}
      <div className="dipe-project-gallery__viewport" ref={viewportRef}>
        <div className={`dipe-project-gallery__track${isDragging ? ' is-dragging' : ''}`} ref={trackRef} onPointerDown={startDrag} onPointerMove={dragCarousel} onPointerUp={endDrag} onPointerCancel={cancelDrag} onLostPointerCapture={cancelDrag} onDragStart={(event) => event.preventDefault()} onClickCapture={blockClickAfterDrag} style={{ transform: `translate3d(-${activeSlide * slideStep - dragOffset}px, 0, 0)` }}>
          {media.map((entry, index) => <GalleryMedia media={entry} key={entry.id} onExpand={() => setExpandedIndex(index)} />)}
        </div>
      </div>
      {maxSlide > 0 && <button className="dipe-project-gallery__nav dipe-project-gallery__nav--next" type="button" onClick={() => moveSlide(1)} disabled={activeSlide === maxSlide} aria-label="Siguiente diapositiva"><ArrowIcon /></button>}
    </div>
    {maxSlide > 0 && <div className="dipe-project-gallery__pagination" aria-label={`Diapositiva ${activeSlide + 1} de ${maxSlide + 1}`}>
      {Array.from({ length: maxSlide + 1 }, (_, index) => <button className={index === activeSlide ? 'is-active' : ''} type="button" onClick={() => setActiveSlide(index)} aria-label={`Ir a la diapositiva ${index + 1}`} aria-current={index === activeSlide ? 'true' : undefined} key={index} />)}
    </div>}
    {expandedIndex !== null && <GalleryLightbox media={media} activeIndex={expandedIndex} onClose={() => setExpandedIndex(null)} onMove={moveExpanded} />}
  </section>;
}
