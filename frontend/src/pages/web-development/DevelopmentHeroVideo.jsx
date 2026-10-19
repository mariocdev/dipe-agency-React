import { useEffect, useRef } from 'react';
import { sitePath } from '../../lib/site';
import { developmentServiceRoutes } from './developmentServiceRoutes';

const sessionKey = 'dipe-development-hero-video-v1';
const normalizePath = (path) => path.replace(/\/+$/, '') || '/';
const sharedPaths = new Set(
  ['/desarrollo-web/', ...Object.values(developmentServiceRoutes)].map((path) => normalizePath(sitePath(path))),
);

export function DevelopmentHeroVideo({ src }) {
  const videoRef = useRef(null);
  const savedPositionRef = useRef(undefined);

  useEffect(() => {
    const video = videoRef.current;
    const path = normalizePath(window.location.pathname);
    if (!video || !sharedPaths.has(path)) return undefined;

    if (savedPositionRef.current === undefined) {
      savedPositionRef.current = null;
      try {
        savedPositionRef.current = JSON.parse(window.sessionStorage.getItem(sessionKey));
        window.sessionStorage.removeItem(sessionKey);
      } catch { /* El vídeo sigue funcionando si el almacenamiento está desactivado. */ }
    }
    const saved = savedPositionRef.current;

    let resumeTime = null;
    try {
      const previous = new URL(document.referrer);
      const previousPath = normalizePath(previous.pathname);
      const navigation = performance.getEntriesByType('navigation')[0];
      if (
        navigation?.type === 'navigate'
        && previous.origin === window.location.origin
        && previousPath !== path
        && sharedPaths.has(previousPath)
        && saved?.path === previousPath
        && saved.src === src
        && Number.isFinite(saved.time)
        && saved.time >= 0
      ) resumeTime = saved.time;
    } catch { /* Una entrada directa o sin referente comienza desde el principio. */ }

    const restorePosition = () => {
      if (resumeTime === null || !Number.isFinite(video.duration) || video.duration <= 0) return;
      try {
        video.currentTime = resumeTime % video.duration;
        resumeTime = null;
      } catch { /* Si todavía no se puede buscar, se reintenta al disponer de datos. */ }
    };
    const savePosition = () => {
      if (video.readyState < 1 || !Number.isFinite(video.currentTime)) return;
      try {
        window.sessionStorage.setItem(sessionKey, JSON.stringify({ path, src, time: video.currentTime }));
      } catch { /* No impedir la navegación si no se puede guardar el punto. */ }
    };
    const saveWhenHidden = () => {
      if (document.visibilityState === 'hidden') savePosition();
    };

    video.addEventListener('loadedmetadata', restorePosition);
    video.addEventListener('loadeddata', restorePosition);
    window.addEventListener('pagehide', savePosition);
    document.addEventListener('visibilitychange', saveWhenHidden);
    if (video.readyState >= 1) restorePosition();

    return () => {
      video.removeEventListener('loadedmetadata', restorePosition);
      video.removeEventListener('loadeddata', restorePosition);
      window.removeEventListener('pagehide', savePosition);
      document.removeEventListener('visibilitychange', saveWhenHidden);
    };
  }, [src]);

  return <video ref={videoRef} className="dipe-web-hero__video" autoPlay loop muted playsInline preload="metadata" aria-hidden="true">
    <source src={src} type="video/mp4" />
  </video>;
}
