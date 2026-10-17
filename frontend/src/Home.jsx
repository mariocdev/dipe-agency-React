import { BlogSection } from './BlogSection';
import { ContactSection } from './ContactSection';
import { FeaturedProjectsSection } from './FeaturedProjectsSection';
import { FaqSection } from './FaqSection';
import { homeMedia } from './homeMedia';
import { LogoCarouselSection } from './LogoCarouselSection';
import { ReviewsSection } from './ReviewsSection';
import { ServiceCardsSection } from './ServiceCardsSection';
import { VideoHero } from './VideoHero';
import { WorkProcessSection } from './WorkProcessSection';
import './Home.css';

const serviceCards = [
  {
    id: 'web',
    title: <>Soluciones de desarrollo<br />web a medida</>,
    headingIcon: homeMedia('Soluciones-de-desarrollo-web-a-medida.gif'),
    backgroundIcon: homeMedia('Soluciones-de-desarrollo-web-a-medida.svg'),
    backgroundPosition: 'left',
    items: [
      { label: 'Desarrollo web con WordPress' },
      { label: 'Desarrollo web con PrestaShop' },
      { label: 'Desarrollo de aplicaciones web (custom)' },
      { label: 'Apps móviles (iOS · Android · PWA)' },
    ],
  },
  {
    id: 'digital',
    title: <>Transformación digital que<br />impulsa tu negocio</>,
    headingIcon: homeMedia('Transformacion-digital-que-impulsa-tu-negocio.gif'),
    backgroundIcon: homeMedia('Transformacion-digital-que-impulsa-tu-negocio.png'),
    backgroundPosition: 'center',
    items: [
      { label: 'Odoo' },
      { label: 'Integraciones y automatizaciones' },
      { label: 'Consultoría tecnológica' },
    ],
  },
  {
    id: 'marketing',
    title: <>Marketing online orientado<br />a resultados</>,
    headingIcon: homeMedia('Marketing-online-orientado-a-resultados.gif'),
    backgroundIcon: homeMedia('Marketing-online-orientado-a-resultados.svg'),
    backgroundPosition: 'right',
    items: [
      { label: 'SEO: estrategia, técnica y contenidos' },
      { label: 'SEM: Google Ads & Social Ads' },
      { label: 'Gestión de redes sociales para empresas' },
      { label: 'Inbound Marketing & automatización' },
    ],
  },
];

const workSteps = [
  {
    title: 'Descubrimiento',
    icon: homeMedia('Descubrimiento.svg'),
    description: 'Objetivos, métricas y mapa de contenidos. Sin jerga innecesaria.',
  },
  {
    title: 'QA',
    icon: homeMedia('QA.svg'),
    description: 'Repos, CI/CD, testing y checklist de lanzamiento. Nada sale sin pasar por QA.',
  },
  {
    title: 'Diseño UX/UI y Desarrollo',
    icon: homeMedia('Diseno-UX-UI-y-Desarrollo.svg'),
    description: 'Wireframes y prototipos que tu equipo puede probar (y criticar) antes de programar.',
  },
  {
    title: 'Lanzamiento y crecimiento',
    icon: homeMedia('Lanzamiento-y-crecimiento.svg'),
    description: 'Medición con GA4, experimentos y roadmap trimestral. La web no se queda “en cuadro”.',
  },
];

export function Home() {
  return <>
    <VideoHero
      videoSrc={homeMedia('Banner-ppal.mp4')}
      title={<>Agencia de desarrollo web que<br />hace webs rápidas, guapas y<br />que venden</>}
    >
      <p>
        ¿Buscas una <strong>Agencia de desarrollo web</strong> que hable claro y<br />
        <strong>entregue en plazo?</strong>
      </p>
      <p>
        Hola . En dipe diseñamos y hacemos <strong>desarrollo web</strong> con<br />
        cabeza (<strong>UX</strong>), corazón (<strong>marca</strong>) y café (<strong>rendimiento</strong>). Tu web<br />
        lista para <strong>posicionar y convertir desde el día 1.</strong>
      </p>
    </VideoHero>
    <ServiceCardsSection title={<><strong>Qué hacemos</strong> (sin humo, con KPI)</>} cards={serviceCards} />
    <WorkProcessSection imageSrc={homeMedia('Nuestra-forma-de-trabajar.png')} title="Nuestra forma de trabajar" steps={workSteps} />
    <FeaturedProjectsSection />
    <ReviewsSection />
    <FaqSection />
    <div className="dipe-home__blog-contact">
      <BlogSection />
      <div className="dipe-home__background-bridge" aria-hidden="true">
        <img src={homeMedia('Hablamos.png')} alt="" />
      </div>
      <ContactSection />
    </div>
    <LogoCarouselSection />
  </>;
}
