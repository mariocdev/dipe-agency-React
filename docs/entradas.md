# Entrada interna y servicios relacionados

Estado: el 18-10-2026 el usuario aprueba expresamente el estado actual de todos los archivos locales como «PERFECTO» y autoriza su consolidación en `main`. Entrada, sidebar, filtros, iconos y servicios relacionados forman parte de esa base. Esta aprobación prevalece sobre las notas históricas de revisión pendientes de este documento; las instrucciones de configuración siguen siendo la referencia de uso. No identifica un commit exacto publicado por FTP ni da por resueltas incidencias técnicas ajenas a la maquetación. Sin builds ni comprobaciones de la web por Codex; solo lectura/render del PDF. Estado Git de la consolidación en `CONTEXTO-PROYECTO.md` y `PLAN_PARA_TERRA.md`.

## URLs y contenido

- Entrada: `/blog/{slug}/`, resuelta por WordPress mediante una entrada nativa publicada. No se crea una página corporativa para cada artículo.
- El usuario confirma la búsqueda nativa: `/?s=texto`. El formulario añade `post_type=post` para limitar también la consulta WordPress al blog. React muestra resultados con las tarjetas y filtros existentes, inicializados con la búsqueda de la URL. No hace falta crear una página de resultados ni cambiar las reglas de enlaces.
- Título, fecha, autor y categorías son nativos. No se escribe «DIPE» como autor fijo ni se copian artículos, fechas o personas de muestra del PDF. Las anotaciones de la maqueta no son contenido público.
- El cuerpo procede de `content.rendered` de WordPress. Se puede introducir HTML en el editor de código de la entrada; no se crea un ACF de contenido ni campos por sección.

## Los dos ACF de cada entrada

El módulo `dipe-core/includes/blog.php` registra automáticamente el grupo **Cabecera de la entrada** cuando ACF Pro está activo; no hay que crearlo manualmente.

| Campo | Nombre | Uso |
| --- | --- | --- |
| Imagen o vídeo del banner | `dipe_post_banner_media` | Un archivo JPG/JPEG/PNG/GIF/WebP/AVIF/MP4/WebM; retorno ACF completo |
| Subtítulo | `dipe_post_subtitle` | Texto breve sin HTML bajo el h1 |

Ambos son opcionales para mantener las entradas existentes. Si falta el medio ACF, la cabecera usa la imagen destacada nativa; si tampoco existe, reserva el espacio. La imagen destacada sigue siendo el medio de las tarjetas del blog. El vídeo del banner tiene controles e inline, sin reproducción automática. `getPost()` solicita `acf_format=standard`; no se fija ningún dominio de medios.

## Índice y estilos del HTML

`EditorialContent.jsx/.css` comparte la tipografía del cuerpo con Proyectos: Gordita regular a 18 px, interlineado 1.7, h2 a 38 px y h3 a 24 px, con la escala responsive existente. h4/h5/h6 usan 20/18/14 px escalados; el h1 queda reservado para el título de la entrada. Los espaciados específicos de la entrada se limitan a su CSS. Proyectos conserva sus columnas y paddings.

El índice se genera desde todos los h2/h3 del HTML, sin ACF adicional. Conserva los identificadores disponibles y resuelve duplicados al preparar la vista, sin modificar lo guardado en WordPress. Si no hay encabezados, no aparece un índice vacío. Los enlaces son anclas nativas y los destinos usan el desplazamiento dinámico de cabecera, que ya contempla la barra de administración de WordPress. Las alturas del texto dependen del contenido.

## Sidebar y cierre

El primer bloque tiene fondo gris `#F6F6F6`, esquinas de 10 px y altura de contenido; contiene búsqueda, tres últimas entradas publicadas excluyendo la actual y categorías nativas con entradas. La lista de categorías admite desplazamiento interno. Las noticias y categorías se obtienen independientemente del artículo; un fallo secundario no bloquea el cuerpo. El segundo bloque contiene las tarjetas de servicios relacionados configuradas. Los comentarios internos del PDF se han leído para proporciones/estilos (banner 529:578 e índice/tarjeta a 32 px escalados), sin publicar anotaciones ni imponer sus alturas de maqueta a los textos.

El cierre incluye compartir mediante enlaces de Facebook/LinkedIn/WhatsApp y copiar enlace, más anterior/siguiente entre entradas publicadas según la navegación nativa de WordPress. Por petición del usuario se usan los cinco SVG aportados: `facebook-f-brands-solid-full.svg`, `linkedin-brands-solid-full.svg`, `instagram-brands-solid-full.svg`, `whatsapp-brands-solid-full.svg` y `copy-light-full.svg`. Se centralizan en `blogMedia.shareIcons` mediante `homeMedia` (uploads/2026/10), sin fijar el dominio temporal. Ajuste vigente: «Compartir» en Gordita Bold 700 normal, 18 px con escala responsive y tinta `var(--Color-2, #1D1D1D)`; iconos de 28 px dentro de controles de 32 px, separación horizontal de 4 px y etiquetas accesibles. Los SVG se muestran mediante máscaras CSS con `currentColor` para pasar a naranja exacto en hover/foco, sin fondo gris. El botón de Instagram abre el menú nativo de compartir si existe; Instagram solo estará entre los destinos si lo ofrece el dispositivo. Sin esa función o si falla, copia el enlace; cancelar no lo copia. No se insertan SDK sociales. `GET dipe/v1/posts/{id}/navigation` aporta los enlaces adyacentes; no añade dos consultas de navegación a cada tarjeta del archivo. No se copian destinos ficticios del PDF. La plantilla termina en el footer común; no añade formulario ni altera configuraciones de correo.

