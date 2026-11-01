import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BlogSection } from '../../components/blog/BlogSection';
import { ResponsiveTitle } from '../../components/content/ResponsiveTitle';
import { getFeaturedProjects, plainText, projectModernHomeCardImage } from '../../lib/api';
import { siteConfig, sitePath } from '../../lib/site';
import { FaqSection } from './sections/FaqSection';
import { homeMedia } from './homeMedia';
import { LogoCarouselSection } from './sections/LogoCarouselSection';
import { reviews } from './sections/ReviewsSection';
import './ModernHome.css';

function useAutoAdvance(count, paused) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (count < 2 || paused) return undefined;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const timer = window.setInterval(() => {
      if (!motion.matches && document.visibilityState === 'visible') setActive((index) => (index + 1) % count);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [active, count, paused]);
  return [active, setActive];
}

function useCarouselDrag(move, setInteracting) {
  const drag = useRef(null);
  const suppressClick = useRef(false);
  return {
    onPointerDown(event) {
      if ((event.pointerType === 'mouse' && event.button !== 0) || event.target.closest('button:not([data-carousel-select])')) return;
      suppressClick.current = false;
      drag.current = { id: event.pointerId, x: event.clientX, moved: false };
      setInteracting(true);
    },
    onPointerMove(event) {
      const start = drag.current;
      if (!start || start.id !== event.pointerId) return;
      if (!start.moved && Math.abs(event.clientX - start.x) >= 8) {
        start.moved = true;
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      if (start.moved) event.preventDefault();
    },
    onPointerUp(event) {
      const start = drag.current;
      if (!start || start.id !== event.pointerId) return;
      drag.current = null;
      if (start.moved) {
        suppressClick.current = true;
        if (Math.abs(event.clientX - start.x) >= 40) move(event.clientX < start.x ? 1 : -1);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setInteracting(false);
    },
    onPointerCancel() { drag.current = null; setInteracting(false); },
    onLostPointerCapture(event) { if (event.target === event.currentTarget) { drag.current = null; setInteracting(false); } },
    onPointerLeave(event) { if (event.pointerType === 'mouse' && drag.current && !event.currentTarget.hasPointerCapture(event.pointerId)) { drag.current = null; setInteracting(false); } },
    onDragStart(event) { event.preventDefault(); },
    onClickCapture(event) { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } },
  };
}

function SketchNote({ children, finalWord }) {
  const arrow = <svg viewBox="0 0 120 100" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path className="modern-home__sketch-line" pathLength="1" d="M120 0C108 43 53 76 8 94" vectorEffect="non-scaling-stroke" /><path className="modern-home__sketch-tip" pathLength="1" d="M8 94L23 89" vectorEffect="non-scaling-stroke" /><path className="modern-home__sketch-tip" pathLength="1" d="M8 94L12 80" vectorEffect="non-scaling-stroke" /></svg>;
  return <span className="modern-home__sketch-note" aria-hidden="true"><span>{children}{finalWord ? <> <span className="modern-home__sketch-end">{finalWord}{arrow}</span></> : arrow}</span></span>;
}

function ModernProjects({ initialBlueprint }) {
  const [state, setState] = useState({ loading: true, data: [], error: false });
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [active, setActive] = useAutoAdvance(state.data.length, paused || interacting);

  useEffect(() => {
    let mounted = true;
    getFeaturedProjects(6, true).then(
      (data) => { if (mounted) setState({ loading: false, data: data || [], error: false }); },
      () => { if (mounted) setState({ loading: false, data: [], error: true }); },
    );
    return () => { mounted = false; };
  }, []);

  const projects = state.data;
  const move = (direction) => setActive((index) => (index + direction + projects.length) % projects.length);
  const dragHandlers = useCarouselDrag(move, setInteracting);

  return <section className={`modern-home__projects${initialBlueprint ? ' is-blueprint' : ''}`} aria-labelledby="modern-projects-title" onMouseEnter={() => setPaused(true)} onMouseLeave={(event) => { if (!event.currentTarget.contains(document.activeElement)) setPaused(false); }} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget) && !event.currentTarget.matches(':hover')) setPaused(false); }}>
    <div className="modern-home__inner">
      <div className="modern-home__section-heading">
        <div><span className="modern-home__eyebrow">Proyectos destacados</span><h2 id="modern-projects-title"><ResponsiveTitle>Proyectos que hablan<br />por nosotros.</ResponsiveTitle></h2></div>
        <div className="modern-home__projects-intro"><p>Una muestra de cómo alineamos diseño, desarrollo web y marketing para lograr resultados.</p>
          {projects.length > 1 && <div className="modern-home__controls">
            <button type="button" onClick={() => move(-1)} aria-label="Proyecto anterior">←</button>
            <button type="button" onClick={() => move(1)} aria-label="Proyecto siguiente">→</button>
          </div>}
        </div>
      </div>
      {state.loading && <div className="modern-home__carousel"><span className="visually-hidden" role="status">Cargando proyectos…</span></div>}
      {state.error && <p role="alert">No se han podido cargar los proyectos destacados.</p>}
      {!state.loading && !state.error && projects.length === 0 && <p>Próximamente compartiremos nuevos proyectos.</p>}
      {projects.length > 0 && <>
        <div className="modern-home__carousel" aria-label="Proyectos destacados" aria-roledescription="carrusel" {...dragHandlers}>
          <SketchNote>Carruseles personalizados de proyectos</SketchNote>
          {projects.map((item, index) => {
            const offset = (index - active + projects.length) % projects.length;
            const position = offset === 0 ? 'active' : offset === 1 ? 'next' : offset === projects.length - 1 ? 'previous' : 'hidden';
            const image = projectModernHomeCardImage(item);
            const title = plainText(item.title?.rendered);
            const cardProps = position === 'active' ? { href: sitePath(item.link) } : { role: 'button', 'data-carousel-select': true, onClick: (event) => { event.preventDefault(); setActive(index); }, onKeyDown: (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActive(index); } }, 'aria-label': `Mostrar proyecto ${title}`, tabIndex: position === 'hidden' ? -1 : 0 };
            return <article className={`modern-home__project modern-home__project--${position}`} key={item.id} aria-hidden={position === 'hidden'}>
              <a className="modern-home__project-card" {...cardProps}>
                {image && <div className="modern-home__project-media"><img src={image.url} alt={image.alt} loading="lazy" decoding="async" /></div>}
                <div className="modern-home__project-info"><h3>{title}</h3>{position === 'active' && <span>Ver proyecto ↗</span>}</div>
              </a>
            </article>;
          })}
        </div>
        {projects.length > 1 && <div className="modern-home__project-dots" aria-label="Seleccionar proyecto">{projects.map((item, index) => <button key={item.id} type="button" className={index === active ? 'is-active' : ''} aria-label={`Mostrar proyecto ${index + 1} de ${projects.length}`} aria-current={index === active ? 'true' : undefined} onClick={() => setActive(index)} />)}</div>}
      </>}
      <a className="modern-home__text-link" href={sitePath('/proyectos/')}>Ver todos los proyectos <span aria-hidden="true">↗</span></a>
    </div>
  </section>;
}

