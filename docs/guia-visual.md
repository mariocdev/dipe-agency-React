# Guía visual Dipe

Fuente: [captura de identidad](referencias/guia-visual.png). Esta referencia define los valores reutilizables del front; el archivo efectivo es `frontend/src/tokens.css`. La [captura de la cabecera actual](referencias/cabecera-actual.png) muestra la diferencia antes de cargar Gordita.

| Uso | Familia | Peso | Tamaño |
| --- | --- | --- | --- |
| H1 | Gordita | Bold (700) | 45 px |
| H2 | Gordita | Bold (700) | 38 px |
| H3 | Gordita | Bold (700) | 20 px |
| Texto general | Gordita | Regular (400) / Bold (700) | 18 px |
| Texto pequeño | Gordita | Regular (400) / Bold (700) | 14 px |
| Texto alternativo | Gordita | Regular (400) / Bold (700) | 24 px |

Colores confirmados: naranja `#FF8600`, tinta `#1D1D1D`, superficie clara `#F6F6F6`, blanco `#FFFFFF`. El negro `#020202` corresponde específicamente a la barra principal de cabecera. El menú superior y el principal usan Gordita Medium (500), el desplegable Gordita Regular (400), según el diseño de cabecera.

## Estado de la fuente

El usuario ha añadido `gordita-font.zip` al proyecto. Contiene Gordita en OTF; se han extraído **Regular (400), Medium (500) y Bold (700)** a `frontend/src/assets/fonts/`, y `frontend/src/fonts.css` los declara con `@font-face`. El navegador ya puede cargar la familia real en lugar de caer a Arial. La [captura de la cabecera actual](referencias/cabecera-actual.png) es anterior a este cambio.

[Type Atelier](https://typeatelier.com/info/) distingue la licencia de escritorio de la licencia web; la descarga de prueba no permite publicar la fuente en un proyecto comercial. El ZIP aportado no incluye documentación de licencia ni WOFF2. Antes de publicar fuera del entorno de pruebas, confirmar que se dispone de licencia web y obtener el kit WOFF2 correspondiente. [Gordita Regular, Medium y Bold](https://typeatelier.com/font/gordita/) son los tres estilos necesarios aquí.

Cuando se disponga del kit WOFF2:

1. Sustituir las rutas OTF de `frontend/src/fonts.css` por los archivos WOFF2, usando `format('woff2')`; conservar pesos `400`, `500` y `700` y `font-display: swap`.
2. Comprobar en herramientas de navegador que los tres archivos cargan con HTTP 200 y que el estilo calculado de la cabecera usa Gordita.
3. Recompilar con `pnpm build`, subir el tema por FTP y purgar Varnish si sirve el CSS anterior. Revisar escritorio y móvil: los anchos del menú varían respecto a Arial.

La escala y los pesos comunes están en `tokens.css` y `styles.css`; el footer debe reutilizarlos.
