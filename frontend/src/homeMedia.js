import { siteConfig } from './site';

const uploadsPath = 'wp-content/uploads/2026/10/';

export function homeMedia(filename) {
  const baseUrl = siteConfig.homeUrl || window.location.origin;

  return new URL(`${uploadsPath}${filename}`, baseUrl).toString();
}
