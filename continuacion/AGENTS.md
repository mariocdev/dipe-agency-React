# Instrucciones para continuar Dipe Agency

Este archivo complementa el `AGENTS.md` de la raíz. Fue creado aparte porque el usuario pidió **no modificar archivos existentes**. Al empezar otro hilo, lee primero `CONTEXTO-PROYECTO.md` en la raíz, después este archivo y, para detalles de una zona, la documentación de `docs/`. Algunas frases del `AGENTS.md` raíz y de `PLAN_PARA_TERRA.md` han quedado desactualizadas: **Contacto ya tiene componente React y endpoint PHP**. Usa el código actual y las confirmaciones del usuario para resolver esas diferencias. No copies aquí contraseñas, claves, licencias ni datos personales de solicitudes.

## Objetivo y reparto de responsabilidades

- Sitio corporativo de Dipe Agency: WordPress resuelve URL, estado HTTP, administración, entradas, CPT y metadatos; el tema clásico `dipe-react` monta el bundle de React; React + Bootstrap dibuja la interfaz.
- Home y páginas corporativas: estructura, textos e imágenes fijas en código. Logo y enlaces de los menús de cabecera/pie sí se configuran en WordPress. Los posts y CPT publicados se editan en `wp-admin` y se leen dinámicamente por REST. No introducir Elementor como maquetador ni usar ACF para construir páginas fijas.
- `dipe-core` contiene CPT, taxonomías, campos ACF registrados por PHP, endpoints, solicitudes privadas y SMTP de los formularios. El tema contiene integración WordPress/React, menús, logos, metadatos actuales y carga de assets. Evita trasladar lógica editorial al tema.
- El SEO futuro debe ser editable en WordPress con una sola fuente de metadatos. El entorno actual fuerza `noindex`, `nofollow` y `Disallow: /`; no retirar esas barreras por una tarea de maquetación. Antes de producción, resolver el HTML inicial de las vistas React y evitar metadatos duplicados.

## Mapa del repositorio

| Ruta | Responsabilidad |
| --- | --- |
| `frontend/src/App.jsx` | Shell y resolución de rutas; conservarlo pequeño. |
| `frontend/src/Home.jsx` | Orden y contenido fijo de las secciones de Home. |
| `frontend/src/*Section.jsx` y CSS homónimos | Secciones independientes; `Header.jsx` y `Footer.jsx` son globales. |
| `frontend/src/api.js` | REST, envío de Contacto y normalización de contenido. |
| `frontend/src/site.js`, `homeMedia.js` | URL/base del sitio y rutas de medios fijos. |
| `frontend/src/tokens.css`, `fonts.css` | Paleta, tipografía y archivos Gordita; `styles.css` conserva estilos globales que se deben extraer gradualmente al tocar cada sección. |
| `wp-content/plugins/dipe-core/dipe-core.php` | Registro de proyectos, ACF/REST, reglas de blog y protección de indexación. |
| `wp-content/plugins/dipe-core/includes/form-submissions.php` | Endpoint Contacto, guardado privado y bandeja `Solicitudes`. |
| `wp-content/plugins/dipe-core/includes/mail-settings.php` | `Ajustes > Correo Dipe`, SMTP y notificaciones. |
| `wp-content/themes/dipe-react/functions.php` | Menús/logos, `window.dipeSite`, manifiesto Vite y metadatos HTML actuales. |
| `docs/` | Especificaciones y decisiones; algunas secciones describen fases anteriores. |

El build de Vite se escribe en `wp-content/themes/dipe-react/assets/` y está ignorado por Git. Es parte de la entrega por FTP cuando cambia React/CSS. No versionar núcleo de WordPress, `wp-config.php`, medios subidos, base de datos, `.env*`, secretos ni assets generados.

## Convenciones de implementación

