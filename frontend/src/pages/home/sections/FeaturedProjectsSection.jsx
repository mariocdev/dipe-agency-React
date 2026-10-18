import { useEffect, useRef, useState } from 'react';
import { getFeaturedProjects, projectHomeCardImage, rendered } from '../../../lib/api';
import { sitePath } from '../../../lib/site';
import { homeMedia } from '../homeMedia';

function FeaturedProjectCard({ item, index }) {
  const image = projectHomeCardImage(item);
  const title = rendered(item.title?.rendered);

  return <article className="dipe-featured-projects__item" style={{ '--project-index': index }}>
    <a className="dipe-featured-projects__card" href={sitePath(item.link)}>
      <div className="dipe-featured-projects__media">
        {image && <img src={image.url} alt={image.alt} />}
      </div>
      <div className="dipe-featured-projects__card-content">
        <h3 dangerouslySetInnerHTML={{ __html: title }} />
        <span>Ver proyecto</span>
      </div>
    </a>
  </article>;
}

export function FeaturedProjectsSection() {
  const [state, setState] = useState({ loading: true, data: [], error: null });
  const canvasRef = useRef(null);

  useEffect(() => {
    getFeaturedProjects().then(
      (data) => setState({ loading: false, data: data || [], error: null }),
      (error) => setState({ loading: false, data: [], error }),
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let frame = 0;
    const updateBackgroundPosition = () => {
      frame = 0;
      const bounds = canvas.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const progress = (viewportHeight / 2 - (bounds.top + bounds.height / 2)) / (viewportHeight + bounds.height);
      const offset = Math.max(-520, Math.min(520, progress * 1050));

      canvas.style.setProperty('--projects-background-offset', `${offset}px`);
    };
    const scheduleBackgroundPosition = () => {
      if (!frame) frame = window.requestAnimationFrame(updateBackgroundPosition);
    };

    window.addEventListener('scroll', scheduleBackgroundPosition, { passive: true });
    window.addEventListener('resize', scheduleBackgroundPosition);
    scheduleBackgroundPosition();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleBackgroundPosition);
      window.removeEventListener('resize', scheduleBackgroundPosition);
    };
  }, []);

  return <section className="dipe-featured-projects" aria-labelledby="featured-projects-title" ref={canvasRef} style={{ backgroundImage: `url(${homeMedia('IMG-Proyectos.png')})` }}>
    <div className="dipe-featured-projects__inner">
      <header className="dipe-featured-projects__heading">
        <h2 id="featured-projects-title">Proyectos destacados</h2>
        <p>Una muestra de cómo alineamos <strong>diseño, desarrollo web y marketing</strong> para lograr resultados.</p>
      </header>

      <div className="dipe-featured-projects__canvas">
        {state.loading && <p className="dipe-featured-projects__message" role="status">Cargando proyectos…</p>}
        {state.error && <p className="dipe-featured-projects__message" role="alert">No se han podido cargar los proyectos destacados.</p>}
        {!state.loading && !state.error && state.data.length === 0 && <p className="dipe-featured-projects__message">Próximamente compartiremos nuevos proyectos.</p>}
        {state.data.length > 0 && <div className="dipe-featured-projects__grid">
          {state.data.map((item, index) => <FeaturedProjectCard item={item} index={index} key={item.id} />)}
        </div>}
      </div>

      <a className="dipe-featured-projects__all-link" href={sitePath('/proyectos/')}>Ver todos los proyectos</a>
    </div>
  </section>;
}
