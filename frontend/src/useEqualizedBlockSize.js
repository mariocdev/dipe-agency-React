import { useLayoutEffect, useRef } from 'react';

export function useEqualizedBlockSize(selector) {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let frame = 0;
    const equalize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const elements = [...container.querySelectorAll(selector)];
        if (elements.length === 0) return;

        elements.forEach((element) => { element.style.blockSize = 'auto'; });
        const tallest = Math.max(...elements.map((element) => element.getBoundingClientRect().height));
        elements.forEach((element) => { element.style.blockSize = `${tallest}px`; });
      });
    };

    const observer = 'ResizeObserver' in window ? new ResizeObserver(equalize) : null;
    observer?.observe(container);
    window.addEventListener('resize', equalize);
    document.fonts?.ready.then(equalize);
    equalize();

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', equalize);
    };
  }, [selector]);

  return containerRef;
}
