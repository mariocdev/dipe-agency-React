import { useEffect, useRef, useState } from 'react';

export function useArchiveGridFeedback({ content, loading, error, enabled = true, scrollTargetRef }) {
  const resultsRef = useRef(null);
  const previousContent = useRef(null);
  const loaderStartedAt = useRef(0);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (!enabled || loading || error) return undefined;
    const previous = previousContent.current;
    previousContent.current = content;
    // The initial response should never pull the visitor away from the hero.
    if (previous === null || previous === content) return undefined;

    const frame = requestAnimationFrame(() => {
      const target = scrollTargetRef?.current || resultsRef.current;
      if (!target) return;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
    });

    return () => cancelAnimationFrame(frame);
  }, [content, loading, error, enabled, scrollTargetRef]);

  useEffect(() => {
    if (enabled && loading && previousContent.current !== null) {
      loaderStartedAt.current = performance.now();
      setShowLoader(true);
      return undefined;
    }
    // Keep very fast requests perceptible without delaying the data response.
    const remaining = !enabled || error ? 0 : Math.max(0, 350 - (performance.now() - loaderStartedAt.current));
    const timer = window.setTimeout(() => setShowLoader(false), remaining);
    return () => window.clearTimeout(timer);
  }, [loading, enabled, error]);

  return { resultsRef, showLoader };
}
