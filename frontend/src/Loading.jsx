import { useEffect, useRef } from 'react';
import './Loading.css';

export function Loading({ compact = false }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let active = true;
    let context;

    import('gsap').then(({ gsap }) => {
      if (!active || !rootRef.current) return;

      context = gsap.context(() => {
        gsap.fromTo('.dipe-loader__bar',
          { scaleY: 0.35, opacity: 0.45 },
          { scaleY: 1, opacity: 1, duration: 0.55, stagger: 0.13, repeat: -1, yoyo: true, ease: 'power2.inOut' },
        );
        gsap.fromTo('.dipe-loader__progress',
          { scaleX: 0.2 },
          { scaleX: 1, duration: 1.1, repeat: -1, yoyo: true, ease: 'power2.inOut' },
        );
        gsap.from('.dipe-loader__caption', { y: 8, opacity: 0, duration: 0.45, ease: 'power2.out' });
      }, rootRef);
    });

    return () => {
      active = false;
      context?.revert();
    };
  }, []);

  return <div className={`dipe-loader${compact ? ' dipe-loader--compact' : ''}`} role="status" aria-label="Cargando contenido" ref={rootRef}>
    <div className="dipe-loader__mark" aria-hidden="true">
      <span className="dipe-loader__bar" />
      <span className="dipe-loader__bar" />
      <span className="dipe-loader__bar" />
    </div>
    <span className="dipe-loader__caption" aria-hidden="true">Cargando</span>
    <span className="dipe-loader__track" aria-hidden="true"><span className="dipe-loader__progress" /></span>
  </div>;
}