- Mantén un componente por sección o plantilla con responsabilidad clara. Comparte funciones de dominio y tokens realmente repetidos; no fuerces un componente visual genérico para diseños diferentes. Evita duplicar estilos globales al añadir secciones.
- Usa `--dipe-*` de `tokens.css` para identidad visual confirmada: naranja `#FF8600`, tinta `#1D1D1D`, superficie `#F6F6F6`, blanco y Gordita 400/500/700. La medida exclusiva de una sección debe quedar en su CSS. Gordita está en OTF; comprobar licencia web y sustituir por WOFF2 autorizado antes de producción.
- No incrustes el dominio temporal en nuevos componentes o CSS. Usa `window.dipeSite`, `sitePath()` y `homeMedia()`; para contenido editorial, usa enlaces y medios devueltos por WordPress.
- En WordPress, conserva respuestas HTTP y enlaces permanentes correctos antes de ajustar una vista React. Rutas previstas: `/blog/`, `/blog/{slug}/`, `/categoria/{slug}/`, `/proyectos/`, `/proyectos/{slug}/`. El problema de categoría con título 404 de WordPress está aplazado por el usuario.
- Para el ACF de imagen de proyectos, la API usa `acf_format=standard`; `projectHomeCardImage()` contempla el objeto ACF y el campo REST alternativo. Amplía el modelo solo al recibir diseños o datos reales. No añadas CPT «proyectos destacados»: se usa la taxonomía y término `destacados`.
- Las reseñas de Home son dos textos reales repetidos para cuatro tarjetas. Conserva la marca de repetición; no las presentes como cuatro testimonios distintos ni añadas integración de Google sin autorización y fuente fiable.
- Para formularios, React presenta campos; `dipe-core` valida, limita frecuencia, registra antes de avisar y selecciona destinatarios/remitente en servidor. El frontend nunca envía destinatarios o cabeceras arbitrarias. `dipe_solicitud` es privado y la bandeja `Solicitudes` solo permite lectura a administradores. El estado `sent` significa aceptación por el servidor de salida, no entrega al buzón. Las contraseñas SMTP se administran en WordPress y nunca en Git.
- CookieYes es la elección para cookies; no añadas otro CMP. No agregues plugins de formulario/SMTP/maquetación por defecto: el proyecto prioriza sencillez y rendimiento.

## Flujo de trabajo impuesto por el usuario

1. Antes de editar, ejecuta `git status --short` **una vez** y preserva todos los cambios existentes. No reinicies Git ni reviertas trabajo ajeno.
2. Lee solo los archivos relevantes para la tarea y entrega cambios acotados. No ejecutes comprobaciones locales por iniciativa propia: sin dev server, navegador, capturas, tests, lint, `git diff --check` ni llamadas a la API. El usuario valida en el servidor tras subir por FTP.
3. Si editas React o CSS, ejecuta `pnpm build` **una sola vez al terminar**, únicamente para generar assets de FTP. Si solo cambias PHP o documentación, no compiles. Informa si el build impide entregar assets.
4. Entrega lista breve de archivos que el usuario debe subir. Nunca afirmes que un cambio funciona en real antes de su confirmación. Usa sus capturas, cabeceras o respuestas cuando se investigue una incidencia.
5. No subas por FTP ni modifiques DNS, hosting, WordPress remoto o Git remoto por iniciativa propia. El usuario realiza la publicación y aporta resultados.

## Lecturas por tarea

- Formularios y correo: `docs/formularios.md`, pero corrige sus frases históricas con el código y `CONTEXTO-PROYECTO.md`.
- Blog: `docs/blog-rutas.md`; no reabrirlo hasta que el usuario lo pida.
- Proyectos/ACF: `docs/proyectos.md` y `docs/modelo-contenido.md`.
- Diseño: `docs/guia-visual.md`, `docs/maquetacion-cabecera-footer.md`, `docs/resenas-home.md` y referencias en `docs/referencias/`.
- SEO, contenidos y plugins: `docs/arquitectura-editorial.md`.
