# Caché y rendimiento

## Estado vigente: caché pública permanente (19-10-2026, plugin 0.4.22)

El usuario confirma PageSpeed con loader desactivado y solicita **habilitar Rocket permanentemente**, incluso si vuelve a poner contraseña en el index. Esta autorización sustituye la decisión anterior de mantener la guarda temporal; acepta que el HTML cacheado puede servirse antes de ese PHP y no quedar protegido por esa contraseña. No se modifica el index ni `.htaccess` manualmente.

`DIPE_CORE_ROCKET_PAGE_CACHE_READY=true` y perfil nuevo `react-v3-public`: al abrir el administrador con permisos de gestión se aplican una vez caché móvil compartida/HTTPS/10 h y precargas de caché/enlaces. Se conservan el perfil React y sus exclusiones; no se activa retraso de JS, CSS sin usar, LazyLoad ni limpieza de BD. Al aplicar el perfil se regeneran las reglas, configuración PHP y drop-in de Rocket y se purga el HTML anterior, retirando la exclusión global temporal. El aviso de Dipe deja de mostrarse. Volver a poner contraseña al index no cambia este estado automáticamente.

**Subida de esta iteración:** primero `wp-content/plugins/dipe-core/includes/cache.php`, después `wp-content/plugins/dipe-core/dipe-core.php`; con Rocket activo, abrir el administrador para aplicar el perfil público. Mantener el loader desactivado, dejar que finalice la precarga y repetir PageSpeed móvil sobre la misma URL/condiciones; el frontend de visitantes sin sesión es el relevante. Sin compilación ni assets nuevos. No se ha activado directamente en servidor ni se confirma caché servida o nueva puntuación. Las secciones de guarda siguientes describen la configuración anterior y no son instrucciones vigentes.

**Informe aportado como referencia:** móvil emulado Moto G Power/4G lenta, Lighthouse 13.5, 19-10-2026 03:19 CEST: rendimiento 66, FCP 3,2 s, LCP 19,1 s, TBT 0 ms, CLS 0 y 14.670 KiB transferidos. LCP identificado como texto del hero; su desglose indica 2.520 ms de retraso de renderizado, distinto de los 19,1 s de la métrica de portada (no se equiparan ni se confirma causa única). MP4 del hero 6.585 KiB, fondo FAQ 1.890 KiB y GIF de iconos de servicios ~3.108 KiB. El informe señala asimismo imágenes de proyectos sobredimensionadas, OTF en la cadena crítica y CSS/JS sin usar. La caché HTML no transforma esos medios. Por indicación posterior del usuario se aísla primero la activación de caché: no se cambian vídeo, imágenes, tipografía, carga de secciones ni división de bundles en esta iteración. Próximo paso tras nueva medición: estudiar WebP Express con entrega real para React y tratamiento específico del vídeo/GIF.

Sin comprobaciones locales, tests, lint, build, consultas de prueba al servidor, FTP ni operaciones Git; revisión del usuario en servidor pendiente.

## Revisión tras Rocket: primera mejora de medios (19-10-2026)

Segundo informe aportado, 03:23 CEST, misma emulación móvil y loader desactivado según la confirmación anterior:

| Dato | Antes | Después de activar Rocket |
| --- | --- | --- |
| Rendimiento | 66 | 67 |
| FCP | 3,2 s | 3,2 s |
| LCP | 19,1 s | 19,0 s |
| TBT / CLS | 0 ms / 0 | 0 ms / 0 |
| Speed Index | 4,8 s | 4,5 s |
| Navegación inicial en árbol de dependencias | 384 ms | 185 ms |
| Transferencia total indicada | 14.670 KiB | 13.330 KiB |

Es una comparación de dos ejecuciones, no prueba de acierto de caché ni de mejora atribuible solo a Rocket. El HTML inicial llega antes, mientras el LCP apenas cambia. El elemento LCP sigue siendo el párrafo del hero dentro de `ResponsiveTitle`; el desglose muestra 2.320 ms de retraso de renderizado y la portada 19,0 s. Son métricas mostradas en contextos distintos del informe; no se suman ni se atribuyen 19 s a un único recurso sin traza. TBT 0 no elimina JS de la ruta crítica: React debe descargarse y ejecutarse para dibujar la web.

