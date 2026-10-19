import { useEffect, useRef, useState } from 'react';
import { getRelatedServiceTerms, plainText, submitContactForm } from '../../lib/api';
import { redirectToFormThankYou } from '../../lib/formThankYou';
import { sitePath } from '../../lib/site';
import { contactMedia as media } from './contactMedia';

export const contactFaqs = [
  {
    id: 'contact-response', question: '¿En cuánto tiempo respondéis?',
    answerText: 'Normalmente en menos de 24h laborables. Si es urgente, dilo en el asunto y priorizamos.',
    answer: <>Normalmente en <strong>menos de 24h laborables.</strong> Si es urgente, dilo en el asunto y priorizamos.</>,
  },
  // Borradores autorizados por el usuario: pendientes de revisión editorial.
  {
    id: 'contact-briefing', question: '¿Necesitáis un briefing perfecto?',
    answerText: 'No hace falta tenerlo todo resuelto. Cuéntanos qué quieres conseguir, qué tienes ahora y qué te está frenando. A partir de ahí, concretamos juntos el alcance y los siguientes pasos.',
  },
  {
    id: 'contact-nda', question: '¿Hacéis NDA?',
    answerText: 'Si tu proyecto necesita un acuerdo de confidencialidad, indícalo al contactar. Lo revisamos contigo antes de compartir información sensible y acordamos cómo avanzar.',
  },
  {
    id: 'contact-budget', question: '¿Presupuesto cerrado o “ya veremos”?',
    answerText: 'Primero concretamos objetivos y alcance para preparar una propuesta con fases, tiempos y presupuesto. Si aparecen nuevas necesidades, las revisamos contigo antes de incorporarlas.',
  },
  {
    id: 'contact-location', question: '¿Trabajáis solo en Salamanca?',
    answerText: 'Podemos hablar de tu proyecto por llamada o videollamada. Cuéntanos dónde está tu equipo y cómo preferís coordinaros para acordar una forma de trabajo que encaje.',
  },
  {
    id: 'contact-maintenance', question: '¿Podéis mantener mi web actual?',
    answerText: 'Cuéntanos con qué tecnología está hecha y qué necesitas mejorar. Revisamos su situación para proponerte el mantenimiento o la evolución que tenga sentido para tu proyecto.',
  },
  {
    id: 'contact-marketing', question: '¿También lleváis el marketing?',
    answerText: 'Sí: SEO, SEM, redes sociales e inbound marketing. Cuéntanos tus objetivos y vemos cómo coordinar la web y el marketing para trabajar con una dirección clara.',
  },
].map((faq) => ({ ...faq, answer: faq.answer || faq.answerText }));

const channels = [
  {
    id: 'form', title: 'Formulario (la vía rápida)',
    description: 'Cuéntanos lo mínimo para ayudarte bien. Prometemos leerlo todo (aunque uses mayúsculas).',
    label: 'Contactar por formulario', href: '#formulario-contacto',
  },
  {
    id: 'call', title: 'Llamada o videollamada',
    description: 'Si lo quieres resolver “a viva voz”, agenda 15–20 minutos. Vamos al grano.',
    label: 'Solicitar una llamada gratuita',
  },
  {
    id: 'email', title: 'Email directo',
    description: '¿Adjuntos y contexto largo? Perfecto.',
    label: 'Enviar email', href: 'mailto:info@dipe.es',
  },
];

export function ContactChannels({ bookingUrl }) {
  return <section className="dipe-contact-channels" aria-labelledby="contact-channels-title">
    <div className="dipe-web-container">
      <h2 id="contact-channels-title">Cómo prefieres hablar</h2>
      <div className="dipe-contact-channels__grid">
        {channels.map((channel) => {
          const href = channel.id === 'call' ? bookingUrl : channel.href;
          const icon = media.channelIcons[channel.id];
          return <article className="dipe-contact-channel" key={channel.id}>
            <div className="dipe-contact-channel__icon" aria-hidden="true">
              {icon && <img src={icon} alt="" />}
            </div>
            <h3>{channel.title}</h3>
            <p>{channel.description}</p>
            {href ? <a href={href}>{channel.label}</a> : <button type="button" disabled>{channel.label}</button>}
          </article>;
        })}
      </div>
    </div>
  </section>;
}

