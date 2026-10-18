import { FaqSection, homeFaqs } from '../home/sections/FaqSection';
import { WorkProcessSection } from '../home/sections/WorkProcessSection';
import { ProjectsContact } from '../projects/ProjectsContact';
import { webDevelopmentMedia as media } from './webDevelopmentMedia';
import {
  WebDevelopmentCapabilities,
  WebDevelopmentCases,
  WebDevelopmentHero,
  WebDevelopmentIncludes,
  WebDevelopmentPaths,
} from './WebDevelopmentSections';
import './WebDevelopment.css';

const steps = [
  {
    title: 'Descubrimiento',
    icon: media.strategyIcon,
    description: 'Objetivos, KPIs y alcance sin curvas. Quick wins a la vista.',
  },
  {
    title: 'QA',
    icon: media.qaIcon,
    description: 'Sprints cortos, demos quincenales y checklist de calidad.',
  },
  {
    title: 'Diseño UX/UI y Desarrollo',
    icon: media.designIcon,
    description: 'Prototipos navegables para validar pronto. Menos “sorpresa final”, más aciertos.',
  },
  {
    title: 'Lanzamiento & crecimiento',
    icon: media.analyticsIcon,
    description: <>Plan de go-live, monitorización y <strong>roadmap</strong> trimestral. La web evoluciona, no se queda colgada.</>,
  },
];

const faqQuestions = [
  '¿Hacéis “desarrollo web” rápido o bonito?',
  '¿Cuánto tarda mi proyecto?',
  '¿Podéis migrar sin perder SEO?',
  '¿Trabajáis con nuestro equipo interno?',
  '¿También lleváis marketing?',
];
const firstAnswer = 'Ambas. Si tarda 6 segundos en cargar, ni tu madre la ve. Rendimiento y diseño van juntos.';
// Las respuestas no desplegadas en el PDF reutilizan las ya presentes en Home.
const faqs = homeFaqs.map((item, index) => ({
  ...item,
  question: faqQuestions[index],
  ...(index === 0 ? { answer: firstAnswer, answerText: firstAnswer } : {}),
}));

export function WebDevelopment() {
  return <div className="dipe-web-development">
    <WebDevelopmentHero />
    <WebDevelopmentIncludes />
    <WebDevelopmentPaths />
    <WebDevelopmentCapabilities />
    <WorkProcessSection videoSrc={media.processVideo} title="Nuestra manera de trabajar" steps={steps} />
    <WebDevelopmentCases />
    <FaqSection
      items={faqs}
      title={<>FAQs sobre desarrollo web<br />(con seriedad y una sonrisa)</>}
    />
    <ProjectsContact
      id="web-contacto"
      source="desarrollo-web"
      formType="contacto-servicios"
      title="¿Hablamos?"
      intro={<p>Cuéntanos tu objetivo y te devolvemos un plan de desarrollo web con fases, tiempos y presupuesto claro. Tecnología con cabeza, diseño con gusto y resultados con números.</p>}
    />
  </div>;
}
