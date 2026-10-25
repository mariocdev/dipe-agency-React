# Tienda: pestañas, lista de deseos y preguntas

**Privacidad/invitados/correos, actualización 0.4.29 (25-10-2026):** preguntas abiertas también a invitados, pendientes de validación; usuarios sin compra también requieren aprobación, compradores identificados pueden publicar preguntas directamente. Opiniones solo para compradores identificados y con aprobación. Ambos formularios requieren privacidad y validación antispam de servidor. Core incorpora también identidad de correos HTML Woo sin alterar datos/envíos. Reglas, fuentes y FTP vigentes en [Formularios y correo](tienda-formularios-correo.md), sustituyendo la política anterior de publicar preguntas de cualquier usuario identificado.

**Gestión y moderación ampliadas (25-10-2026):** `dipe-core` 0.4.28 añade pestañas comunes en Productos para Opiniones/Preguntas, tabla de preguntas con búsqueda/producto/visibilidad/respondidas, paginación y acciones en lote, y filtro/columna de respuesta en las valoraciones nativas de WooCommerce. Nuevas opiniones de cliente requieren aprobación; nuevas preguntas se publican inmediatamente aunque no estén respondidas. Las pendientes antiguas no cambian de estado solas. Sustituye el comportamiento de publicación pendiente y las tarjetas de administración descritos en la primera entrega. Guía vigente, permisos, alcance y FTP exacto en [Gestión de opiniones y preguntas](tienda-moderacion.md). Cambia también ProductQuestions JSX (aviso y recarga); sin comprobaciones locales/build/FTP/Git, pendiente revisión en servidor.

**Estado inicial de filtros (25-10-2026):** solo Categorías empieza abierto; Precio, atributos y Disponibilidad empiezan cerrados, incluidos atributos que lleguen después de la carga inicial. Se conservan la apertura individual, el control global «Encuentra el tuyo» y los valores seleccionados al plegar. Modificado `ShopArchiveFilters.jsx`. El mismo lote amplía el sidebar de compra y el sticky dinámico con altura real del header; fuentes, requisito de conversión del bloque y FTP exacto en [Carrito y checkout](tienda-checkout.md). Sin comprobaciones locales/build/FTP/Git; revisión en servidor pendiente.

## Galería y filtros, ajuste posterior del 25-10-2026

Nueva `ProductGallery.jsx/.css`, extraída de ProductDetail: cursor de lupa y zoom de seguimiento del ratón en la imagen principal. Solicita la imagen `src` de tamaño completo de Store API al aproximar el puntero; no amplía la miniatura responsive. La escala está limitada al menor valor entre 2,5× y la resolución disponible por píxel físico de pantalla. Si la fuente no tiene margen para ampliar sin interpolación, conserva su escala; no se inventa resolución ni se promete recuperar detalle ausente del original.

Click/Enter abre un lightbox con diálogo nativo, fondo oscuro, miniaturas, anterior/siguiente, contador y ajuste/tamaño original. La imagen completa también respeta la resolución disponible considerando la densidad de pantalla. En modo original, si excede la ventana se puede desplazar por su contenedor; no se escala por encima de ese límite. Flechas del teclado navegan, Escape/botón/fondo exterior cierran, el fondo queda inerte, se bloquea/restaura el scroll de la raíz y se devuelve el foco a la imagen principal. La galería sigue las imágenes de la variación y conserva el corazón de favoritos. La versión completa se carga por interacción, no para todas las imágenes de antemano.

El sidebar usa grupos desplegables nativos controlados: **Encuentra el tuyo** cierra todos los grupos si alguno está abierto y los abre todos si están cerrados. Cada título controla su propio grupo; cerrar no elimina selecciones. Los filtros nuevos que lleguen con los metadatos respetan el estado global. Los rótulos siguen sin HX. **Limpiar** es independiente y también reinicia el precio escrito aún no aplicado. La cabecera permite reorganizar Limpiar en espacios estrechos sin partir «Encuentra el tuyo»; el rótulo tiene texto sin salto de línea.

El buscador aplica hover/borde y foco al formulario entero (input + botón de lupa). Se retira el contorno parcial del input y se conserva indicación de foco en el botón; no queda un borde naranja cortado antes de la lupa.

Fuentes de esta corrección: nuevos `frontend/src/pages/shop/ProductGallery.jsx` y `ProductGallery.css`; modificados `ProductDetail.jsx/.css`, `ShopArchiveFilters.jsx` y `Shop.css`. Solo FTP de assets completos con manifiesto tras compilación del usuario; no cambia PHP, productos, medios, datos, core o menús. Sin pruebas locales, navegador, build, llamadas de prueba a la API, FTP ni Git. Revisión de zoom/calidad, lightbox/teclado/móvil, plegado y buscador pendiente en servidor.

