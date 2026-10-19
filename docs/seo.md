# Integración de Yoast SEO

## Estado (19-10-2026)

**Editor del archivo de proyectos, nueva iteración local:** `dipe-core` **0.4.24** añade **Proyectos > SEO del archivo** mediante `includes/project-archive-seo.php`. Permite editar título SEO, metadescripción e indexación del archivo general `/proyectos/`, con enlace para verlo. Lee y escribe las opciones nativas de Yoast `title-ptarchive-dipe_proyecto`, `metadesc-ptarchive-dipe_proyecto` y `noindex-ptarchive-dipe_proyecto`; no guarda una segunda configuración ni añade etiquetas al frontal. Usa el saneamiento de Yoast para conservar las variables `%%...%%`, `WPSEO_Options` para guardar, comprueba después lo persistido y solicita purga Rocket si cambia algún valor. POST/nonce y `manage_options`; sin Yoast/opciones disponibles solo muestra aviso y rechaza guardado. No escribe valores hasta que el administrador guarda. Conserva H1/contenido/diseño React, rutas y SEO individual/de categorías, y la regla anterior de noindex, follow/sin canonical de paginación/búsqueda. No crea una página nativa duplicada. FTP: nuevo `includes/project-archive-seo.php` **antes** de `dipe-core.php`; no requiere tema ni compilación. Pendiente revisión del usuario en servidor; sin comprobaciones locales, build, FTP ni operaciones Git.

**Paginación y búsquedas, nueva iteración local:** `dipe-core` **0.4.23** aplica `noindex, follow` y ausencia de canonical a las búsquedas nativas y páginas posteriores a la primera reconocidas por WordPress. Cubre Yoast, robots/canonical nativos y el fallback del tema. No altera la primera página del archivo ni crea nuevas rutas paginadas; la paginación React actual no cambia de URL. El mu-plugin temporal para crear/borrar 40 copias por tipo y la entrega/revisión de estos PHP se detallan en [paginacion-pruebas.md](paginacion-pruebas.md). Sin compilación ni comprobaciones locales; pendiente revisión del usuario en servidor.

Yoast está instalado y funciona según confirmación del usuario. Preparada una nueva iteración local de metadatos/schema con `dipe-core` **0.4.20**; la publicación y revisión de esta entrega siguen pendientes. El usuario había descargado el PHP del tema desde el servidor al checkout: no confundir esa descarga con una nueva publicación ni con su incorporación a GitHub.

## Logo, imágenes sociales, negocio y prueba de Google (19-10-2026)

**Bloqueo persistente por robots, nueva evidencia del usuario:** la prueba sigue indicando bloqueo por robots aunque el texto aportado permite `Google-InspectionTool` explícitamente. Ese texto no bloquea la portada para la herramienta; que Orcascan y PageSpeed accedan no acredita qué versión de robots recibe Google. El HTML pegado incluye metadatos `index, follow` y el grafo Yoast con Organization/LocalBusiness, pero corresponde a una sesión con barra de administración y no demuestra la respuesta pública al rastreador.

El `.htaccess` local de Rocket tiene `ExpiresDefault "access plus 1 month"` sin excepción para `text/plain`. Preparada una excepción limitada a `robots.txt`, fuera de los bloques regenerados de Rocket/WordPress: desactiva `mod_expires` para ese archivo, retira `Expires` y fija `Cache-Control: public, max-age=300, must-revalidate` cuando `mod_headers` está disponible. Evita que futuras respuestas hereden el mes de caché; no invalida una copia que Google ya conserve. La caché es una hipótesis, no una causa confirmada: no se han consultado las cabeceras ni el servidor.

