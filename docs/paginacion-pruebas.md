# Contenido de prueba y SEO de paginación

## Herramienta retirada del administrador (25-10-2026)

A petición del usuario se retiran los registros del menú de Herramientas y del endpoint AJAX de creación/borrado en wp-content/mu-plugins/dipe-pagination-fixtures.php (1.0.1). El código previo se conserva inactivo; no quedan acciones registradas por el mu-plugin. Las copias existentes, los originales, los términos y la biblioteca no se modifican. La retirada de la herramienta no implica borrar las 80 copias mostradas por el usuario.

FTP de esta iteración: sobrescribir únicamente wp-content/mu-plugins/dipe-pagination-fixtures.php con esta versión. No requiere compilación ni assets, y no afecta al mu-plugin separado de copias de productos. Después recargar el administrador: el apartado Contenido de prueba ya no debe aparecer. Sin comprobaciones locales, build, API de prueba, FTP, cambios de contenido ni Git de escritura; pendiente revisión del usuario en servidor. Las instrucciones siguientes quedan como histórico y no deben usarse para volver a registrar la herramienta.

## Entrega local (19-10-2026)

El usuario solicita 40 duplicados del proyecto `congreso-de-escuelas-de-negocios-y-direccion` y 40 de la entrada `que-es-un-sitemap-y-guia-para-crearlo-deforma-correcta`, conservando ACF, contenido y medios, con variación de categorías y servicios relacionados. Los originales se resuelven por slug y tipo en la instalación actual, sin guardar el dominio temporal.

Preparado `wp-content/mu-plugins/dipe-pagination-fixtures.php`, independiente de las reglas SEO permanentes de `dipe-core` 0.4.23. No se han creado ni eliminado contenidos en el servidor.

## Uso desde WordPress

En **Herramientas > Contenido de prueba**:

1. **Crear / completar las 80 copias** publica 40 proyectos y 40 entradas adicionales. Mantener la pantalla abierta hasta el mensaje final. Procesa cuatro copias por petición, alternando proyecto/entrada. Si se interrumpe, repetir el botón completa los números que faltan; no añade otros 80 cada vez. Una copia incompleta o enviada a la papelera se sustituye al reanudar la creación.
2. Revisar los listados y filtros en servidor y comunicar el resultado. Los títulos y fechas permanecen iguales al original; cada copia tiene ID y slug propios con sufijo `-prueba-01` a `-prueba-40` (WordPress puede añadir un sufijo adicional si ya existe una URL igual).
3. Al terminar las pruebas, **Borrar todas las copias de prueba** solicita confirmación y las elimina definitivamente por lotes, incluidas papelera y copias incompletas. Una sola acción inicia el proceso completo. No afecta a los originales, otros contenidos, términos ni archivos de medios. No hace falta que los originales sigan disponibles para borrar.
4. Cuando el contador total quede en cero, se puede retirar por FTP el archivo del mu-plugin. Retirarlo antes no elimina las copias ni permite gestionarlas desde Herramientas.

Ambas acciones requieren `manage_options`, POST y nonce. La creación verifica también permiso de edición de los originales. Un bloqueo serializa cada lote frente a otras pestañas/administradores y caduca a los diez minutos si una petición muere. La pantalla informa del progreso y errores; no hay cron ni tareas ocultas al cerrar la pantalla. Si se utiliza caché del hosting o CDN, se purga desde su panel después de cambiar el contenido; la herramienta ya no incorpora purgas de proveedores externos.

## Datos conservados y reparto

