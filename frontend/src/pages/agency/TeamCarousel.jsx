import { useCallback, useEffect, useRef, useState } from 'react';
import { ResponsiveTitle } from '../../components/content/ResponsiveTitle';
import { useEqualizedBlockSize } from '../../hooks/useEqualizedBlockSize';
import { getTeamMembers } from '../../lib/api';
import chevronIcon from '../../assets/icons/chevron-down-solid-full.svg';
import './TeamCarousel.css';

// Carga el equipo de WordPress y coordina el desplazamiento de sus tarjetas.
export function TeamCarousel() {
  const [state, setState] = useState({ loading: true, members: [], error: false });
  const namesRef = useEqualizedBlockSize('.dipe-team__caption h3', state.members);
  const viewportRef = useEqualizedBlockSize('.dipe-team__role', state.members);
  const dragRef = useRef(null);
  const glideFrameRef = useRef(0);
  const [navigation, setNavigation] = useState({ previous: false, next: false });

  useEffect(() => () => cancelAnimationFrame(glideFrameRef.current), []);

  useEffect(() => {
    let active = true;
    getTeamMembers().then((members) => {
      if (active) setState({ loading: false, members, error: false });
    }).catch(() => {
      if (active) setState({ loading: false, members: [], error: true });
    });
    return () => { active = false; };
  }, []);

  const updateNavigation = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const previous = viewport.scrollLeft > 1;
    const next = viewport.scrollLeft < viewport.scrollWidth - viewport.clientWidth - 1;
    const bounds = viewport.getBoundingClientRect();
    let fadeLeft = 0;
    let fadeRight = 0;
    for (const card of viewport.children) {
      const rect = card.getBoundingClientRect();
      // El degradado nunca alcanza una tarjeta que cabe completa en la vista.
      if (rect.left < bounds.left - 1 && rect.right > bounds.left) {
        fadeLeft = Math.min(48, rect.right - bounds.left);
      }
      if (rect.right > bounds.right + 1 && rect.left < bounds.right) {
        fadeRight = Math.min(48, bounds.right - rect.left);
      }
    }
    viewport.style.setProperty('--dipe-team-mask', `linear-gradient(to right, ${fadeLeft ? 'transparent' : '#000'} 0, #000 ${fadeLeft}px, #000 calc(100% - ${fadeRight}px), ${fadeRight ? 'transparent' : '#000'} 100%)`);
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    namesRef.current?.style.setProperty('--dipe-team-progress', maxScroll > 0 ? Math.max(0, Math.min(1, viewport.scrollLeft / maxScroll)) : 1);
    setNavigation((current) => current.previous === previous && current.next === next ? current : { previous, next });
  }, [namesRef, viewportRef]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    updateNavigation();
    const observer = 'ResizeObserver' in window ? new ResizeObserver(updateNavigation) : null;
    observer?.observe(viewport);
    window.addEventListener('resize', updateNavigation);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateNavigation);
    };
  }, [state.members, updateNavigation]);

  function cancelGlide(viewport) {
    cancelAnimationFrame(glideFrameRef.current);
    glideFrameRef.current = 0;
    viewport.classList.remove('is-settling');
  }

  function glideTo(viewport, target) {
    cancelAnimationFrame(glideFrameRef.current);
    viewport.classList.add('is-settling');
    const start = viewport.scrollLeft;
    const distance = target - start;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || Math.abs(distance) < 1) {
      viewport.scrollTo({ left: target, behavior: 'instant' });
      cancelGlide(viewport);
      return;
    }

    const started = performance.now();
    const animate = (now) => {
      const progress = Math.min(1, (now - started) / 720);
      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      viewport.scrollTo({ left: start + distance * eased, behavior: 'instant' });
      if (progress < 1) {
        glideFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Reactivar el snap solo cuando ya estamos en el destino evita el salto.
        cancelGlide(viewport);
      }
    };
    glideFrameRef.current = requestAnimationFrame(animate);
  }

  function move(direction) {
    const viewport = viewportRef.current;
    const card = viewport?.firstElementChild;
    if (!card) return;
    const gap = parseFloat(window.getComputedStyle(viewport).columnGap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    const target = (Math.round(viewport.scrollLeft / step) + direction) * step;
    glideTo(viewport, Math.max(0, Math.min(viewport.scrollWidth - viewport.clientWidth, target)));
  }

  function startDrag(event) {
    const viewport = event.currentTarget;
    if (event.pointerType !== 'mouse') cancelGlide(viewport);
    if (event.pointerType !== 'mouse' || event.button !== 0 || !event.isPrimary || viewport.scrollWidth <= viewport.clientWidth) return;
    event.preventDefault();
    viewport.focus({ preventScroll: true });
    viewport.classList.add('is-dragging');
    cancelGlide(viewport);
    viewport.scrollTo({ left: viewport.scrollLeft, behavior: 'instant' });
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: viewport.scrollLeft,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
      moved: false,
    };
    viewport.setPointerCapture(event.pointerId);
  }

  function drag(event) {
    const current = dragRef.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const distance = event.clientX - current.startX;
    if (!current.moved && Math.abs(distance) < 5) return;
    event.preventDefault();
    const now = performance.now();
    current.velocity = (current.lastX - event.clientX) / Math.max(1, now - current.lastTime);
    current.lastX = event.clientX;
    current.lastTime = now;
    current.moved = true;
    event.currentTarget.scrollLeft = current.startScroll - distance;
  }

  function endDrag(event) {
    const current = dragRef.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const viewport = event.currentTarget;
    dragRef.current = null;
    viewport.classList.add('is-settling');
    viewport.classList.remove('is-dragging');
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const firstCard = viewport.firstElementChild;
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const step = firstCard.getBoundingClientRect().width + (parseFloat(window.getComputedStyle(viewport).columnGap) || 0);
    const momentum = !reducedMotion && event.type === 'pointerup' && performance.now() - current.lastTime < 100
      ? Math.max(-step, Math.min(step, current.velocity * 140)) : 0;
    const projected = Math.max(0, Math.min(maxScroll, viewport.scrollLeft + momentum));
    const left = viewport.getBoundingClientRect().left;
    const stops = [0, maxScroll, ...[...viewport.children].map((card) => Math.max(0, Math.min(maxScroll, card.getBoundingClientRect().left - left + viewport.scrollLeft)))];
    const target = stops.reduce((closest, stop) => Math.abs(stop - projected) < Math.abs(closest - projected) ? stop : closest);
    glideTo(viewport, target);
  }

  function navigateWithKeyboard(event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      glideTo(event.currentTarget, event.key === 'Home' ? 0 : event.currentTarget.scrollWidth - event.currentTarget.clientWidth);
    }
  }

  if (!state.loading && !state.error && state.members.length === 0) return null;

  return <section className="dipe-team dipe-web-container" aria-labelledby="team-title" ref={namesRef}>
    <header className="dipe-team__heading">
      <h2 id="team-title"><ResponsiveTitle>Nuestro equipo<br />(la parte humana de tanta sigla)</ResponsiveTitle></h2>
      <p>El humor es opcional; la profesionalidad, no.</p>
    </header>
    {state.loading && <p className="dipe-team__message" role="status">Cargando equipo…</p>}
    {state.error && <p className="dipe-team__message" role="alert">No se ha podido cargar el equipo.</p>}
    {state.members.length > 0 && <>
      <div className="dipe-team__viewport" ref={viewportRef} onScroll={updateNavigation} onPointerDown={startDrag} onPointerMove={drag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onWheel={(event) => cancelGlide(event.currentTarget)} onDragStart={(event) => event.preventDefault()} onKeyDown={navigateWithKeyboard} tabIndex={0} role="region" aria-label="Personas del equipo" aria-roledescription="carrusel">
        {state.members.map((member) => <article className="dipe-team__card" key={member.id}>
          <div className="dipe-team__photo">
            {member.image && <img
              src={member.image.url}
              alt={member.image.alt || member.name}
              width={member.image.width}
              height={member.image.height}
              loading="lazy"
              decoding="async"
              draggable={false}
            />}
          </div>
          <div className="dipe-team__caption">
            <h3>{member.name}</h3>
            <p className="dipe-team__role">{member.role}</p>
            {member.quote && <blockquote>{member.quote}</blockquote>}
          </div>
        </article>)}
      </div>
      {(navigation.previous || navigation.next) && <nav className="dipe-team__controls" aria-label="Desplazar el carrusel del equipo">
        <button type="button" className="dipe-team__previous" disabled={!navigation.previous} onClick={() => move(-1)} aria-label="Persona anterior"><img src={chevronIcon} alt="" /></button>
        <span className="dipe-team__progress" aria-hidden="true"><span /></span>
        <button type="button" className="dipe-team__next" disabled={!navigation.next} onClick={() => move(1)} aria-label="Persona siguiente"><img src={chevronIcon} alt="" /></button>
      </nav>}
    </>}
  </section>;
}
