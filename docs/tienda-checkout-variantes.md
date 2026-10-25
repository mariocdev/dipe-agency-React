# Checkout normal y por pasos

## Scroll antes del cambio y envío gratuito (25-10-2026)

Esta iteración sustituye el orden anterior: conserva la sección actual mientras sube suavemente al encabezado y, cuando termina, cambia el paso y ejecuta su entrada animada. También se aplica al cambiar de formato. No oculta la sección larga dejando un hueco durante la subida. Las interrupciones del usuario cancelan el destino pendiente; los errores del mismo paso desplazan/focalizan el campo correspondiente. Movimiento reducido mantiene el cambio directo.

Core 0.4.32 filtra los paquetes después de la caché de Woo y antes de elegir método/calcular totales. Si un paquete ofrece free_shipping, solo deja sus métodos gratuitos; si no, conserva sus tarifas. Woo mantiene la disponibilidad según mínimo, cupón y zona existentes, y reelige el método si el elegido desaparece. No se crean requisitos/cupones ni se modifican pedidos o ajustes.

Fuentes: frontend/src/lib/scroll.js, frontend/src/pages/shop/CheckoutExperience.jsx, wp-content/plugins/dipe-core/includes/shop-checkout.php y wp-content/plugins/dipe-core/dipe-core.php. FTP: assets completos del tema con .vite/manifest.json, después includes/shop-checkout.php y dipe-core.php, con los módulos anteriores ya presentes. No repetir conversión ni subir plantillas del tema por este ajuste. Sin comprobaciones locales/build/API/pedidos/correos/FTP/Git; pendiente revisión en servidor de pasos de distinta altura, errores, ambas vistas, disponibilidad del gratuito y retirada del cupón/pérdida de mínimo.

## Revisión sin huecos, menú móvil y animaciones (25-10-2026)

Las tarjetas de revisión se apilan en dos columnas independientes: contacto y envío seleccionado por un lado, dirección y facturación diferente por el otro. Cada tarjeta siguiente comienza tras la anterior de su columna, sin depender de la altura de la otra columna. En móvil se apilan todas en una sola columna, manteniendo el orden del DOM y del teclado.

El menú usa botones con altura uniforme y números de tamaño fijo; conserva los nombres completos en sus etiquetas accesibles y abrevia «Revisa tu pedido» a «Revisión» solo en el botón. A ≤680 px pasa a dos columnas; cuando el carrito no requiere envío y hay tres pasos, el último ocupa el ancho completo. Una barra de progreso anima el avance/retroceso. Se mantienen los límites de navegación y validación existentes.

Los cambios de paso animan el título, las tarjetas de revisión y los contenedores nativos visibles con opacidad y desplazamiento leve de 12 px, durante 260 ms con ligero escalonado; el sentido depende de avance/retroceso. La tarjeta de pago usa solo opacidad. Se usa Web Animations si está disponible, cancelando animaciones al cambiar de vista o desmontar. El formulario, campos y pasarelas se conservan en el DOM; los recálculos nativos no reinician esta animación. Scroll suave al encabezado y foco directo para errores. La preferencia de movimiento reducido desactiva animaciones, transiciones y scroll suave.

El asterisco de la casilla legal permanece inline y se une a «envío.» mediante un espacio no separable en el PHP, tanto en normal como en pasos. No cambia texto, destino legal, obligatoriedad o registro del consentimiento.

Código modificado: `frontend/src/pages/shop/CheckoutExperience.jsx`, `CheckoutExperience.css`, `NativeCommerce.css` y `wp-content/plugins/dipe-core/includes/shop-checkout.php`. Documentación: esta guía, `docs/tienda-checkout.md`, `PLAN_PARA_TERRA.md` y `CONTEXTO-PROYECTO.md`.

**FTP exclusivo de este ajuste:** assets completos en `wp-content/themes/dipe-react/assets/`, incluido `.vite/manifest.json`, tras compilación del usuario, y `wp-content/plugins/dipe-core/includes/shop-checkout.php`. Core sigue 0.4.30; no repetir conversión ni subir de nuevo `dipe-core.php` o `review-order.php` por este lote. Sin comprobaciones locales, navegador/capturas, tests/lint, build, API de prueba, pedidos/correos, FTP u operaciones Git. Pendiente revisar en servidor columnas con/sin dirección diferente, menú y textos en móvil, avance/retroceso y errores, animación con movimiento reducido y ajuste del asterisco al estrechar la pantalla o recalcular WooCommerce.

## Ajuste posterior: tamaño, imágenes y datos (25-10-2026)

