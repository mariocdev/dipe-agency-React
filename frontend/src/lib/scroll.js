let cancelCurrentScroll = null;

// Mantiene el espacio anterior mientras un paso o listado se vuelve más corto.
export function preserveScrollHeight(element) {
  if (!element) return () => {};
  const minHeight = element.style.minHeight;
  const overflowAnchor = element.style.overflowAnchor;
  element.style.minHeight = window.getComputedStyle(element).height;
  element.style.overflowAnchor = 'none';
  let restored = false;
  return () => {
    if (restored) return;
    restored = true;
    element.style.minHeight = minHeight;
    element.style.overflowAnchor = overflowAnchor;
  };
}

// La rueda, el tacto y el teclado interrumpen el desplazamiento automático.
export function scrollToContent(target, { block = 'start', onFinish = () => {}, onComplete = () => {} } = {}) {
  cancelCurrentScroll?.();
  if (!target) { onFinish(); return () => {}; }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = window.scrollY;
  let frame = 0;
  let finished = false;
  let startedAt = null;
  let destination = start;
  const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
  function finish() {
    if (finished) return;
    finished = true;
    window.cancelAnimationFrame(frame);
    window.removeEventListener('wheel', finish);
    window.removeEventListener('touchstart', finish);
    window.removeEventListener('pointerdown', finish);
    window.removeEventListener('keydown', keydown);
    if (cancelCurrentScroll === finish) cancelCurrentScroll = null;
    onFinish();
  }
  function keydown(event) { if (keys.includes(event.key)) finish(); }
  function tick(now) {
    if (!target.isConnected) { finish(); return; }
    if (startedAt === null) {
      startedAt = now;
      const rect = target.getBoundingClientRect();
      const margin = parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
      const offset = block === 'center' ? (window.innerHeight - rect.height) / 2 : margin;
      destination = Math.max(0, Math.min(window.scrollY + rect.top - offset,
        document.documentElement.scrollHeight - window.innerHeight));
    }
    const duration = Math.min(950, 650 + Math.abs(destination - start) * .08);
    const progress = reducedMotion ? 1 : Math.min(1, (now - startedAt) / duration);
    const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    // Cada frame ya está interpolado: evita una segunda animación del navegador.
    window.scrollTo({ top: start + (destination - start) * eased, behavior: 'instant' });
    if (progress < 1 && Math.abs(destination - start) > 1) frame = window.requestAnimationFrame(tick);
    else { finish(); onComplete(); }
  }
  cancelCurrentScroll = finish;
  window.addEventListener('wheel', finish, { passive: true });
  window.addEventListener('touchstart', finish, { passive: true });
  window.addEventListener('pointerdown', finish, { passive: true });
  window.addEventListener('keydown', keydown);
  frame = window.requestAnimationFrame(tick);
  return finish;
}