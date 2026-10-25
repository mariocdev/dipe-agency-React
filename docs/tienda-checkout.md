# Carrito flotante y checkout Dipe

## Direcciones del pedido confirmado (25-10-2026)

El resumen de pedido recibido y el detalle nativo del pedido en Mi cuenta muestran facturación y envío en tarjetas alineadas, con etiquetas para cada dato. Nueva plantilla `wp-content/themes/dipe-react/woocommerce/order/order-details-customer.php`, basada en la nativa 8.7.0: lee los datos guardados en el pedido, sin usar el perfil actual del cliente ni reconstruir direcciones desde HTML. Separa nombre, apellidos, empresa, dirección, piso/puerta, código postal, localidad, provincia/región, país, teléfono y correo de facturación; omite valores vacíos y convierte códigos de país/provincia a nombres con WooCommerce. Conserva la condición nativa de dirección de envío, las clases de columnas y ambos hooks de detalles de cliente/direcciones. Los permisos de acceso al pedido siguen en el flujo nativo de Woo.

`frontend/src/pages/shop/NativeCommerce.css` añade estilos exclusivos para estas tarjetas y sus listas de etiquetas/valores. La cuadrícula ajusta el número de columnas al espacio disponible, ocupa una columna en móvil y retira sus pseudo-elementos de limpieza para que no desplacen las tarjetas a celdas posteriores. No modifica las direcciones de edición en Mi cuenta, los emails ni los datos del pedido. Revisar esta plantilla cuando WooCommerce actualice su versión.

Archivos de esta iteración: nuevo PHP y NativeCommerce.css; documentación en esta guía, `CONTEXTO-PROYECTO.md` y `PLAN_PARA_TERRA.md`.

**FTP exclusivo de esta iteración:**

1. `wp-content/themes/dipe-react/woocommerce/order/order-details-customer.php`, creando la carpeta `order` si falta.
2. `wp-content/themes/dipe-react/assets/` completo, incluido `.vite/manifest.json`, tras compilación del usuario.

Sin cambio de core ni nueva conversión del checkout. Sin comprobaciones locales, navegador/capturas, tests/lint, build, API de prueba, pedidos/correos, FTP u operaciones Git. Pendiente revisar en servidor alineación, etiquetas, datos largos, móvil, dirección de envío diferente y pedidos sin envío. Esta entrega no confirma publicación ni una nueva vista validada.

## Iteraciones del formulario de compra

**Revisión dinámica y pasos responsive (25-10-2026):** tarjetas de revisión en dos columnas independientes (una en móvil), sin hueco entre contacto y envío seleccionado; menú de pasos en dos columnas a ≤680 px y barra de progreso animada. Transición de entrada al avanzar/retroceder y scroll suave, respetando movimiento reducido y DOM de campos/pasarelas. Asterisco legal inline unido a «envío.» con espacio no separable. Cambios: CheckoutExperience JSX/CSS, NativeCommerce.css y core includes/shop-checkout.php; core sigue 0.4.30. FTP solo **assets completos/manifiesto + `wp-content/plugins/dipe-core/includes/shop-checkout.php`**. Sin repetir conversión ni nueva plantilla de productos. Detalles en [Variantes de checkout](tienda-checkout-variantes.md); sin comprobaciones locales/build/API/FTP/Git, pendiente revisión en servidor.

**Ajuste compacto y miniaturas (25-10-2026):** después de confirmar que ya ve y le gustan ambas variantes, el usuario pide campos/espacios menores, imagen de producto y datos identificados al revisar. NativeCommerce.css compacta ambas vistas (campos/Select2 44 px, filas 14 px, label/campo 4 px y menos padding/gap). La plantilla review-order.php añade miniatura nativa de producto/variación en las dos vistas. CheckoutExperience JSX/CSS muestra etiquetas y valores separados para contacto/direcciones en el paso de revisión. FTP de este ajuste: **assets completos/manifiesto + `wp-content/themes/dipe-react/woocommerce/checkout/review-order.php`**, sin cambio de core ni reconversión. Detalle y archivos en [Variantes de checkout](tienda-checkout-variantes.md). Sin comprobaciones locales/build/API/FTP/Git; nueva iteración pendiente de revisión en servidor.

**Dos variantes de prueba (25-10-2026, core 0.4.30):** selector al entrar para Checkout normal o por pasos (datos → envío → revisión → pago, omitiendo envío cuando no procede). Ambas presentaciones conservan un formulario nativo y permiten cambiar formato sin borrar campos en la página. El modo normal mantiene sidebar y sticky; el modo por pasos añade validación progresiva y errores/foco, sin reemplazar el pago nativo. Herramientas → Checkout Dipe añade editor de página y enlaces de prueba. Alcance, explicación de edición/One Page Checkout y FTP específico en [Variantes de checkout](tienda-checkout-variantes.md). Sigue siendo necesario el shortcode clásico; sin conversión automática, plugins nuevos, pruebas locales/build/API/FTP/Git. Pendiente revisión del usuario en servidor.

