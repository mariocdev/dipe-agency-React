import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { preserveScrollHeight, scrollToContent } from '../lib/scroll';

// Gestiona el loader y el scroll al actualizar los resultados de un archivo.
export function useArchiveGridFeedback({ content, loading, error, enabled = true, scrollTargetRef }) {
  const resultsRef = useRef(null);
  const previousContent = useRef(null);
  const loaderStartedAt = useRef(0);
  const [showLoader, setShowLoader] = useState(false);

  const scrollCleanup = useRef(() => {});
  const heightCleanup = useRef(() => {});

  useLayoutEffect(() => {
    if (!enabled || error) {
      scrollCleanup.current();
      heightCleanup.current();
      return;
    }
    if (loading) {
      scrollCleanup.current();
      heightCleanup.current();
      if (previousContent.current !== null) heightCleanup.current = preserveScrollHeight(resultsRef.current);
      return;
    }
    const previous = previousContent.current;
    previousContent.current = content;
    // La primera respuesta conserva la posición del visitante junto al hero.
    if (previous === null || previous === content) { heightCleanup.current(); return; }
    scrollCleanup.current = scrollToContent(scrollTargetRef?.current || resultsRef.current, {
      onFinish: () => heightCleanup.current(),
    });
  }, [content, loading, error, enabled, scrollTargetRef]);

  useEffect(() => () => {
    scrollCleanup.current();
    heightCleanup.current();
  }, []);

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
