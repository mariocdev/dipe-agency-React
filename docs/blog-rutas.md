# Rutas del blog

**Estado tras revisión del usuario:** aplazado hasta retomar el blog. El HTML facilitado de `/categoria/seo/` contiene el H1 React «Categoría: SEO», pero el `<title>` y `og:title` de WordPress dicen «Página no encontrada». La vista del navegador no demuestra que la consulta WordPress ni el HTTP sean correctos. No dar por terminada esta integración; esperar a que el usuario quiera continuarla.

El plugin `dipe-core` 0.4.0 configura una sola vez los enlaces de WordPress: entradas ` /blog/%postname%/ ` y categorías `categoria`. Crea una página publicada «Blog» con slug `blog` si no existe. Si ya hay una página `blog` en borrador, debe publicarse desde el admin; el código no modifica una página existente. El CPT de proyectos y su taxonomía usan `with_front: false` para conservar `/proyectos/` al añadir el prefijo `/blog/` a las entradas. El plugin regenera las reglas de WordPress una vez tras el cambio.

React sirve el archivo `/blog/`, el detalle `/blog/{slug}/` y el archivo `/categoria/{slug}/`, consumiendo entradas y categorías nativas por REST. El archivo carga entradas por bloques; los posts nuevos aparecen sin recompilar. El HTML de una entrada procede de Gutenberg. La sección de blog de Home toma `post.link` y `category.link` de WordPress, así que seguirá las nuevas URL.

Si la URL antigua `/category/{slug}/` o `/{post-slug}/` pasa a ser 404, `dipe-core` la redirige a la URL nueva cuando encuentra la categoría o entrada publicada. No redirige rutas de otros contenidos.

## Entrega y revisión

Subir por FTP `wp-content/plugins/dipe-core/dipe-core.php` y el tema `wp-content/themes/dipe-react/` con `assets/` regenerado. El usuario revisará en el servidor las URL, enlaces de tarjetas, estado HTTP y redirecciones, y comunicará cualquier incidencia. Si persiste un 404, abrir **Ajustes → Enlaces permanentes** y guardar una vez para regenerar reglas; los valores esperados son estructura personalizada `/blog/%postname%/` y base de categorías `categoria`. Purgar Varnish si sirve respuestas antiguas. No hacer comprobaciones locales por iniciativa del agente.