Entrega local del 25-10-2026, pendiente de subir y revisar en servidor. Sustituye la pantalla de carrito React anterior. Sin comprobaciones locales, navegador, tests, API de prueba, compilación, FTP ni operaciones Git.

**Actualización de sidebar y sticky (25-10-2026):** el HTML aportado por el usuario aún corresponde a Checkout Blocks, por lo que falta aplicar la conversión indicada más abajo. Sobre el formulario clásico se separan resumen, cupón, envío y pago/confirmación en tarjetas iguales, en ese orden. Envío queda entre cupón y pago, usa las tarifas y campos nativos y se refresca por AJAX. El sticky mide ambas columnas con ResizeObserver y se asigna a la más corta en escritorio; respeta `--dipe-anchor-header-offset` más 20 px y se desactiva con una sola columna. También ajusta las columnas del checkout por bloques mientras siga activo, sin mover sus nodos React. Fuentes/FTP de esta ampliación se indican al final; no hay nuevas comprobaciones ni validación visual en servidor.

## Comportamiento

El elemento del menú WordPress con clase `menu-cart` abre un panel lateral, también desde las páginas corporativas. Conserva solo el icono y su nombre accesible. Muestra imágenes, variaciones, cantidades, eliminación, cupones y totales devueltos por WooCommerce. El envío pendiente se indica sin inventar un importe. El botón principal lleva directamente a la URL real de finalizar compra. Añadir un producto abre el panel automáticamente.

El proveedor del carrito pasa de ShopLayout a App para compartir estado con la cabecera. Consulta la sesión al abrir, sin pedir el carrito en cada página corporativa. Conserva cookies del mismo origen, nonces y mutaciones serializadas; no almacena datos de compra en localStorage. El diálogo contiene el foco, admite Escape/cierre exterior y devuelve el foco al botón de apertura. El menú compacto se cierra antes de abrirlo. Se mantienen los cortes de 1290/550 px.

Se retiran `ShopCart.jsx/.css`. La página asignada a carrito en WooCommerce se conserva para su funcionamiento interno, pero su visita redirige temporalmente a compra si contiene productos, o a tienda si está vacío. No borrar esa página ni desasignarla. Hay un respaldo de redirección en React para HTML anterior.

La compra mantiene el formulario **clásico nativo** de WooCommerce; no se recrean sus campos o pasarelas en React. Etiquetas externas con espacio, campos con borde y radio como Contacto, y resumen con envío y métodos de pago compactos a la derecha. En móvil el resumen queda después de los datos. Los hooks agrupan el resumen y se mantienen las plantillas nativas de las pasarelas; la tabla de productos utiliza la plantilla propia indicada a continuación. Cuenta, recuperación y pedido recibido conservan sus formularios nativos.

La ampliación posterior sí añade una única plantilla de tema `woocommerce/checkout/review-order.php`, basada en la nativa **11.2.0** instalada localmente: conserva productos, descuentos, cargos, impuestos, totales y sus filtros/hooks, y retira solo el bloque de envío de esa tabla. Las opciones se renderizan una sola vez en la tarjeta de envío, con `wc_cart_totals_shipping_html()` y los hooks originales. Esa tarjeta se incluye en `woocommerce_update_order_review_fragments`; no se ocultan o duplican radios ni se modifican los cálculos del carrito. Revisar esta plantilla cuando WooCommerce cambie su versión de plantilla. Las plantillas de las pasarelas se mantienen nativas.

El cupón se aplica desde un portal React al hueco del sidebar mediante el proveedor de carrito y Store API existentes. Se retira el formulario de cupón superior para evitar duplicaciones, y el widget no anida otro formulario dentro del checkout. Tras aplicar, se solicita el recálculo nativo; su eliminación sigue disponible en el desglose nativo. No habilita cupones si WooCommerce los tiene desactivados.

## Activar el formulario clásico una vez

Después de subir los archivos y assets:

1. Abrir **Herramientas → Checkout Dipe**.
2. Pulsar **Aplicar diseño de checkout Dipe**.
3. Revisar finalizar compra en la web.

La acción exige permisos y nonce; opera solo sobre la página asignada a compra. Sustituye exclusivamente el bloque `woocommerce/checkout` por `[woocommerce_checkout]`, conserva otros bloques y guarda el contenido anterior en `_dipe_checkout_content_backup`. No se ejecuta al subir o cargar el plugin. Así WooCommerce y las extensiones detectan el tipo de checkout real de la página, en lugar de forzar su HTML mientras sigue almacenada como bloque.

Si la página ya contiene el shortcode, no hay que convertirla. Si su estructura es distinta, la herramienta avisa sin sobrescribirla. **Restaurar contenido anterior** recupera la copia únicamente cuando el contenido actual coincide con la conversión guardada; si alguien ha editado después, no lo sustituye. No cambia ajustes comerciales, precios, pasarelas, zonas, impuestos ni pedidos. Las pasarelas deben admitir checkout clásico; se revisan con las extensiones reales del servidor.

## Aceptación de políticas

Una casilla sin marcar y obligatoria enlaza a `/politica-de-privacidad/` y `/politica-de-devoluciones-y-envio/`, generadas con `home_url()`. Los enlaces abren otra pestaña para conservar el formulario. No se crean ni se redactan esas páginas.

