# Tienda: catálogo, producto, carrito y pantallas de WooCommerce

## Rango de precio y controles de relacionados (25-10-2026)

El precio se elige con una barra de dos tiradores nativos (mínimo y máximo), importes visibles formateados y soporte de teclado. Los límites proceden de products/collection-data para el catálogo/categoría/etiqueta actual y usan la precisión monetaria entregada por Woo. Se mantienen las URL, Limpiar y Aplicar precio; arrastrar no envía peticiones hasta aplicar. Si no hay rango real disponible, se informa y deshabilita su aplicación, sin límites inventados.

Las flechas de relacionados pasan a la derecha del h2, pegadas al borde del contenedor y centradas verticalmente con el título. Los puntos quedan centrados debajo, más juntos (16 px), con activo naranja alargado (32 px). Ratón: arrastre tras 6 px, captura mientras se arrastra, prevención del clic accidental en enlaces y ajuste suave a tarjeta cercana al soltar. Los botones de favoritos conservan su interacción; tacto, trackpad y teclado mantienen su navegación. Continúan las mismas tarjetas, cantidad, grupos y escala 4/3/2/1.

Fuentes: frontend/src/lib/commerce.js, frontend/src/pages/shop/ShopArchive.jsx, ShopArchiveFilters.jsx, Shop.css, RelatedProducts.jsx y RelatedProducts.css. FTP de estos cambios: assets completos del tema con .vite/manifest.json, tras compilación del usuario. El envío gratuito exclusivo de esta entrega lleva PHP adicional y versión 0.4.32: consultar [checkout](tienda-checkout-variantes.md). Sin comprobaciones locales/build/API de prueba/FTP/Git; pendiente revisión del usuario en servidor.

**Catálogo de 12 y carrusel de relacionados (25-10-2026):** `lib/commerce.js` pide 12 productos por página en tienda, categorías, etiquetas y filtros/lista de deseos. Páginas completas pares, sin añadir tarjetas ficticias para completar un último resultado parcial. ProductDetail consulta hasta 12 relacionados de su categoría, excluye el actual y delega la presentación en `RelatedProducts.jsx/.css`: cuatro tarjetas por vista en escritorio, tres a ≤1260 px, dos a ≤880 px y una a ≤440 px. Conserva `ShopProductCard`, con favoritos, precio, enlaces, H3 y hover propios. Scroll nativo con snap, táctil/trackpad, flechas circulares y puntos por grupo; controles y puntos se calculan desde el número visible indicado por CSS. No clona productos ni rota automáticamente; oculta controles cuando todo cabe y respeta movimiento reducido. Flechas/Home/End con foco en el carrusel; cada enlace sigue siendo accesible por teclado. Se retiran del CSS de ProductDetail las antiguas reglas de grid de relacionados.

Fuentes de esta iteración: `frontend/src/lib/commerce.js`, `frontend/src/pages/shop/ProductDetail.jsx/.css` y nuevos `RelatedProducts.jsx/.css`. FTP del frontal: **assets completos del tema con `.vite/manifest.json`**, tras compilación del usuario. Para ampliar el catálogo de pruebas, subir además el nuevo `wp-content/mu-plugins/dipe-product-copies-demo.php` y seguir [Copias temporales](tienda-demo.md). Documentación: esta guía, tienda-demo, guía visual, PLAN y CONTEXTO. Sin comprobaciones locales, navegador/capturas, tests/lint, build, API de prueba, productos/pedidos/correos remotos, FTP u operaciones Git. Pendiente revisión del usuario en servidor de páginas de tienda/categoría, filtro y paginación, cuatro tarjetas/flechas/puntos, extremos y responsive.

**Carrito flotante y checkout, actualización del 25-10-2026:** [guía y FTP exacto](tienda-checkout.md). El carrito pasa a un panel global desde la cabecera y tras añadir un producto, con acceso directo a compra; se retira su pantalla y la URL heredada redirige. Compra con formulario clásico nativo, campos similares a Contacto, pagos a la derecha y aceptación obligatoria de privacidad/devoluciones/envío validada en servidor por `dipe-core` 0.4.27. Tras subir, aplicar conversión reversible en **Herramientas → Checkout Dipe**. Sustituye las referencias inferiores al carrito como página y al uso de bloques para compra. Sin comprobaciones locales/build/FTP/Git; revisión en servidor pendiente.

**Galería y filtros, última corrección del 25-10-2026:** zoom con cursor de lupa limitado a resolución de la imagen completa, lightbox nativo moderno con teclado/miniaturas/ajuste-original, filtros plegables por grupo o todos mediante «Encuentra el tuyo», Limpiar independiente y foco/hover del buscador a ancho completo. Galería separada en `ProductGallery.jsx/.css`; detalle en [Interacciones de tienda](tienda-interacciones.md). Esta corrección solo requiere assets tras compilación del usuario, sin PHP. Revisión en servidor pendiente.

