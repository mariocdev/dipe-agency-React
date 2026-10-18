import { useEffect, useState } from 'react';
import { getRelatedProjects } from '../../lib/api';
import { ProjectCard } from './ProjectCard';
import './RelatedProjects.css';

export function RelatedProjects({ project }) {
  const [state, setState] = useState({ loading: true, items: [], error: null });

  useEffect(() => {
    let active = true;
    setState({ loading: true, items: [], error: null });
    getRelatedProjects(project).then((items) => {
      if (active) setState({ loading: false, items, error: null });
    }).catch((error) => {
      if (active) setState({ loading: false, items: [], error });
    });
    return () => { active = false; };
  }, [project]);

  if (state.loading || (!state.error && state.items.length === 0)) return null;

  return <section className="dipe-related-projects" aria-labelledby="related-projects-title">
    <h2 id="related-projects-title">Más proyectos destacados</h2>
    {state.error
      ? <p role="alert">No se han podido cargar los proyectos destacados.</p>
      : <div className="dipe-related-projects__grid">
        {state.items.map((item) => <ProjectCard item={item} key={item.id} />)}
      </div>}
  </section>;
}
