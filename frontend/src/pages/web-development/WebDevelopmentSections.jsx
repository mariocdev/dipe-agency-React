import { useId, useState } from 'react';
import { FitText } from '../../components/content/FitText';
import { ResponsiveTitle } from '../../components/content/ResponsiveTitle';
import { ResponsiveParagraphs } from '../../components/content/ResponsiveParagraphs';
import chevronIcon from '../../assets/icons/chevron-down-solid-full.svg';
import { sitePath } from '../../lib/site';
import { webDevelopmentMedia as media } from './webDevelopmentMedia';
import { developmentServiceRoutes } from './developmentServiceRoutes';
import { DevelopmentHeroVideo } from './DevelopmentHeroVideo';

const includedFeatures = [
  {
    title: 'Arquitectura y estrategia',
    icon: media.includesIcons.strategy,
    description: <>Mapa de contenidos, <strong>intenciones de búsqueda</strong>, rutas de conversión y KPIs. Si no mueve negocio, no entra.</>,
  },
  {
    title: 'Diseño UX/UI y Desarrollo',
    icon: media.includesIcons.design,
    description: <>Wireframes que tu equipo puede criticar y un <strong>design system</strong> que evita el “cada página de su padre”.</>,
  },
  {
    title: 'QA',
    icon: media.includesIcons.qa,
    description: <><strong>WordPress</strong> profesional y <strong>PrestaShop</strong> que vende. CI/CD, testing y checklist antes de publicar. Core Web Vitals en verde o no dormimos.</>,
  },
  {
    title: 'Analítica y medición',
    icon: media.includesIcons.analytics,
    description: <>GA4, eventos bien etiquetados y paneles que hablan claro: leads, ventas y coste por adquisición.</>,
  },
];

// La tercera URL conserva Salamanca y usa el diseño de Aplicaciones web por indicación del usuario.
const servicePaths = [
  {
    id: 'wordpress',
    title: <>WordPress<br />profesional</>,
    description: 'Bloques a medida, seguridad y edición fácil sin romper nada (prometido). Perfecto para webs corporativas y contenido.',
    linkLabel: 'Ir Desarrollo web con WordPress',
    imageLabel: 'WordPress',
    href: developmentServiceRoutes.wordpress,
  },
  {
    id: 'prestashop',
    title: <>PrestaShop para<br />ecommerce</>,
    description: 'Catálogo serio, checkout sin fricción e integraciones con pagos y logística. Ideal para ecommerce que quieren vender más y mejor.',
    linkLabel: 'Ir Desarrollo web con PrestaShop',
    imageLabel: 'PrestaShop',
    href: developmentServiceRoutes.prestashop,
  },
  {
    id: 'salamanca',
    title: <>Diseño web<br />Salamanca</>,
    description: 'Proyectos con acento local: performance, SEO técnico y conversión para empresas de Salamanca y alrededores.',
    linkLabel: 'Ir a Diseño web Salamanca',
    imageLabel: 'Diseño web Salamanca',
    href: developmentServiceRoutes.applications,
  },
];

// Descripciones desplegadas provisionales, redactadas con autorización del usuario.
const capabilityGroups = [
  {
    title: 'Integraciones y automatización (lo justo y necesario)',
    items: [
      { title: 'ERP/CRM/BI', description: 'Conectamos la web con las herramientas de gestión, relación con clientes y análisis del negocio. Las conexiones se definen según los procesos y los datos que necesitéis compartir.' },
      { title: 'Pagos y logística', description: 'Integramos los métodos de pago y los flujos logísticos que necesita el proyecto, cuidando la experiencia de compra y la preparación de pedidos.' },
      { title: 'Buscadores y APIs', description: 'Planteamos buscadores y conexiones con otros sistemas para que los usuarios encuentren lo que necesitan y la web encaje con la operativa del negocio.' },
    ],
  },
  {
    title: <>SEO técnico y rendimiento<br />(porque “bonita” también es “rápida”)</>,
    items: [
      { title: 'Core Web Vitals', description: 'Trabajamos la velocidad de carga, la estabilidad visual y la respuesta a las interacciones. Imágenes, código y recursos se revisan para cuidar la experiencia de uso.' },
      { title: 'Arquitectura e indexación', description: 'Organizamos la estructura, las rutas y los contenidos para facilitar la navegación y el trabajo de los buscadores. El SEO técnico forma parte del desarrollo desde el inicio.' },
      { title: 'CRO post-clic', description: 'Analizamos qué ocurre después de llegar a la web y planteamos mejoras en contenidos, llamadas a la acción, formularios o checkout para facilitar la conversión.' },
    ],
  },
  {
    title: 'Mantenimiento y evolución',
    items: [
      { title: 'Plan proactivo', description: 'Planificamos las tareas de mantenimiento y revisamos las actualizaciones y el rendimiento para mantener la web estable y detectar necesidades de mejora.' },
      { title: 'Sprints de mejora', description: 'Organizamos las mejoras en ciclos cortos, con objetivos y prioridades claros. La evolución se guía por las necesidades del negocio y las métricas del proyecto.' },
    ],
  },
];

