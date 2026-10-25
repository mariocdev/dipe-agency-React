import { BlogSection } from '../../components/blog/BlogSection';
import { FloatingImage } from '../../components/content/FloatingImage';
import { homeMedia } from '../home/homeMedia';
import { LogoCarouselSection } from '../home/sections/LogoCarouselSection';
import { WorkProcessSection } from '../home/sections/WorkProcessSection';
import { FaqSection } from '../home/sections/FaqSection';
import { DigitalBenefits, DigitalEnquiryForm, DigitalHero, DigitalIncludes, DigitalSolutions } from './DigitalTransformationSections';
import { digitalTransformationMedia as media } from './digitalTransformationMedia';
import '../home/Home.css';
import '../projects/ProjectsContact.css';
import '../home/sections/FaqSection.css';
import './DigitalTransformation.css';

const steps = [
  { title: '01 · Analizamos los procesos', description: 'Estudiamos cómo trabaja actualmente tu empresa, qué herramientas utilizáis y dónde aparecen tareas repetitivas, pérdidas de tiempo o información dispersa.' },
  { title: '02 · Diseñamos la solución', description: 'Priorizamos necesidades y definimos qué procesos mejorar, qué sistemas conectar y qué merece la pena automatizar, adaptar o desarrollar.' },
  { title: '03 · Integramos e implantamos', description: 'Configuramos, conectamos o construimos la solución y la probamos junto a tu equipo para comprobar que encaja con el trabajo real del día a día.' },
  { title: '04 · Acompañamos y evolucionamos', description: 'Ponemos la solución en marcha, acompañamos al equipo y seguimos mejorándola cuando los procesos o las necesidades del negocio cambian.' },
].map((step, index) => ({ ...step, icon: media.processIcons[index] }));

// Borradores autorizados por el usuario, pendientes de revisión editorial en servidor.
const faqs = [
  {
    id: 'digital-plazos', question: '¿Cuánto dura una Transformación Digital?',
    answer: 'Depende de los procesos que quieras mejorar y de las herramientas que haya que conectar o desarrollar. Empezamos por definir prioridades y planteamos una entrega por fases, con un alcance y unos tiempos acordados para cada una.',
  },
  {
    id: 'digital-software', question: '¿Tengo que cambiar todo mi software?',
    answer: 'No necesariamente. Primero revisamos las herramientas que ya utilizáis y qué funciona bien. A partir de ahí valoramos qué conservar, qué conectar y qué conviene adaptar o sustituir para reducir tareas manuales y duplicidades.',
  },
  {
    id: 'digital-primer-paso', question: '¿Con qué empezamos: Odoo, Aplicación Web o App?',
    answer: 'Empezamos por el proceso que necesitas resolver. Odoo puede encajar para centralizar la gestión; una aplicación web, para necesidades específicas; y una app móvil, para tareas que deben acompañar al equipo o al cliente. La elección depende del uso real y de las conexiones necesarias.',
  },
  {
    id: 'digital-equipo', question: '¿Cómo aseguráis que el equipo lo use?',
    answer: 'Contamos con el equipo desde el análisis y probamos la solución con las personas que van a utilizarla. La puesta en marcha se acompaña de orientación y ajustes sobre el trabajo diario, para que la herramienta encaje con los procesos y resulte sencilla de usar.',
  },
  {
    id: 'digital-roi', question: '¿Se mide el ROI?',
    answer: 'Definimos indicadores antes de empezar, como tiempo dedicado a una tarea, errores o costes de gestión. Después comparamos la evolución con el punto de partida y la inversión realizada. Así podemos valorar el retorno con datos y decidir las siguientes mejoras.',
  },
].map((faq) => ({ ...faq, answerText: faq.answer }));

export function DigitalTransformation() {
  return <div className="dipe-digital">
    <DigitalHero />
    <DigitalBenefits />
    <DigitalIncludes />
    <DigitalSolutions />
    <WorkProcessSection title="ASÍ ABORDAMOS LA TRANSFORMACIÓN DIGITAL" steps={steps} imageSrc={media.processImage} />
    <BlogSection eyebrow="Recursos e ideas" title="Compartimos lo que aprendemos por el camino" description="Desarrollo, SEO, marketing, diseño y tecnología. En nuestro blog compartimos parte de lo que aprendemos trabajando cada día y explicamos conceptos que pueden ayudar a tomar mejores decisiones digitales." />
    <div className="dipe-digital-faqs"><FaqSection items={faqs} title="FAQs de Transformación Digital" backgroundSrc={null} /></div>
    <div className="dipe-projects-contact" id="digital-contacto">
      <section className="dipe-digital-contact" aria-labelledby="digital-contact-title">
        <div className="dipe-digital-container dipe-digital-contact__inner">
          <div className="dipe-digital-contact__intro"><h2 id="digital-contact-title"><span>Cuéntanos</span> qué tienes entre manos</h2><p><strong>¿Tienes una idea, un proyecto nuevo o algo que quieres mejorar?</strong></p><p>Dinos qué necesitas y vemos juntos la mejor forma de hacerlo realidad.<br />Sin rodeos y hablando claro desde el principio.</p></div>
          <DigitalEnquiryForm />
        </div>
      </section>
    </div>
    <div className="dipe-projects-contact__background-bridge" aria-hidden="true"><FloatingImage src={homeMedia('Hablamos.png')} /></div>
    <LogoCarouselSection />
  </div>;
}
