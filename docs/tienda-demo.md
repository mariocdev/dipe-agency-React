# Preparar WooCommerce para maquetar

## Copias temporales para paginación y carrusel (25-10-2026)

Nuevo mu-plugin independiente `wp-content/mu-plugins/dipe-product-copies-demo.php`. Subir ese archivo y abrir **Herramientas → Copias de productos demo → Crear / reanudar copias**. No ejecuta cambios al cargarlo. Selecciona por defecto **tres copias por original**, ajustables de 1 a 10 antes de iniciar. Con los 12 padres iniciales se obtienen 36 copias nuevas (48 padres en total) y, si siguen cuatro originales por categoría, 16 productos por categoría. Duplica únicamente padres simples/variables publicados al iniciar, excluyendo sus propias copias; fija ese catálogo de origen para toda la ejecución.

Usa la duplicación nativa de WooCommerce: mantiene imágenes/galería compartidas, categorías, etiquetas, atributos, precios, existencias y variaciones. No descarga ni duplica medios, comentarios, preguntas o pedidos. Reinicia ventas/contadores de valoraciones y asigna SKU propios; identifica título/slug/descripciones como DEMO. Retira de las copias los metadatos `_dipe_` originales antes de asignar marcas propias, por lo que las herramientas anteriores de tienda/reseñas/medios no las confunden con originales demo. Elimina también el canonical explícito heredado. El padre permanece en borrador hasta terminar y sincronizar sus variaciones.

La pantalla procesa una copia con sus variaciones por petición AJAX, en secuencia mientras está abierta. Puede detenerse tras la petición en curso y reanudarse; reconoce posiciones completas para no duplicarlas ni sobrescribir ediciones. Si encuentra una copia incompleta, se detiene y ofrece retirar las copias antes de reiniciar. POST/nonce, permisos de administración/edición/publicación/borrado, comprobación del original y bloqueo compartido de diez minutos protegen las operaciones. No tiene cron propio ni ejecuta tareas al cerrar la pantalla.

**Retirar copias a la papelera** procesa únicamente productos marcados por este mu-plugin y sus variaciones; comprueba antes que no contengan variaciones ajenas. No borra originales, medios o ajustes. También recoge variaciones propias huérfanas. Se rechaza la retirada si WordPress tiene la papelera desactivada para evitar borrado definitivo; las copias retiradas siguen la retención habitual de la papelera. Al terminar se libera el lote y puede iniciarse otro. Si quieres limpiar el catálogo, completa primero la retirada y después elimina el archivo del mu-plugin. Quitar solo el archivo conserva los productos creados, que WooCommerce administra normalmente.

FTP de esta herramienta: **solo el nuevo PHP**. El catálogo a 12 por página y el carrusel de relacionados requieren además los assets indicados en [Tienda frontend](tienda-frontend.md). No cambia el preparador original ni `dipe-core`. Sin comprobaciones locales, navegador/capturas, tests/lint, build, API de prueba, creación remota de productos, pedidos/correos, FTP u operaciones Git. Pendiente ejecución/revisión del usuario en servidor.

**Confirmación del usuario, 25-10-2026:** «ha ido perfecto todo». El preparador se considera revisado en servidor según esa confirmación, sin identificar un commit exacto desplegado. No hace falta repetir su instalación para la siguiente entrega; las pantallas nuevas se documentan en [Tienda frontend](tienda-frontend.md) y siguen pendientes de revisión propia.

Entrega local del 25-10-2026. Plugin independiente **Dipe — preparación de tienda demo**, versión 1.0.0. El usuario ya ha instalado WooCommerce en su WordPress. La copia del proveedor aportada al workspace declara 11.2.1; no se ha confirmado la versión efectiva del servidor ni ejecutado el plugin allí.

## Instalación y uso

### Mu-plugin posterior: reseñas y preguntas ficticias (25-10-2026)

Solicitado expresamente para pruebas. Subir únicamente `wp-content/mu-plugins/dipe-shop-discussion-demo.php`, abrir **Herramientas > Opiniones y preguntas demo** y pulsar **Crear / completar ejemplos**. Requiere WooCommerce y el módulo de preguntas de `dipe-core` (0.4.26 o posterior). La carga del archivo no modifica datos por sí sola.

Por cada producto publicado con la marca del preparador Dipe, crea cinco reseñas aprobadas (una de cada puntuación de 1 a 5), dos preguntas publicadas con respuesta, una publicada sin respuesta y una pendiente. Con los doce productos iniciales son **60 reseñas y 48 preguntas**, de las que 36 son públicas y 12 pendientes. Las reseñas se asignan al producto padre, no se duplican por variación.

Autor y textos de reseña incluyen DEMO; preguntas y respuestas se identifican como ficticias. Sin usuarios, pedidos, compradores verificados o correos nuevos. Las reseñas de ejemplo **sí afectan temporalmente a las medias y recuentos**; si un producto no tenía otras reseñas, las cinco puntuaciones dan una media de 3/5. No se altera la sección de opiniones reales de Home.

