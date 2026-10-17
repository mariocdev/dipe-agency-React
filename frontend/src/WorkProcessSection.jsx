import { useEqualizedBlockSize } from './useEqualizedBlockSize';

function WorkProcessCard({ step }) {
  return <article className="dipe-work-process__card">
    <img className="dipe-work-process__icon" src={step.icon} alt="" aria-hidden="true" />
    <h3 className="dipe-equalize-title">{step.title}</h3>
    <p>{step.description}</p>
  </article>;
}

export function WorkProcessSection({ imageSrc, title, steps }) {
  const gridRef = useEqualizedBlockSize('.dipe-equalize-title');

  return <section className="dipe-work-process">
    <div className="dipe-work-process__visual">
      <img src={imageSrc} alt="" />
    </div>
    <div className="dipe-work-process__panel">
      <div className="dipe-work-process__content">
        <h2>{title}</h2>
        <div className="dipe-work-process__grid" ref={gridRef}>
          {steps.map((step) => <WorkProcessCard key={step.title} step={step} />)}
        </div>
      </div>
    </div>
  </section>;
}