Con el shortcode activo, `dipe-core` 0.4.27 añade la casilla, evita duplicar las condiciones nativas y valida la aceptación al tramitar el checkout, aunque se omita el campo oculto o se altere el HTML. Los refrescos AJAX conservan la selección mediante los identificadores nativos `terms` y `terms-field`.

También se rechaza la creación de un pedido por POST a `/wc/store/v*/checkout` sin `terms: true` (acepta también `1` o `"1"`). Una futura compra por Store API deberá enviar ese valor tras aceptación expresa. El bloqueo no se aplica a consultas del carrito ni a borradores PATCH; no se anulan permisos/nonces nativos. Hasta convertir el bloque, se conserva su comportamiento original.

Los pedidos creados por estos flujos registran fecha UTC y URL aceptadas en `_dipe_policies_accepted_at` y `_dipe_policies_accepted_urls`, mediante CRUD de WooCommerce. No registra copia/versionado del texto legal. El pago de un pedido ya existente no recibe un formulario nuevo. Los formularios de Contacto, destinatarios, correo y SMTP se mantienen.

## Fuentes de esta entrega

- Nuevos: `frontend/src/components/commerce/CartProvider.jsx`, `FloatingCart.jsx` y `FloatingCart.css`.
- React: `frontend/src/app/App.jsx`; `components/layout/Header.jsx/.css`; `pages/shop/ShopShared.jsx`, `ShopPages.jsx`, `ProductDetail.jsx/.css`, `NativeCommerce.jsx/.css`, `CheckoutLayout.jsx` y `ShopArchiveFilters.jsx`.
- Retirados: `frontend/src/pages/shop/ShopCart.jsx/.css`.
- PHP: `wp-content/plugins/dipe-core/includes/shop-checkout.php`, `dipe-core.php`, `wp-content/themes/dipe-react/inc/commerce.php` y `wp-content/themes/dipe-react/woocommerce/checkout/review-order.php`.
- Documentación: esta guía, tienda-frontend, cabecera/pie y las dos notas de continuidad.

## FTP exacto

1. Subir `wp-content/plugins/dipe-core/includes/shop-checkout.php`.
2. Subir `wp-content/plugins/dipe-core/dipe-core.php` (0.4.27), después del módulo requerido. Si faltan entregas anteriores, conservar sus dependencias, incluido `includes/shop-features.php`.
3. Subir los assets completos generados por el usuario a `wp-content/themes/dipe-react/assets/`, incluido `.vite/manifest.json`.
4. Subir `wp-content/themes/dipe-react/woocommerce/checkout/review-order.php` (crear las carpetas si faltan).
5. Subir `wp-content/themes/dipe-react/inc/commerce.php`, junto a la plantilla anterior y una vez disponibles los nuevos assets.
6. Aplicar la conversión en Herramientas y revisar en servidor.

No hace falta subir `functions.php`, `commerce-native.php`, fuentes React ni instalar otro plugin. No se ha ejecutado ninguna subida o cambio remoto desde Codex.

Revisión del usuario: panel desde cabecera y tras añadir simple/variación; cantidades, eliminación, cupón y errores; acceso a compra y URL antigua de carrito; responsive/etiquetas; recálculo de envío y pago configurado; rechazo sin políticas y conservación de la casilla tras recalcular; compra de prueba y pedido recibido. Vista, pasarelas y pedidos pendientes de validar en servidor.

## Archivos y FTP de la ampliación de sidebar

Fuentes nuevas: `frontend/src/pages/shop/CheckoutLayout.jsx` y `wp-content/themes/dipe-react/woocommerce/checkout/review-order.php`. Modificados: `frontend/src/pages/shop/NativeCommerce.jsx/.css`, `ShopArchiveFilters.jsx` y `wp-content/themes/dipe-react/inc/commerce.php`. Documentación: esta guía, `docs/tienda-interacciones.md`, `CONTEXTO-PROYECTO.md` y `PLAN_PARA_TERRA.md`. El catálogo empieza con solo Categorías abierto; los controles individuales/globales siguen disponibles y los atributos que carguen después empiezan cerrados.

Para esta ampliación subir **assets completos del tema con `.vite/manifest.json`**, **`wp-content/themes/dipe-react/woocommerce/checkout/review-order.php`** (crear las carpetas si faltan) y **`wp-content/themes/dipe-react/inc/commerce.php`**. La plantilla debe acompañar al PHP para que no se dupliquen los selectores de envío. No cambia `dipe-core` ni es necesario volver a subirlo si ya está en 0.4.27.

Después aplicar **Herramientas → Checkout Dipe → Aplicar diseño de checkout Dipe** si aún está el bloque, como muestra el HTML recibido. Si ya se convirtió, no repetir. Revisar orden de tarjetas, aplicar/quitar cupón, dirección y selección de envío, pago y consentimiento, cambio dinámico del sticky al ampliar una columna, separación del header y móvil. Sin cambios remotos o comprobaciones locales ejecutados.
