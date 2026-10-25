# Gestión de opiniones y preguntas

**Actualización 0.4.29 (25-10-2026):** preguntas de invitados y usuarios sin compra pendientes de aprobación; solo preguntas de compradores identificados se publican directamente. Opiniones restringidas a compradores identificados y pendientes de aprobación. Privacidad obligatoria y controles de servidor en ambos formularios. Invitados sin campos de nombre/email, autor público «Invitado». Se conserva esta gestión administrativa, con textos/autor actualizados. Guía y FTP vigentes en [Formularios y correo](tienda-formularios-correo.md), que sustituye el orden de subida inferior de la 0.4.28.

Entrega local del 25-10-2026, `dipe-core` **0.4.28**. Preparada por petición del usuario, pendiente de revisión en servidor. Sin pruebas locales, navegador, lint, llamadas de prueba a API, build, FTP ni operaciones Git. No se modifica el proveedor WooCommerce ni se instala otro plugin.

## Acceso

En **Productos → Preguntas y respuestas** y **Productos → Valoraciones** (nombre traducido por WooCommerce) aparecen pestañas comunes **Opiniones / Preguntas y respuestas**. Se conserva el listado nativo de opiniones de WooCommerce y se sustituye el listado de tarjetas de preguntas por una tabla nativa de WordPress.

## Preguntas

- Búsqueda por texto, búsqueda de producto con selector nativo WooCommerce, filtros **Respondidas / Sin respuesta**, visibilidad **Publicadas / Ocultas-pendientes / Papelera**, fecha ordenable y paginación de 20.
- Cada fila muestra pregunta, producto, autor, resumen de respuesta, visibilidad y fecha. Enlaces para responder/editar, publicar/ocultar y enviar a papelera; acciones de estado por POST y con nonce.
- Selección y acciones en lote para publicar, ocultar y enviar a papelera. En Papelera se pueden restaurar. No hay eliminación definitiva; si WordPress tiene desactivada la papelera, no se ofrece ni se ejecuta esa acción. Las restauradas recuperan su visibilidad anterior.
- Editor de una pregunta con texto completo y respuesta oficial, estado separado y vuelta al listado conservando filtros/página. Una respuesta vacía deja la pregunta como «Sin respuesta»; guardar una respuesta no obliga a publicar una pregunta oculta.
- Los permisos requieren `manage_woocommerce` y `edit_products`; se comprueba además la capacidad de editar el producto de cada pregunta. Enviar a papelera exige permiso de borrado del producto. No concede roles ni capacidades nuevas.

**Publicación vigente:** cualquier visitante puede preguntar con privacidad y controles. Las preguntas de invitados y usuarios sin compra esperan aprobación. Las de compradores identificados salen aunque no tengan respuesta; solo estas actualizan de inmediato el listado y contador públicos. Las pendientes anteriores conservan su estado y pueden publicarse desde las acciones del listado. No se publica contenido pendiente antiguo automáticamente.

Se conservan `dipe_product_qa`, producto padre y `_dipe_product_answer`. No se copian los datos ni se modifica el formato de la respuesta REST pública. Solo se muestran en la web preguntas publicadas de productos públicos. No se envían correos ni avisos al cliente.

## Opiniones y valoraciones

Se reutiliza la pantalla oficial de WooCommerce para mantener aprobación, respuesta rápida, edición, antispam, papelera, acciones en lote y actualización nativa de medias. Sus filtros por estrellas, producto, estado y búsqueda se combinan con el nuevo filtro **Opiniones respondidas / Opiniones sin respuesta**, y una columna adicional muestra ese estado. Se mantienen búsqueda, estrellas y respuesta al cambiar de vista pendiente/publicada.