const budgetNumber = new Intl.NumberFormat('es-ES', { useGrouping: 'always', minimumFractionDigits: 0 });
const budgetRanges = Array.from({ length: 10 }, (_, index) => {
  const min = index * 2000;
  const max = min + 2000;
  return { value: `${min}-${max}`, label: `${budgetNumber.format(min)} – ${budgetNumber.format(max)} €` };
});

export function ContactFormSection() {
  const [services, setServices] = useState([]);
  const [servicesStatus, setServicesStatus] = useState('loading');
  const [submission, setSubmission] = useState({ status: 'idle', message: '', fields: {} });
  const submitting = useRef(false);

  const fieldFeedback = (name) => ({
    'aria-invalid': submission.fields[name] ? 'true' : undefined,
    'aria-describedby': submission.fields[name] ? `contact-error-${name}` : undefined,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const values = new FormData(form);
    submitting.current = true;
    setSubmission({ status: 'sending', message: 'Enviando…', fields: {} });
    try {
      const response = await submitContactForm({
        nombre: values.get('nombre'),
        email: values.get('email'),
        telefono: values.get('telefono'),
        empresa_sector: values.get('empresa_sector'),
        interes: values.get('interes') || '',
        presupuesto: values.get('presupuesto'),
        objetivos: values.get('objetivos'),
        mensaje: values.get('mensaje'),
        privacidad: values.get('privacidad') === 'accepted',
        company: values.get('company'),
        origen: 'contacto-principal',
        url_origen: `${window.location.origin}${window.location.pathname}`,
      }, 'contacto-general');
      form.reset();
      setSubmission({ status: 'success', message: response.message || 'Gracias. Hemos recibido tu mensaje.', fields: {} });
      redirectToFormThankYou(response.redirect_url);
    } catch (error) {
      setSubmission({ status: 'error', message: error.message || 'No se ha podido enviar el mensaje. Inténtalo de nuevo.', fields: error.fields || {} });
    } finally {
      submitting.current = false;
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    getRelatedServiceTerms({ signal: controller.signal }).then((items) => {
      if (controller.signal.aborted) return;
      setServices(items);
      setServicesStatus('ready');
    }).catch(() => {
      if (!controller.signal.aborted) setServicesStatus('error');
    });
    return () => controller.abort();
  }, []);

  return <section
    className="dipe-contact-page-form"
    id="formulario-contacto"
    aria-labelledby="contact-page-form-title"
    style={media.formBackground ? { backgroundImage: `url("${media.formBackground}")` } : undefined}
  >
    <div className="dipe-web-container dipe-contact-page-form__layout">
      <aside className="dipe-contact-page-form__details" aria-labelledby="contact-location-title">
        <div className="dipe-contact-page-form__brand" aria-hidden="true">
          {media.brandImage && <img src={media.brandImage} alt="" />}
        </div>
        <h3 id="contact-location-title">También nos puedes encontrar</h3>
        <address>
          <a href="https://maps.app.goo.gl/JjwyyDkWYmNgW6F26/" target="_blank" rel="nofollow noopener noreferrer">Oficina Salamanca<br />Jesús Arambarri, 33 – 37003 Salamanca</a>
        </address>
        <a href="tel:+34923623738">(+34) 923 623 738</a>
        <a href="mailto:info@dipe.es">info@dipe.es</a>
      </aside>
      <div>
        <h2 id="contact-page-form-title">Formulario de contacto</h2>
        <form className="dipe-contact-page-form__fields" onSubmit={handleSubmit} noValidate aria-busy={submission.status === 'sending'}>
          <div>
            <label className="visually-hidden" htmlFor="page-contact-name">Nombre y apellidos (obligatorio)</label>
            <input {...fieldFeedback('nombre')} id="page-contact-name" name="nombre" placeholder="Nombre y apellidos*" autoComplete="name" minLength={2} maxLength={160} required />
          </div>
          <div>
            <label className="visually-hidden" htmlFor="page-contact-email">Email (obligatorio)</label>
            <input {...fieldFeedback('email')} id="page-contact-email" name="email" type="email" placeholder="Email*" autoComplete="email" maxLength={254} required />
          </div>
          <div>
            <label className="visually-hidden" htmlFor="page-contact-phone">Teléfono</label>
            <input {...fieldFeedback('telefono')} id="page-contact-phone" name="telefono" type="tel" placeholder="Teléfono" autoComplete="tel" minLength={3} maxLength={50} />
          </div>
          <div>
            <label className="visually-hidden" htmlFor="page-contact-business">Empresa y sector</label>
            <input {...fieldFeedback('empresa_sector')} id="page-contact-business" name="empresa_sector" placeholder="Empresa y sector" maxLength={250} />
          </div>
          <div>
            <label className="visually-hidden" htmlFor="page-contact-interest">Estoy interesado en…</label>
            <div className="dipe-contact-page-form__select">
              <select {...fieldFeedback('interes')} id="page-contact-interest" name="interes" defaultValue="" disabled={servicesStatus !== 'ready' || services.length === 0} aria-busy={servicesStatus === 'loading'} aria-describedby={submission.fields.interes ? 'contact-error-interes' : servicesStatus === 'error' ? 'contact-services-error' : undefined}>
                <option value="">{servicesStatus === 'loading' ? 'Cargando servicios…' : servicesStatus === 'error' ? 'Servicios no disponibles' : services.length === 0 ? 'No hay servicios disponibles' : 'Estoy interesado en…'}</option>
                {services.map((service) => <option key={service.id} value={service.id}>{plainText(service.name)}</option>)}
              </select>
            </div>
            {servicesStatus === 'error' && <p className="dipe-contact-page-form__note" id="contact-services-error" role="status">No se han podido cargar los servicios. Puedes indicar tu interés en el mensaje.</p>}
          </div>
          <div>
            <label className="visually-hidden" htmlFor="page-contact-budget">Presupuesto estimado</label>
            <div className="dipe-contact-page-form__select">
              <select {...fieldFeedback('presupuesto')} id="page-contact-budget" name="presupuesto" defaultValue="">
                <option value="">Presupuesto estimado</option>
                {budgetRanges.map((range) => <option key={range.value} value={range.value}>{range.label}</option>)}
                <option value="20000+">20.000 € o más</option>
              </select>
            </div>
          </div>
          <div className="dipe-contact-page-form__full">
            <label className="visually-hidden" htmlFor="page-contact-goals">Objetivos/KPIs</label>
            <textarea {...fieldFeedback('objetivos')} id="page-contact-goals" name="objetivos" placeholder="Objetivos/KPIs" rows={3} maxLength={5000} />
          </div>
          <div className="dipe-contact-page-form__full">
            <label className="visually-hidden" htmlFor="page-contact-message">Mensaje</label>
            <textarea {...fieldFeedback('mensaje')} id="page-contact-message" name="mensaje" placeholder="Mensaje" rows={3} maxLength={5000} />
          </div>
          <div className="dipe-contact-page-form__honeypot" aria-hidden="true">
            <label htmlFor="page-contact-company">Empresa</label>
            <input id="page-contact-company" name="company" autoComplete="off" tabIndex={-1} type="text" />
          </div>
          <div className="dipe-contact-page-form__consent dipe-contact-page-form__full">
            <input {...fieldFeedback('privacidad')} id="page-contact-privacy" name="privacidad" type="checkbox" value="accepted" required />
            <label htmlFor="page-contact-privacy">He leído y acepto los términos y condiciones de la <a href={sitePath('/politica-de-privacidad/')} target="_blank" rel="nofollow noopener noreferrer">política de privacidad</a></label>
          </div>
          <div className="dipe-contact-page-form__full">
            <button className="dipe-contact-page-form__submit" type="submit" disabled={submission.status === 'sending'}>{submission.status === 'sending' ? 'Enviando…' : 'Enviar'}</button>
          </div>
          {submission.status !== 'idle' && <div className={`dipe-contact-page-form__status dipe-contact-page-form__full is-${submission.status}`} role={submission.status === 'error' ? 'alert' : 'status'}>
            <p>{submission.message}</p>
            {Object.keys(submission.fields).length > 0 && <ul>
              {Object.entries(submission.fields).map(([name, message]) => <li id={`contact-error-${name}`} key={name}>{message}</li>)}
            </ul>}
          </div>}
        </form>
      </div>
    </div>
  </section>;
}
