import { useEffect, useState } from 'react';
import { featuredImage, getSample, getSamples, rendered } from './api';

const config = window.dipeSite || {};
const basePath = (config.basePath || '/').replace(/\/$/, '');

function sitePath(path = '') {
  return `${basePath}/${path.replace(/^\//, '')}`.replace(/\/{2,}/g, '/');
}

function SiteLink({ href, children, className }) {
  return <a className={className} href={sitePath(href)}>{children}</a>;
}

function Shell({ children }) {
  return <>
    <header className="border-bottom bg-white">
      <nav className="navbar navbar-expand container py-3" aria-label="Principal">
        <SiteLink href="/" className="navbar-brand fw-bold">Dipe Agency</SiteLink>
        <SiteLink href="/muestras/" className="nav-link">Muestras</SiteLink>
      </nav>
    </header>
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
    <p className="text-uppercase text-secondary small fw-semibold">Prueba vertical</p>
    <h1 className="display-5">WordPress gestiona el contenido; React muestra las vistas.</h1>
    <p className="lead col-lg-8">Esta pantalla es temporal. Los diseños, textos y secciones definitivas se crearán a partir del inventario editorial.</p>
    <SiteLink href="/muestras/" className="btn btn-dark">Ver muestras de prueba</SiteLink>
  </section>;
}

function Samples() {
  const [state, setState] = useState({ loading: true, data: [], error: null });
  useEffect(() => {
    getSamples().then((data) => setState({ loading: false, data, error: null })).catch((error) => setState({ loading: false, data: [], error }));
  }, []);

  if (state.loading) return <section className="container py-5"><Loading /></section>;
  if (state.error) return <section className="container py-5"><Failure error={state.error} /></section>;
  return <section className="container py-5">
    <h1>Muestras</h1>
    {state.data.length === 0 ? <p className="text-secondary">Aún no hay muestras publicadas.</p> : <div className="row g-4 mt-1">
      {state.data.map((item) => <article className="col-md-6 col-lg-4" key={item.id}>
        <div className="card h-100 shadow-sm">
          {featuredImage(item) && <img className="card-img-top sample-image" src={featuredImage(item)} alt="" />}
          <div className="card-body d-flex flex-column">
            <h2 className="h4" dangerouslySetInnerHTML={{ __html: rendered(item.title?.rendered) }} />
            <div className="text-secondary" dangerouslySetInnerHTML={{ __html: rendered(item.excerpt?.rendered) }} />
            <SiteLink href={item.link} className="stretched-link mt-auto">Ver detalle</SiteLink>
          </div>
        </div>
      </article>)}
    </div>}
  </section>;
}

function SampleDetail({ slug }) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  useEffect(() => {
    getSample(slug).then((data) => setState({ loading: false, data, error: null })).catch((error) => setState({ loading: false, data: null, error }));
  }, [slug]);
  if (state.loading) return <section className="container py-5"><Loading /></section>;
  if (state.error) return <section className="container py-5"><Failure error={state.error} /></section>;
  if (!state.data) return <NotFound />;
  const item = state.data;
  const client = item.meta?.dipe_item_client;
  const website = item.meta?.dipe_item_url;
  return <article className="container py-5 col-lg-8">
    <SiteLink href="/muestras/" className="small">← Todas las muestras</SiteLink>
    <h1 className="mt-3" dangerouslySetInnerHTML={{ __html: rendered(item.title?.rendered) }} />
    {featuredImage(item) && <img className="img-fluid rounded my-4 detail-image" src={featuredImage(item)} alt="" />}
    {client && <p><strong>Cliente:</strong> {client}</p>}
    <div className="lead" dangerouslySetInnerHTML={{ __html: rendered(item.excerpt?.rendered) }} />
    {website && <p><a href={website} rel="noopener noreferrer" target="_blank">Visitar enlace externo</a></p>}
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
  const path = (basePath && currentPath.startsWith(basePath) ? currentPath.slice(basePath.length) : currentPath).replace(/\/+$/, '') || '/';
  const sampleMatch = path.match(/^\/muestras\/([^/]+)$/);
  let page = <NotFound />;
  if (path === '/') page = <Home />;
  else if (path === '/muestras') page = <Samples />;
  else if (sampleMatch) page = <SampleDetail slug={decodeURIComponent(sampleMatch[1])} />;
  return <Shell>{page}</Shell>;
}
