import { useEqualizedBlockSize } from '../../../hooks/useEqualizedBlockSize';
import { sitePath } from '../../../lib/site';

function ServiceCard({ card }) {
  return <article className={`dipe-service-card dipe-service-card--${card.backgroundPosition}`}>
    <img className="dipe-service-card__background-icon" src={card.backgroundIcon} alt="" aria-hidden="true" />
    <div className="dipe-service-card__content">
      <div className="dipe-service-card__heading">
        <h3 className="dipe-equalize-title">{card.title}</h3>
        <img className="dipe-service-card__heading-icon" src={card.headingIcon} alt="" aria-hidden="true" />
      </div>
      <ul className="dipe-service-card__list">
        {card.items.map((item) => <li key={item.label}><a href={sitePath(item.href || '#')}>{item.label}</a></li>)}
      </ul>
    </div>
  </article>;
}

export function ServiceCardsSection({ title, cards }) {
  const gridRef = useEqualizedBlockSize('.dipe-equalize-title');

  return <section className="dipe-services" aria-labelledby="dipe-services-title">
    <div className="dipe-services__inner">
      <h2 className="dipe-services__title" id="dipe-services-title">{title}</h2>
      <div className="dipe-services__grid" ref={gridRef}>
        {cards.map((card) => <ServiceCard card={card} key={card.id} />)}
      </div>
    </div>
  </section>;
}