El usuario confirma que ve ambas variantes y aprueba su aspecto anterior. Esta nueva iteración compacta el formulario de ambas vistas: campos y Select2 de 44 px, padding 9×12 px, 14 px entre filas, 4 px entre etiqueta y control, 16 px entre medios campos y 28 px entre columnas del checkout normal. Tarjetas con 18 px de padding (16 en móvil), títulos del formulario a 20 px y notas con mínimo de 96 px. Cuenta y reseñas conservan sus medidas.

La tabla compartida de productos incluye ahora miniaturas nativas Woo de 56 px (48 en móvil), mediante el producto del carrito y el filtro `woocommerce_cart_item_thumbnail`; conserva nombre, cantidad, datos de variación y cálculos/refrescos nativos. La revisión por pasos presenta listas de etiquetas/valores: correo, teléfono, nombre, apellidos, empresa, dirección, piso/puerta, código postal, localidad, provincia/región y país, según los campos que tengan valor. Distingue envío y facturación cuando difieren; mantiene sus enlaces de edición. Las tarjetas no fuerzan alturas iguales.

Archivos de código modificados: `frontend/src/pages/shop/NativeCommerce.css`, `CheckoutExperience.jsx`, `CheckoutExperience.css` y `wp-content/themes/dipe-react/woocommerce/checkout/review-order.php`. Documentación actualizada: esta guía, `docs/tienda-checkout.md`, `CONTEXTO-PROYECTO.md` y `PLAN_PARA_TERRA.md`.

**FTP de este ajuste únicamente:** `wp-content/themes/dipe-react/assets/` completo con `.vite/manifest.json`, tras compilación del usuario, y `wp-content/themes/dipe-react/woocommerce/checkout/review-order.php`. No cambia core ni se repite la conversión ya aplicada. No se ejecutan comprobaciones locales, tests/lint, navegador, build, API de prueba, pedidos/correos, FTP u operaciones Git. Pendiente revisar en servidor medidas de formulario/Select2, móvil, miniaturas y variaciones en ambas vistas, también después de recalcular, y etiquetas/dirección diferente en revisión.

## Entrega inicial

Entrega local del 25-10-2026, core **0.4.30**, pendiente de revisión en servidor. El usuario solicita editar la página y comparar dos presentaciones con un selector al entrar. No se ejecutan comprobaciones locales, navegador, tests, lint, API de prueba, compilación, pedidos, correos, FTP u operaciones Git.

## Edición en WordPress

La página asignada a finalizar compra conserva `the_content()` y puede editarse desde **Páginas**. El proyecto no incorpora un editor visual del formulario: los campos proceden del shortcode nativo y su distribución/estilos se controlan en el tema y React. Añadir texto, imágenes o bloques alrededor de `[woocommerce_checkout]` sigue siendo posible. Se añade **Editar página en WordPress** en **Herramientas → Checkout Dipe**, sin nuevos bloqueos, roles o capacidades.

