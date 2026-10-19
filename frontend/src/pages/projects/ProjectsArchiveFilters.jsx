import { useLayoutEffect, useRef, useState } from 'react';

const minimumFontSize = 16;
const minimumPadding = 20;

export function ProjectsArchiveFilters({ options, categories, filter, onChange }) {
  const containerRef = useRef(null);
  const buttonsRef = useRef(null);
  const selectRef = useRef(null);
  const focusAfterResizeRef = useRef(false);
  const [compact, setCompact] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const row = buttonsRef.current;
    let frame = 0;
    let active = true;

    const fit = () => {
      if (!active) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const buttons = [...row.querySelectorAll('button')];
        if (!buttons.length || !container.clientWidth) return;

        container.style.removeProperty('--dipe-project-filter-font-size');
        container.style.removeProperty('--dipe-project-filter-padding');
        const style = window.getComputedStyle(buttons[0]);
        const maximumSize = Math.max(minimumFontSize, parseFloat(style.fontSize) || 18);
        const maximumPadding = Math.max(minimumPadding, parseFloat(style.paddingLeft) || 42);
        const gap = parseFloat(window.getComputedStyle(row).columnGap) || 0;
        const measure = () => buttons.reduce((width, button) => width + button.getBoundingClientRect().width, 0) + gap * (buttons.length - 1);
        const apply = (progress) => {
          container.style.setProperty('--dipe-project-filter-font-size', `${minimumFontSize + (maximumSize - minimumFontSize) * progress}px`);
          container.style.setProperty('--dipe-project-filter-padding', `${minimumPadding + (maximumPadding - minimumPadding) * progress}px`);
        };

        const available = container.clientWidth - 1;
        const maximumWidth = measure();
        let needsSelect = false;
        if (maximumWidth > available) {
          apply(0);
          const minimumWidth = measure();
          needsSelect = minimumWidth > available;
          if (!needsSelect && maximumWidth > minimumWidth) {
            apply(Math.max(0, Math.min(1, (available - minimumWidth) / (maximumWidth - minimumWidth))));
          }
        }

        const focused = document.activeElement;
        if ((needsSelect && row.contains(focused)) || (!needsSelect && focused === selectRef.current)) {
          focusAfterResizeRef.current = true;
        }
        setCompact(needsSelect);
      });
    };

    const observer = 'ResizeObserver' in window ? new ResizeObserver(fit) : null;
    observer?.observe(container);
    window.addEventListener('resize', fit);
    document.fonts?.ready.then(fit);
    document.fonts?.addEventListener('loadingdone', fit);
    fit();

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', fit);
      document.fonts?.removeEventListener('loadingdone', fit);
    };
  }, [options]);

  useLayoutEffect(() => {
    if (!focusAfterResizeRef.current) return;
    focusAfterResizeRef.current = false;
    const control = compact ? selectRef.current : buttonsRef.current?.querySelector('[aria-pressed="true"]');
    control?.focus({ preventScroll: true });
  }, [compact]);

  return <div className="dipe-projects-archive__filters" ref={containerRef} data-compact={compact ? '' : undefined}>
    <div className="dipe-projects-archive__filter-buttons" ref={buttonsRef} role="group" aria-label="Filtrar proyectos" aria-hidden={compact ? true : undefined} inert={compact ? true : undefined}>
      <button className="dipe-projects-archive__filter" type="button" aria-pressed={!filter} onClick={() => onChange(null)}>Todos los proyectos</button>
      {options.map((option) => <button
        className="dipe-projects-archive__filter"
        type="button"
        key={option.slug}
        aria-pressed={filter === option.slug}
        disabled={categories.loading || !categories.items[option.slug]}
        onClick={() => onChange(option.slug)}
      >{option.label}</button>)}
    </div>
    <div className="dipe-projects-archive__filter-select" hidden={!compact}>
      <select ref={selectRef} aria-label="Filtrar proyectos" value={filter || ''} onChange={(event) => onChange(event.target.value || null)}>
        <option value="">Todos los proyectos</option>
        {options.map((option) => <option key={option.slug} value={option.slug} disabled={categories.loading || !categories.items[option.slug]}>{option.label}</option>)}
      </select>
    </div>
  </div>;
}
