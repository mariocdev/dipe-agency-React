import { useEffect, useRef } from 'react';
import './PageContent.css';

// Títulos y tarjetas comparten una entrada vertical con escalonado al entrar juntos.
const revealSelector = [
  'section[aria-labelledby] h2[id]',
  '.dipe-work-process__content > h2',
  '.dipe-web-capabilities__group > h2',
  '.dipe-service-card',
  '.dipe-work-process__card',
  '.dipe-web-feature',
  '.dipe-web-path',
  '.dipe-web-case',
  '.dipe-agency-value',
  '.dipe-blog__card',
  '.dipe-blog-archive-card',
  '.dipe-featured-projects__item',
  '.dipe-projects-archive__item',
  '.dipe-contact-channel',
  '.dipe-related-services__card',
].join(', ');

const pendingClass = 'dipe-scroll-reveal--pending';
const enteringClass = 'dipe-scroll-reveal--entering';
const delayProperty = '--dipe-scroll-reveal-delay';

// Anima la entrada de títulos y tarjetas al aparecer durante el scroll.
export function PageContent({ children, effectsEnabled }) {
  const mainRef = useRef(null);

  useEffect(() => {
    const main = mainRef.current;
    if (!effectsEnabled || !main || !window.IntersectionObserver) return undefined;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const seen = new WeakSet();
    const tracked = new Set();
    const clearElement = (element) => {
      observer.unobserve(element);
      element.classList.remove(pendingClass, enteringClass);
      element.style.removeProperty(delayProperty);
      tracked.delete(element);
    };
    const clearAll = () => {
      tracked.forEach(clearElement);
    };
    const revealInset = () => Math.round(window.innerHeight * 0.2);
    const createObserver = () => new IntersectionObserver((entries) => {
      const groupCounts = new Map();
      // Orden de lectura, sin depender del orden de las notificaciones del observer.
      const ready = entries.filter(({ target, isIntersecting }) =>
        isIntersecting && target.classList.contains(pendingClass));
      ready.sort((a, b) => {
        const position = a.target.compareDocumentPosition(b.target);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });
      ready.forEach(({ target }) => {
        if (!target.classList.contains(pendingClass)) return;
        observer.unobserve(target);
        target.classList.remove(pendingClass);
        if (motionPreference.matches) clearElement(target);
        else {
          // Cada sección empieza su secuencia; limitar la espera en grupos grandes.
          const group = target.closest('section') || main;
          const index = groupCounts.get(group) || 0;
          target.style.setProperty(delayProperty, `${Math.min(index * 110, 440)}ms`);
          groupCounts.set(group, index + 1);
          target.classList.add(enteringClass);
        }
      });
    }, { threshold: 0, rootMargin: `0px 0px -${revealInset()}px 0px` });
    let observer = createObserver();

    const registerElement = (element) => {
      if (seen.has(element) || motionPreference.matches) return;
      seen.add(element);
      // Evitar entradas anidadas y dejar quietos el texto editorial y los laterales.
      if (element.closest('aside, .dipe-editorial-content')
        || element.parentElement?.closest(revealSelector)) return;

      const rect = element.getBoundingClientRect();
      // Conservar visible lo que ya ha pasado la línea de aparición al cargar.
      if (!rect.width || !rect.height || rect.top < window.innerHeight - revealInset()
        || element.contains(document.activeElement)) return;

      tracked.add(element);
      element.classList.add(pendingClass);
      observer.observe(element);
    };
    const registerTree = (node) => {
      if (!(node instanceof Element)) return;
      if (node.matches(revealSelector)) registerElement(node);
      node.querySelectorAll(revealSelector).forEach(registerElement);
    };

    registerTree(main);
    // REST puede incorporar bloques después del montaje; no observar estilos ni texto.
    const mutations = new MutationObserver((records) => {
      tracked.forEach((element) => {
        if (!main.contains(element)) clearElement(element);
      });
      records.forEach(({ addedNodes }) => addedNodes.forEach(registerTree));
    });
    mutations.observe(main, { childList: true, subtree: true });

    const finishAnimation = (event) => {
      if (event.animationName === 'dipe-scroll-reveal') clearElement(event.target);
    };
    const showFocusedBlock = (event) => {
      const block = event.target.closest(`.${pendingClass}, .${enteringClass}`);
      if (block) clearElement(block);
    };
    const updateMotionPreference = () => {
      if (motionPreference.matches) clearAll();
      else registerTree(main);
    };
    const restorePage = (event) => {
      if (event.persisted) clearAll();
    };
    const updateViewport = () => {
      observer.disconnect();
      observer = createObserver();
      tracked.forEach((element) => {
        if (element.classList.contains(pendingClass)) observer.observe(element);
      });
    };

    main.addEventListener('animationend', finishAnimation);
    main.addEventListener('focusin', showFocusedBlock);
    motionPreference.addEventListener('change', updateMotionPreference);
    window.addEventListener('pageshow', restorePage);
    window.addEventListener('resize', updateViewport);

    return () => {
      mutations.disconnect();
      clearAll();
      observer.disconnect();
      main.removeEventListener('animationend', finishAnimation);
      main.removeEventListener('focusin', showFocusedBlock);
      motionPreference.removeEventListener('change', updateMotionPreference);
      window.removeEventListener('pageshow', restorePage);
      window.removeEventListener('resize', updateViewport);
    };
  }, [effectsEnabled]);

  return <main ref={mainRef}>{children}</main>;
}
