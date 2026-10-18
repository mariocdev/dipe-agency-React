import { homeMedia } from '../home/homeMedia';

// Recursos fijos desde la URL del sitio, sin vincularlos al dominio de pruebas.
export const webDevelopmentMedia = {
  heroVideo: homeMedia('Banner-servicios-desarrollo.mp4'),
  includesBackground: homeMedia('BG-Que-incluye-nuestro-desarrollo-web.png'),
  integrations: homeMedia('Integraciones-y-automatizacion-lo-justo-y-necesario-1.png'),
  wordpress: homeMedia('WordPress-profesional.png'),
  prestashop: homeMedia('PrestaShop-para-ecommerce.png'),
  salamanca: homeMedia('Diseno-web-Salamanca.png'),
  processVideo: homeMedia('Nuestra-manera-de-trabajar-Desarollo-web-1.mp4'),
  includesIcons: {
    strategy: homeMedia('Arquitectura-y-estrategia.svg'),
    design: homeMedia('Diseno-UX-UI-y-Desarrollo-1.svg'),
    qa: homeMedia('QA-1.svg'),
    analytics: homeMedia('Analitica-y-medicion.svg'),
  },
  strategyIcon: homeMedia('Descubrimiento.svg'),
  designIcon: homeMedia('Diseno-UX-UI-y-Desarrollo.svg'),
  qaIcon: homeMedia('QA.svg'),
  analyticsIcon: homeMedia('Lanzamiento-y-crecimiento.svg'),
};