function ModernReviews() {
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [active, setActive] = useAutoAdvance(reviews.length, paused || interacting);
  const dragHandlers = useCarouselDrag((direction) => setActive((index) => (index + direction + reviews.length) % reviews.length), setInteracting);
  return <section className="modern-home__reviews" aria-labelledby="modern-reviews-title" onMouseEnter={() => setPaused(true)} onMouseLeave={(event) => { if (!event.currentTarget.contains(document.activeElement)) setPaused(false); }} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget) && !event.currentTarget.matches(':hover')) setPaused(false); }}>
    <div className="modern-home__inner">
      <div className="modern-home__section-heading"><div><span className="modern-home__eyebrow">Lo que dicen de nosotros</span><h2 id="modern-reviews-title"><ResponsiveTitle>Personas que confían<br />en lo que hacemos.</ResponsiveTitle></h2></div><p>Opiniones reales de quienes han trabajado con nosotros.</p></div>
      <div className="modern-home__reviews-grid" aria-label="Opiniones de clientes" aria-roledescription="carrusel" {...dragHandlers}><div className="modern-home__reviews-track" style={{ '--review-offset': -active }}>{[...reviews, reviews[0]].map((review, index) => <article className="modern-home__review" key={`${review.id}-${index}`} aria-hidden={index !== active && index !== active + 1}>
        <span className="modern-home__quote" aria-hidden="true">“</span><blockquote>{review.text}</blockquote>
        <div><span className="modern-home__avatar" aria-hidden="true">{review.author.charAt(0)}</span><div><cite>{review.author}</cite><span className="modern-home__stars" aria-label={`${review.rating} de 5 estrellas`}>★★★★★</span></div></div>
        {review.isRepeat && <p className="modern-home__review-repeat">Reseña repetida para esta demostración</p>}
      </article>)}</div></div>
      {reviews.length > 1 && <div className="modern-home__controls modern-home__reviews-controls"><button type="button" onClick={() => setActive((active - 1 + reviews.length) % reviews.length)} aria-label="Reseña anterior">←</button><button type="button" onClick={() => setActive((active + 1) % reviews.length)} aria-label="Reseña siguiente">→</button></div>}
    </div>
  </section>;
}

