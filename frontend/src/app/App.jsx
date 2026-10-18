import { useCallback, useState } from 'react';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { IntroAnimation } from '../components/layout/IntroAnimation';
import { siteConfig, sitePath } from '../lib/site';
import { BlogArchive, BlogPost } from '../pages/blog/BlogPages';
import { Home } from '../pages/home/Home';
import { ProjectDetail } from '../pages/projects/ProjectDetail';
import { ProjectCategoryArchive, ProjectsArchive } from '../pages/projects/ProjectsArchive';
import { WebDevelopment } from '../pages/web-development/WebDevelopment';
import { Agency } from '../pages/agency/Agency';
import { ServiceDevelopment } from '../pages/web-development/ServiceDevelopment';
import { developmentServiceRoutes } from '../pages/web-development/developmentServiceRoutes';

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
  const searchTerm = new URLSearchParams(window.location.search).get('s');
  const basePath = (siteConfig.basePath || '/').replace(/\/$/, '');
  const path = (basePath && currentPath.startsWith(basePath) ? currentPath.slice(basePath.length) : currentPath).replace(/\/+$/, '') || '/';
  const projectMatch = path.match(/^\/proyectos\/([^/]+)$/);
  const projectCategoryMatch = path.match(/^\/proyectos\/categoria\/([^/]+)$/);
  const postMatch = path.match(/^\/blog\/([^/]+)$/);
  const categoryMatch = path.match(/^\/categoria\/(.+)$/);
  const serviceId = Object.keys(developmentServiceRoutes).find((key) => developmentServiceRoutes[key].replace(/\/$/, '') === path);
  let page = <NotFound />;
  if (path === '/' && searchTerm !== null) page = <BlogArchive searchTerm={searchTerm} />;
  else if (path === '/') page = <Home />;
  else if (path === '/desarrollo-web') page = <WebDevelopment />;
  else if (path === '/agencia-desarrollo-web') page = <Agency />;
  else if (serviceId) page = <ServiceDevelopment serviceId={serviceId} />;
  else if (path === '/proyectos') page = <ProjectsArchive />;
  else if (projectCategoryMatch) page = <ProjectCategoryArchive slug={decodeURIComponent(projectCategoryMatch[1])} onNotFound={NotFound} />;
  else if (projectMatch) page = <ProjectDetail slug={decodeURIComponent(projectMatch[1])} onNotFound={NotFound} />;
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
