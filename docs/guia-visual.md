# Guía visual Dipe

**Base aprobada (18-10-2026):** el usuario confirma que el estado actual de los archivos locales es «PERFECTO» y autoriza consolidarlo en `main`. Conservar esos estilos como referencia: no reabrir ajustes ya aprobados ni alterar CSS en tareas que solo cambien lógica. Las notas históricas de revisión visual pendientes quedan subordinadas a esta aprobación; las incidencias técnicas/editoriales requieren su confirmación específica.

Actualizada el 18-10-2026. Fuente de identidad: [captura de identidad](referencias/guia-visual.png). Los valores efectivos están en `frontend/src/styles/tokens.css` y `frontend/src/styles/fonts.css`; prevalece el código actual. La [captura antigua de cabecera](referencias/cabecera-actual.png) es anterior a Gordita y no representa su aspecto vigente.

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

El usuario ha añadido `gordita-font.zip` al proyecto. Contiene Gordita en OTF; se han extraído **Regular (400), Medium (500) y Bold (700)** a `frontend/src/assets/fonts/`, y `frontend/src/styles/fonts.css` los declara con `@font-face`. El navegador puede cargar la familia real en lugar de caer a Arial.

[Type Atelier](https://typeatelier.com/info/) distingue la licencia de escritorio de la licencia web; la descarga de prueba no permite publicar la fuente en un proyecto comercial. El ZIP aportado no incluye documentación de licencia ni WOFF2. Antes de publicar fuera del entorno de pruebas, confirmar que se dispone de licencia web y obtener el kit WOFF2 correspondiente. [Gordita Regular, Medium y Bold](https://typeatelier.com/font/gordita/) son los tres estilos necesarios aquí.

Cuando se disponga del kit WOFF2:

1. Sustituir las rutas OTF de `frontend/src/styles/fonts.css` por WOFF2, usando `format('woff2')`; conservar pesos `400`, `500`, `700` y `font-display: swap`.
2. El usuario compilará, publicará y comprobará en servidor la carga de los archivos y Gordita en escritorio/móvil. No ejecutar comprobaciones locales por iniciativa propia.

La escala y los pesos comunes están en `tokens.css` y `styles.css`; el footer debe reutilizarlos.

## Continuar la maquetación de páginas corporativas

Esta sección resume las decisiones vigentes de la conversación de Desarrollo web y Agencia. Sirve de punto de partida; el diseño nuevo puede requerir secciones propias. Leer `PLAN_PARA_TERRA.md` y conservar el trabajo local antes de editar. No rehacer páginas aprobadas ni convertir en global un ajuste solicitado para una sola página.

### Rutas y referencias reales

| Página / uso | Ruta | Referencia React |
| --- | --- | --- |
| Desarrollo web, composición del padre | `/desarrollo-web/` | `pages/web-development/WebDevelopment.jsx` |
| WordPress | `/desarrollo-web/desarrollo-web-wordpress/` | `ServiceDevelopment.jsx`, clave `wordpress` |
| PrestaShop | `/desarrollo-web/desarrollo-web-prestashop/` | `ServiceDevelopment.jsx`, clave `prestashop` |
| Aplicaciones web | `/desarrollo-web/desarrollo-web-salamanca/` | `ServiceDevelopment.jsx`, clave `applications` |
| Agencia / Quiénes somos | `/agencia-desarrollo-web/` | `pages/agency/Agency.jsx` |

Los archivos React de esta guía son relativos a `frontend/src/`. La URL Salamanca para Aplicaciones web está confirmada expresamente por el usuario: no renombrarla ni cambiar sus textos a contenido local por deducción. Las tarjetas del padre/Agencia conservan su etiqueta e imagen de Salamanca aprobadas.

WordPress resuelve URL y HTTP. El usuario crea/publica la página nativa con su slug y jerarquía; React compone el diseño en `app/App.jsx`. Registrar una ruta React no crea una página WordPress. El menú lo administra WordPress.

### Qué reutilizar

| Sección | Archivo y opciones vigentes |
| --- | --- |
| Hero de servicios/Agencia | `WebDevelopmentSections.jsx`: `WebDevelopmentHero` acepta título, subtítulo, descripción, etiqueta/ancla, vídeo o imagen. Para una cabecera solo con imagen, pasar `videoSrc={null}`: omitirlo activa el vídeo por defecto. |
| Introducción y tarjetas «Qué incluye» | Mismo archivo: `WebDevelopmentIncludes` acepta contenido, fondo y `gridLayout`; título lateral + grid 2×2 o cuadrícula de tres columnas. El fondo empieza en el cuerpo de tarjetas, después de la introducción. |
| Tarjetas de servicios | Mismo archivo: `WebDevelopmentPaths`; imágenes vinculadas a los identificadores existentes. No asumir que admite medios arbitrarios para otra familia sin adaptar su contrato. |
| Listas desplegables | Mismo archivo: `WebDevelopmentCapabilities`, con grupos y textos, imagen opcional y acordeón compartido. |
| Casos y métricas | Mismo archivo: `WebDevelopmentCases`, contenido configurable. Conservar cifras aportadas y saltos de línea deliberados. |
| Proceso de trabajo | `pages/home/sections/WorkProcessSection.jsx`: título, pasos, imagen/vídeo opcionales; admite medios pendientes sin URL vacía. |
| FAQ | `pages/home/sections/FaqSection.jsx`: `items` con `id`, `question`, `answer` y `answerText`; este último alimenta JSON-LD y debe coincidir con la respuesta visible. Siempre empiezan todas cerradas. |
| Formulario, imagen flotante y logos | `pages/projects/ProjectsContact.jsx/.css`: conserva el puente de `Hablamos.png` y acepta `id`, `source`, `formType`, título e introducción. Reutilizar el cierre completo, evitando reposicionar la imagen flotante por página. |
| Igualación dinámica de alturas | `hooks/useEqualizedBlockSize.js`: devuelve una ref de contenedor; selector de los elementos a igualar y clave opcional de contenido como segundo argumento. Para datos REST, pasar la colección para recalcular cuando llega. |

Para una página muy similar a las hijas, usar `ServiceDevelopment.jsx`, `serviceDevelopmentContent.jsx`, `serviceDevelopmentMedia.js` y `developmentServiceRoutes.js`. Para una estructura distinta, seguir la composición de Agencia con componentes/CSS de página. `App.jsx` mantiene rutas y shell. No crear un componente genérico para tarjetas visualmente diferentes.

### Tamaños y comportamientos que ya se han afinado

- Ancho compartido: 80%; hasta 1640 px, 85%; hasta 1500 px, 90%. Escala tipográfica en los mismos tramos: 1 / 0.92 / 0.84. Usar los tokens existentes, sin imponer anchos máximos nuevos al conjunto.
- La tabla de identidad inicial no fija el h1 de los servicios: el hero usa Gordita 700 normal, 89 px en la parte grande y 64 px en la secundaria centrada, multiplicados por la escala y con adaptación móvil existente. Introducción de servicios: 24 px de referencia, peso 500. Botones: padding lateral 54 px, 32 px hasta 560 px.
- Tarjetas de servicios y «Qué incluye»: hover/foco con la sombra naranja existente `0 0 10.7px 0`. Imágenes de las tres tarjetas de servicios en gris por defecto, color al interactuar, encuadre center bottom desplazado 20 px hacia abajo.
- Casos: contenido alineado arriba; bloque interior `fit-content` centrado horizontalmente. Padding vertical 30 px y lateral de seguridad 20 px. **Los 100 px laterales fueron un ajuste intermedio sustituido** por espacios adaptados al contenido para conservar trabajos en dos líneas en escritorio; móvil admite envolver.
- FAQ y listas: cerradas al cargar, apertura/cierre animados y un elemento abierto como máximo por sección. Las listas usan botones/paneles controlados, no `details`. El SVG llamado `chevron-down` apunta realmente hacia arriba: en las listas, cerrado = rotación 180° y abierto = 0°. No girar globalmente el SVG. Respetar movimiento reducido.
- Anclas de auditoría: enlaces nativos a `#web-contacto`; destino con `scroll-margin-top: calc(var(--dipe-anchor-header-offset, 72px) + 20px)`. `Header.jsx` calcula altura sticky más `top`. El CSS ya contempla la barra de WordPress; no añadir otro desplazamiento fijo. `#quienes-somos` usa el mismo criterio.
- Solo Agencia elimina el margen exterior entre el proceso con imagen de alto completo y las FAQ. El usuario confirma que las demás están bien: no extenderlo a otras páginas salvo que lo pida.
- Equipo: nombres y cargos igualados por separado al mayor alto, incluso fuera de la vista. Carrusel con tarjetas completas al inicio (4/3/2/1 según ancho), arrastre de ratón, táctil nativo, flechas/teclado, progreso y degradado solo en tarjetas cortadas. Al soltar, animación de 720 ms; el snap se reactiva al terminar para evitar el salto. El usuario ha dado por buenos el carrusel, las alturas y el último ajuste suave. Contrato y administración en `docs/equipo.md`.

### Del PDF/Figma al contenido y los medios

Usar el PDF para composición, orden, textos y saltos, y el diseño nuevo para las diferencias. El primer prototipo Figma no fue accesible; no afirmar haberlo inspeccionado. El usuario suele aportar los medios finales tras aprobar la primera maqueta. No convertir una captura del diseño en imagen final. Los placeholders deben reservar espacio sin solicitar URLs vacías.

Los medios actuales ya están conectados en `webDevelopmentMedia.js`, `serviceDevelopmentMedia.js` y `pages/agency/agencyMedia.js`. Se resuelven con `homeMedia(filename)` desde `siteConfig.homeUrl`; el helper actual apunta a uploads de **2026/10**. Respetar nombre, extensión y mayúsculas. Para otro mes, adaptar la resolución de forma centralizada; no modificar a ciegas el mes global ni incrustar el dominio temporal. Los `processImage: null` de las hijas son posters opcionales, no vídeos pendientes. Vídeos decorativos: silencio, bucle, inline y encuadre del componente existente.

Copiar del HTML pegado solo los textos necesarios, no clases Tailwind, rutas de Next ni marcado ajeno. Las respuestas no visibles en los PDF y los textos desplegables de los servicios fueron redactados como **provisionales con autorización expresa del usuario**; siguen pendientes de revisión editorial. Esa autorización no convierte en definitivas esas respuestas ni permite inventar cifras, testimonios, equipo o datos empresariales en futuras páginas.

### Formularios y entrega

Desarrollo y sus hijas utilizan `formType="contacto-servicios"`, `source="desarrollo-web"`; Agencia usa Contacto internas (`formType="contacto"` por defecto), `source="agencia"`. Ambos tienen nombre, email, teléfono, mensaje y privacidad obligatorios. No seleccionar el tipo solo por semejanza visual ni inventar campos/destinatarios: consultar `docs/formularios.md` cuando cambie el envío.

No ejecutar builds, navegador, servidor, capturas, tests, lint, llamadas de prueba a API ni comprobaciones locales. El usuario compila y revisa tras FTP. Para React/CSS entrega: `wp-content/themes/dipe-react/assets/` completo, incluido `.vite/manifest.json`; para PHP, archivos exactos y dependencias antes del cargador. No subir fuentes React ni documentos como archivos públicos. No repetir el comando de compilación. No hacer FTP, commit/push o cambios de rama por iniciativa propia. Registrar aprobaciones concretas y pendientes sin afirmar una validación global.