Creación por lotes de un producto y marcas estables para no duplicar los ejemplos al repetir. Se conservan los cambios que el usuario haga en ejemplos ya existentes, incluso si cambia su estado. Para retirarlos, pulsar **Borrar únicamente estos ejemplos**, aceptar su eliminación definitiva (incluye esas ediciones) y esperar a que los contadores queden en cero. Entonces borrar el mu-plugin. Borrar solo su archivo conserva los datos; se puede volver a subir para retirarlos.

La limpieza busca sus marcas incluso en papelera/spam o si el padre ya no existe. No elimina opiniones/preguntas ajenas, productos, usuarios o medios. Tras crear o borrar recalcula las medias/recuentos con WooCommerce. Usa [inserción nativa de comentarios con metadatos](https://developer.wordpress.org/reference/functions/wp_insert_comment/) y [consulta por estado y marcas](https://developer.wordpress.org/reference/classes/wp_comment_query/__construct/); las preguntas utilizan el tipo interno `dipe_product_qa` y `_dipe_product_answer` ya existentes.

Herramienta protegida con permisos administrativos, POST/nonce y bloqueo de lotes. Sin modificar React, PHP del tema, configuración comercial o SMTP. No necesita compilación ni otros archivos FTP. Sin ejecución de PHP, pruebas locales/API del sitio, build, FTP u operaciones Git; creación y retirada pendientes de la acción del usuario en servidor.

### Preparador original del catálogo

1. Instalar `entregas/dipe-shop-demo-1.0.0.zip` desde **Plugins > Añadir plugin > Subir plugin** y activarlo. El ZIP contiene solo la herramienta propia, no WooCommerce. Activarlo no crea datos ni cambia ajustes.
2. Abrir **Herramientas > Tienda demo Dipe** con un administrador que tenga permisos de WooCommerce y productos.
3. Pulsar **Crear / completar catálogo demo** y aceptar la publicación de los datos ficticios. Mantener la pantalla abierta hasta el mensaje final. Cada petición procesa un producto y sus variaciones; se puede reanudar después de un error sin duplicar los productos completados.
4. Revisar los productos en **Productos** y las opciones de la segunda sección de la herramienta. Pulsar **Aplicar estos ajustes** solo con las opciones deseadas.
5. Comunicar el resultado del administrador y las URL de tienda/categorías para conectar la siguiente iteración React a las rutas reales. La propia pantalla muestra las páginas WooCommerce asignadas y su estado.

Usar la instalación de pruebas y mantener los cobros reales desactivados. Los productos se publican para poder consumirlos desde Store API; esta herramienta no desactiva las pasarelas existentes ni bloquea pedidos que puedan iniciarse por otras interfaces. No configura métodos de pago y no crea pedidos por sí misma.

## Catálogo incluido

| Categoría | Productos ficticios | Casos cubiertos |
| --- | --- | --- |
| Papelería | Libreta naranja A5, cuaderno negro de proyectos, bloc de notas de escritorio y pack de tres libretas | Productos simples, oferta, agotado y conjunto vendido como un único producto simple. |
| Bolsas y accesorios | Bolsa natural, bolsa negra, mochila urbana y neceser negro | Distintos colores, importes, stock y agotado. |
| Ropa | Camiseta, sudadera, gorra y calcetines | Dos variables y dos simples. |

En total: **12 productos padre, 10 simples y 2 variables; 20 variaciones**. Camiseta: cuatro tallas y tres colores (12 combinaciones). Sudadera: cuatro tallas y dos colores (8 combinaciones). Algunas combinaciones están agotadas de forma intencionada.

- Categorías nativas: `papeleria`, `bolsas-y-accesorios`, `ropa`.
- Etiquetas: `demo-dipe`, `oficina`, `regalo`, `textil`.
- Atributos globales: `pa_color` (naranja, negro, blanco, natural) y `pa_talla` (S, M, L, XL). Se usan tanto en filtros futuros como en la selección de variaciones.
- Productos con SKU `DIPE-DEMO-…`, slug inicial `demo-dipe-…` y título terminado en «DEMO»; descripción que identifica el contenido ficticio.
- Precios regulares y ofertas de muestra, sin impuestos en estos productos. Los números se interpretan en la moneda de la tienda; no se convierten al cambiarla.
- Una sola imagen provisional, copiada de los assets locales de WooCommerce a la biblioteca, compartida por los productos. No son fotografías definitivas ni galerías variadas: se sustituyen desde el editor de producto. La herramienta no obtiene imágenes remotas.

No se crean valoraciones, reseñas, usuarios, preguntas, cupones, pedidos ni productos digitales. Las reseñas se pueden habilitar, pero sus medias permanecen reales y vacías hasta recibir opiniones.

## Ajustes visibles y opcionales

| Opción del formulario | Efecto al aplicarla |
| --- | --- |
| Moneda | Se selecciona inicialmente la que ya utiliza WooCommerce; se guarda la elegida, sin conversión de importes. |
| Stock | Activa gestión global de stock y deja visibles los agotados para maquetar su estado. |
| Reseñas | Activa reseñas, estrellas obligatorias, etiqueta de comprador verificado y escritura solo de compradores verificados. No sustituye las reglas de moderación de comentarios existentes. |
| Páginas | Crea/asigna solo las que falten: tienda, carrito, finalizar-compra y mi-cuenta. Conserva cualquier asignación válida, sus URL, contenido y estado. |
| Envío de ejemplo, desmarcado inicialmente | Crea una zona para el país elegido y una tarifa fija de ejemplo, inicialmente 4,90 en la moneda elegida, sin impuestos. Solo si no existen zonas/métodos anteriores. No cambia países de venta ni ubicación del negocio. |

Las opciones actúan sobre toda la tienda. Dejar una casilla desmarcada conserva el ajuste actual; no lo desactiva. La creación del catálogo y la aplicación de ajustes son acciones independientes.

No se cambian tipos impositivos, reglas fiscales, cuentas, alta/compra como invitado, contraseñas, dirección del negocio, buzones/destinatarios o pasarelas. Tampoco se cambian los enlaces permanentes de productos/categorías. No se configura cron propio ni se ejecutan envíos de formularios o campañas.

Si una página con el slug necesario ya existe pero no está asignada y no pertenece a la herramienta, se pide asignarla manualmente desde WooCommerce; no se ocupa ni sobrescribe. Si faltan páginas se generan con contenido nativo de WooCommerce, pero el tema actual solo monta React: esas páginas todavía necesitan su implementación visual. No se declara que carrito, checkout o cuenta funcionen en el frontal por haber creado sus páginas.

La zona demo, una vez creada, se edita desde WooCommerce; el formulario no sobrescribe sus modificaciones posteriores. Si una operación falla después de un paso completado, lo ya guardado se conserva y el aviso indica que la operación está incompleta. Revisar las páginas/zona existentes antes de repetir.

## Repetición y retirada

Los productos y variaciones se identifican mediante metadatos privados de propiedad y una clave estable por artículo/combinación. Una colisión con un SKU ajeno produce error, sin modificar el producto existente. Categorías, etiquetas y atributos existentes se reutilizan por slug, sin sobrescribirlos.

Crear de nuevo conserva las ediciones de los productos ya completados; solo completa productos pendientes y restaura las copias propias en papelera. No repone imágenes, textos, precios o variaciones que el usuario haya cambiado/borrado deliberadamente en un producto completado. Se pueden editar las categorías y medios desde WordPress después de la creación inicial.

**Enviar productos demo a la papelera** retira solo los productos marcados y sus variaciones. Si un padre contiene una variación ajena a la herramienta se detiene para revisión manual. Se rechaza la operación si `EMPTY_TRASH_DAYS=0`, porque WordPress borraría definitivamente. Con papelera activa se aplica la política habitual de conservación/vaciado de WordPress; no es un respaldo permanente.

Se conservan categorías, etiquetas, atributos, imagen, páginas y ajustes porque pueden haberse reutilizado y para permitir restauración. No hay borrado masivo de pedidos, usuarios o medios, ni restauración automática de configuración global. Desactivar/desinstalar este plugin conserva los datos: WooCommerce sigue administrándolos. No es necesario mantenerlo activo para que Store API exponga el catálogo.

Las operaciones requieren permisos administrativos y de productos, POST y nonce. Un bloqueo compartido serializa lotes/ajustes entre pestañas y caduca a los diez minutos tras una interrupción. La interfaz solo procesa peticiones mientras la pantalla está abierta; no hay tareas ocultas propias al cerrarla.

## Archivos y despliegue

- ZIP instalable: `entregas/dipe-shop-demo-1.0.0.zip`.
- Alternativa FTP: subir la carpeta `wp-content/plugins/dipe-shop-demo/`, con `dipe-shop-demo.php` y `readme.txt`, y activar desde Plugins. Elegir un único método de instalación; no duplicar como mu-plugin.
- Documentación: este archivo, `docs/plan-tienda-headless.md`, `CONTEXTO-PROYECTO.md` y `PLAN_PARA_TERRA.md`; no necesitan FTP.
- `.gitignore` excluye el paquete WooCommerce de terceros y los ZIP generados de `entregas/`; el código propio del preparador sigue siendo versionable. No se edita ni se empaqueta el proveedor.

Se ha preparado el código mediante lectura de las API PHP de la copia WooCommerce local. No se ejecutan comprobaciones locales, tests, lint, PHP, servidor, navegador, peticiones de prueba al sitio ni compilación. Empaquetar el ZIP no compila React. Sin FTP, instalación/configuración remota u operaciones Git. Revisión del usuario en servidor pendiente; no se declara publicado ni validado.

Siguiente iteración: catálogo, categorías, filtros y ficha en React con los datos reales creados por la herramienta; después carrito y compra. Digitales/descargas permanecen en la segunda etapa.
