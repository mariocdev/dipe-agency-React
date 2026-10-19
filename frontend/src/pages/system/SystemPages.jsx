import { FitText } from '../../components/content/FitText';
import { ResponsiveTitle as ResponsiveText } from '../../components/content/ResponsiveTitle';
import { sitePath } from '../../lib/site';
import { systemMedia } from './systemMedia';
import './SystemPages.css';

function MessagePage({ title, children, background }) {
  return <section className="dipe-system-page" aria-labelledby="system-page-title" style={{ backgroundImage: `url("${background}")` }}>
    <div className="dipe-system-page__inner">
      <FitText as="h1" className="dipe-system-page__title">{title}</FitText>
      <p className="dipe-system-page__description"><ResponsiveText>{children}</ResponsiveText></p>
      <a className="dipe-system-page__button" href={sitePath('/')}>Volver al inicio</a>
    </div>
  </section>;
}

export function NotFoundPage() {
  return <MessagePage title="Página no encontrada" background={systemMedia.notFound}>
    ¡Vaya! Parece que no hemos conseguido localizar<br />la página que estás buscando.
  </MessagePage>;
}

export function ThankYouPage({ title }) {
  return <MessagePage title={title} background={systemMedia.thankYou}>
    Hemos recibido tu mensaje. Nos pondremos en contacto contigo a la mayor brevedad posible.
  </MessagePage>;
}