Último ajuste de cabecera solicitado el 18-10-2026: interlineado del h1 de 1 a 1.2 y del subtítulo de 1.45 a 1.7. Son cambios específicos de la entrada, con alturas dinámicas y pendientes de revisión del usuario en servidor junto a los iconos.

## Servicios relacionados: una taxonomía compartida

`dipe_related_service` es una taxonomía no jerárquica, con comportamiento de etiquetas, asignable a **Entradas** y **Proyectos**. No es otro CPT y no sustituye las categorías/etiquetas existentes, incluida «Destacados».

1. En **Servicios relacionados**, crear el término real, por ejemplo Marketing Online si corresponde al contenido.
2. Editar ese término y elegir **Página del servicio** (`dipe_service_page`), una página nativa de WordPress. Añadir opcionalmente **Imagen del servicio** (`dipe_service_image`). Estos ACF pertenecen al término, no añaden más campos al grupo de la entrada.
3. Asignar el mismo término desde la entrada y el proyecto correspondientes.

Los enlaces se obtienen del permalink de la página seleccionada; no se deducen del slug de la etiqueta. La taxonomía no crea archivos públicos ni nuevas URL. Los servicios sin página publicada no se muestran. Seleccionar una página no la crea ni la maqueta: usar destinos que tengan página nativa y plantilla React preparada; las páginas de servicio todavía no implementadas siguen pendientes de su propia tarea.

El campo REST de solo lectura `dipe_related_services` devuelve términos asignados con nombre, URL e imagen. En entradas se presentan como tarjetas del sidebar. En proyectos aparecen como enlaces en el resumen existente, conservando su diseño. El contenido compartido se administra una sola vez.

## Archivos de esta iteración

Código añadido o modificado:

- `wp-content/plugins/dipe-core/dipe-core.php` (versión 0.4.11).
- `wp-content/plugins/dipe-core/includes/blog.php` (nuevo).
- `wp-content/plugins/dipe-core/includes/related-services.php` (nuevo).
- `frontend/src/app/App.jsx` (selección de la vista de búsqueda nativa).
- `frontend/src/lib/api.js`.
- `frontend/src/components/content/EditorialContent.jsx` (nuevo).
- `frontend/src/components/content/EditorialContent.css` (nuevo).
- `frontend/src/components/services/RelatedServices.jsx` (nuevo).
- `frontend/src/components/services/RelatedServices.css` (nuevo).
- `frontend/src/pages/blog/BlogPost.jsx` (nuevo).
- `frontend/src/pages/blog/BlogPostSidebar.jsx` (nuevo).
- `frontend/src/pages/blog/BlogPostFooter.jsx` (nuevo).
- `frontend/src/pages/blog/blogMedia.js` (mapa de medios e iconos de compartir).
- `frontend/src/pages/blog/BlogPages.jsx`.
- `frontend/src/pages/blog/BlogPages.css`.
- `frontend/src/pages/blog/BlogArchive.jsx` (búsqueda inicial desde URL).
- `frontend/src/pages/blog/BlogArchiveSections.jsx` (hero parametrizable para resultados).
- `frontend/src/pages/projects/ProjectDetail.jsx`.
- `frontend/src/pages/projects/ProjectDetail.css`.

Documentación añadida o actualizada: este archivo, `CONTEXTO-PROYECTO.md`, `PLAN_PARA_TERRA.md`, `docs/blog-rutas.md` y `docs/proyectos.md`.

## FTP y revisión del usuario

Subir en este orden:

1. `wp-content/plugins/dipe-core/includes/blog.php` y `wp-content/plugins/dipe-core/includes/related-services.php`.
2. `wp-content/plugins/dipe-core/dipe-core.php`, que carga ambos módulos.
3. Tras la compilación del usuario, carpeta completa `wp-content/themes/dipe-react/assets/`, incluido `assets/.vite/manifest.json`.

No subir fuentes React ni documentación como archivos públicos. No se han cambiado otros PHP en esta iteración y no hace falta cambiar de tema, activar de nuevo el plugin ni crear una página para la búsqueda nativa.

Pendientes concretos: aportar/asignar banner y subtítulo a una entrada real; introducir su HTML con h2/h3; configurar un servicio con una página publicada ya preparada y asignarlo a una entrada y un proyecto; revisar el diseño responsive, anclas con/sin barra de WordPress, ambos medios de banner, buscador/resultados y navegación anterior/siguiente. La discrepancia anterior de HTTP/metadatos de categorías sigue pendiente y no se declara resuelta con esta plantilla.
