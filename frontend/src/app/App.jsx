import { useCallback, useState } from 'react';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { IntroAnimation } from '../components/layout/IntroAnimation';
import { PageContent } from '../components/layout/PageContent';
import { siteConfig } from '../lib/site';
import { formThankYouPages } from '../lib/formThankYou';
import { BlogArchive, BlogPost } from '../pages/blog/BlogPages';
import { Home } from '../pages/home/Home';
import { ProjectDetail } from '../pages/projects/ProjectDetail';
import { ProjectCategoryArchive, ProjectsArchive } from '../pages/projects/ProjectsArchive';
import { WebDevelopment } from '../pages/web-development/WebDevelopment';
import { DigitalTransformation } from '../pages/digital-transformation/DigitalTransformation';
import { ShopPages } from '../pages/shop/ShopPages';
import { CartProvider } from '../components/commerce/CartProvider';
import { FloatingCart } from '../components/commerce/FloatingCart';
import { Agency } from '../pages/agency/Agency';
import { Contact } from '../pages/contact/Contact';
import { LegalPage } from '../pages/legal/LegalPage';
import { legalPages } from '../pages/legal/legalContent';
import { NotFoundPage, ThankYouPage } from '../pages/system/SystemPages';
import { ServiceDevelopment } from '../pages/web-development/ServiceDevelopment';
import { developmentServiceRoutes } from '../pages/web-development/developmentServiceRoutes';

const introSessionKey = 'dipe-intro-shown-v1';

// Consulta el ajuste del sitio y si la intro ya se mostró en esta pestaña.
function shouldShowIntro() {
  if (siteConfig.loaderEnabled === false) return false;

  try {
    return window.sessionStorage.getItem(introSessionKey) !== '1';
  } catch {
    return true;
  }
}

// Envuelve cada página con la cabecera, el contenido y el pie compartidos.
function Shell({ children, effectsEnabled }) {
  return <>
    <Header />
    <PageContent effectsEnabled={effectsEnabled}>{children}</PageContent>
    <Footer />
  </>;
}

function Failure({ error }) {
  return <div className="alert alert-danger" role="alert">No se ha podido cargar el contenido. {error.message}</div>;
}

// Selecciona la página según la URL y coordina la intro de entrada.
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
  const legalPage = Object.hasOwn(legalPages, path.slice(1)) ? legalPages[path.slice(1)] : null;
  const thankYouPage = Object.values(formThankYouPages).find((page) => page.path.replace(/\/$/, '') === path);
  let page = <NotFoundPage />;
  if (siteConfig.commerce?.enabled && siteConfig.commerce.context) page = <ShopPages context={siteConfig.commerce.context} onNotFound={NotFoundPage} />;
  else if (path === '/' && searchTerm !== null) page = <BlogArchive searchTerm={searchTerm} />;
  else if (path === '/') page = <Home />;
  else if (path === '/desarrollo-web') page = <WebDevelopment />;
  else if (path === '/transformacion-digital') page = <DigitalTransformation />;
  else if (path === '/agencia-desarrollo-web') page = <Agency />;
  else if (path === '/contacto') page = <Contact />;
  else if (thankYouPage) page = <ThankYouPage title={thankYouPage.title} />;
  else if (legalPage) page = <LegalPage page={legalPage} />;
  else if (serviceId) page = <ServiceDevelopment serviceId={serviceId} />;
  else if (path === '/proyectos') page = <ProjectsArchive />;
  else if (projectCategoryMatch) page = <ProjectCategoryArchive slug={decodeURIComponent(projectCategoryMatch[1])} onNotFound={NotFoundPage} />;
  else if (projectMatch) page = <ProjectDetail slug={decodeURIComponent(projectMatch[1])} onNotFound={NotFoundPage} />;
  else if (path === '/blog') page = <BlogArchive />;
  else if (postMatch) page = <BlogPost slug={decodeURIComponent(postMatch[1])} onNotFound={NotFoundPage} />;
  else if (categoryMatch) page = <BlogArchive categorySlug={decodeURIComponent(categoryMatch[1].split('/').at(-1))} onNotFound={NotFoundPage} />;
  return <CartProvider>
    <div inert={showIntro ? true : undefined} aria-busy={showIntro}>
      <Shell effectsEnabled={!showIntro}>{page}</Shell>
    </div>
    {showIntro && <IntroAnimation onComplete={finishIntro} />}
    <FloatingCart />
  </CartProvider>;
}
