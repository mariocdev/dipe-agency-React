import { homeMedia } from '../home/homeMedia';

// Añadir aquí el nombre del fondo definitivo cuando lo aporte el usuario.
// Las imágenes de las entradas proceden de WordPress, no de la maqueta.
const heroBackgroundFilename = null;

export const blogMedia = {
  heroBackground: heroBackgroundFilename ? homeMedia(heroBackgroundFilename) : null,
  shareIcons: {
    linkedin: homeMedia('linkedin-brands-solid-full.svg'),
    whatsapp: homeMedia('whatsapp-brands-solid-full.svg'),
    instagram: homeMedia('instagram-brands-solid-full.svg'),
    facebook: homeMedia('facebook-f-brands-solid-full.svg'),
    copy: homeMedia('copy-light-full.svg'),
  },
};
