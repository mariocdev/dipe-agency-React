import { useId } from 'react';
import { ResponsiveTitle } from '../../components/content/ResponsiveTitle';
import { useEqualizedBlockSize } from '../../hooks/useEqualizedBlockSize';
import { sitePath } from '../../lib/site';
import { digitalTransformationMedia as media } from './digitalTransformationMedia';

const features = [
  { title: 'Mapa de procesos y KPIs', description: 'Ventas, compras, inventario, atención, finanzas… Dibujamos el “antes” y el “después” con números.' },
  { title: 'Integraciones y automatización', description: <><strong>Que el ERP, CRM, web y logística</strong> hablen solos. Disparamos tareas cuando toca y medimos todo.</> },
  { title: 'Entrega por fases', description: 'Sprints cortos + valor pronto. Nada de “nos vemos en seis meses”.' },
];

const solutions = [
  {
    id: 'odoo', title: 'Odoo', lead: 'Centraliza la gestión de tu negocio.', technology: 'Odoo',
    description: <><p>Implantamos y adaptamos Odoo para gestionar desde un mismo entorno áreas como ventas, clientes, facturación, compras, inventario o procesos internos.</p><p>Menos información repetida entre herramientas. Más control sobre lo que ocurre en tu empresa.</p></>,
  },
  {
    id: 'web', title: 'Desarrollo de Aplicaciones Web', lead: 'Cuando una herramienta estándar se queda corta.', technology: 'Laravel · React',
    description: <p>Desarrollamos aplicaciones web a medida para digitalizar procesos, gestionar información, crear áreas privadas o resolver necesidades específicas de tu negocio. La herramienta se adapta a tu forma de trabajar. No al revés.</p>,
  },
  {
    id: 'mobile', title: 'Desarrollo de aplicaciones móviles', lead: 'Cuando el proceso necesita acompañarte allá donde estés.', technology: 'iOS · Android · PWA',
    description: <><p>Creamos aplicaciones móviles para clientes, equipos o procesos que necesitan funcionar desde cualquier lugar.</p><p>Diseñamos la solución alrededor de quién va a utilizarla, qué necesita hacer y cómo debe conectarse con el resto de herramientas del negocio.</p></>,
  },
];

// Maqueta independiente: este conjunto de campos todavía no tiene contrato de envío aprobado.
export function DigitalEnquiryForm() {
  const id = useId();
  const fields = [
    { key: 'nombre', label: 'Nombre*', type: 'text', autoComplete: 'name', full: true, required: true },
    { key: 'email', label: 'Email*', type: 'email', autoComplete: 'email', required: true },
    { key: 'telefono', label: 'Teléfono*', type: 'tel', autoComplete: 'tel', required: true },
    { key: 'empresa', label: 'Empresa', type: 'text', autoComplete: 'organization' },
    { key: 'dominio', label: 'Dominio de tu web', type: 'text', autoComplete: 'url' },
  ];

  return <div className="dipe-digital-form">
    <form aria-describedby={`${id}-pending`} onSubmit={(event) => event.preventDefault()}>
      {fields.map((field) => <div key={field.key} className={field.full ? 'dipe-digital-form__full' : undefined}>
        <label className="visually-hidden" htmlFor={`${id}-${field.key}`}>{field.label}</label>
        <input id={`${id}-${field.key}`} name={field.key} placeholder={field.label} type={field.type} autoComplete={field.autoComplete} required={field.required} />
      </div>)}
      <div className="dipe-digital-form__full">
        <label className="visually-hidden" htmlFor={`${id}-mensaje`}>Mensaje*</label>
        <textarea id={`${id}-mensaje`} name="mensaje" placeholder="Mensaje*" rows="4" required />
      </div>
      <div className="dipe-digital-form__consent dipe-digital-form__full">
        <input id={`${id}-privacidad`} type="checkbox" required />
        <label htmlFor={`${id}-privacidad`}>He leído y acepto los términos y condiciones de la <a href={sitePath('/politica-de-privacidad/')} target="_blank" rel="nofollow noopener noreferrer">política de privacidad</a></label>
      </div>
      <div className="dipe-digital-form__full"><button type="submit" disabled>Enviar</button></div>
      <p className="dipe-digital-form__pending dipe-digital-form__full" id={`${id}-pending`}>Formulario pendiente de activación.</p>
    </form>
  </div>;
}

