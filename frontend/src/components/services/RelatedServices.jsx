import { plainText } from '../../lib/api';
import { sitePath } from '../../lib/site';
import './RelatedServices.css';

export function RelatedServices({ services = [] }) {
  const items = Array.isArray(services) ? services.filter((service) => service?.url) : [];
  if (items.length === 0) return null;

  return <section className="dipe-related-services" aria-label="Servicios relacionados">
    {items.map((service) => <div className="dipe-related-services__card" key={service.id}>
      <h2>{items.length === 1 ? 'Servicio relacionado' : plainText(service.name)}</h2>
      <a className="dipe-related-services__image" href={sitePath(service.url)} aria-label={`Ver ${plainText(service.name)}`}>
        {service.image?.url && <img src={service.image.url} alt={service.image.alt || ''} loading="lazy" decoding="async" />}
      </a>
      <a className="dipe-related-services__link" href={sitePath(service.url)}>{plainText(service.name)}</a>
    </div>)}
  </section>;
}
