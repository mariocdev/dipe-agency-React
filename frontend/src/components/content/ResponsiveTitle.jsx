import { Children, Fragment, isValidElement, useLayoutEffect, useRef } from 'react';
import './ResponsiveTitle.css';

// Separa los saltos editoriales de textos inline escritos en React.
export function responsiveTitleContent(children) {
  const lines = [[]];
  const collect = (content) => Children.forEach(content, (child) => {
    if (isValidElement(child) && child.type === Fragment) {
      collect(child.props.children);
    } else if (isValidElement(child) && child.type === 'br') {
      lines.push([]);
    } else {
      lines[lines.length - 1].push(child);
    }
  });
  collect(children);
  if (lines.length === 1) return children;

  return lines.map((line, index) => <Fragment key={index}>
    {index > 0 && <>
      <span className="dipe-title-break"><br /></span>
      <span className="dipe-title-space"> </span>
    </>}
    <span className="dipe-title-line">{Children.toArray(line)}</span>
  </Fragment>);
}

// Permite envolver las líneas editoriales cuando no caben en el contenedor.
export function ResponsiveTitle({ children }) {
  const ref = useRef(null);
  const content = responsiveTitleContent(children);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    let active = true;
    let frame = 0;
    let observedWidth;

    const update = () => {
      if (!active) return;
      const width = element.clientWidth;
      if (!width) return;
      // Mide cada línea editorial sin envolver, sin cambiar el tamaño de letra.
      element.setAttribute('data-responsive-title-measuring', '');
      const needsFlow = [...element.querySelectorAll(':scope > .dipe-title-line')]
        .some((line) => line.getBoundingClientRect().width > width + 0.5);
      element.removeAttribute('data-responsive-title-measuring');
      element.toggleAttribute('data-responsive-title-flow', needsFlow);
    };
    const schedule = () => {
      if (!active) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === observedWidth) return;
      observedWidth = entry.contentRect.width;
      schedule();
    }) : null;

    update();
    observer?.observe(element);
    window.addEventListener('resize', schedule);
    document.fonts?.ready.then(schedule);
    document.fonts?.addEventListener('loadingdone', schedule);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', schedule);
      document.fonts?.removeEventListener('loadingdone', schedule);
    };
  }, [children]);

  return content === children ? children : <span className="dipe-responsive-title" ref={ref}>{content}</span>;
}
