import { ContactSection } from '../../components/contact/ContactSection';
import { homeMedia } from '../home/homeMedia';
import { LogoCarouselSection } from '../home/sections/LogoCarouselSection';
import './ProjectsContact.css';

const defaultIntro = <p>Cuéntanos tu reto. Como Agencia Desarrollo Web, te proponemos un plan con fases, tiempos y presupuesto claro para crecer con seguridad.</p>;

export function ProjectsContact({ intro = defaultIntro, source = 'proyectos', formType = 'contacto', title = '¿Empezamos?', id }) {
  return <>
    <div className="dipe-projects-contact" id={id}>
      <ContactSection source={source} formType={formType} title={title} intro={intro} hideDetails />
    </div>
    <div className="dipe-projects-contact__background-bridge" aria-hidden="true">
      <img src={homeMedia('Hablamos.png')} alt="" />
    </div>
    <LogoCarouselSection />
  </>;
}
