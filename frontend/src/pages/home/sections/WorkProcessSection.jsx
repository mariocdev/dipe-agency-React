import { useEqualizedBlockSize } from '../../../hooks/useEqualizedBlockSize';
import { ResponsiveTitle } from '../../../components/content/ResponsiveTitle';
import { useDeferredMedia } from '../../../hooks/useDeferredMedia';

function WorkProcessCard({ step }) {
  return <article className="dipe-work-process__card">
    <img className="dipe-work-process__icon" src={step.icon} alt="" aria-hidden="true" loading="lazy" decoding="async" />
    <h3 className="dipe-equalize-title">{step.title}</h3>
    <p>{step.description}</p>
  </article>;
}

export function WorkProcessSection({ imageSrc, videoSrc, title, steps }) {
  const gridRef = useEqualizedBlockSize('.dipe-equalize-title');
  const [mediaRef, mediaReady] = useDeferredMedia();

  return <section className="dipe-work-process">
    <div className="dipe-work-process__visual" ref={mediaRef}>
      {videoSrc
        ? mediaReady && <video autoPlay loop muted playsInline preload="metadata" poster={imageSrc} aria-hidden="true">
          <source src={videoSrc} type="video/mp4" />
        </video>
        : imageSrc
          ? mediaReady && <img src={imageSrc} alt="" decoding="async" />
          : <span className="dipe-work-process__placeholder" aria-hidden="true">Imagen o vídeo pendiente</span>}
    </div>
    <div className="dipe-work-process__panel">
      <div className="dipe-work-process__content">
        <h2><ResponsiveTitle>{title}</ResponsiveTitle></h2>
        <div className="dipe-work-process__grid" ref={gridRef}>
          {steps.map((step) => <WorkProcessCard key={step.title} step={step} />)}
        </div>
      </div>
    </div>
  </section>;
}
