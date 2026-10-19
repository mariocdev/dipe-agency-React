import { useEffect, useRef, useState } from 'react';

// Keep offscreen media requests away from the first render; keep text mounted.
export function useDeferredMedia(rootMargin = '200px 0px') {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready || !ref.current) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setReady(true);
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      setReady(true);
    }, { rootMargin, threshold: 0 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ready, rootMargin]);

  return [ref, ready];
}