**Iteración posterior del 25-10-2026:** pestañas reales en ficha (ya no navegación por anclas), corazones/lista de deseos por sesión y usuario, hover de tarjetas con 2 px de elevación/sombra suave y 10 px de padding de información. Primera gestión de preguntas moderadas en `dipe-core` 0.4.26. Instrucciones y PHP adicional de esta entrega en [Interacciones de tienda](tienda-interacciones.md); sustituye las menciones inferiores a Q&A todavía sin implementar y al enlace de ampliar imágenes. Revisión de este lote en servidor pendiente.

Entrega local del 25-10-2026. El usuario confirma que el preparador de la demo ha funcionado correctamente en servidor y solicita maquetar la tienda con la identidad de Dipe. Al preguntar por conectar también el carrito responde «Todo todo»; se amplía esta iteración a carrito, compra y cuenta. Esta confirmación valida el preparador, no las pantallas nuevas de esta entrega.

## Diseño y alcance

- Cabecera, pie, tipografía, naranja, anchos y escala responsive existentes. Banner oscuro con el fondo `Banner-agencia.png`, ya utilizado por otras páginas; sin dominio temporal ni nuevas imágenes inventadas.
- Accesos a cuenta y carrito integrados como iconos naranjas en la cabecera general, antes de Hablamos, mediante enlaces nativos con clases `menu-account`/`menu-cart`. La barra secundaria anterior se ha retirado para evitar duplicaciones; los breadcrumbs mantienen navegación de tienda. El usuario añade Tienda y los dos enlaces en WordPress, según `docs/maquetacion-cabecera-footer.md`; no se crean automáticamente ni necesitan shortcode.
- Catálogo con sidebar de categorías, precio desde/hasta, Color, Talla y disponibilidad. Búsqueda de productos independiente del blog, orden de colección/novedades/precio, chips de filtros activos, limpieza y paginación de 12 productos. En móvil el sidebar es desplegable y el grid pasa a dos columnas, una en pantallas muy estrechas.
- Ficha con galería y miniaturas cuando existen varias imágenes, enlace a imagen completa, categoría, título, precio/oferta, resumen, opciones de variación, disponibilidad, cantidad y añadido real al carrito. Descripción HTML editorial y atributos, reseñas nativas y productos relacionados reales de su categoría.
- Carrito React con cantidades, actualización, eliminación, cupones, desglose y enlace a finalizar compra. Los precios/totales y los mensajes de error proceden de WooCommerce. El envío no calculado se indica como pendiente y el total como provisional.
- Compra y cuenta nativas de WooCommerce dentro del shell y estilos Dipe. Mantienen sus formularios/bloques, rutas y scripts, incluyendo acceso, recuperación, pedidos, direcciones y descargas que la configuración instalada permita. No se reconstruyen esos flujos con claves administrativas o endpoints públicos propios.

La compra/cuenta nativas son una decisión de implementación para conservar la compatibilidad con las pasarelas y funciones instaladas. Catálogo, ficha y carrito sí se dibujan en React. No se afirma que toda la compra sea un checkout headless escrito desde cero.

## Datos, rutas y sesión

`inc/commerce.php` del tema entrega `window.dipeSite.commerce`: estado activo, tipo de vista consultada, ID/slug de producto o término y las URL nativas de tienda/carrito/compra/cuenta, moneda, decimales e imagen provisional. Solo para usuarios autenticados incluye un nonce REST ligado a su sesión. No publica claves de WooCommerce, datos privados de clientes, contraseñas o configuración de pasarela.

`App.jsx` consume ese contexto antes de las rutas anteriores. No supone que las páginas se llamen siempre `/tienda/` o `/mi-cuenta/`, ni cambia slugs, enlaces permanentes, páginas o estados HTTP. WordPress continúa resolviendo las URL; los enlaces de categorías y productos proceden de WooCommerce.

El tema declara soporte WooCommerce y aporta `woocommerce.php` para que catálogo, categorías/etiquetas y productos utilicen el shell React. La ficha conserva el HTML original de las reseñas y su formulario mediante `comments_template()` y el producto consultado; respeta comprador verificado, registro, moderación y configuración existentes. No crea opiniones ficticias.

`commerce-native.php` conserva `the_content()` en compra y cuenta. `NativeCommerceSlot` mueve el nodo DOM original a su posición en React sin inyectar una copia del HTML ni regenerar formularios, nonces o bloques. La compatibilidad efectiva de bloques, scripts de pago y estilos necesita revisión en servidor con las extensiones realmente instaladas.