- Conserva título, HTML, extracto, autor, fecha de publicación, opciones de comentarios, contraseña y jerarquía del original. WordPress genera ID/GUID propios; no se copian revisiones ni comentarios como contenidos independientes.
- Copia los metadatos guardados y sus filas repetidas, con deserialización y escapado de escritura: incluye referencias `_campo` de ACF, repetidores, galerías, destacada y metadatos editoriales/Yoast. Omite marcas propias de la herramienta, bloqueos de edición y slugs/fechas antiguos. No cambia campos de los originales ni metadatos de los adjuntos.
- Reutiliza los IDs y URL de imágenes/vídeos existentes. No duplica archivos ni adjuntos, por lo que el borrado de las copias conserva la biblioteca.
- Cada copia recibe una categoría por rotación entre todas las categorías existentes de su tipo, incluidas las vacías: `category` para entradas y `dipe_project_category` para proyectos. Recibe un servicio por rotación independiente entre los términos existentes de `dipe_related_service` con página de servicio publicada. No inventa ni crea términos; para variar el reparto tienen que existir varias opciones. Con más de 40 categorías o servicios, 40 copias por tipo no alcanzan a cubrirlos todos.
- Si el original tiene categoría principal de Yoast guardada, la alinea con la categoría asignada a la copia. Conserva el resto de taxonomías, incluida `Destacados` si la tiene el proyecto original. Eso puede mostrar copias también en Home; respeta la solicitud de conservar los demás datos.
- Cada copia queda marcada con `_dipe_pagination_fixture=v1`, número `_dipe_pagination_slot` y estado `_dipe_pagination_ready` al completar la publicación. El borrado consulta y vuelve a comprobar esa marca, limitado a entradas/proyectos; no usa coincidencias de título ni de slug para decidir qué eliminar.

## Regla SEO permanente

`includes/seo.php` de `dipe-core` impone **noindex, follow** en búsquedas nativas (`is_search()`, también sin resultados) y URLs paginadas que WordPress identifica mediante `is_paged()` o variables `paged`/`page` superiores a 1. La primera página normal del archivo conserva su política previa. No se cambian robots.txt, sitemaps, indexabilidad de fichas ni ajustes editoriales guardados.

Con Yoast utiliza `wpseo_robots_array` y `wpseo_canonical`; sin Yoast utiliza `wp_robots`, filtra la canonical nativa y omite la canonical propia del tema. **Canonical vacía se interpreta como ausencia de etiqueta `rel="canonical"`**, sin `href=""` ni destino a la primera página. Se conservan las URL sociales.

La navegación de proyectos usa botones/estado React; el blog utiliza también números desde el ajuste posterior del 19-10-2026, sustituyendo «Cargar más entradas» y reemplazando el bloque visible de ocho entradas. Ambos marcan la página activa con fondo naranja corporativo. Siguen sin crear URLs de página. Los filtros de texto dentro del listado tampoco son la búsqueda nativa de WordPress: comparten el documento del archivo. La entrega de PHP no convierte esos controles en enlaces paginados ni cambia las consultas HTTP de WordPress. No declara que exista ya `/blog/page/2/` ni que esa ruta devuelva una página válida; la integración de URLs se abordará en una iteración posterior con los datos de prueba disponibles. La incidencia histórica HTTP/metadatos de categorías sigue pendiente. El ajuste de números requiere la compilación del usuario y subida de assets completos del tema con `.vite/manifest.json`, sin nuevos PHP.

## Archivos y revisión

FTP, conservando rutas y este orden:

1. `wp-content/plugins/dipe-core/includes/seo.php`.
2. `wp-content/plugins/dipe-core/dipe-core.php`.
3. `wp-content/themes/dipe-react/functions.php`.
4. `wp-content/mu-plugins/dipe-pagination-fixtures.php` (crear la carpeta si no existe; el PHP va directamente en ella y se carga automáticamente, sin activación).

El cargador local conserva los módulos de las entregas anteriores: deben estar presentes en servidor. No requiere compilación ni subida de assets React. Purgar caché tras subir los PHP y abrir Herramientas. El usuario revisa creación/reanudación, reparto/ACF/imágenes, filtros y borrado, y aporta el HTML servido de búsqueda/paginación cuando corresponda. No se han ejecutado comprobaciones locales, tests, lint, build, servidor, navegador, capturas, llamadas de prueba a API, FTP ni operaciones Git. Sin publicación ni revisión confirmadas; no se crea PR ni hace falta pull por este lote exclusivamente local.

Referencias de implementación: [robots de WordPress](https://developer.wordpress.org/reference/hooks/wp_robots/), [canonical de Yoast](https://developer.yoast.com/features/seo-tags/canonical-urls/api/), [directivas de robots de Yoast](https://github.com/Yoast/wordpress-seo/blob/trunk/src/presentations/indexable-presentation.php), [inserción de contenido WordPress](https://developer.wordpress.org/reference/functions/wp_insert_post/). Solo se ha consultado documentación oficial, sin acceder a las URLs del servidor de pruebas.
