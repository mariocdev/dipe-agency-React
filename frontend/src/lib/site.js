export const siteConfig = typeof window !== 'undefined' ? (window.dipeSite || {}) : {};
const basePath = (siteConfig.basePath || '/').replace(/\/$/, '');

export function sitePath(path = '') {
  const value = String(path).trim();

  if (!value || value === '#') return '#';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return value;
  if (/^[a-z][a-z\d+.-]*:/i.test(value)) return '#';

  return `${basePath}/${value.replace(/^\//, '')}`.replace(/\/{2,}/g, '/');
}
