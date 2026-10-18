import { useCallback, useEffect, useState } from 'react';
import { getProject, getProjects, projectHomeCardImage, rendered } from './api';
import { Header } from './Header';
import { Footer } from './Footer';
import { Home } from './Home';
import { BlogArchive, BlogPost } from './BlogPages';
import { IntroAnimation } from './IntroAnimation';
import { siteConfig, sitePath } from './site';

const introSessionKey = 'dipe-intro-shown-v1';

function shouldShowIntro() {
  try {
    return window.sessionStorage.getItem(introSessionKey) !== '1';
  } catch {
    return true;
  }
}

function SiteLink({ href, children, className }) {
  return <a className={className} href={sitePath(href)}>{children}</a>;
}

function Shell({ children }) {
  return <>
    <Header />
    <main>{children}</main>
    <Footer />
  </>;
}

function Failure({ error }) {
  return <div className="alert alert-danger" role="alert">No se ha podido cargar el contenido. {error.message}</div>;
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

  if (state.loading) return <p className="text-secondary" role="status">Cargando proyectos…</p>;
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
  if (state.loading) return <section className="container py-5"><p className="text-secondary" role="status">Cargando proyecto…</p></section>;
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
  const [showIntro, setShowIntro] = useState(shouldShowIntro);
  const finishIntro = useCallback(() => {
    try { window.sessionStorage.setItem(introSessionKey, '1'); } catch { /* La navegación continúa si el almacenamiento está desactivado. */ }
    setShowIntro(false);
  }, []);
  const currentPath = window.location.pathname;
  const basePath = (siteConfig.basePath || '/').replace(/\/$/, '');
  const path = (basePath && currentPath.startsWith(basePath) ? currentPath.slice(basePath.length) : currentPath).replace(/\/+$/, '') || '/';
  const projectMatch = path.match(/^\/proyectos\/([^/]+)$/);
  const postMatch = path.match(/^\/blog\/([^/]+)$/);
  const categoryMatch = path.match(/^\/categoria\/(.+)$/);
  let page = <NotFound />;
  if (path === '/') page = <Home />;
  else if (path === '/proyectos') page = <ProjectsPage />;
  else if (projectMatch) page = <ProjectDetail slug={decodeURIComponent(projectMatch[1])} />;
  else if (path === '/blog') page = <BlogArchive />;
  else if (postMatch) page = <BlogPost slug={decodeURIComponent(postMatch[1])} />;
  else if (categoryMatch) page = <BlogArchive categorySlug={decodeURIComponent(categoryMatch[1].split('/').at(-1))} />;
  return <>
    <div inert={showIntro ? true : undefined} aria-busy={showIntro}>
      <Shell>{page}</Shell>
    </div>
    {showIntro && <IntroAnimation onComplete={finishIntro} />}
  </>;
}