FTP de esta iteración: solo `.htaccess` en la raíz pública, conservando cualquier regla adicional existente en el servidor y el bloque `Dipe robots cache` fuera de los bloques automáticos. Sin compilación. Tras la subida, purgar las cachés del alojamiento/CDN si existen y solicitar nueva lectura desde el informe de robots.txt de Search Console. Si persiste, comparar contenido/fecha/estado que muestra Google y revisar registros del alojamiento para las peticiones a `/robots.txt` y a la URL probada con Google-InspectionTool; no añadir más permisos ni atribuirlo al schema sin esa evidencia. Pendiente revisión en servidor; sin comprobaciones locales, llamadas al servidor, FTP ni operaciones Git.

`functions.php` del tema emite en `wp_head()` la etiqueta fija solicitada `og:logo` con el logo principal nativo (`custom_logo`, Identidad del sitio). No fija una URL de uploads ni reutiliza los dominios/archivos del HTML de referencia. La misma fuente alimenta el logo del negocio.

La regla social solicitada se aplica en la presentación nativa de Yoast (`wpseo_frontend_presentation`), con una sola imagen y sus dimensiones/MIME reales: en entradas usa el ACF `dipe_post_banner_media` si es imagen y después la destacada; en proyectos usa `dipe_project_banner_image` y después la destacada; sin imagen válida y en el resto de páginas usa el logo principal. Un vídeo ACF no se publica como `og:image`. Se alinea también `twitter:image`. Esta regla de salida prevalece sobre la imagen social manual de Yoast, por petición del usuario; no modifica el valor guardado en el editor. Con Yoast inactivo se mantiene el fallback de metadatos del tema con la misma selección de imagen. Si no hay logo configurado ni imagen válida, no se inventa una URL.

`includes/seo.php` amplía el grafo conectado de Yoast mediante `wpseo_schema_graph`: una entidad con tipos `Organization` y `LocalBusiness`, reutilizando el ID nativo existente o añadiéndola si falta. Nombre Dipe, email `info@dipe.es`, teléfono `+34923623738`, dirección Jesús Arambarri, 33, Salamanca, 37003, ES y contacto comercial en español proceden del HTML aportado y coinciden con Contacto/Footer actuales. URL e identificadores se obtienen de WordPress. El logo procede de `custom_logo`; se conservan perfiles sociales y otros datos previos de la entidad. WebSite y Article/BlogPosting enlazan su publisher con esa entidad y la WebPage de Home la referencia en `about`. Se conserva el resto del grafo nativo (página, web, migas, artículos cuando Yoast los genera). No se copian del HTML antiguo las preguntas FAQ sin nombre/respuesta ni sus scripts de terceros; no se añaden horarios, coordenadas o valoraciones sin datos.

El usuario aporta el motivo de una prueba del 19-10-2026 a las 3:10:22: **Google-InspectionTool para smartphones, rastreo no permitido y obtención bloqueada por robots.txt**. El robots físico incorpora un grupo explícito `User-agent: Google-InspectionTool` con `Disallow:` vacío, junto a los permisos existentes para Googlebot/Googlebot-image; conserva el resto del texto solicitado. Esto permite las URL con parámetros que React usa para obtener datos, sin aplicar a la herramienta las restricciones del grupo genérico. No demuestra que esa regla fuera la causa concreta del bloqueo de la raíz: la versión que Google tiene en caché puede ser distinta. La ubicación del `.htaccess` no sustituye la actualización del robots ni acredita acceso público; no se modifica ese archivo ni el index raíz.

Después de subir el robots, solicitar nueva lectura desde el informe de robots.txt en Search Console y repetir una prueba nueva. Google suele conservar robots en caché hasta 24 h y puede hacerlo más tiempo si falla su actualización. Si sigue bloqueado, comparar la versión/fecha que muestra Google con el robots publicado y el motivo actualizado antes de atribuirlo a Yoast o al schema. La contraseña, si sigue activa, también tendrá que retirarse para permitir acceso público; no hay confirmación nueva de su estado. Sin consulta al servidor ni prueba ejecutada por Codex; no se declara resuelto el rastreo.