El mayor coste de descarga sigue en el MP4 (6.585 KiB), fondo FAQ (1.890 KiB), tres GIF de servicios (3.108 KiB) y foto de proceso (937 KiB): unos 12,2 MiB entre esos recursos. En el código todos se solicitaban al montar sus componentes, aunque fueran exteriores al viewport; `preload="metadata"` del vídeo no limita por sí solo una reproducción automática. Permanecen ~272 KiB de fuentes OTF y ~49 KiB de CSS global. El informe recomienda retraso JS y retirada CSS de forma genérica; no se activan a ciegas sobre la aplicación React ni sus estados dinámicos.

La respuesta de proyectos del árbol pasa de 7,55 a 0,12 KiB y sus imágenes no figuran en el segundo listado. El usuario confirma que **las tarjetas siguen viéndose correctamente sin sesión**. No se interpreta el tamaño como un error REST ni se cambia el feed sin una respuesta real que lo justifique; la diferencia de transferencia puede tener otras causas y limita una comparación exacta del peso total.

Cambios preparados para una iteración aislada, conservando contenido y estilos:

- Nuevo `hooks/useDeferredMedia.js`: IntersectionObserver con margen de 200 px, activación una sola vez y carga normal si no existe esa API. Controla únicamente medios; los textos siguen montándose desde el principio. No añade dependencia ni listener de scroll.
- `ServiceCardsSection.jsx`: cada tarjeta inicia GIF/fondo al acercarse al viewport. Un elemento con la clase/tamaño existentes reserva el hueco del icono mientras tanto.
- `WorkProcessSection.jsx`: imagen/vídeo de proceso se montan al acercarse al visual; el contenedor conserva su tamaño CSS existente. Iconos SVG con carga diferida nativa.
- `FaqSection.jsx`: conserva FAQ, interacción y schema; asigna el fondo al acercarse la sección, evitando solicitar 1,9 MiB desde el montaje inicial.
- `FeaturedProjectsSection.jsx`: difiere su fondo y la escucha de parallax hasta la proximidad; conserva consulta REST/markup de tarjetas y usa carga diferida nativa para miniaturas.
- `LogoCarouselSection.jsx`: carga diferida nativa y decodificación asíncrona de logos inferiores. Se añade también decodificación asíncrona a los medios anteriores.

