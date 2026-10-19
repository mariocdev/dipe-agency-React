import { useRef, useState } from 'react';
import { submitContactForm } from '../../lib/api';
import { redirectToFormThankYou } from '../../lib/formThankYou';
import { sitePath } from '../../lib/site';
import './ContactSection.css';

const initialSubmissionState = { status: 'idle', message: '', fields: {} };
const defaultIntro = <>
  <p><strong>Solicita una auditoría o presupuesto</strong></p>
  <p>Cuéntanos tu objetivo y te devolvemos un plan claro (fases, tiempos y presupuesto). Somos tu Agencia de desarrollo web para crecer con cabeza… y un poco de chispa.</p>
</>;

export function ContactSection({ source = 'home', formType = 'contacto', title = '¿Hablamos?', intro = defaultIntro, hideDetails = false }) {
  const [submission, setSubmission] = useState(initialSubmissionState);
  const submitting = useRef(false);

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
    setSubmission({ status: 'sending', message: '', fields: {} });

    try {
      const response = await submitContactForm({
        nombre: values.get('nombre'),
        email: values.get('email'),
        telefono: values.get('telefono'),
        mensaje: values.get('mensaje'),
        privacidad: values.get('privacidad') === 'accepted',
        company: values.get('company'),
        origen: source,
        url_origen: `${window.location.origin}${window.location.pathname}`,
      }, formType);
      form.reset();
      setSubmission({
        status: 'success',
        message: response.message || 'Gracias. Hemos recibido tu mensaje.',
        fields: {},
      });
      redirectToFormThankYou(response.redirect_url);
    } catch (error) {
      setSubmission({
        status: 'error',
        message: error.message || 'No se ha podido enviar el mensaje. Inténtalo de nuevo.',
        fields: error.fields || {},
      });
    } finally {
      submitting.current = false;
    }
  };

  return <section className="dipe-contact" aria-labelledby="contact-title">
    <div className="dipe-contact__inner">
      <div className="dipe-contact__details">
        <h2 id="contact-title">{title}</h2>
        <div className="dipe-contact__intro">
          {intro}
        </div>
        {!hideDetails && <>
          <address className="dipe-contact__address">
            <a href="https://maps.app.goo.gl/JjwyyDkWYmNgW6F26/" target="_blank" rel="nofollow noopener noreferrer">
              Oficina Salamanca<br />
              Jesús Arambarri, 33 – 37003 Salamanca
            </a>
          </address>
          <a className="dipe-contact__link" href="tel:+34923623738" target="_blank" rel="nofollow noopener noreferrer">(+34) 923 623 738</a>
          <a className="dipe-contact__link" href="mailto:info@dipe.es" target="_blank" rel="nofollow noopener noreferrer">info@dipe.es</a>
        </>}
      </div>

      <div className="dipe-contact__form-panel">
        <form className="dipe-contact__form" onSubmit={handleSubmit} noValidate>
          <div className="dipe-contact__field dipe-contact__field--full">
            <label className="visually-hidden" htmlFor="contact-name">Nombre</label>
            <input aria-invalid={submission.fields.nombre ? 'true' : undefined} autoComplete="name" id="contact-name" maxLength="160" name="nombre" placeholder="Nombre:" required type="text" />
          </div>
          <div className="dipe-contact__field">
            <label className="visually-hidden" htmlFor="contact-email">Email</label>
            <input aria-invalid={submission.fields.email ? 'true' : undefined} autoComplete="email" id="contact-email" maxLength="254" name="email" placeholder="Email:" required type="email" />
          </div>
          <div className="dipe-contact__field">
            <label className="visually-hidden" htmlFor="contact-phone">Teléfono</label>
            <input aria-invalid={submission.fields.telefono ? 'true' : undefined} autoComplete="tel" id="contact-phone" maxLength="50" name="telefono" placeholder="Teléfono:" required type="tel" />
          </div>
          <div className="dipe-contact__field dipe-contact__field--full">
            <label className="visually-hidden" htmlFor="contact-message">Mensaje</label>
            <textarea aria-invalid={submission.fields.mensaje ? 'true' : undefined} id="contact-message" maxLength="5000" name="mensaje" placeholder="Mensaje:" required rows="6" />
          </div>
          <div className="dipe-contact__honeypot" aria-hidden="true">
            <label htmlFor="contact-company">Empresa</label>
            <input autoComplete="off" id="contact-company" name="company" tabIndex="-1" type="text" />
          </div>
          <div className="dipe-contact__consent dipe-contact__field--full">
            <input aria-invalid={submission.fields.privacidad ? 'true' : undefined} id="contact-privacy" name="privacidad" required type="checkbox" value="accepted" />
            <label htmlFor="contact-privacy">He leído y acepto los términos y condiciones de la <a href={sitePath('/politica-de-privacidad/')} target="_blank" rel="nofollow noopener noreferrer">política de privacidad</a></label>
          </div>
          <div className="dipe-contact__field--full">
            <button disabled={submission.status === 'sending'} type="submit">{submission.status === 'sending' ? 'Enviando…' : 'Enviar'}</button>
          </div>
          {submission.status !== 'idle' && <p className={`dipe-contact__status is-${submission.status}`} role={submission.status === 'error' ? 'alert' : 'status'}>{submission.message}</p>}
        </form>
      </div>
    </div>
  </section>;
}
