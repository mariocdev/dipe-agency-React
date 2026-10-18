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
  const [expandedIndex, setExpandedIndex] = useState(null);
  const rootRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const autoCompletedRef = useRef(false);
  const lastScrollRef = useRef(0);
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
    const viewport = viewportRef.current;
    const item = trackRef.current?.firstElementChild;
    if (!viewport || !item) return;

    const gap = Number.parseFloat(window.getComputedStyle(trackRef.current).gap) || 0;
    viewport.scrollTo({ left: activeSlide * (item.getBoundingClientRect().width + gap), behavior: 'smooth' });
  }, [activeSlide, visibleItems]);

  useEffect(() => {
    if (maxSlide < 1) return undefined;

    function handleWheel(event) {
      if (autoCompletedRef.current || event.deltaY <= 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const bounds = rootRef.current?.getBoundingClientRect();
      if (!bounds || bounds.top > window.innerHeight * 0.45 || bounds.bottom < window.innerHeight * 0.35) return;

      const now = Date.now();
      if (now - lastScrollRef.current < 600) {
        event.preventDefault();
        return;
      }

      lastScrollRef.current = now;
      event.preventDefault();
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

  function syncSlideFromScroll() {
    const viewport = viewportRef.current;
    const item = trackRef.current?.firstElementChild;
    if (!viewport || !item) return;

    const gap = Number.parseFloat(window.getComputedStyle(trackRef.current).gap) || 0;
    const next = Math.round(viewport.scrollLeft / (item.getBoundingClientRect().width + gap));
    setActiveSlide(Math.min(Math.max(next, 0), maxSlide));
  }

  return <section className="dipe-project-gallery" aria-labelledby="project-gallery-title" ref={rootRef}>
    <h2 id="project-gallery-title">Galería del proyecto</h2>
    <div className="dipe-project-gallery__carousel" aria-roledescription="carrusel" aria-label="Galería del proyecto">
      {maxSlide > 0 && <button className="dipe-project-gallery__nav dipe-project-gallery__nav--previous" type="button" onClick={() => moveSlide(-1)} disabled={activeSlide === 0} aria-label="Diapositiva anterior"><ArrowIcon previous /></button>}
      <div className="dipe-project-gallery__viewport" ref={viewportRef} onScroll={syncSlideFromScroll}>
        <div className="dipe-project-gallery__track" ref={trackRef}>
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
