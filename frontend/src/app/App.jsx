import { useCallback, useState } from 'react';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { IntroAnimation } from '../components/layout/IntroAnimation';
import { PageContent } from '../components/layout/PageContent';
import { siteConfig } from '../lib/site';
import { formThankYouPages } from '../lib/formThankYou';
import { CartProvider } from '../components/commerce/CartProvider';
import { FloatingCart } from '../components/commerce/FloatingCart';
import { legalPageSlugs } from '../pages/legal/legalRoutes';
import { NotFoundPage, ThankYouPage } from '../pages/system/SystemPages';
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

// Cada navegación carga un documento WordPress: importar solo su plantilla antes de montar.
async function pageFrom(load, name, props) {
  const module = await load();
  const Page = module[name];
  return <Page {...props} />;
}

export async function loadAppPage() {
  const currentPath = window.location.pathname;
  const searchTerm = new URLSearchParams(window.location.search).get('s');
  const basePath = (siteConfig.basePath || '/').replace(/\/$/, '');
  const path = (basePath && currentPath.startsWith(basePath) ? currentPath.slice(basePath.length) : currentPath).replace(/\/+$/, '') || '/';
  const projectMatch = path.match(/^\/proyectos\/([^/]+)$/);
  const projectCategoryMatch = path.match(/^\/proyectos\/categoria\/([^/]+)$/);
  const postMatch = path.match(/^\/blog\/([^/]+)$/);
  const categoryMatch = path.match(/^\/categoria\/(.+)$/);
  const serviceId = Object.keys(developmentServiceRoutes).find((key) => developmentServiceRoutes[key].replace(/\/$/, '') === path);
  const legalSlug = Object.values(legalPageSlugs).find((slug) => slug === path.slice(1));
  const thankYouPage = Object.values(formThankYouPages).find((page) => page.path.replace(/\/$/, '') === path);
  if (siteConfig.commerce?.enabled && siteConfig.commerce.context) {
    const { loadShopPage } = await import('../pages/shop/ShopPages');
    return loadShopPage(siteConfig.commerce.context, NotFoundPage);
  }
  if (path === '/' && searchTerm !== null) return pageFrom(() => import('../pages/blog/BlogArchive'), 'BlogArchive', { searchTerm });
  if (path === '/') return pageFrom(() => import('../pages/home/Home'), 'Home');
  if (path === '/desarrollo-web') return pageFrom(() => import('../pages/web-development/WebDevelopment'), 'WebDevelopment');
  if (path === '/transformacion-digital') return pageFrom(() => import('../pages/digital-transformation/DigitalTransformation'), 'DigitalTransformation');
  if (path === '/agencia-desarrollo-web') return pageFrom(() => import('../pages/agency/Agency'), 'Agency');
  if (path === '/contacto') return pageFrom(() => import('../pages/contact/Contact'), 'Contact');
  if (thankYouPage) return <ThankYouPage title={thankYouPage.title} />;
  if (legalSlug) return pageFrom(() => import('../pages/legal/LegalPage'), 'LegalPage', { slug: legalSlug });
  if (serviceId) return pageFrom(() => import('../pages/web-development/ServiceDevelopment'), 'ServiceDevelopment', { serviceId });
  if (path === '/proyectos') return pageFrom(() => import('../pages/projects/ProjectsArchive'), 'ProjectsArchive');
  if (projectCategoryMatch) return pageFrom(() => import('../pages/projects/ProjectsArchive'), 'ProjectCategoryArchive', { slug: decodeURIComponent(projectCategoryMatch[1]), onNotFound: NotFoundPage });
  if (projectMatch) return pageFrom(() => import('../pages/projects/ProjectDetail'), 'ProjectDetail', { slug: decodeURIComponent(projectMatch[1]), onNotFound: NotFoundPage });
  if (path === '/blog') return pageFrom(() => import('../pages/blog/BlogArchive'), 'BlogArchive');
  if (postMatch) return pageFrom(() => import('../pages/blog/BlogPost'), 'BlogPost', { slug: decodeURIComponent(postMatch[1]), onNotFound: NotFoundPage });
  if (categoryMatch) return pageFrom(() => import('../pages/blog/BlogArchive'), 'BlogArchive', { categorySlug: decodeURIComponent(categoryMatch[1].split('/').at(-1)), onNotFound: NotFoundPage });
  return <NotFoundPage />;
}

// Mantiene una sola instancia del shell, del carrito y de los formularios nativos.
export function App({ page }) {
  const [showIntro, setShowIntro] = useState(shouldShowIntro);
  const finishIntro = useCallback(() => {
    try { window.sessionStorage.setItem(introSessionKey, '1'); } catch { /* La navegación continúa si el almacenamiento está desactivado. */ }
    setShowIntro(false);
  }, []);
  return <CartProvider>
    <div inert={showIntro ? true : undefined} aria-busy={showIntro}>
      <Shell effectsEnabled={!showIntro}>{page}</Shell>
    </div>
    {showIntro && <IntroAnimation onComplete={finishIntro} />}
    <FloatingCart />
  </CartProvider>;
}
