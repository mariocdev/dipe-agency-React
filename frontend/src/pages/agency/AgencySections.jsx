import { agencyMedia as media } from './agencyMedia';

function AgencyValueCard({ className, image, title, children }) {
  return <article className={`dipe-agency-value ${className}`}>
    {image && <img src={image} alt="" loading="lazy" />}
    <div className="dipe-agency-value__content">
      <h3>{title}</h3>
      {children}
    </div>
  </article>;
}

export function WhoWeAreSection() {
  return <section className="dipe-agency-intro dipe-web-container" id="quienes-somos" aria-labelledby="agency-about-title">
    <header className="dipe-agency-intro__heading">
      <h2 id="agency-about-title">Quiénes somos<br />(versión café corto)</h2>
      <p>Equipo senior, cercano y alérgico a los “ya si eso”. Diseñamos, desarrollamos y medimos: web corporativa en <strong>WordPress</strong>, ecommerce en <strong>PrestaShop</strong> y proyectos con acento local de <strong>Diseño web Salamanca</strong>. Trabajamos por sprints, enseñamos progreso y llegamos a tiempo (sí, pasa).</p>
    </header>
    <div className="dipe-agency-intro__values">
      <AgencyValueCard className="dipe-agency-value--mission" image={media.mission} title="Misión">
        <p>Ayudar a empresas y startups a tener <strong>presencia online profesional, traducir el mundo online y acompañar su digitalización</strong> de principio a fin. Si la web no mueve negocio, la cambiamos hasta que lo haga.</p>
      </AgencyValueCard>
      <AgencyValueCard className="dipe-agency-value--vision" image={media.vision} title="Visión">
        <p>Ser la <strong>agencia de referencia</strong> para quien busca proyectos bien hechos, medibles y sin dramas, creando relaciones largas basadas en confianza y datos (los buenos, no los que “más bonitos quedan”).</p>
      </AgencyValueCard>
      <AgencyValueCard className="dipe-agency-value--values" image={media.values} title="Valores">
        <ul>
          <li><strong>Profesionalidad:</strong> método, transparencia y entregas que se usan.</li>
          <li><strong>Implicación real:</strong> nos metemos hasta la cocina (y fregamos al salir).</li>
          <li><strong>Servicio 360 con cabeza:</strong> Desarrollo web con WordPress, Desarrollo web con PrestaShop, Transformación Digital y marketing… lo justo para aportar valor.</li>
        </ul>
      </AgencyValueCard>
    </div>
  </section>;
}
