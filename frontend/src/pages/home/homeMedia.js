import { siteConfig } from '../../lib/site';

const uploadsPath = 'wp-content/uploads/2026/10/';

export function homeMedia(filename) {
  const baseUrl = siteConfig.homeUrl || (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '');
  const target = `${uploadsPath}${filename}`;

  if (!baseUrl) return `/${target.replace(/^\/+/, '')}`;
  return new URL(target, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
}
