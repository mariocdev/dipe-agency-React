import { useLayoutEffect, useRef } from 'react';
import { responsiveTitleContent } from './ResponsiveTitle';

// Conserva los <br> editoriales. Al alcanzar el mínimo responsive permite envolver.
export function FitText({ as: Tag = 'span', children, className, maxFontSize, onSizeChange }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    let active = true;
    let frame = 0;
    let observedWidth;

    const fit = () => {
      if (!active) return;
      // Recupera el máximo definido por el CSS actual, también al ensanchar.
      element.style.removeProperty('font-size');
      element.removeAttribute('data-responsive-title-flow');
      element.style.whiteSpace = 'nowrap';
      element.style.overflowWrap = 'normal';
      const width = element.clientWidth;
      const computed = getComputedStyle(element);
      const cssMaximum = parseFloat(computed.fontSize);
      if (!width || !cssMaximum) return;
      // El tamaño móvil es fijo; los br solo se liberan si este título no cabe.
      if (computed.getPropertyValue('--dipe-fit-fixed').trim() === '1') {
        if (element.scrollWidth > width) {
          element.setAttribute('data-responsive-title-flow', '');
          element.style.whiteSpace = 'normal';
          element.style.overflowWrap = 'anywhere';
        }
        onSizeChange?.(cssMaximum);
        return;
      }
      const maximum = Math.min(cssMaximum, maxFontSize > 0 ? maxFontSize : cssMaximum);
      const floor = Math.min(maximum, parseFloat(computed.getPropertyValue('--dipe-fit-min-size')) || 1);
      if (maximum < cssMaximum) element.style.fontSize = `${maximum}px`;
      if (element.scrollWidth <= width) {
        onSizeChange?.(maximum);
        return;
      }

      // Busca el mayor tamaño entero que cabe, sin recorrer todos los píxeles.
      let minimum = Math.ceil(floor);
      let upper = Math.floor(maximum);
      let fitted = floor;
      while (minimum <= upper) {
        const size = Math.floor((minimum + upper) / 2);
        element.style.fontSize = `${size}px`;
        if (element.scrollWidth <= width) {
          fitted = size;
          minimum = size + 1;
        } else {
          upper = size - 1;
        }
      }
      element.style.fontSize = `${fitted}px`;
      if (floor > 1 && element.scrollWidth > width) {
        element.setAttribute('data-responsive-title-flow', '');
        element.style.whiteSpace = 'normal';
        element.style.overflowWrap = 'anywhere';
      }
      onSizeChange?.(fitted);
    };

    const scheduleFit = () => {
      if (!active) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(([entry]) => {
      // Cambiar la altura del texto no debe iniciar otro ajuste.
      if (entry.contentRect.width === observedWidth) return;
      observedWidth = entry.contentRect.width;
      scheduleFit();
    }) : null;

    fit();
    observer?.observe(element);
    window.addEventListener('resize', scheduleFit);
    document.fonts?.ready.then(scheduleFit);
    document.fonts?.addEventListener('loadingdone', scheduleFit);

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', scheduleFit);
      document.fonts?.removeEventListener('loadingdone', scheduleFit);
    };
  }, [children, maxFontSize, onSizeChange]);

  return <Tag ref={ref} className={className} style={{ display: 'block', minWidth: 0, maxWidth: '100%', whiteSpace: 'nowrap', overflowWrap: 'normal', wordBreak: 'normal' }}>{responsiveTitleContent(children)}</Tag>;
}
