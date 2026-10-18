import { FaqSection, homeFaqs } from '../home/sections/FaqSection';
import { WorkProcessSection } from '../home/sections/WorkProcessSection';
import { ProjectsContact } from '../projects/ProjectsContact';
import { WebDevelopmentHero, WebDevelopmentPaths } from '../web-development/WebDevelopmentSections';
import { developmentServiceRoutes } from '../web-development/developmentServiceRoutes';
import { webDevelopmentMedia as sharedMedia } from '../web-development/webDevelopmentMedia';
import { agencyMedia as media } from './agencyMedia';
import { WhoWeAreSection } from './AgencySections';
import { TeamCarousel } from './TeamCarousel';
import '../web-development/WebDevelopment.css';
import './Agency.css';

const services = [
  {
    id: 'wordpress', title: <>Desarrollo web<br />con WordPress</>,
    description: 'Diseños a medida, bloques/patrones propios y Core Web Vitals en verde. Editas sin romper nada (prometido).',
    imageLabel: 'WordPress', href: developmentServiceRoutes.wordpress,
  },
  {
    id: 'prestashop', title: <>Desarrollo web con<br />PrestaShop</>,
    description: 'Catálogo serio, checkout sin fricción e integraciones de pagos y logística. Más pedido, menos carrito perdido.',
    imageLabel: 'PrestaShop', href: developmentServiceRoutes.prestashop,
  },
  {
    id: 'salamanca', title: <>Diseño web<br />Salamanca</>,
    description: 'Proyectos con enfoque local: SEO técnico, rendimiento y contenidos que posicionan en Salamanca… y más allá.',
    imageLabel: 'Diseño web Salamanca', href: developmentServiceRoutes.applications,
  },
];

const steps = [
  { title: 'Descubrimiento', icon: sharedMedia.strategyIcon, description: 'Objetivos, KPIs y alcance sin giros de guion. Quick wins a la vista.' },
  { title: 'QA', icon: sharedMedia.qaIcon, description: <>Repos, CI/CD, checklist y <strong>Core Web Vitals</strong> en verde o no dormimos.</> },
  { title: 'UX/UI & Desarrollo', icon: sharedMedia.designIcon, description: 'Wireframes y prototipo navegable. Validar pronto = acertar más.' },
  { title: 'Lanzamiento & evolución', icon: sharedMedia.analyticsIcon, description: 'Analítica bien puesta (GA4), experimentos y roadmap por sprints. Web viva, negocio vivo.' },
];

const faqs = [
  {
    id: 'agency-design-development', question: '¿Sois más de diseño o de desarrollo?',
    answerText: 'De negocio. Diseñamos bonito y desarrollamos sólido, pero todo pasa por el filtro KPI.',
    answer: <>De <strong>negocio.</strong> Diseñamos bonito y desarrollamos sólido, pero todo pasa por el filtro KPI.</>,
  },
  { ...homeFaqs.find((faq) => faq.id === 'equipo-interno'), question: '¿Trabajáis con nuestro equipo interno?' },
  { ...homeFaqs.find((faq) => faq.id === 'marketing'), question: '¿Solo web o también marketing?' },
  {
    id: 'agency-technology', question: '¿Qué tecnología usáis?',
    answerText: 'WordPress y PrestaShop para webs y ecommerce, y Laravel y React para aplicaciones a medida. La tecnología se define según los objetivos y las necesidades del proyecto.',
    answer: 'WordPress y PrestaShop para webs y ecommerce, y Laravel y React para aplicaciones a medida. La tecnología se define según los objetivos y las necesidades del proyecto.',
  },
  {
    id: 'agency-budget', question: '¿Presupuesto y tiempos?',
    answerText: 'Partimos de tus objetivos y del alcance para preparar un plan con fases, tiempos y presupuesto claro. Trabajamos por sprints y enseñamos el progreso durante el proyecto.',
    answer: 'Partimos de tus objetivos y del alcance para preparar un plan con fases, tiempos y presupuesto claro. Trabajamos por sprints y enseñamos el progreso durante el proyecto.',
  },
];

export function Agency() {
  return <div className="dipe-web-development dipe-agency">
    <WebDevelopmentHero
      title="Agencia Desarrollo web"
      subtitle="gente maja, método serio y webs que dan números"
      description={<p>Somos una <strong>Agencia Desarrollo Web</strong> que mezcla UX con cabeza, código limpio y KPI en grande. Hacemos <strong>Desarrollo web con WordPress, Desarrollo web con PrestaShop</strong> y <strong>Diseño web Salamanca</strong> para que tu web guste a clientes… y a Google.<br />Menos humo, más resultados.</p>}
      auditLabel="Conócenos (Prometemos cero tecnopalabra)"
      anchorHref="#quienes-somos"
      videoSrc={media.heroVideo}
      imageSrc={media.heroImage}
    />
    <WhoWeAreSection />
    <WebDevelopmentPaths title="Qué hacemos (y por qué se nota)" cards={services} showLinks={false} />
    <TeamCarousel />
    <WorkProcessSection
      title={<>Cómo trabajamos<br />(paso corto, vista larga)</>}
      steps={steps}
      imageSrc={media.processImage}
      videoSrc={media.processVideo}
    />
    <FaqSection items={faqs} title={<>FAQs de nuestra Agencia Desarrollo Web<br />(con seriedad y una sonrisa)</>} />
    <ProjectsContact
      id="web-contacto"
      source="agencia"
      title="¿Hablamos?"
      intro={<p>Cuéntanos tu reto. Como <strong>Agencia Desarrollo Web</strong>, te preparamos un plan con fases, tiempos y presupuesto claro. Si quieres, lo explicamos en “modo café” o en “modo KPI”.</p>}
    />
  </div>;
}
