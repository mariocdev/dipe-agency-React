import { webDevelopmentMedia as shared } from './webDevelopmentMedia';
import { homeMedia } from '../home/homeMedia';

// Banner compartido y medios específicos resueltos desde la URL del sitio.
// processImage queda disponible para añadir un poster si el usuario lo aporta.
// Los iconos existentes son provisionales y se pueden sustituir por página.
export const serviceDevelopmentMedia = {
  wordpress: {
    heroVideo: shared.heroVideo,
    includesBackground: homeMedia('Que-incluye-nuestro-desarrollo-en-WordPress.png'),
    capabilitiesImage: homeMedia('Casos-de-uso-tipicos-con-WordPress.png'),
    processImage: null,
    processVideo: homeMedia('Proceso-de-trabajo-Desarrollo-con-Wordpress.mp4'),
    featureIcons: [shared.includesIcons.design, shared.designIcon, shared.includesIcons.strategy, shared.qaIcon, shared.includesIcons.analytics],
  },
  prestashop: {
    heroVideo: shared.heroVideo,
    includesBackground: homeMedia('Que-incluye-nuestro-desarrollo-en-PrestaShop.png'),
    capabilitiesImage: homeMedia('Integraciones-que-suelen-pedirnos.png'),
    processImage: null,
    processVideo: homeMedia('Proceso-de-trabajo-Desarrollo-con-Prestashop.mp4'),
    featureIcons: [shared.designIcon, shared.includesIcons.strategy, shared.qaIcon, shared.includesIcons.analytics, shared.qaIcon],
  },
  applications: {
    heroVideo: shared.heroVideo,
    includesBackground: homeMedia('Que-incluye-nuestro-servicio-de-diseno-web-version-Salamanca.png'),
    capabilitiesImage: homeMedia('Por-que-con-dipe-y-por-que-en-Salamanca.png'),
    processImage: null,
    processVideo: homeMedia('Proceso-de-trabajo.mp4'),
    featureIcons: [shared.designIcon, shared.includesIcons.analytics, shared.qaIcon, shared.includesIcons.analytics],
  },
};
