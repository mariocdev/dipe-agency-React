import { useEffect, useState } from 'react';
import { getProject, getProjects, projectHomeCardImage, rendered } from './api';
import { Header } from './Header';
import { siteConfig, sitePath } from './site';

function SiteLink({ href, children, className }) {
  return <a className={className} href={sitePath(href)}>{children}</a>;
}

function Shell({ children }) {
  return <>
    <Header />
    <main>{children}</main>
  </>;
}

function Loading() {
  return <p className="text-secondary" role="status">Cargando contenido…</p>;
}

function Failure({ error }) {
  return <div className="alert alert-danger" role="alert">No se ha podido cargar el contenido. {error.message}</div>;
}

function Home() {
  return <section className="container py-5">
    <p className="text-uppercase text-secondary small fw-semibold">Dipe Agency</p>
    <h1 className="display-5">Proyectos seleccionados</h1>
    <p className="lead col-lg-8">Esta sección conecta la home con los proyectos publicados en WordPress. El diseño definitivo llegará con las piezas visuales.</p>
    <Projects limit={3} compact />
  </section>;
}

function ProjectCard({ item }) {
  const image = projectHomeCardImage(item);
  return <article className="col-md-6 col-lg-4" key={item.id}>
    <div className="card h-100 shadow-sm">
      {image && <img className="card-img-top sample-image" src={image.url} alt={image.alt} />}
      <div className="card-body d-flex flex-column">
        <h2 className="h4" dangerouslySetInnerHTML={{ __html: rendered(item.title?.rendered) }} />
        <SiteLink href={item.link} className="stretched-link mt-auto">Ver proyecto</SiteLink>
      </div>
    </div>
  </article>;
}

function Projects({ limit = 24, compact = false }) {
  const [state, setState] = useState({ loading: true, data: [], error: null });
  useEffect(() => {
    getProjects(limit).then((data) => setState({ loading: false, data, error: null })).catch((error) => setState({ loading: false, data: [], error }));
  }, [limit]);

  if (state.loading) return <Loading />;
  if (state.error) return <Failure error={state.error} />;
  if (state.data.length === 0) return <p className="text-secondary">Aún no hay proyectos publicados.</p>;
  return <div className="row g-4 mt-1">
    {state.data.map((item) => <ProjectCard item={item} key={item.id} />)}
    {compact && <div className="col-12"><SiteLink href="/proyectos/" className="btn btn-outline-dark">Ver todos los proyectos</SiteLink></div>}
  </div>;
}

function ProjectsPage() {
  return <section className="container py-5">
    <h1>Proyectos</h1>
    <Projects />
  </section>;
}

function ProjectDetail({ slug }) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  useEffect(() => {
    getProject(slug).then((data) => setState({ loading: false, data, error: null })).catch((error) => setState({ loading: false, data: null, error }));
  }, [slug]);
  if (state.loading) return <section className="container py-5"><Loading /></section>;
  if (state.error) return <section className="container py-5"><Failure error={state.error} /></section>;
  if (!state.data) return <NotFound />;
  const item = state.data;
  const image = projectHomeCardImage(item);
  return <article className="container py-5 col-lg-8">
    <SiteLink href="/proyectos/" className="small">← Todos los proyectos</SiteLink>
    <h1 className="mt-3" dangerouslySetInnerHTML={{ __html: rendered(item.title?.rendered) }} />
    {image && <img className="img-fluid rounded my-4 detail-image" src={image.url} alt={image.alt} />}
  </article>;
}

function NotFound() {
  return <section className="container py-5">
    <p className="text-uppercase text-secondary small fw-semibold">404</p>
    <h1>Página no encontrada</h1>
    <p>La dirección no existe o el contenido ya no está publicado.</p>
    <SiteLink href="/" className="btn btn-dark">Volver al inicio</SiteLink>
  </section>;
}

export function App() {
  const currentPath = window.location.pathname;
  const basePath = (siteConfig.basePath || '/').replace(/\/$/, '');
  const path = (basePath && currentPath.startsWith(basePath) ? currentPath.slice(basePath.length) : currentPath).replace(/\/+$/, '') || '/';
  const projectMatch = path.match(/^\/proyectos\/([^/]+)$/);
  let page = <NotFound />;
  if (path === '/') page = <Home />;
  else if (path === '/proyectos') page = <ProjectsPage />;
  else if (projectMatch) page = <ProjectDetail slug={decodeURIComponent(projectMatch[1])} />;
  return <Shell>{page}</Shell>;
}
