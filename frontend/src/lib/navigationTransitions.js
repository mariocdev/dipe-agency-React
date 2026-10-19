// Coordina los enlaces internos con las transiciones de página en curso.
export function installNavigationTransitions(root) {
  let pendingUrl = null;
  let fallbackTimer;
  let revision = 0;

  const reset = () => {
    pendingUrl = null;
    revision += 1;
    window.clearTimeout(fallbackTimer);
  };

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || !root.contains(link) || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;

    const destination = new URL(link.href, window.location.href);
    const current = window.location;
    const changesPage = destination.origin === current.origin
      && (destination.pathname !== current.pathname || destination.search !== current.search);

    if (!changesPage) {
      reset();
      return;
    }

    // Respetar el último destino si se encadenan clics durante la misma animación.
    if (pendingUrl) {
      event.preventDefault();
      pendingUrl = destination.href;
      return;
    }

    const transition = document.activeViewTransition;
    const animations = (document.getAnimations?.() || []).filter((animation) =>
      animation.effect?.pseudoElement?.startsWith('::view-transition')
      && (animation.playState === 'running' || animation.pending));
    if (!transition && !animations.length) return;

    event.preventDefault();
    pendingUrl = destination.href;
    const navigationRevision = ++revision;
    const navigate = () => {
      if (navigationRevision !== revision || !pendingUrl) return;
      const href = pendingUrl;
      reset();
      window.location.assign(href);
    };

    // Evitar interrumpir la transición anterior, sin dejar un enlace bloqueado.
    fallbackTimer = window.setTimeout(navigate, 400);
    Promise.allSettled(transition ? [transition.finished] : animations.map((animation) => animation.finished))
      .then(navigate);
  });

  window.addEventListener('pagehide', reset);
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) reset();
  });
}