One Page Checkout también usa shortcodes/plantillas para insertar una compra y conserva la página oficial de WooCommerce. No es necesario instalarlo para comparar estas dos variantes. Fuentes primarias: [One Page Checkout](https://woocommerce.com/document/woocommerce-one-page-checkout/) y [edición del bloque Checkout](https://woocommerce.com/document/woocommerce-store-editing/customizing-cart-and-checkout/checkout-block/). Los bloques permiten otra forma de edición visual; estas dos presentaciones concretas usan el formulario clásico preparado en el proyecto.

## Dos presentaciones, una compra nativa

Al entrar por la URL de finalizar compra aparece el selector **Checkout normal / Checkout por pasos**. Se usa la página ya asignada a WooCommerce; no se crean dos páginas oficiales, shortcodes simultáneos o sesiones de carrito. La URL puede indicar `?vista_checkout=normal` o `?vista_checkout=pasos` para acceder directamente a una variante. Las URL se construyen desde la página real, sin fijar dominio o slug.

**Normal:** datos de contacto, facturación y envío a la izquierda, y tarjetas de resumen, cupón, envío y pago/confirmación a la derecha. Conserva el sticky dinámico en la columna más corta con separación del header y los campos con diseño de Contacto.

**Por pasos:**

1. **Tus datos:** campos nativos de contacto, facturación y dirección de envío, con la opción de dirección diferente que WooCommerce permita.
2. **Envío:** tarifas y opciones reales de WooCommerce, recalculadas con la dirección. Se omite para carritos que no necesitan envío.
3. **Revisa tu pedido:** datos de contacto/direcciones, selección de envío, productos, descuentos, cupón y totales nativos; accesos para corregir los pasos anteriores.
4. **Pago:** métodos y botón originales de WooCommerce, con aceptación de las políticas existente.

El indicador permite volver a pasos alcanzados. Cambiar una dirección invalida los avances posteriores. Los controles «Continuar» comprueban filas nativas aplicables, formatos y selección de tarifas; esperan los refrescos AJAX. Enter en un paso intermedio avanza por la navegación y no tramita el pedido. El envío sintético de pasarelas también se controla mediante el evento nativo `checkout_place_order`, sin sustituir un posible rechazo de otros validadores.

Se conservan el mismo formulario DOM, nombres, campos, nonces, sesión y eventos. Se ocultan secciones por presentación, sin deshabilitar o duplicar los campos. WooCommerce y cada pasarela mantienen la validación final, creación del pedido y pago. Al entrar en Pago se vuelve a activar la selección nativa y se notifica el cambio de tamaño para las interfaces de pago que lo requieran; su funcionamiento efectivo sigue pendiente de revisión con las extensiones instaladas.

Los errores nativos quedan visibles y se abre el paso correspondiente cuando existe un campo identificado. Los controles incluyen foco, estado actual/completado, mensajes y diseño responsive. «Cambiar formato» permite volver al selector y conservar los valores del formulario mientras se permanezca en la página. Atrás/adelante del navegador recupera el formato indicado en la URL y comienza por los datos. No se añaden direcciones o datos de pago a la URL, localStorage o sessionStorage; WooCommerce conserva su sesión nativa.

Los importes y resúmenes se leen del DOM nativo; React no calcula precios, impuestos o costes de envío. No se tramita un pedido al elegir formato, cambiar paso o recalcular. Pedido recibido, pago de pedido existente y cuenta conservan sus vistas nativas y no muestran este selector.

## Activación y enlaces de prueba

En **Herramientas → Checkout Dipe** aparecen el editor y, con shortcode activo, **Ver selector / Probar checkout normal / Probar checkout por pasos**. Si la página aún usa Checkout Blocks, primero se muestra el botón de conversión ya preparado, con copia restaurable. Las variantes no se implementan moviendo nodos de los bloques React de WooCommerce.

La edición de página no queda bloqueada por el respaldo: editar después de convertir simplemente impide que una restauración automática sobrescriba esos cambios. No se convierte, edita o publica contenido de WordPress desde Codex. Los huecos del selector/navegación se insertan con hooks del tema antes y después del formulario. Con assets o PHP anteriores, el formulario nativo continúa como respaldo, sin imponer un selector incompleto.

## Fuentes y FTP

- Nuevos `frontend/src/pages/shop/CheckoutExperience.jsx` y `CheckoutExperience.css`.
- Modificado `frontend/src/pages/shop/CheckoutLayout.jsx` para montar las presentaciones y mantener sticky solo en la vista normal.
- Modificado `wp-content/themes/dipe-react/inc/commerce.php` con huecos antes/después del formulario.
- Modificados `wp-content/plugins/dipe-core/includes/shop-checkout.php` (editor/enlaces/explicación) y `dipe-core.php` (versión 0.4.30).
- Documentación: esta guía, `docs/tienda-checkout.md`, `CONTEXTO-PROYECTO.md` y `PLAN_PARA_TERRA.md`.

FTP de esta entrega, en orden:

1. **`wp-content/themes/dipe-react/assets/` completo**, incluido `.vite/manifest.json`, después de la compilación del usuario.
2. **`wp-content/themes/dipe-react/inc/commerce.php`**.
3. **`wp-content/plugins/dipe-core/includes/shop-checkout.php`**.
4. **`wp-content/plugins/dipe-core/dipe-core.php`**, al final del PHP.

Conservar las dependencias de entregas anteriores del tema y core, incluida la plantilla `woocommerce/checkout/review-order.php` y los módulos de la 0.4.29. Si ese lote aún no se subió, completar primero su relación en `docs/tienda-formularios-correo.md`. No hace falta instalar otro plugin, reactivar WooCommerce, tocar pasarelas/envíos o subir PHP de cuenta/reseñas.

Después revisar en servidor selector, ambas URL directas, edición de contenido alrededor del shortcode, avance/retroceso/cambio de formato, errores de campos, dirección diferente, envío y cupón, actualización de totales, políticas y pago instalado. Comprobar además móvil, foco, carrito sin envío, errores de servidor y pedido recibido. Estas vistas, recorridos y pagos no se consideran validados por esta entrega local.