function ModernProcess({ workSteps }) {
  const [active, setActive] = useState(0);

  return <section className="modern-home__process" aria-labelledby="modern-process-title">
    <div className="modern-home__inner modern-home__process-layout">
      <div className="modern-home__process-content"><div className="modern-home__section-heading"><div><span className="modern-home__eyebrow">Nuestra metodología</span><h2 id="modern-process-title"><ResponsiveTitle>Nuestra forma<br />de trabajar.</ResponsiveTitle></h2></div><p>Un proceso claro y colaborativo, desde la primera idea hasta el lanzamiento y crecimiento.</p></div></div>
      <div className="modern-home__process-interaction">
        <div className="modern-home__process-visual">
          <div className="modern-home__process-ring" aria-hidden="true"><span /></div>
          <div className="modern-home__steps">{workSteps.map((step, index) => <button type="button" className={`modern-home__step${active === index ? ' is-selected' : ''}`} key={step.title} aria-pressed={active === index} onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} onClick={() => setActive(index)}>
            <span className="modern-home__step-icon"><img src={step.icon} alt="" loading="lazy" /></span><span className="modern-home__step-number">0{index + 1}</span><span className="modern-home__step-title">{step.title}</span><span className="modern-home__step-description">{step.description}</span>
          </button>)}</div>
        </div>
        <div className="modern-home__process-detail" aria-live="polite">{workSteps.map((step, index) => <div className={`modern-home__process-detail-item${active === index ? ' is-active' : ''}`} aria-hidden={active !== index} key={step.title}><strong>{step.title}</strong><p>{step.description}</p></div>)}</div>
      </div>
    </div>
  </section>;
}

