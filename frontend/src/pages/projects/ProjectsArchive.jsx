import { useEffect, useRef, useState } from 'react';
import { FitText } from '../../components/content/FitText';
import { useArchiveGridFeedback } from '../../hooks/useArchiveGridFeedback';
import { ArchiveLoadingOverlay } from '../../components/content/ArchiveLoadingOverlay';
import { getProjectArchive, getProjectCategory, plainText } from '../../lib/api';
import { sitePath } from '../../lib/site';
import { homeMedia } from '../home/homeMedia';
import { ProjectCard } from './ProjectCard';
import { ProjectsContact } from './ProjectsContact';
import { ProjectsArchiveFilters } from './ProjectsArchiveFilters';
import './ProjectsArchive.css';

const archiveDescription = 'Una muestra de cómo alineamos diseño, desarrollo web y marketing para lograr resultados.';
const perPage = 12;
const projectFilters = [
  { slug: 'wordpress', label: 'Proyectos con WordPress' },
  { slug: 'prestashop', label: 'Proyectos con PrestaShop' },
];

function ProjectPagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return <nav className="dipe-projects-archive__pagination" aria-label="Paginación de proyectos">
    {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button
      className="dipe-projects-archive__page"
      type="button"
      key={number}
      aria-current={number === page ? 'page' : undefined}
      onClick={() => onChange(number)}
    >
      {number}
    </button>)}
  </nav>;
}

function ProjectGridLoader() {
  return <div className="dipe-projects-archive__grid dipe-projects-archive__grid--loading" role="status" aria-label="Cargando proyectos">
    {Array.from({ length: 6 }, (_, index) => <div className="dipe-projects-archive__loader-card" aria-hidden="true" key={index}>
      <span className="dipe-projects-archive__loader-image" />
      <span className="dipe-projects-archive__loader-category" />
      <span className="dipe-projects-archive__loader-title" />
    </div>)}
  </div>;
}

function Projects({ categoryId = null, page = 1, onTotalPages, scrollTargetRef }) {
  const [state, setState] = useState({ loading: true, projects: [], error: null });
  const { resultsRef, showLoader } = useArchiveGridFeedback({ content: state.projects, loading: state.loading, error: state.error, scrollTargetRef });

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));
    getProjectArchive({ page, categoryId, perPage }).then((result) => {
      if (!active) return;
      onTotalPages?.(result.totalPages);
      setState({ loading: false, projects: result.projects || [], error: null });
    }).catch((error) => {
      if (active) setState({ loading: false, projects: [], error });
    });
    return () => { active = false; };
  }, [categoryId, onTotalPages, page]);

  return <>
    <span className="visually-hidden" role="status">{showLoader && state.loading ? 'Cargando proyectos…' : ''}</span>
    <div className="dipe-projects-archive__results dipe-archive-loading-surface" ref={resultsRef} aria-busy={state.loading}>
    {state.error
      ? <p className="dipe-projects-archive__message" role="alert">No se han podido cargar los proyectos.</p>
      : state.loading && state.projects.length === 0
        ? <ProjectGridLoader />
        : state.projects.length === 0
          ? <p className="dipe-projects-archive__message">Aún no hay proyectos publicados.</p>
          : <div className="dipe-projects-archive__grid">
            {state.projects.map((item) => <ProjectCard item={item} key={item.id} />)}
          </div>}
      <ArchiveLoadingOverlay active={showLoader} />
    </div>
  </>;
}

function ProjectsBanner({ title, description }) {
  const [titleFontSize, setTitleFontSize] = useState(null);

  return <header className="dipe-projects-banner" style={{ backgroundImage: `url(${homeMedia('Cabecera-proyectos.png')})` }}>
    <div className="dipe-projects-banner__inner">
      <FitText as="h1" onSizeChange={setTitleFontSize}>{title}</FitText>
      {description && <FitText as="h2" maxFontSize={titleFontSize === null ? undefined : titleFontSize - 6}>{description}</FitText>}
    </div>
  </header>;
}

export function ProjectsArchive() {
  const filtersRef = useRef(null);
  const [categories, setCategories] = useState({ loading: true, items: {} });
  const [filter, setFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let active = true;
    Promise.all(projectFilters.map(async (filterOption) => [filterOption.slug, await getProjectCategory(filterOption.slug)]))
      .then((items) => {
        if (active) setCategories({ loading: false, items: Object.fromEntries(items.filter(([, item]) => item)) });
      })
      .catch(() => { if (active) setCategories({ loading: false, items: {} }); });
    return () => { active = false; };
  }, []);

  function selectFilter(slug) {
    setFilter(slug);
    setPage(1);
  }

  const categoryId = filter ? categories.items[filter]?.id : null;

  return <>
    <ProjectsBanner title="Proyectos" description={archiveDescription} />
    <section className="dipe-projects-archive" aria-label="Archivo de proyectos">
      <div className="dipe-projects-archive__filter-anchor" ref={filtersRef}>
        <ProjectsArchiveFilters options={projectFilters} categories={categories} filter={filter} onChange={selectFilter} />
      </div>
      <Projects categoryId={categoryId} page={page} onTotalPages={setTotalPages} scrollTargetRef={filtersRef} />
      <ProjectPagination page={page} totalPages={totalPages} onChange={setPage} />
    </section>
    <ProjectsContact />
  </>;
}

export function ProjectCategoryArchive({ slug, onNotFound }) {
  const filtersRef = useRef(null);
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    getProjectCategory(slug).then((data) => setState({ loading: false, data, error: null }))
      .catch((error) => setState({ loading: false, data: null, error }));
  }, [slug]);

  if (state.loading) return <section className="container py-5"><p className="text-secondary" role="status">Cargando categoría…</p></section>;
  if (state.error) return <section className="container py-5"><div className="alert alert-danger" role="alert">No se ha podido cargar el contenido. {state.error.message}</div></section>;
  if (!state.data) return onNotFound();

  const category = state.data;
  return <>
    <ProjectsBanner title={plainText(category.name)} description={plainText(category.description)} />
    <section className="dipe-projects-archive" aria-label={`Proyectos de ${category.name}`}>
      <a className="dipe-projects-archive__back" ref={filtersRef} href={sitePath('/proyectos/')}>← Todos los proyectos</a>
      <Projects categoryId={category.id} page={page} onTotalPages={setTotalPages} scrollTargetRef={filtersRef} />
      <ProjectPagination page={page} totalPages={totalPages} onChange={setPage} />
    </section>
  </>;
}
