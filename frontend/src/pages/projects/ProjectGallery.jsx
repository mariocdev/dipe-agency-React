import { useEffect, useRef, useState } from 'react';
import './ProjectGallery.css';

function isVideo(media) {
  return media.mimeType.startsWith('video/') || /\.(mp4|webm|mov)(?:\?|$)/i.test(media.url);
}

function GalleryMedia({ media, expanded, zoomed = false, onExpand, className = '' }) {
  const video = isVideo(media);

  if (expanded) {
    return <div className={`dipe-project-gallery__media ${zoomed ? 'is-zoomed' : ''} ${className}`.trim()}>
      {video
        ? <video src={media.url} controls playsInline aria-label={media.alt || 'Vídeo de la galería'} />
        : <img src={media.url} alt={media.alt} />}
    </div>;
  }

  return <button className={`dipe-project-gallery__media ${className}`.trim()} type="button" onClick={onExpand} aria-label={`Ampliar ${media.alt || 'elemento de la galería'}`}>
    {video
      ? <video src={media.url} muted playsInline preload="metadata" aria-label={media.alt || 'Vídeo de la galería'} />
      : <img src={media.url} alt={media.alt} />}
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
  const canZoom = !isVideo(active);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => setZoomed(false), [activeIndex]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onMove(-1);
      if (event.key === 'ArrowRight') onMove(1);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, onMove]);

  return <div className="dipe-project-gallery__lightbox" role="dialog" aria-modal="true" aria-label="Vista ampliada de la galería">
    <button className="dipe-project-gallery__close" type="button" onClick={onClose} aria-label="Cerrar vista ampliada">×</button>
    {canMove && <button className="dipe-project-gallery__lightbox-nav dipe-project-gallery__lightbox-nav--previous" type="button" onClick={() => onMove(-1)} aria-label="Elemento anterior">‹</button>}
    <GalleryMedia media={active} expanded zoomed={zoomed} className="dipe-project-gallery__expanded-media" />
    {canMove && <button className="dipe-project-gallery__lightbox-nav dipe-project-gallery__lightbox-nav--next" type="button" onClick={() => onMove(1)} aria-label="Elemento siguiente">›</button>}
    {canZoom && <button className="dipe-project-gallery__zoom" type="button" onClick={() => setZoomed((current) => !current)} aria-pressed={zoomed} aria-label={zoomed ? 'Reducir imagen' : 'Ampliar imagen'}><MagnifierIcon /></button>}
  </div>;
}

export function ProjectGallery({ media }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);
  const [slideStep, setSlideStep] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const autoCompletedRef = useRef(false);
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
      if (autoCompletedRef.current || event.deltaY <= 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const bounds = rootRef.current?.getBoundingClientRect();
      const isCarouselInUse = bounds && bounds.top <= window.innerHeight * 0.65 && bounds.bottom >= window.innerHeight * 0.25;
      if (!isCarouselInUse) return;

      const now = Date.now();
      event.preventDefault();
      if (now - lastScrollRef.current < 600) {
        return;
      }

      lastScrollRef.current = now;
      setActiveSlide((current) => {
        const next = Math.min(current + 1, maxSlide);
        if (next === maxSlide) autoCompletedRef.current = true;
        return next;
      });
    }

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [maxSlide]);

  if (media.length === 0) return null;

  function moveSlide(direction) {
    setActiveSlide((current) => Math.min(Math.max(current + direction, 0), maxSlide));
  }

  function moveExpanded(direction) {
    setExpandedIndex((current) => (current + direction + media.length) % media.length);
  }

  function startDrag(event) {
    if (event.button !== 0) return;
    dragStateRef.current = { pointerId: event.pointerId, startX: event.clientX, offset: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  }

  function dragCarousel(event) {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const rawOffset = event.clientX - dragState.startX;
    const atFirstSlide = activeSlide === 0 && rawOffset > 0;
    const atLastSlide = activeSlide === maxSlide && rawOffset < 0;
    const offset = (atFirstSlide || atLastSlide) ? rawOffset * 0.18 : rawOffset;
    dragState.offset = offset;
    if (Math.abs(rawOffset) > 6) suppressClickRef.current = true;
    setDragOffset(offset);
  }

  function endDrag(event) {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragStateRef.current = null;
    setIsDragging(false);
    setDragOffset(0);

    if (slideStep > 0 && Math.abs(dragState.offset) >= slideStep * 0.16) moveSlide(dragState.offset < 0 ? 1 : -1);
  }

  function cancelDrag(event) {
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

  return <section className="dipe-project-gallery" aria-labelledby="project-gallery-title" ref={rootRef}>
    <h2 id="project-gallery-title">Galería del proyecto</h2>
    <div className="dipe-project-gallery__carousel" aria-roledescription="carrusel" aria-label="Galería del proyecto">
      {maxSlide > 0 && <button className="dipe-project-gallery__nav dipe-project-gallery__nav--previous" type="button" onClick={() => moveSlide(-1)} disabled={activeSlide === 0} aria-label="Diapositiva anterior"><ArrowIcon previous /></button>}
      <div className="dipe-project-gallery__viewport">
        <div className={`dipe-project-gallery__track${isDragging ? ' is-dragging' : ''}`} ref={trackRef} onPointerDown={startDrag} onPointerMove={dragCarousel} onPointerUp={endDrag} onPointerCancel={cancelDrag} onClickCapture={blockClickAfterDrag} style={{ transform: `translate3d(-${activeSlide * slideStep - dragOffset}px, 0, 0)` }}>
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