**Corrección semántica posterior (25-10-2026):** H1 de producto conservado; las pestañas no insertan HX ni títulos de sección predefinidos. Solo el HTML editorial del producto aporta los encabezados que su editor incluya. Se elimina también el H2 nativo duplicado de reseñas en el HTML del tema y su etiqueta de formulario deja de declarar `role="heading"`/`aria-level`. La pregunta conserva sus etiquetas de formulario sin «Haz tu pregunta» como H3. «También te puede gustar» sigue H2 y todas las tarjetas de productos pasan a H3, igual que en el catálogo bajo su H2 de colección y las líneas del carrito bajo «Tus productos». El sidebar usa textos/legends para controles y los estados vacíos/error no añaden HX. Los estilos visuales se conservan mediante clases. Esta corrección añade dos PHP del tema al FTP: `inc/commerce.php` y `woocommerce.php`, además de los assets; no requiere volver a subir `dipe-core` por sí misma. Revisión en servidor pendiente.

Entrega local del 25-10-2026, pendiente de revisión del usuario en servidor. Parte de las capturas aportadas: pestañas funcionales con diseño Dipe, corazón en la imagen y hover suave con espacio interior en las tarjetas. No se copia el contenido alimentario, el color rojo ni los contadores ficticios de la referencia.

## Pestañas y tarjetas

`ProductTabs.jsx` presenta Descripción, Detalles, Opiniones y Preguntas y respuestas. Cuando caben, son botones con `tablist`, `tab` y `tabpanel`, selección activa y navegación por flechas/Home/End. **Ajuste del 25-10-2026:** cuando la fila no cabe en el ancho real del contenedor, se sustituye visualmente por un selector nativo con etiqueta «Información del producto», las cuatro opciones y sus contadores. No hay desplazamiento lateral ni un corte fijo por tamaño de pantalla. ResizeObserver compara el ancho natural de la fila con el disponible, también al cambiar contadores, fuentes o dimensiones; hay respaldo de resize/fuentes. La fila se conserva oculta y fuera del flujo para medirla sin clonar controles; el selector es el único control accesible en ese modo. Al recuperar espacio vuelven las pestañas. Si un cambio de formato oculta el control enfocado, el foco pasa a su equivalente visible.

Solo hay un panel visible. Con selector se presenta como región etiquetada por su sección; con pestañas conserva las relaciones ARIA originales. Los paneles permanecen montados para conservar los formularios de reseñas y preguntas. El acceso a opiniones junto al título abre esa sección y actualiza también el selector; enlaces nativos de comentarios/`respond` siguen revelándola al volver de un envío.

Fuentes de este ajuste: `frontend/src/pages/shop/ProductTabs.jsx` y `ProductDetail.css`; documentación en esta guía, `CONTEXTO-PROYECTO.md` y `PLAN_PARA_TERRA.md`. FTP solo `wp-content/themes/dipe-react/assets/` completo con `.vite/manifest.json`, tras compilación del usuario. Sin PHP, core o ajustes de WordPress nuevos. Sin comprobaciones locales, navegador/capturas, tests/lint, build, API de prueba, FTP u operaciones Git. Pendiente revisar en servidor el selector al estrechar y las pestañas al ampliar, selección externa de opiniones, contadores, teclado/foco y conservación de formularios.

El activo es naranja corporativo; el contenido tiene borde y padding como en la referencia, manteniendo tipografía, anchos y estilos del proyecto. No se inventan pestañas de ingredientes o conservación para productos que no tienen esos campos.

Retiradas la flecha flotante de las tarjetas y la flecha de ampliar la imagen de la ficha. Único control de acción sobre la imagen: corazón arriba a la derecha. Oferta/Agotado siguen como etiquetas informativas. El corazón es un botón hermano del enlace de la imagen, no un botón dentro de un enlace; conserva nombre accesible y `aria-pressed`. Hover diferenciado y relleno naranja al guardar.

Tarjetas de tienda: padding de información **10 px izquierda, derecha y abajo**, conservando 20 px superiores (15 en móvil). Hover y foco interno elevan la tarjeta **2 px** y muestran sombra naranja de **6 px al 18 %**, más suave que la del blog. Se retira el zoom previo de la imagen. Movimiento reducido omite el desplazamiento y animaciones. No se cambian las tarjetas de blog o proyectos.

## Lista de deseos

- Invitado: IDs de producto en `sessionStorage`, clave `dipe-shop-wishlist-session-v1`. Conserva navegación/recargas de esa pestaña y termina con su sesión; no promete sincronización entre pestañas de invitados o dispositivos.
- Identificado: metadato privado `_dipe_shop_favorites` del usuario actual, mediante REST autenticado de WordPress por cookies y nonce. Los IDs no se guardan como lista personal en almacenamiento público del navegador.
- Al acceder se unen los favoritos de invitado a los de la cuenta, conservando los existentes y sin duplicar. Se retiran del almacenamiento de invitado los que se hayan guardado en la cuenta. Límite de 100 productos; una variación se normaliza a su producto padre.
- El catálogo incluye botón **Lista de deseos**, con estado en URL `favoritos=1`; puede combinarse con los filtros de la sección actual. Sin favoritos no se hace una consulta con `include` vacío que devolvería todo el catálogo.
- La cuenta nativa incluye **Lista de deseos**, que enlaza al catálogo general con ese parámetro, sin registrar una nueva ruta WordPress o exigir guardar enlaces permanentes.
- El corazón de catálogo, relacionados y ficha comparte estado. En cuenta se confirma el cambio tras respuesta del servidor. Un fallo no simula que se haya guardado. Al restaurar una página desde la caché de navegación se recupera la lista actual.