export function ModernHome({ serviceCards, workSteps }) {
  const homeRef = useRef(null);
  const sequenceRef = useRef({ animating: false, moving: false });
  const [initialBlueprint] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useLayoutEffect(() => {
    const sections = homeRef.current.querySelectorAll('.modern-home__hero, .modern-home__services, .modern-home__projects');
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sections.forEach((section) => section.classList.toggle('is-blueprint', section.getBoundingClientRect().bottom > 0));
    }
    return () => sections.forEach((section) => section.classList.remove('is-blueprint'));
  }, []);

  useEffect(() => {
    const root = homeRef.current;
    const sections = Array.from(root.querySelectorAll('.modern-home__hero, .modern-home__services, .modern-home__projects'));
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let moveTimer;
    let targetPosition;
    let touchStart;
    let touchCaptured = false;
    const headerBottom = () => Math.max(0, document.querySelector('.dipe-header')?.getBoundingClientRect().bottom || 0);
    const stickyHeaderBottom = () => {
      const header = document.querySelector('.dipe-header');
      if (!header) return 0;
      return header.getBoundingClientRect().height + Math.max(0, parseFloat(window.getComputedStyle(header).top) || 0);
    };
    const navigate = (direction, event) => {
      if (motion.matches || window.matchMedia('(max-width: 880px)').matches || root.closest('[inert]') || event.target.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return false;
      if (sequenceRef.current.moving) return true;
      const top = headerBottom();
      const index = sections.findIndex((section) => { const rect = section.getBoundingClientRect(); return rect.top <= top + 25 && rect.bottom > top + 25; });
      if (index < 0) return false;
      const rect = sections[index].getBoundingClientRect();
      const destinationTop = stickyHeaderBottom();
      const usableHeight = window.innerHeight - destinationTop;
      // En secciones más altas que la pantalla, permitir leer todo antes de saltar.
      if (rect.height > usableHeight + 40 && ((direction > 0 && rect.bottom > window.innerHeight + 12) || (direction < 0 && rect.top < top - 12))) return false;
      const next = sections[index + direction];
      if (!next) return false;
      targetPosition = window.scrollY + next.getBoundingClientRect().top - destinationTop;
      sequenceRef.current.moving = true;
      window.clearTimeout(moveTimer);
      moveTimer = window.setTimeout(() => { sequenceRef.current.moving = false; }, 1800);
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      return true;
    };
    const onScrollEnd = () => {
      if (sequenceRef.current.moving && Math.abs(window.scrollY - targetPosition) < 3) {
        window.clearTimeout(moveTimer);
        sequenceRef.current.moving = false;
      }
    };
    const onWheel = (event) => {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX) || !event.deltaY) return;
      if (navigate(Math.sign(event.deltaY), event)) event.preventDefault();
    };
    const onTouchStart = (event) => { touchCaptured = false; if (event.touches.length === 1) touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY }; };
    const onTouchMove = (event) => {
      if (touchCaptured) { event.preventDefault(); return; }
      if (!touchStart || event.touches.length !== 1) return;
      const dx = event.touches[0].clientX - touchStart.x;
      const dy = event.touches[0].clientY - touchStart.y;
      if (Math.abs(dy) < 25 || Math.abs(dy) <= Math.abs(dx)) return;
      if (navigate(dy < 0 ? 1 : -1, event)) { event.preventDefault(); touchCaptured = true; touchStart = null; }
    };
    const onTouchEnd = () => { touchStart = null; touchCaptured = false; };
    const onKeyDown = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return;
      if (navigate(event.key === 'ArrowDown' ? 1 : -1, event)) event.preventDefault();
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('scrollend', onScrollEnd);
    return () => { window.clearTimeout(moveTimer); sequenceRef.current.moving = false; window.removeEventListener('wheel', onWheel); window.removeEventListener('touchstart', onTouchStart); window.removeEventListener('touchmove', onTouchMove); window.removeEventListener('touchend', onTouchEnd); window.removeEventListener('touchcancel', onTouchEnd); window.removeEventListener('keydown', onKeyDown); window.removeEventListener('scrollend', onScrollEnd); };
  }, []);

  useEffect(() => {
    const root = homeRef.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    let context;
    let observer;
    let fallback;
    const revealAll = () => root.querySelectorAll('.is-blueprint, .is-drawing').forEach((section) => section.classList.remove('is-blueprint', 'is-drawing'));

    const start = () => {
      if (disposed || motion.matches) return;
      const heroRect = root.querySelector('.modern-home__hero').getBoundingClientRect();
      sequenceRef.current.animating = heroRect.bottom > 0 && heroRect.top < window.innerHeight;
      fallback = window.setTimeout(() => { sequenceRef.current.animating = false; revealAll(); }, 4000);
      Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
        window.clearTimeout(fallback);
        if (disposed || motion.matches || !homeRef.current) { sequenceRef.current.animating = false; revealAll(); return; }
        gsap.registerPlugin(ScrollTrigger);
        context = gsap.context(() => {
          ['.modern-home__hero', '.modern-home__services', '.modern-home__projects'].forEach((selector) => {
            const section = root.querySelector(selector);
            if (section.getBoundingClientRect().bottom <= 0) return;
            const play = () => {
              if (!section.classList.contains('is-blueprint')) return;
              sequenceRef.current.animating = true;
              section.classList.add('is-drawing');
              const timeline = gsap.timeline({ onComplete: () => { section.classList.remove('is-drawing'); sequenceRef.current.animating = false; } });
              timeline.call(() => section.classList.remove('is-blueprint'), null, 2.6)
                .to({}, { duration: 0.6 });
            };
            if (selector === '.modern-home__hero' && section.getBoundingClientRect().top < window.innerHeight) play();
            else ScrollTrigger.create({ trigger: section, start: 'top 85%', once: true, onEnter: play });
          });
        }, root);
      }).catch(() => { window.clearTimeout(fallback); sequenceRef.current.animating = false; revealAll(); });
    };

    const shell = root.closest('[inert]');
    if (shell) {
      observer = new MutationObserver(() => {
        if (!shell.hasAttribute('inert')) { observer.disconnect(); start(); }
      });
      observer.observe(shell, { attributes: true, attributeFilter: ['inert'] });
    } else start();
    return () => { disposed = true; window.clearTimeout(fallback); observer?.disconnect(); context?.revert(); sequenceRef.current.animating = false; };
  }, []);

  return <div className="modern-home" ref={homeRef}>
    <section className={`modern-home__hero${initialBlueprint ? ' is-blueprint' : ''}`}>
      <div className="modern-home__inner modern-home__hero-inner">
        <div className="modern-home__hero-copy">
          <span className="modern-home__eyebrow">Agencia de desarrollo web</span>
          <h1><ResponsiveTitle>Webs que conectan.<br />Negocios que crecen<span className="modern-home__hero-accent">.</span></ResponsiveTitle></h1>
          <p>Diseñamos y hacemos desarrollo web con cabeza (UX), corazón (marca) y café (rendimiento). Tu web lista para posicionar y convertir desde el día 1.</p>
          <a className="modern-home__button" href={sitePath('/contacto/')}>Hablemos de tu proyecto <span aria-hidden="true">↗</span></a>
        </div>
        <div className="modern-home__orbit" aria-hidden="true"><SketchNote finalWord="personalizadas">Animaciones rápidas y</SketchNote><span className="modern-home__orbit-line modern-home__orbit-line--one" /><span className="modern-home__orbit-line modern-home__orbit-line--two" /><span className="modern-home__orbit-line modern-home__orbit-line--three" /><img className="modern-home__planet" src={homeMedia('cropped-Favicon-DIPE.png')} alt="" decoding="async" /></div>
      </div>
    </section>
    <section className={`modern-home__services${initialBlueprint ? ' is-blueprint' : ''}`} aria-labelledby="modern-services-title">
      <div className="modern-home__inner">
        <div className="modern-home__section-heading"><div><span className="modern-home__eyebrow">Qué hacemos</span><h2 id="modern-services-title"><ResponsiveTitle>Soluciones digitales<br />para crecer.</ResponsiveTitle></h2></div><p>Desarrollo, tecnología y marketing para impulsar tu negocio.</p></div>
        <div className="modern-home__services-grid"><SketchNote>Diseño ordenado y cuidado</SketchNote>{serviceCards.map((card, index) => <article className="modern-home__service" key={card.id}>
          <span className="modern-home__service-number">0{index + 1} <span aria-hidden="true">↗</span></span>
          <h3><ResponsiveTitle>{card.title}</ResponsiveTitle></h3>
          <ul>{card.items.map((item) => <li key={item.label}>{item.href ? <a href={sitePath(item.href)}>{item.label}{'\u00a0'}<span aria-hidden="true">↗</span></a> : item.label}</li>)}</ul>
        </article>)}<article className="modern-home__service modern-home__service--brand">
          {siteConfig.logo?.url ? <img src={siteConfig.logo.url} alt={siteConfig.logo.alt || 'Dipe Agency'} loading="lazy" decoding="async" /> : <strong>Dipe Agency</strong>}
          <p>Desarrollo web, tecnología y marketing para impulsar tu negocio.</p>
        </article></div>
      </div>
    </section>
    <ModernProjects initialBlueprint={initialBlueprint} />
    <ModernProcess workSteps={workSteps} />
    <ModernReviews />
    <FaqSection backgroundSrc={null} />
    <BlogSection eyebrow="Ideas y recursos" />
    <LogoCarouselSection />
  </div>;
}