Los dos filtros de respuesta se aplican a opiniones principales de tipo `review`, no a las filas de respuesta; mientras estén activos, el selector nativo de tipo muestra únicamente opiniones. Una opinión se considera respondida cuando tiene una **respuesta directa publicada de la tienda**. Las respuestas pendientes, spam y papelera no cuentan. El filtro «Cualquier estado de respuesta» vuelve a permitir todos los tipos de fila nativos, incluidas respuestas. La pantalla mantiene los contadores de estado nativos de WooCommerce; no se inventan contadores de las combinaciones de filtros.

Las respuestas oficiales se identifican por el usuario con capacidades de gestión/edición de productos, o por `_dipe_shop_store_reply=1` guardado en nuevas respuestas nativas del personal autorizado. Las respuestas antiguas sin marcador se reconocen por las capacidades actuales de su autor; no se reclasifican respuestas anónimas/importadas como oficiales sin evidencia. La precarga de los estados de respuesta se hace por página; las consultas personalizadas se limitan al listado administrativo. Tras usar la respuesta rápida nativa, volver a filtrar/recargar actualiza el estado de la columna y los resultados.

**Moderación obligatoria:** las nuevas opiniones de clientes sobre productos quedan pendientes antes de ser públicas, incluso si el autor ya tenía opiniones aprobadas. Se aplica mediante `pre_comment_approved` a los envíos nativos que usan la aprobación de WordPress. No se altera el estado de opiniones existentes ni de importaciones administrativas con aprobación explícita, ni la moderación de comentarios del blog. Se conservan errores y decisiones de spam/papelera; las respuestas del personal autorizado mantienen la aprobación nativa. Aprobar/retirar aprobación desde WooCommerce sigue siendo una acción explícita y mantiene sus cálculos nativos.

El contenido de reseñas y sus respuestas sigue siendo el de WooCommerce. No se inventan compradores verificados, notas, testimonios o mensajes de correo, ni se alteran las reseñas corporativas de Home.

## Archivos modificados

- Nuevos `wp-content/plugins/dipe-core/includes/shop-discussions-admin.php` y `includes/class-shop-questions-table.php`.
- Nuevo `wp-content/plugins/dipe-core/assets/shop-discussions.css`, cargado solo en las dos pantallas.
- Modificados `wp-content/plugins/dipe-core/includes/shop-features.php` (publicación de nuevas preguntas y traslado de gestión administrativa) y `dipe-core.php` (carga del módulo, versión 0.4.28).
- Modificado `frontend/src/pages/shop/ProductQuestions.jsx` (mensaje y recarga tras publicar).
- Documentación: esta guía, `docs/tienda-interacciones.md`, `CONTEXTO-PROYECTO.md` y `PLAN_PARA_TERRA.md`.

## FTP y revisión

Subir en este orden, sin reactivar el plugin:

1. `wp-content/plugins/dipe-core/includes/shop-discussions-admin.php`.
2. `wp-content/plugins/dipe-core/includes/class-shop-questions-table.php`.
3. `wp-content/plugins/dipe-core/assets/shop-discussions.css`.
4. `wp-content/plugins/dipe-core/includes/shop-features.php`.
5. **Al final del PHP**, `wp-content/plugins/dipe-core/dipe-core.php`.
6. Assets completos generados por el usuario a `wp-content/themes/dipe-react/assets/`, con `.vite/manifest.json`.

El orden del PHP evita duplicar temporalmente las funciones administrativas trasladadas del módulo antiguo al nuevo. Deben conservarse las dependencias del plugin de entregas anteriores, incluido `shop-checkout.php`; no se sube de nuevo si ya está presente. No hay cambios en el tema PHP ni en WooCommerce, SMTP o ajustes globales de comentarios.

Revisión del usuario: acceso administrador/gestor; búsqueda y filtros combinados; respuesta y conservación de visibilidad; publicar/ocultar/papelera/restaurar en lote; pregunta nueva visible y contador actualizado; opinión nueva pendiente, aprobación explícita y respuesta nativa; filtros por estrellas/producto/respuesta y medias nativas. Ninguno de estos recorridos se ha ejecutado o dado por validado desde Codex.