Los endpoints privados solo acceden a `get_current_user_id()`, sin aceptar un ID de cliente de React. Solo se incluyen productos publicados, visibles públicamente y sin contraseña. Las mutaciones se serializan por usuario, los resultados privados llevan `Cache-Control: private, no-store` y no se publican claves administrativas. Si el navegador impide conservar la sesión se informa; si falla la carga de cuenta se ofrece reintento.

## Preguntas y respuestas

Primera implementación propia en `dipe-core`, sin instalar una extensión adicional. Se usa el tipo interno **`dipe_product_qa`**, no público, sin archivo/rewrite ni REST genérico, con producto padre, autor identificado y texto de la pregunta. La respuesta oficial se guarda en `_dipe_product_answer`. No se reutilizan comentarios de reseña ni se altera el promedio o el número de opiniones.

El listado público devuelve únicamente preguntas publicadas y su respuesta, nombre de perfil y fecha, paginadas de diez en diez. No devuelve correos, IDs de usuario o preguntas pendientes. El contador de la pestaña procede de esa consulta y no se inventa mientras carga.

Para preguntar no hace falta cuenta o compra. El formulario tiene texto (10–2000 caracteres), privacidad y controles técnicos. Los invitados figuran como «Invitado», sin pedir nombre/email. Invitados y usuarios sin compra quedan pendientes; preguntas de compradores identificados se publican y refrescan listado/contador aunque no tengan respuesta. El servidor valida el origen, token firmado, privacidad, campo trampa, límites y duplicados; no se fía del estado enviado por React.

Gestión en **Productos > Preguntas y respuestas**: administrador/gestor con `manage_woocommerce`, `edit_products` y permiso sobre el producto dispone de tabla con filtros, respuesta en editor, visibilidad independiente y acciones en lote reversibles. Las opiniones se administran con la tabla nativa WooCommerce ampliada. Detalles en la guía de moderación. La respuesta pública sigue como «Respuesta de Dipe». No se envían correos ni se crean datos de ejemplo en esta entrega.

Rutas bajo `dipe/v1/shop`:

| Ruta | Uso |
| --- | --- |
| `GET wishlist` | Lista privada del usuario actual. |
| `POST wishlist` | Unión de IDs de invitado a la lista actual. |
| `POST wishlist/{product_id}` | Guardar/quitar un producto en esa lista. |
| `GET products/{product_id}/questions` | Preguntas aprobadas, total y paginación. |
| `GET products/{product_id}/question-form` | Token y condiciones de publicación del formulario, sin caché. |
| `POST products/{product_id}/questions` | Nueva pregunta con privacidad; publicación según compra/sesión. |

Esta primera gestión contempla una respuesta oficial por pregunta. Hilos entre usuarios, notificaciones, adjuntos, edición del autor y políticas de retención/exportación/borrado quedan fuera de esta iteración. Los formularios de contacto y su SMTP no cambian.

## Archivos y FTP

PHP: nuevo `wp-content/plugins/dipe-core/includes/shop-features.php` y actualizado `wp-content/plugins/dipe-core/dipe-core.php`, versión **0.4.26**. No cambia el PHP del tema: ya entrega el nonce REST de usuarios identificados.

React: nuevos `pages/shop/ProductTabs.jsx`, `ProductQuestions.jsx` y `Wishlist.jsx`; actualizados `ProductDetail.jsx/.css`, `ShopShared.jsx`, `Shop.css`, `ShopArchive.jsx` y `lib/commerce.js`. Documentación: este archivo, guía de tienda, plan de tienda, guía visual y ambas notas de continuidad.

Orden de subida:

1. `wp-content/plugins/dipe-core/includes/shop-features.php`.
2. `wp-content/plugins/dipe-core/dipe-core.php` (requiere el módulo nuevo).
3. Tras compilación del usuario, **assets completos** de `wp-content/themes/dipe-react/assets/`, incluido `.vite/manifest.json`.

No hace falta instalar otro plugin ni repetir el preparador de datos o guardar enlaces permanentes. Los documentos y las fuentes React no se suben por FTP. El usuario revisa pestañas/reseñas, corazones de invitado/cuenta, vista de favoritos, hover/móvil y el recorrido enviar → moderar → publicar pregunta en servidor.

Sin comprobaciones locales, PHP, tests, lint, navegador, capturas, API de prueba, compilación, FTP ni operaciones Git. No se declara esta vista o persistencia validada antes de esa revisión.