const cases = [
  {
    title: 'B2B industrial (WordPress)',
    work: <>Rediseño +<br />SEO técnico</>,
    results: [
      { value: '+82%', label: 'Tráfico orgánico' },
      { value: '+38%', label: 'leads en 6 meses.' },
    ],
  },
  {
    title: 'Retail ecommerce (PrestaShop)',
    work: <>Checkout y<br />rendimiento</>,
    results: [
      { value: '+29%', label: 'conversión' },
      { value: '-24%', label: 'tiempo de preparación.' },
    ],
  },
];

function MediaSlot({ src, label, className = '' }) {
  return <div className={`dipe-web-media ${className}${src ? '' : ' dipe-web-media--pending'}`}>
    {src
      ? <img src={src} alt="" loading="lazy" />
      : <span>{label}<small>Imagen pendiente</small></span>}
  </div>;
}

export function WebDevelopmentHero({
  title = 'Desarrollo web que carga rápido,',
  subtitle = 'convierte y te ahorra cafés de más',
  auditLabel = 'Pide tu auditoría gratuita',
  videoSrc = media.heroVideo,
  imageSrc = null,
  description = null,
  anchorHref = '#web-contacto',
  secondaryAction = { label: 'Ver proyectos', href: sitePath('/proyectos/') },
}) {
  const [titleFontSize, setTitleFontSize] = useState(null);

  return <header className="dipe-web-hero" style={imageSrc ? { backgroundImage: `url("${imageSrc}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
    {videoSrc && <DevelopmentHeroVideo src={videoSrc} />}
    <div className="dipe-web-hero__inner">
      <h1><FitText onSizeChange={setTitleFontSize}>{title}</FitText><FitText className="dipe-web-hero__subtitle" maxFontSize={titleFontSize === null ? undefined : titleFontSize - 6}>{subtitle}</FitText></h1>
      {description && <div className="dipe-web-hero__description"><ResponsiveParagraphs>{description}</ResponsiveParagraphs></div>}
      <div className="dipe-web-hero__actions">
        <a className="dipe-web-button dipe-web-button--outline" href={anchorHref}>{auditLabel}</a>
        {secondaryAction.href
          ? <a className="dipe-web-button dipe-web-button--outline" href={secondaryAction.href}>{secondaryAction.label}</a>
          : <button className="dipe-web-button dipe-web-button--outline" type="button" disabled>{secondaryAction.label}</button>}
      </div>
    </div>
  </header>;
}

const defaultIntro = <>
  <p>Hacemos <strong>desarrollo web</strong> con método y buen gusto: UX con sentido, código limpio y SEO técnico.</p>
  <div>
    <p>Tu web lista para gustar a usuarios y a Google.</p>
    <p>Sí, también entregamos en plazo (no es leyenda urbana).</p>
  </div>
</>;

export function WebDevelopmentIncludes({
  intro = defaultIntro,
  title = <>Qué incluye nuestro<br />desarrollo web (sin humo)</>,
  features = includedFeatures,
  backgroundSrc = media.includesBackground,
  gridLayout = false,
}) {
  const cards = features.map((feature) => <article className="dipe-web-feature" key={feature.title}>
    <img src={feature.icon} alt="" loading="lazy" />
    <h3><ResponsiveTitle>{feature.title}</ResponsiveTitle></h3>
    <p>{feature.description}</p>
  </article>);

  return <section className="dipe-web-includes" aria-labelledby="web-includes-title">
    <div className="dipe-web-container">
      <div className="dipe-web-includes__intro">
        {intro}
      </div>
    </div>
    <div className="dipe-web-includes__body" style={backgroundSrc ? { backgroundImage: `url("${backgroundSrc}")` } : undefined}>
      <div className={`dipe-web-container ${gridLayout ? 'dipe-web-includes__cards-grid' : 'dipe-web-includes__layout'}`}>
        <div className="dipe-web-includes__heading">
          <h2 id="web-includes-title"><ResponsiveTitle>{title}</ResponsiveTitle></h2>
          <a className="dipe-web-button" href="#web-contacto">Solicita una auditoría gratuita</a>
        </div>
        {gridLayout ? cards : <div className="dipe-web-includes__grid">{cards}</div>}
      </div>
    </div>
  </section>;
}

export function WebDevelopmentPaths({ title = 'Elige tu camino (mini-hub de servicios)', cards = servicePaths, showLinks = true }) {
  return <section className="dipe-web-paths dipe-web-container" aria-labelledby="web-paths-title">
    <h2 id="web-paths-title"><ResponsiveTitle>{title}</ResponsiveTitle></h2>
    <div className="dipe-web-paths__grid">
      {cards.map((service) => <article className="dipe-web-path" key={service.id}>
        <h3>{!showLinks && service.href
          ? <a className="dipe-web-path__title-link" href={sitePath(service.href)}><ResponsiveTitle>{service.title}</ResponsiveTitle></a>
          : <ResponsiveTitle>{service.title}</ResponsiveTitle>}</h3>
        <p>{service.description}</p>
        {showLinks && (service.href
          ? <a className="dipe-web-path__link" href={sitePath(service.href)}>{service.linkLabel}</a>
          : <span className="dipe-web-path__link" aria-disabled="true">{service.linkLabel}</span>)}
        <MediaSlot src={media[service.id]} label={service.imageLabel} className="dipe-web-path__image" />
      </article>)}
    </div>
  </section>;
}

export function WebDevelopmentCapabilities({ groups = capabilityGroups, imageSrc = media.integrations, imageLabel = 'Integraciones y rendimiento' }) {
  const accordionId = useId();
  const [openItemId, setOpenItemId] = useState(null);

  return <section className="dipe-web-capabilities" aria-label="Integraciones, rendimiento y mantenimiento">
    <div className="dipe-web-capabilities__content">
      {groups.map((group, index) => <div className="dipe-web-capabilities__group" key={index}>
        <h2><ResponsiveTitle>{group.title}</ResponsiveTitle></h2>
        <ul>{group.items.map((item, itemIndex) => {
          const itemId = `${accordionId}-${index}-${itemIndex}`;
          const isOpen = openItemId === itemId;

          return <li key={item.title}>
            <div className={`dipe-web-capabilities__item${isOpen ? ' is-open' : ''}`}>
              <button
                className="dipe-web-capabilities__trigger"
                type="button"
                id={`${itemId}-trigger`}
                aria-expanded={isOpen}
                aria-controls={`${itemId}-answer`}
                onClick={() => setOpenItemId((current) => current === itemId ? null : itemId)}
              >
                <span>{item.title}</span>
                <img src={chevronIcon} alt="" aria-hidden="true" />
              </button>
              <div
                className="dipe-web-capabilities__panel"
                id={`${itemId}-answer`}
                role="region"
                aria-labelledby={`${itemId}-trigger`}
                aria-hidden={!isOpen}
              >
                <div className="dipe-web-capabilities__panel-inner">
                  <p className="dipe-web-capabilities__answer">{item.description}</p>
                </div>
              </div>
            </div>
          </li>;
        })}</ul>
      </div>)}
    </div>
    <MediaSlot src={imageSrc} label={imageLabel} className="dipe-web-capabilities__image" />
  </section>;
}

export function WebDevelopmentCases({ items = cases }) {
  return <section className="dipe-web-cases dipe-web-container" aria-labelledby="web-cases-title">
    <h2 id="web-cases-title">Casos</h2>
    <p className="dipe-web-cases__intro">(resumen con números bonitos)</p>
    <div className="dipe-web-cases__grid">
      {items.map((item) => <article className="dipe-web-case" key={item.title}>
        <div className="dipe-web-case__content">
          <h3>{item.title}</h3>
          <div className="dipe-web-case__results">
            <p className="dipe-web-case__work">{item.work}</p>
            <dl className={item.results.length === 1 ? 'dipe-web-case__metrics--single' : undefined}>{item.results.map((result) => <div key={result.label}>
              <dt>{result.label}</dt>
              <dd>{result.value}</dd>
            </div>)}</dl>
          </div>
        </div>
      </article>)}
    </div>
  </section>;
}