**Duración ajustada posteriormente a petición del usuario (19-10-2026):** `IntroAnimation.jsx` pasa de la versión breve de ~0,9 s a **2 segundos nominales**: entrada de 1,1 s y viaje del logo/fundido de salida de 0,9 s. La salida alternativa sin logo cargado también dura 0,9 s. Conserva frecuencia por pestaña, restauración de scroll/logo, movimiento reducido e interruptor en Herramientas. El temporizador de seguridad pasa de 1.400 a 2.500 ms desde el efecto para no interrumpir la duración normal y evitar espera indefinida de GSAP; sujeto a ejecución del hilo principal. Los datos e imágenes de la página cargan por su flujo actual. Sin comprobaciones locales ni compilación; pendiente revisión del ritmo en servidor tras FTP de assets completos del tema con manifiesto.

FTP de esta entrega, conservando rutas: `includes/seo.php` antes de `dipe-core.php`, `wp-content/themes/dipe-react/functions.php`, `robots.txt` a la raíz pública y, tras compilación del usuario, `wp-content/themes/dipe-react/assets/` completo con `.vite/manifest.json`. Purgar las cachés externas que existan. No se modifica la guarda temporal de Rocket. Sin comprobaciones locales, tests, lint, build, FTP ni operaciones Git; revisión del usuario en servidor pendiente.