El cliente `lib/commerce.js` utiliza Store API. Los filtros se aplican antes de paginar, sobre toda la colección. Categoría y etiqueta usan el ID de la consulta WordPress; Color/Talla son atributos globales. Los rangos se convierten a unidades menores usando los decimales de WooCommerce. Los controles conservan estado en `q`, `desde`, `hasta`, `stock`, `color`, `talla`, `orden` y `pagina`; no reutilizan el parámetro `s` del blog. Atrás/adelante recupera los filtros y cada cambio reinicia la página.

Para cada variación se consulta su respuesta propia antes de permitir compra: la búsqueda por atributos del producto no garantiza una combinación comprable. Se respetan estado, precio y límites de cantidad del servidor. Las peticiones anteriores se cancelan para evitar resultados fuera de orden.

El carrito usa cookies del mismo origen y el nonce devuelto por Store API, con credenciales `same-origin`, mutaciones serializadas y renovación de nonce tras rechazo de autorización, sin desactivar validaciones. El checkout nativo comparte esa sesión. El carrito no se cachea en el navegador; no se guarda un Cart Token en localStorage. Al restaurar una página desde la caché de navegación se vuelve a consultar el carrito. El hosting/CDN debe respetar la privacidad y las exclusiones nativas de carrito, cuenta y checkout.

## Archivos modificados

Fuentes React nuevas:

- `frontend/src/lib/commerce.js`.
- `frontend/src/pages/shop/ShopPages.jsx`.
- `frontend/src/pages/shop/ShopShared.jsx` y `Shop.css`.
- `frontend/src/pages/shop/ShopArchive.jsx` y `ShopArchiveFilters.jsx`.
- `frontend/src/pages/shop/ProductDetail.jsx` y `ProductDetail.css`.
- `frontend/src/pages/shop/ShopCart.jsx` y `ShopCart.css`.
- `frontend/src/pages/shop/NativeCommerce.jsx` y `NativeCommerce.css`.

Integración: `frontend/src/app/App.jsx` y `wp-content/themes/dipe-react/functions.php`. PHP nuevo: `wp-content/themes/dipe-react/inc/commerce.php`, `woocommerce.php` y `commerce-native.php`. No cambia el plugin preparador, `dipe-core`, el proveedor WooCommerce, `navigationTransitions.js`, `site.js` ni las páginas corporativas existentes.

Documentación: este archivo, `docs/plan-tienda-headless.md`, `docs/tienda-demo.md`, `docs/guia-visual.md`, `CONTEXTO-PROYECTO.md` y `PLAN_PARA_TERRA.md`.

## FTP y siguiente revisión

El usuario compila y sube. No se repite el comando de compilación.

Orden recomendado para tener todas las dependencias antes de activar el nuevo contexto:

1. Subir `wp-content/themes/dipe-react/inc/commerce.php` (crear `inc/` si no existe).
2. Subir `wp-content/themes/dipe-react/woocommerce.php` y `wp-content/themes/dipe-react/commerce-native.php`.
3. Subir **todo** `wp-content/themes/dipe-react/assets/` generado por el usuario, incluido `.vite/manifest.json`.
4. Subir `wp-content/themes/dipe-react/functions.php` al final.

No subir `frontend/src/` ni documentación por FTP. No hace falta reinstalar o ejecutar el preparador, crear más productos ni cambiar los enlaces permanentes. Si se quiere Tienda en la cabecera general, asignar su página existente desde Apariencia > Menús.

Revisión en servidor del usuario: catálogo general y categoría/etiqueta, combinación de filtros y navegación atrás, móvil, variación disponible y agotada, añadido/cantidades/cupones, continuidad al checkout y acceso/cuenta, y reseñas con las reglas elegidas. Las fotos siguen siendo las del catálogo preparado (provisionales si no se han sustituido). No se declaran validadas estas vistas ni el recorrido de pago.

No se han ejecutado comprobaciones locales, PHP, tests, lint, servidor, navegador, capturas, peticiones de prueba a la API ni build. Sin FTP, modificación remota, commit/push o PR nuevo. Se ha trabajado por lectura y edición de fuentes, conservando el trabajo previo.

## Límites y siguientes bloques

No se activan pasarelas, cobros reales, tipos impositivos, tarifas, registro de clientes o correos nuevos. La compra depende de la configuración que ya exista y del comportamiento nativo de WooCommerce; la creación efectiva de pedidos/pagos solo ocurrirá cuando se utilice ese flujo. No se inventan mensajes de éxito o confirmaciones de pago en React.

Preguntas/respuestas interactivas, recuperación de carritos, alta de digitales y sus archivos, configuración comercial definitiva y la decisión SEO de productos/schema/combinaciones filtradas siguen en sus fases posteriores. Las pantallas nativas de cuenta ya pueden mostrar las descargas autorizadas cuando existan productos digitales. Los tipos de compra conectados desde la ficha React en esta entrega son simples y variables, los usados por la demo.
