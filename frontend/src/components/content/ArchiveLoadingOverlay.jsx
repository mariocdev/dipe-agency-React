import './ArchiveLoadingOverlay.css';

export function ArchiveLoadingOverlay({ active }) {
  if (!active) return null;

  return <div className="dipe-archive-loading" aria-hidden="true">
    <div className="dipe-archive-loading__status">
      <span className="dipe-archive-loading__spinner" />
      <span>Cargando…</span>
    </div>
  </div>;
}
