import { FaqSection } from '../home/sections/FaqSection';
import { LogoCarouselSection } from '../home/sections/LogoCarouselSection';
import { WebDevelopmentHero } from '../web-development/WebDevelopmentSections';
import { ContactChannels, ContactFormSection, contactFaqs } from './ContactSections';
import { contactMedia as media } from './contactMedia';
import '../web-development/WebDevelopment.css';
import './Contact.css';

// La agenda aún no tiene destino confirmado; no sustituir por un servicio externo.
const bookingUrl = null;

export function Contact() {
  return <div className="dipe-web-development dipe-contact-page">
    <WebDevelopmentHero
      title="Contacto"
      subtitle="cuéntanos tu idea y la bajamos a un plan (con KPI)"
      description={<p>¿Tienes un proyecto en mente y quieres cifras, fechas y un plan sin humo? Escríbenos.<br />Te respondemos rápido y con pasos claros. Café opcional, deadline obligatorio.</p>}
      auditLabel="Enviar formulario"
      anchorHref="#formulario-contacto"
      secondaryAction={{ label: 'Agendar una llamada', href: bookingUrl }}
      videoSrc={null}
      imageSrc={media.heroImage}
    />
    <ContactChannels bookingUrl={bookingUrl} />
    <ContactFormSection />
    <FaqSection
      items={contactFaqs}
      title={<>FAQs de Contacto<br />(seriedad + sonrisa)</>}
      backgroundSrc={media.faqBackground}
    />
    <LogoCarouselSection />
  </div>;
}
