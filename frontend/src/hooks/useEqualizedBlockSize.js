import { useLayoutEffect, useRef } from 'react';

export function useEqualizedBlockSize(selector, contentKey, mediaQuery) {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const media = mediaQuery ? window.matchMedia(mediaQuery) : null;

    let frame = 0;
    let active = true;
    const equalize = () => {
      if (!active) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const elements = [...container.querySelectorAll(selector)];
        elements.forEach((element) => { element.style.removeProperty('block-size'); });
        if (media && !media.matches) return;
        const visibleElements = elements.filter((element) => element.getClientRects().length > 0);
        if (visibleElements.length < 2) return;

        // Medir las tarjetas hermanas evita depender del breakpoint o de la
        // alineación del texto; un carrusel horizontal sigue teniendo columnas.
        let layout = visibleElements[0].parentElement;
        while (!visibleElements.every((element) => layout.contains(element))) {
          layout = layout.parentElement;
        }
        const cards = visibleElements.map((element) => {
          let card = element;
          while (card.parentElement !== layout) card = card.parentElement;
          return card;
        });
        const firstLeft = cards[0].getBoundingClientRect().left;
        const hasColumns = cards.some((card) => Math.abs(card.getBoundingClientRect().left - firstLeft) > 1);
        if (!hasColumns) return;

        const tallest = Math.max(...visibleElements.map((element) => element.getBoundingClientRect().height));
        visibleElements.forEach((element) => { element.style.blockSize = `${tallest}px`; });
      });
    };

    const observer = 'ResizeObserver' in window ? new ResizeObserver(equalize) : null;
    observer?.observe(container);
    window.addEventListener('resize', equalize);
    media?.addEventListener('change', equalize);
    document.fonts?.ready.then(equalize);
    equalize();

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', equalize);
      media?.removeEventListener('change', equalize);
      container.querySelectorAll(selector).forEach((element) => { element.style.removeProperty('block-size'); });
    };
  }, [selector, contentKey, mediaQuery]);

  return containerRef;
}