Referencias: [API del grafo de Yoast](https://developer.yoast.com/features/schema/api/), [presentación de metadatos de Yoast](https://github.com/Yoast/wordpress-seo/blob/trunk/src/integrations/front-end-integration.php), [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization), [LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business), [Google-InspectionTool](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-inspectiontool), [actualizar la caché de robots](https://developers.google.com/crawling/docs/robots-txt/submit-updated-robots-txt?hl=es).

**Retirada del bloqueo global (19-10-2026):** por petición expresa del usuario se eliminan los bloqueos de pruebas en WordPress y su réplica en Yoast. Al abrir el administrador con permisos de gestión se restaura `blog_public=1` una sola vez; después se respetan los ajustes posteriores del administrador. El usuario se ocupa del `index.php` raíz con contraseña; no se crea ni modifica ese archivo. Mientras exista la contraseña, los buscadores no accederán al frontal. Para esta retirada basta con subir primero `includes/seo.php` y después `dipe-core.php`, abrir el administrador y purgar caché si está activa. Sin compilación ni comprobaciones locales; pendiente revisión en servidor.

## Responsabilidades

- WordPress resuelve la URL, consulta y estado HTTP. React conserva el contenido y diseño actuales. La navegación entre páginas carga el documento de destino: no necesita un segundo gestor de metadatos en React ni peticiones SEO adicionales.
- El tema ya declara `title-tag` y llama una vez a `wp_head()` en `header.php`. Yoast utiliza esa salida nativa para título SEO, descripción, canonical, robots, Open Graph, tarjetas sociales y schema. No se llama manualmente a `wpseo_head` ni se inyecta `yoast_head` desde React.
- `dipe_react_meta_tags()` deja de emitir sus etiquetas cuando está definido `WPSEO_VERSION`. Sin Yoast activo conserva el fallback anterior. No se modifican menús, logos, rutas ni estilos.
- `dipe-core` carga `includes/seo.php`. Desde 0.4.17 no impone robots globales a WordPress, Yoast ni sus metadatos REST. Los hooks propios de Yoast son inertes cuando el plugin no está activo.
- El sitemap de Yoast excluye expresamente `dipe_equipo` y `dipe_solicitud` (sin fichas públicas), y las taxonomías `dipe_project_tag` (selección de destacados) y `dipe_related_service` (relaciones con páginas de servicio, sin archivo propio). Se conservan las exclusiones previas de Yoast para otros tipos. Páginas, entradas, proyectos y categorías públicas mantienen las decisiones configurables del plugin.
- El perfil mínimo ajusta únicamente sus interruptores; no cambia títulos, descripciones, plantillas editoriales, ajustes de URL o redirecciones. La iteración 0.4.20 añade las reglas de salida de imágenes sociales y los datos de negocio descritos arriba, sin sobrescribir los valores guardados en Yoast.

## Perfil mínimo (19-10-2026)

El usuario limita Yoast a metadatos, schema, sitemap y etiquetas sociales, con impacto mínimo en la web. No se añade ninguna salida visual ni se cambia React.

| Función | Estado del perfil |
| --- | --- |
| Framework de schema, sitemap XML, Open Graph y tarjetas X | Activados |
| Análisis SEO, legibilidad, lenguaje inclusivo, contenido esencial, insights, contador y sugerencias de enlaces | Desactivados |
| IA, llms.txt, IndexNow, Slack, seguimiento de uso, barra de administración y lista de tareas de Yoast | Desactivados |
| Integraciones Semrush, Wincher y Algolia | Desactivadas |
| API SEO de Yoast y endpoint agregador de schema | Desactivados; la REST de WordPress/ACF utilizada por React sigue operativa |

`dipe_core_configure_yoast_minimal_profile()` se ejecuta una sola vez al abrir una pantalla del administrador con `manage_options`, después de activar Yoast y subir los PHP. Usa `WPSEO_Options`, modifica solo valores distintos y reconocidos por la versión instalada, y registra `dipe_core_yoast_profile=minimal-v1` solo cuando la lectura posterior coincide. Si Yoast no está instalado/activo, queda pendiente sin bloquear el sitio. No escribe ajustes en las visitas públicas ni vuelve a imponer el perfil después de aplicarlo; los cambios posteriores del administrador se conservan. Las funciones que no existan en la versión instalada se omiten.

Los controles para editar título, descripción, imagen social y schema de cada contenido permanecen disponibles. Las migas visuales no se insertan en ninguna plantilla y no se elimina su información del schema. No se activan limpiezas de rastreo, transformaciones de URL ni redirecciones nuevas; este perfil tampoco elimina reglas que ya existan.

Desde 0.4.20, el logo principal de **Apariencia > Personalizar > Identidad del sitio** es la fuente de `og:logo`, `Organization.logo` y la imagen social de las páginas sin detalle editorial, por solicitud expresa del usuario. Las imágenes principales de proyectos/entradas alimentan `og:image` en sus fichas. Los campos sociales de Yoast se conservan guardados, pero esta regla determina su salida. Esta decisión sustituye la indicación anterior de configurar por separado logo e imágenes sociales exclusivamente en Yoast.

## Subida e instalación

Los cambios SEO/robots no requieren compilación React. El acortamiento del loader de la entrega 0.4.20 sí requiere la compilación del usuario y los assets completos con manifiesto.

Subir por FTP en este orden, conservando las mismas rutas:

1. `wp-content/plugins/dipe-core/includes/seo.php` (nuevo).
2. `wp-content/plugins/dipe-core/dipe-core.php` (cargador y versión 0.4.20).
3. `wp-content/themes/dipe-react/functions.php` (relevo de metadatos).

El `dipe-core.php` local conserva referencias de iteraciones anteriores: los otros módulos existentes de `includes/` deben estar ya subidos. Si el servidor aún no tiene esas entregas, subir completa la carpeta local `wp-content/plugins/dipe-core/` antes de activar Yoast. No sustituir un plugin completo más reciente del servidor por una copia antigua.

Después, instalar y activar Yoast SEO Free y Premium desde WordPress; conectar la licencia desde MyYoast sin guardar claves ni credenciales en el repositorio. Abrir una pantalla del administrador para aplicar el perfil mínimo y revisar los interruptores en Yoast SEO > Ajustes. Si la integración 0.4.15 ya se subió, en esta iteración basta con los dos PHP de `dipe-core`; el tema no vuelve a cambiar. No se necesita activar WP Rocket para esta integración.

## Configuración editorial en WordPress

- Completar la configuración inicial de Yoast con los datos reales de la organización y su logo. Los metadatos de cada página fija se editan en su página nativa de WordPress, aunque el cuerpo siga en React.
- Revisar Entradas, Páginas y Proyectos en los ajustes por tipo de contenido. Para el listado general usar **Proyectos > SEO del archivo**, que edita título, descripción e indexación en las mismas opciones nativas de Yoast; `/proyectos/` es el archivo del CPT `dipe_proyecto`, mientras `/blog/` usa una página nativa publicada. No crear una segunda página de proyectos para editar ese archivo. La indexación del archivo respeta también Ajustes > Lectura y la regla propia de páginas posteriores a la primera.
- Configurar categorías de entradas y `dipe_project_category` para sus archivos reales. Equipo, solicitudes, etiquetas de destacados y servicios relacionados no deben usarse como destinos SEO públicos.
- Ajustar título SEO, descripción e imagen social en cada contenido. Los análisis quedan desactivados por petición del usuario; no se añade una integración para analizar el cuerpo fijo de React o los campos ACF.
- El bloqueo global de pruebas queda retirado por petición del usuario: no se fuerzan `blog_public=0`, `X-Robots-Tag`, `wp_robots`, `Disallow: /` ni `wpseo_robots_array`. Tras abrir el administrador se restaura una sola vez la visibilidad. Se respetan después Ajustes > Lectura y las decisiones por contenido de Yoast; no se fuerza la indexación de privados, 404 u otros destinos excluidos normalmente.

## Revisión pendiente en servidor

El usuario revisa tras subir los PHP e instalar los plugins. No se han ejecutado comprobaciones locales, build, navegador, tests, lint ni llamadas de prueba a API.

Comprobar primero en los ajustes de Yoast que se ha aplicado el perfil mínimo: sitemap, schema y redes activos, extras desactivados, conservando los campos editoriales.

1. Editar y guardar un título SEO y descripción identificables en una página real, una entrada y un proyecto; comprobar su salida en el código fuente servido y al navegar desde otra página.
2. Confirmar una sola salida para título, descripción, canonical cuando corresponda y etiquetas sociales. Yoast puede omitir canonical en páginas no indexables: no forzar una segunda etiqueta desde el tema.
3. Confirmar que los contenidos públicos configurados como indexables ya no reciben el bloqueo global ni su cabecera. Si se sirve una versión antigua, purgar la caché del servidor antes de concluir que la nueva configuración no se aplica.
4. Revisar `/blog/`, `/proyectos/` y sus categorías con el estado HTTP real. La incidencia histórica de `/categoria/seo/` sigue pendiente; Yoast no corrige una consulta WordPress que resulte 404.

El cuerpo inicial continúa siendo el montaje de React en un contenedor. Esta integración prepara los metadatos; no añade SSR ni resuelve por sí sola la indexación del contenido completo.

## Referencias oficiales

- [Opciones nativas de título, descripción e indexación de archivos de Yoast](https://github.com/Yoast/wordpress-seo/blob/trunk/inc/options/class-wpseo-option-titles.php) y [API de opciones utilizada por el editor del archivo](https://github.com/Yoast/wordpress-seo/blob/trunk/inc/options/class-wpseo-options.php).
- [Integración de Yoast](https://developer.yoast.com/development/integrating/) y [API de metadatos](https://developer.yoast.com/customization/apis/metadata-api/).
- [API de sitemaps y exclusiones](https://developer.yoast.com/features/xml-sitemaps/api/).
- [Filtro de robots en la presentación de Yoast](https://github.com/Yoast/wordpress-seo/blob/trunk/src/presentations/indexable-presentation.php).
- [Instalación de Premium](https://yoast.com/help/installation-guide-of-wordpress-seo-premium/).
- [Ajustes y funciones de Yoast](https://yoast.com/help/configuration-guide-for-yoast-seo/) y [logo de organización](https://yoast.com/help/yoast-seo-settings-site-representation/).
- [Opciones de funciones](https://github.com/Yoast/wordpress-seo/blob/trunk/inc/options/class-wpseo-option-wpseo.php) y [API de opciones](https://github.com/Yoast/wordpress-seo/blob/trunk/inc/options/class-wpseo-options.php).