export function DigitalHero() {
  return <header className="dipe-digital-hero" style={media.heroImage ? { backgroundImage: `url("${media.heroImage}")` } : undefined}>
    <div className="dipe-digital-container dipe-digital-hero__inner">
      <div><h1>Transformación Digital</h1><p>Te ayudamos a digitalizar procesos, conectar herramientas y automatizar tareas para que tu equipo pierda menos tiempo gestionando y pueda dedicarlo a hacer avanzar el negocio.</p></div>
    </div>
  </header>;
}

export function DigitalBenefits() {
  return <section className="dipe-digital-benefits dipe-digital-container" aria-labelledby="digital-benefits-title">
    <h2 id="digital-benefits-title"><ResponsiveTitle>¿Dónde se te está yendo el tiempo?<br />(beneficios/utilidad)</ResponsiveTitle></h2>
    <p><strong>Hay tareas que debería hacer tu equipo. Y otras que debería hacer la tecnología.</strong></p>
    <p>Copiar datos de un sitio a otro, actualizar Excels, buscar información en varias herramientas o repetir el mismo proceso una y otra vez consume tiempo y genera errores.</p>
    <div className="dipe-digital-benefits__note">
      <h3>La transformación digital empieza por detectar qué está frenando el trabajo 💡</h3>
      <p>y buscar una forma más sencilla y eficiente de hacerlo. Procesos, herramientas e información tienen que trabajar juntos para reducir tareas manuales, evitar duplicidades y hacer el día a día más ágil.</p>
    </div>
  </section>;
}

export function DigitalIncludes() {
  return <section className="dipe-digital-includes" style={{ backgroundImage: `url("${media.includesBackground}")` }} aria-labelledby="digital-includes-title">
    <div className="dipe-digital-container dipe-digital-includes__inner">
      <div><h2 id="digital-includes-title"><ResponsiveTitle>Qué entendemos por<br />Transformación Digital</ResponsiveTitle></h2><a className="dipe-digital-button" href="#digital-contacto">Solicita una auditoría gratuita</a></div>
      <div className="dipe-digital-includes__grid">{features.map((feature, index) => <article className="dipe-digital-feature" key={feature.title}>
        <img src={media.featureIcons[index]} alt="" loading="lazy" /><h3>{feature.title}</h3><p>{feature.description}</p>
      </article>)}</div>
    </div>
  </section>;
}

export function DigitalSolutions() {
  const gridRef = useEqualizedBlockSize('.dipe-digital-solution__heading');
  return <section className="dipe-digital-solutions dipe-digital-container" aria-labelledby="digital-solutions-title">
    <header><p className="dipe-digital-eyebrow">Soluciones de transformación digital</p><h2 id="digital-solutions-title"><ResponsiveTitle>No todos los negocios necesitan digitalizar lo mismo</ResponsiveTitle></h2><p>Puede que necesites centralizar la gestión de tu empresa, conectar herramientas que ahora trabajan por separado o desarrollar una solución que no existe en el mercado.<br />Por eso buscamos la tecnología que mejor encaja con tus procesos, tus objetivos y la forma real en la que trabaja tu equipo.</p></header>
    <div className="dipe-digital-solutions__grid" ref={gridRef}>{solutions.map((solution) => <article className="dipe-digital-solution" key={solution.id}>
      <div className="dipe-digital-solution__heading"><h3>{solution.title}</h3><p><strong>{solution.lead}</strong></p></div>
      <div>{solution.description}</div>
      <div className="dipe-digital-solution__media">{media.solutionImages[solution.id] ? <img src={media.solutionImages[solution.id]} alt={solution.technology} loading="lazy" /> : <span>{solution.technology}<small>Imagen pendiente</small></span>}</div>
    </article>)}</div>
  </section>;
}