La carga nativa `loading="lazy"` puede anticiparse bastante al viewport; por eso los GIF y fondos pesados usan la proximidad explícita, en lugar de confiar solo en ese atributo ([documentación de Chrome](https://web.dev/articles/browser-level-image-lazy-loading)). No se difiere el texto ni el vídeo del hero en esta entrega. Los archivos originales mantienen su peso: el objetivo de esta iteración es retirar las descargas lejanas del inicio, no afirmar que se hayan comprimido ni que la nueva puntuación esté medida.

**Fuentes:** se intentó convertir las tres OTF originales a WOFF2 sin subsetting, pero no hay intérprete `python` ni `py` disponible en esta sesión. No se han generado WOFF2, instalado dependencias ni cambiado `fonts.css`. La conversión queda pendiente de una herramienta disponible; se conserva la tipografía original y no se dan cifras de ahorro sin generar los archivos.

**WebP Express:** no está en el checkout. Su documentación ofrece entrega por reglas de servidor para solicitudes JPEG/PNG, que puede cubrir URLs creadas por React y fondos CSS sin depender de reemplazar HTML. Ese modo requiere concretar el servidor/cachés y comprobar entrega real tras configuración; los GIF animados y el MP4 necesitan optimización aparte. No se instala ni configura todavía el plugin, ni se cambia `.htaccess`, Rocket, WordPress o la base de datos ([documentación del plugin](https://wordpress.org/plugins/webp-express/)).

Archivos de código de esta iteración: `hooks/useDeferredMedia.js` y `pages/home/sections/{ServiceCardsSection,WorkProcessSection,FaqSection,FeaturedProjectsSection,LogoCarouselSection}.jsx`. FTP tras compilación del usuario: `wp-content/themes/dipe-react/assets/` completo con `.vite/manifest.json`; sin PHP, fuentes nuevas ni uploads. Purgar Rocket al sustituir assets y repetir la misma prueba con loader desactivado; revisar además que los medios aparecen al bajar y que se conserva el diseño. Sin comprobaciones locales, tests, lint, build, navegación/capturas, pruebas de API, FTP ni operaciones Git. Pendiente revisión del usuario en servidor. Próximos bloques: versión ligera del vídeo y GIF, WebP/entrega y tamaños de imágenes, WOFF2 y reducción del CSS/JS inicial por rutas.

## WP Rocket: primera iteración (19-10-2026)

El usuario confirma que Yoast está subido y funciona correctamente. Solicita preparar Rocket, con ALT automáticos y WebP en una iteración posterior. El paquete local declara **3.15.0.1**; su `wp-rocket.php` contiene modificaciones de validación de licencia, por lo que no se entrega como paquete de instalación. Utilizar una copia oficial. Los archivos del proveedor no se modifican ni se incorporan a Git; `.gitignore` excluye su carpeta. No se ha auditado ese paquete ni confirmado compatibilidad con otra versión aún no aportada.

`dipe-core` 0.4.18 incorpora `includes/cache.php`. Con Rocket activo y opciones inicializadas, aplica una sola vez al abrir el administrador con `manage_options` un perfil de ajustes reconocidos por la versión instalada, utilizando el guardado nativo de opciones. Conserva licencia, CDN, exclusiones y demás ajustes no incluidos. Los cambios manuales posteriores se respetan; pasar del perfil protegido al público aplica una nueva configuración una vez.

- Caché móvil compartida con escritorio, HTTPS y caducidad de 10 horas; sin caché de usuarios autenticados.
- Precarga de caché y enlaces preparada solo para el perfil público.
- Sin minificación/combinación adicional, aplazamiento/retraso de JS ni optimización de entrega de CSS. Vite ya genera los bundles y React dibuja el contenido; se excluyen también sus assets y configuración inline del retraso/aplazamiento de JS y sus assets de la optimización JS.
- Sin LazyLoad de Rocket: el HTML inicial no contiene las imágenes que React crea. No se da por resuelta la carga de imágenes mediante esa opción.
- Sin limpieza automática de base de datos, control de Heartbeat ni envío de estadísticas.
- Blog y Proyectos se añaden a las URL de purga al guardar contenido. Se conservan las purgas nativas de Rocket para entradas, archivos, menús y personalizador.
- Las páginas con formularios pueden cachearse cuando se habilite el perfil público: el envío actual es un POST REST, independiente del HTML. No se cambian formularios, destinatarios ni correos.

## Ajuste desde el panel aportado (19-10-2026, plugin 0.4.19)

El HTML aportado por el usuario corresponde al panel de Rocket **3.15.0.1**: móvil activado sin archivos separados, usuarios autenticados desactivado, caducidad de 10 horas, optimización de archivos/medios desactivada y precargas desactivadas. Ya aparecen `/blog/` y `/proyectos/` en purga. La captura HTML no acredita que se esté sirviendo caché: el mensaje genérico del escritorio de Rocket no refleja la guarda propia de Dipe. El usuario identifica `robots.txt` como causa del fallo de rastreo de Google y se ocupa de actualizarlo; no se modifica en esta tarea ni se confirma una nueva prueba correcta.

Corregido un defecto del perfil 0.4.18: Rocket transforma las URL completas de purga en rutas durante `update_option()`. La comparación posterior esperaba URL completas y podía impedir guardar la marca de aplicación única, repitiendo configuración y purga al entrar al admin. El perfil `react-v2` normaliza primero los campos de patrones con `rocket_sanitize_textarea_field()`, la función nativa del proveedor. El guardado y la comparación utilizan así el mismo formato. Se revisa por lectura del código del proveedor; no se ha ejecutado una prueba local ni medido su efecto en servidor.

El perfil también guarda las exclusiones de los JS del tema, su configuración inline y su retraso/aplazamiento en los campos nativos reconocidos, conservando las existentes. Así aparecen al desplegar sus opciones en el panel, además de seguir protegidas por filtros. La ruta de assets se obtiene del tema, sin fijar el dominio ni nombres de bundles versionados. Se explicitan `optimize_css_delivery=0` e `image_dimensions=0` cuando esas claves ya existen.

Configuración recomendada para esta copia:

| Apartado del panel | Ajuste |
| --- | --- |
| Caché móvil | Activada; archivos separados desactivados, porque el servidor entrega la misma estructura y CSS adapta el diseño. |
| Usuarios conectados | Desactivada. Revisar la caché del frontal como visitante. |
| Vida útil | 10 horas; las actualizaciones de contenido usan las purgas. |
| Minificar CSS/JS y combinar JS | Desactivado para esta base: Vite ya genera los bundles de producción optimizados. |
| Optimizar entrega de CSS | Desactivado. Retirar CSS requiere revisar también estados dinámicos de menús, filtros, carruseles y contenido REST; no se ha hecho esa revisión. |
| Cargar JS de manera diferida / Retrasar ejecución | Desactivado. El módulo de React ya se carga como `type="module"`; retrasarlo hasta una interacción retrasaría el contenido de la web. No hay terceros concretos aportados que justifiquen activar un retraso global. |
| LazyLoad, fondos CSS y dimensiones de imágenes | Desactivado en Rocket. Las imágenes de React se crean después de la respuesta PHP; su carga y dimensiones deben resolverse donde se generan. |
| Precargar caché / Precargar enlaces | Activados al aplicar `react-v3-public`; el usuario autoriza caché permanente con independencia de la contraseña del index. |
| Precargar fuentes / Prefetch DNS | Vacío en esta iteración. Las fuentes actuales son OTF locales versionadas por Vite; no introducir rutas supuestas ni precargar todos los archivos. |
| Reglas avanzadas | Conservar exclusiones propias existentes y purga de `/blog/` y `/proyectos/`; no excluir todas las páginas con formulario, ni cachear búsquedas mediante parámetros. |
| Base de datos | Sin limpieza programada. No mejora la descarga/renderizado de los bundles ni de las imágenes. |
| CDN / Varnish / Cloudflare / Sucuri | No activar sin confirmar que el servicio está contratado/configurado y cómo se purga. |
| Heartbeat | Sin cambios: no se ha identificado como causa de carga del frontal. |
| Compatibilidad WebP | Desactivada hasta concretar la conversión y entrega. Esa casilla no convierte las imágenes ([documentación oficial](https://docs.wp-rocket.me/article/1282-webp)). |

La caché de HTML puede reducir el trabajo de WordPress y su tiempo de respuesta; los datos REST que React pide después, el tamaño del JS, las fuentes, imágenes y vídeos conservan su coste propio. No se afirma que Rocket haya optimizado esos recursos ni se promete una puntuación sin revisión en servidor. La caché de navegador y compresión dependen de las reglas que Rocket pueda aplicar y del servidor; no se han comprobado aquí ([reglas oficiales de htaccess](https://docs.wp-rocket.me/article/1788-wp-rocket-rules-in-the-htaccess-file)).

FTP de este ajuste: `wp-content/plugins/dipe-core/includes/cache.php` y después `wp-content/plugins/dipe-core/dipe-core.php`. Abrir el administrador para aplicar `react-v2` una vez; revisar en el servidor que abrirlo de nuevo no vuelve a purgar por reaplicar el perfil. Con la guarda actual la caché de página sigue desactivada. Sin compilación React, pruebas locales ni FTP automático.

## Contraseña temporal y activación (histórico, sustituido por 0.4.22)

El usuario confirma que **sigue activa la protección por contraseña en el `index.php` raíz**. No se modifica ese archivo. Un HTML cacheado podría servirse antes de ejecutar ese PHP; por ello `DIPE_CORE_ROCKET_PAGE_CACHE_READY` permanece en `false`.

La integración bloquea la generación de caché de página, elimina las reglas de servicio directo de HTML de Rocket y añade una exclusión de todas las URL a su configuración PHP generada. Al aplicar el perfil regenera reglas/configuración/drop-in y purga HTML previo. El administrador muestra un aviso persistente mientras siga la guarda. Estos filtros no controlan Varnish, CDN ni otras cachés del hosting.

Orden de subida y puesta en marcha por el usuario:

1. Mantener Rocket inactivo durante la preparación. Si ya hubiera estado activo, desactivarlo y vaciar su caché antes de instalar esta integración: el código de un plugin no puede interceptar un HTML que ya se sirve antes de cargar WordPress.
2. Subir primero `wp-content/plugins/dipe-core/includes/cache.php` y después `wp-content/plugins/dipe-core/dipe-core.php`.
3. Instalar/activar una copia oficial de Rocket y abrir el administrador. La guarda y el perfil protegido deben aplicarse; revisar el aviso y la protección del frontal en el servidor.
4. Cuando se retire realmente la contraseña del index, cambiar `DIPE_CORE_ROCKET_PAGE_CACHE_READY` a `true` en `includes/cache.php`, subir ese archivo y volver a abrir el administrador. Eso aplica el perfil público con precarga, regenera la configuración y purga el HTML previo. Retirar solo la contraseña **no habilita** la caché.
5. Revisar en servidor, como visitante, Home, Blog/categoría/entrada, Proyectos y un envío real de contacto; confirmar el servicio desde caché y las purgas tras editar contenido. Si hubiera Varnish/CDN, purgarlo también al desplegar. No se han ejecutado estas revisiones ni se declara mejora medida o publicación confirmada.

Esta entrega no requiere compilación React ni assets del tema. Documentación y `.gitignore` no se suben por FTP. Sin comprobaciones locales, tests, lint, build, llamadas de prueba a API ni despliegue automático.

## Interruptor del loader para mediciones (19-10-2026, plugin 0.4.21)

**Herramientas > Loader de la web** permite a administradores activar/desactivar «Mostrar el loader al entrar en la web». Opción `dipe_core_loader_enabled`, activada por defecto para conservar el comportamiento previo. El guardado usa POST administrativo, permiso `manage_options` y nonce; no hay ruta pública de escritura. El módulo nuevo `includes/site-tools.php` se carga desde `dipe-core.php`.

El tema publica `loaderEnabled` como booleano en `window.dipeSite`, junto a la configuración existente. `App.jsx` lo consulta antes del marcador de sesión: desactivado no monta la intro y el contenido queda accesible desde el primer render, con sus efectos habituales. Se aplica por igual a visitantes y PageSpeed; no hay detección especial del rastreador ni petición REST añadida para consultar el ajuste. Activado conserva una aparición por pestaña y la animación breve existente; puede requerir una pestaña nueva para volver a verla si ya se mostró.

Cambiar el valor solicita una purga de dominio mediante la función nativa de Rocket cuando está disponible, porque la configuración pública está dentro del HTML cacheado. No vuelve a aplicar el perfil Rocket ni habilita su caché protegida. Otras cachés del hosting/CDN deben vaciarse por su vía habitual; los documentos ya abiertos necesitan recarga. Guardar sin cambiar no solicita una nueva purga.

FTP: primero `wp-content/plugins/dipe-core/includes/site-tools.php`, después `wp-content/plugins/dipe-core/dipe-core.php`, `wp-content/themes/dipe-react/functions.php` y, tras compilación del usuario, assets completos del tema con `.vite/manifest.json`. Una vez subido todo, desmarcar la opción y guardar antes de medir; el ajuste por sí solo no elimina los demás costes de carga. Sin comprobaciones locales, tests, lint, build, FTP ni operaciones Git; pendiente revisión del usuario en servidor del guardado, ambos estados y purga.

## Siguiente iteración: imágenes

Pendiente definir una solución pequeña para ALT derivados del nombre de archivo, que conserve los ALT manuales y las imágenes decorativas con ALT vacío. Hay que cubrir los medios editoriales servidos por REST y distinguirlos de las imágenes fijas de React; un reemplazo del HTML de WordPress no cubre por sí solo las imágenes creadas después por React.

WebP queda pendiente de revisar con la copia definitiva de Rocket y el servidor: conversión de originales/miniaturas y entrega de las URL reales de imágenes, incluidas las de React y fondos CSS. No activar reemplazos de HTML suponiendo que alcanzan todos esos casos. No se instala WebP Express ni otro plugin de imágenes en esta iteración.

Referencias oficiales: [deshabilitar caché de página](https://docs.wp-rocket.me/article/61-disable-page-caching), [requisitos de precarga](https://docs.wp-rocket.me/article/8-preload-cache), [retraso de JavaScript hasta interacción](https://docs.wp-rocket.me/article/1349-delay-javascript-execution). Los hooks y nombres de opciones de esta integración se han consultado en el código local 3.15.0.1, sin ejecutarlo.
