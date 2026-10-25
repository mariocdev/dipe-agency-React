import { useEffect, useId, useRef, useState } from 'react';
import { ShopProductCard } from './ShopShared';
import chevronIcon from '../../assets/icons/chevron-down-solid-full.svg';
import './RelatedProducts.css';

export function RelatedProducts({ products }) {
  const id = useId();
  const viewportRef = useRef(null);
  const pagesRef = useRef([0]);
  const dragRef = useRef(null);
  const suppressClickUntil = useRef(0);
  const [navigation, setNavigation] = useState({ page: 0, pages: 1, previous: false, next: false });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    let frame = 0;
    function update() {
      const slides = Array.from(viewport.children);
      if (!slides.length || !viewport.clientWidth) return;
      const count = Math.max(1, Number.parseInt(window.getComputedStyle(viewport).getPropertyValue('--dipe-related-visible'), 10) || 4);
      const maximum = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const last = Math.max(0, slides.length - count);
      const positions = Array.from({ length: Math.ceil(slides.length / count) }, (_, index) => Math.min(maximum, slides[Math.min(index * count, last)].offsetLeft - slides[0].offsetLeft));
      pagesRef.current = positions;
      const page = positions.reduce((nearest, position, index) => Math.abs(viewport.scrollLeft - position) < Math.abs(viewport.scrollLeft - positions[nearest]) ? index : nearest, 0);
      const next = { page, pages: positions.length, previous: viewport.scrollLeft > 1, next: viewport.scrollLeft < maximum - 1 };
      setNavigation((current) => Object.keys(next).every((key) => current[key] === next[key]) ? current : next);
    }
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(() => { frame = 0; update(); });
    }
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    observer?.observe(viewport);
    viewport.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      observer?.disconnect();
      viewport.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.cancelAnimationFrame(frame);
      dragRef.current = null;
      viewport.classList.remove('is-dragging');
    };
  }, [products]);

  function scrollToPosition(position) {
    viewportRef.current?.scrollTo({ left: position, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  function goTo(page) {
    scrollToPosition(pagesRef.current[Math.max(0, Math.min(page, pagesRef.current.length - 1))]);
  }

  function move(direction) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const positions = pagesRef.current;
    const page = direction > 0 ? positions.findIndex((position) => position > viewport.scrollLeft + 1) : positions.reduce((last, position, index) => position < viewport.scrollLeft - 1 ? index : last, -1);
    if (page >= 0) goTo(page);
  }

  function onKeyDown(event) {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowLeft') move(-1);
    else if (event.key === 'ArrowRight') move(1);
    else if (event.key === 'Home') goTo(0);
    else if (event.key === 'End') goTo(pagesRef.current.length - 1);
    else return;
    event.preventDefault();
  }

  function startDrag(event) {
    const viewport = viewportRef.current;
    if (event.pointerType !== 'mouse' || event.button !== 0 || !viewport
      || event.target.closest('button, input, select, textarea')
      || viewport.scrollWidth <= viewport.clientWidth + 1) return;
    suppressClickUntil.current = 0;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, left: viewport.scrollLeft, active: false };
  }

  function drag(event) {
    const current = dragRef.current;
    const viewport = viewportRef.current;
    if (!current || current.pointerId !== event.pointerId || !viewport) return;
    const distance = event.clientX - current.x;
    if (!current.active) {
      if (Math.abs(distance) < 6) return;
      current.active = true;
      viewport.classList.add('is-dragging');
      viewport.scrollTo({ left: current.left, behavior: 'instant' });
      viewport.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    viewport.scrollTo({ left: current.left - distance, behavior: 'instant' });
  }

  function endDrag(event) {
    const current = dragRef.current;
    const viewport = viewportRef.current;
    if (!current || current.pointerId !== event.pointerId || !viewport) return;
    dragRef.current = null;
    if (!current.active) return;
    suppressClickUntil.current = performance.now() + 350;
    const slides = Array.from(viewport.children);
    const maximum = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const positions = slides.map((slide) => Math.min(maximum, slide.offsetLeft - slides[0].offsetLeft));
    const nearest = positions.reduce((best, position) => Math.abs(viewport.scrollLeft - position) < Math.abs(viewport.scrollLeft - best) ? position : best, positions[0] || 0);
    viewport.classList.remove('is-dragging');
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    scrollToPosition(nearest);
  }

  function suppressDragClick(event) {
    if (performance.now() >= suppressClickUntil.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickUntil.current = 0;
  }

  return <section className="dipe-product__related" aria-labelledby={id + '-title'} aria-roledescription="carrusel">
    <div className="dipe-shop__container">
      <div className="dipe-product__related-heading">
        <p className="dipe-shop__eyebrow">Sigue explorando</p><h2 id={id + '-title'}>También te puede gustar</h2>
        {navigation.pages > 1 && <nav className="dipe-related__arrows" aria-label="Navegar por los productos recomendados">
          <button type="button" className="dipe-related__arrow dipe-related__previous" disabled={!navigation.previous} onClick={() => move(-1)} aria-label="Productos anteriores" aria-controls={id + '-viewport'}><img src={chevronIcon} alt="" /></button>
          <button type="button" className="dipe-related__arrow dipe-related__next" disabled={!navigation.next} onClick={() => move(1)} aria-label="Productos siguientes" aria-controls={id + '-viewport'}><img src={chevronIcon} alt="" /></button>
        </nav>}
      </div>
      <div id={id + '-viewport'} className="dipe-related__viewport" ref={viewportRef} tabIndex={0} role="group" aria-label="Productos recomendados. Usa las flechas para navegar." onKeyDown={onKeyDown} onPointerDown={startDrag} onPointerMove={drag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onPointerLeave={() => { if (dragRef.current && !dragRef.current.active) dragRef.current = null; }} onDragStart={(event) => event.preventDefault()} onClickCapture={suppressDragClick}>
        {products.map((product, index) => <div key={product.id} className="dipe-related__slide" role="group" aria-roledescription="diapositiva" aria-label={(index + 1) + ' de ' + products.length}><ShopProductCard product={product} /></div>)}
      </div>
      {navigation.pages > 1 && <nav className="dipe-related__dots" aria-label="Grupos de productos recomendados">{Array.from({ length: navigation.pages }, (_, page) => <button type="button" key={page} onClick={() => goTo(page)} aria-label={'Ver grupo ' + (page + 1) + ' de ' + navigation.pages} aria-current={navigation.page === page ? 'true' : undefined} aria-controls={id + '-viewport'}><span /></button>)}</nav>}
    </div>
  </section>;
}