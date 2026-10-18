import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '../../lib/site';
import './IntroAnimation.css';

export function IntroAnimation({ onComplete }) {
  const rootRef = useRef(null);
  const restoreScrollRef = useRef(() => {});
  const [sequenceDone, setSequenceDone] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const logo = siteConfig.logo || {};

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    restoreScrollRef.current = () => { document.body.style.overflow = previousOverflow; };
    document.body.style.overflow = 'hidden';
    return () => restoreScrollRef.current();
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      return undefined;
    }

    let active = true;
    let timeline;

    import('gsap').then(({ gsap }) => {
      if (!active || !rootRef.current) return;

      const left = rootRef.current.querySelectorAll('.dipe-intro__bars--left .dipe-intro__bar');
      const right = rootRef.current.querySelectorAll('.dipe-intro__bars--right .dipe-intro__bar');
      const bars = [...left, ...right];
      const brand = rootRef.current.querySelector('.dipe-intro__brand');

      timeline = gsap.timeline({ onComplete: () => { if (active) setSequenceDone(true); } });
      timeline
        .fromTo(left, { x: -60, scaleY: 0.25, opacity: 0 }, { x: 0, scaleY: 1, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, 0)
        .fromTo(right, { x: 60, scaleY: 0.25, opacity: 0 }, { x: 0, scaleY: 1, opacity: 1, duration: 0.7, stagger: -0.1, ease: 'power3.out' }, 0)
        .fromTo(brand, { scale: 0.82, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.35)
        .to(bars, { scaleY: 0.45, duration: 0.35, stagger: { each: 0.08, from: 'center' }, repeat: 1, yoyo: true, ease: 'power2.inOut' }, 0.95)
        .to(bars, { scaleY: 0, opacity: 0, duration: 0.32, stagger: { each: 0.05, from: 'edges' }, ease: 'power2.in' }, 2.1)
        .to(brand, { scale: 1.05, duration: 0.3, ease: 'power2.out' }, 2.15);
    }).catch(() => { if (active) onComplete(); });

    return () => {
      active = false;
      timeline?.kill();
    };
  }, [onComplete]);

  useEffect(() => {
    if (!sequenceDone) return undefined;

    let active = true;
    let exit;
    let restoreHeaderLogo = () => {};
    const finishExit = () => {
      if (!active) return;
      active = false;
      exit?.kill();
      restoreHeaderLogo();
      onComplete();
    };

    import('gsap').then(({ gsap }) => {
      if (!active || !rootRef.current) return;
      const brand = rootRef.current.querySelector('.dipe-intro__brand');
      const image = brand.querySelector('img');
      const headerLogo = document.querySelector('.dipe-header__brand img');

      // Medir con el scrollbar restituido evita un salto de cabecera al retirar el loader.
      restoreScrollRef.current();
      exit = gsap.timeline({ onComplete: finishExit });

      if (image?.naturalWidth && headerLogo?.naturalWidth) {
        const source = image.getBoundingClientRect();
        const target = headerLogo.getBoundingClientRect();
        // object-fit puede dejar espacio dentro de la caja de la imagen del loader.
        const sourceWidth = Math.min(source.width, source.height * image.naturalWidth / image.naturalHeight);

        if (sourceWidth > 0 && target.width > 0 && target.height > 0) {
          const previousVisibility = headerLogo.style.visibility;
          restoreHeaderLogo = () => { headerLogo.style.visibility = previousVisibility; };
          headerLogo.style.visibility = 'hidden';

          exit
            .to(brand, {
              x: target.left + target.width / 2 - (source.left + source.width / 2),
              y: target.top + target.height / 2 - (source.top + source.height / 2),
              scale: Number(gsap.getProperty(brand, 'scaleX')) * target.width / sourceWidth,
              duration: 0.95,
              ease: 'power3.inOut',
            }, 0)
            .to(rootRef.current.querySelector('.dipe-intro__backdrop'), {
              opacity: 0.45, duration: 0.85, ease: 'sine.inOut',
            }, 0.05)
            // Retirar la capa solo después de que el logo haya terminado de encajar.
            .to(rootRef.current.querySelector('.dipe-intro__backdrop'), {
              opacity: 0, duration: 0.3, ease: 'sine.inOut',
            }, 0.95);

          // Si cambia el encuadre durante el viaje, mostrar el logo en su posición actual.
          window.addEventListener('resize', finishExit);
          window.addEventListener('scroll', finishExit, { passive: true });
          return;
        }
      }

      // Con un logo ausente o sin cargar, conservar una salida por fundido.
      exit.to(rootRef.current, { opacity: 0, duration: 0.75, ease: 'sine.inOut' });
    }).catch(finishExit);

    return () => {
      active = false;
      exit?.kill();
      restoreHeaderLogo();
      window.removeEventListener('resize', finishExit);
      window.removeEventListener('scroll', finishExit);
    };
  }, [sequenceDone, onComplete]);

  return <div className="dipe-intro" role="status" aria-label="Entrando en Dipe Agency" ref={rootRef}>
    <div className="dipe-intro__backdrop" aria-hidden="true" />
    <div className="dipe-intro__composition" aria-hidden="true">
      <div className="dipe-intro__bars dipe-intro__bars--left">
        <span className="dipe-intro__bar" /><span className="dipe-intro__bar" /><span className="dipe-intro__bar" />
      </div>
      <div className="dipe-intro__brand">
        {logo.url && !logoFailed
          ? <img src={logo.url} alt="" onError={() => setLogoFailed(true)} />
          : <span>Dipe Agency</span>}
      </div>
      <div className="dipe-intro__bars dipe-intro__bars--right">
        <span className="dipe-intro__bar" /><span className="dipe-intro__bar" /><span className="dipe-intro__bar" />
      </div>
    </div>
  </div>;
}
