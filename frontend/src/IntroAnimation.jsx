import { useEffect, useRef, useState } from 'react';
import { siteConfig } from './site';
import './IntroAnimation.css';

export function IntroAnimation({ onComplete }) {
  const rootRef = useRef(null);
  const [sequenceDone, setSequenceDone] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const logo = siteConfig.logo || {};

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
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
    import('gsap').then(({ gsap }) => {
      if (!active || !rootRef.current) return;
      exit = gsap.to(rootRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: 'power3.inOut',
        onComplete: () => { if (active) onComplete(); },
      });
    }).catch(() => { if (active) onComplete(); });

    return () => {
      active = false;
      exit?.kill();
    };
  }, [sequenceDone, onComplete]);

  return <div className="dipe-intro" role="status" aria-label="Entrando en Dipe Agency" ref={rootRef}>
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
