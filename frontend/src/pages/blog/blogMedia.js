import { homeMedia } from '../home/homeMedia';

// Las imágenes de las entradas proceden de WordPress, no de la maqueta.

export const blogMedia = {
  heroBackground: homeMedia('Cabecera-blog.png'),
  shareIcons: {
    linkedin: homeMedia('linkedin-brands-solid-full.svg'),
    whatsapp: homeMedia('whatsapp-brands-solid-full.svg'),
    instagram: homeMedia('instagram-brands-solid-full.svg'),
    facebook: homeMedia('facebook-f-brands-solid-full.svg'),
    copy: homeMedia('copy-light-full.svg'),
  },
};
