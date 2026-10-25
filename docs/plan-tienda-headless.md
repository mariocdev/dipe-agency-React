# Plan de tienda WooCommerce con React

**Interacciones preparadas (25-10-2026):** ficha con pestañas reales, lista de deseos de invitado por sesión de pestaña y de usuario en su cuenta (con unión al acceder), vista de favoritos y primera gestión de preguntas/respuesta oficial con moderación, sin plugins externos. Tarjetas con corazón, padding y hover pedidos. Nuevo módulo propio `shop-features.php`, core 0.4.26. Detalles/FTP en [Interacciones de tienda](tienda-interacciones.md). Pendiente revisión en servidor; no se considera cerrada la fase avanzada de Q&A, notificaciones o políticas de datos. Abandono y digitales siguen posteriores.

**Implementación local del 25-10-2026:** el usuario confirma el preparador funcionando y pide las pantallas; amplía a carrito/compra/cuenta al responder «Todo todo». Preparados catálogo/categorías/etiquetas con sidebar, filtros y búsqueda, ficha/variaciones y carrito React conectados a Store API; compra/cuenta y reseñas conservan formularios nativos con diseño integrado. Dependencias comerciales sin cambiar; publicación y revisión de este nuevo lote pendientes. Archivos, límites y orden FTP en [Tienda frontend](tienda-frontend.md). El plan inferior conserva el resto de fases; no significa que Q&A, recuperación o digitales ya estén implementados.

Plan del 25-10-2026. **El usuario confirma que WooCommerce ya está instalado en el WordPress real y da por terminada la retirada de Rocket.** La configuración y los datos remotos no se han modificado desde Codex. El preparador descrito a continuación permitirá al usuario crear el catálogo desde WordPress; sus ajustes efectivos se revisarán en servidor. El diseño puede proponerse siguiendo la identidad actual; los datos comerciales reales los define el propietario.

**Preparador solicitado después del plan:** se entrega un plugin temporal instalable que crea el catálogo y aplica ajustes solo al pulsar sus botones administrativos. Sus fuentes no se han ejecutado en el servidor. Incluye 12 productos físicos, variaciones, categorías, etiquetas y atributos; instrucciones y límites en [Preparar WooCommerce para maquetar](tienda-demo.md). No añade pantallas React ni plugins comerciales externos. La recomendación de «solo WooCommerce» se refiere a dependencias de la tienda; esta herramienta propia se puede desactivar tras preparar los datos.

## Recomendación y arquitectura

Usar **WooCommerce como motor comercial y la aplicación React actual como escaparate**, manteniendo ambos en el mismo origen. WordPress conserva las URL, los estados HTTP y los metadatos; WooCommerce administra productos, precios, existencias, clientes y pedidos. React dibuja catálogo, producto, carrito, compra y cuenta.

La Store API incluida en WooCommerce ofrece productos, carrito y checkout orientados al comprador. La REST API administrativa tiene otro alcance: sus claves privadas nunca se incluyen en React, en variables públicas de Vite ni en la configuración del tema. Las operaciones privadas pueden resolverse dentro de `dipe-core`, con las API PHP/CRUD de WooCommerce y autorización del usuario actual. [Store API oficial](https://developer.woocommerce.com/docs/apis/store-api/).

No hace falta introducir Next.js, GraphQL, WPGraphQL, JWT ni otro servidor para empezar. Conservar el mismo origen permite utilizar las cookies de sesión de WordPress. La Store API no sustituye un sistema completo de autenticación y área personal. [Autenticación REST de WordPress](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/).

Como alternativa, Shopify permite consumir catálogo/carrito desde su Storefront API, pasar al checkout alojado y gestionar clientes mediante Customer Account API. Para este proyecto recomiendo WooCommerce: mantiene la gestión comercial en el WordPress existente y permite aprender su integración. Shopify merece reconsiderarse si se prefiere delegar la operación del comercio en otro servicio; exige otra integración y condiciones comerciales propias. Esta elección es una recomendación de arquitectura, no una comparación de rendimiento medida. [Arquitectura headless de Shopify](https://shopify.dev/docs/storefronts/headless/bring-your-own-stack).

## Plugins previstos

| Momento | Plugin nuevo | Alcance |
| --- | --- | --- |
| Inicio | **WooCommerce** | Catálogo, variaciones, inventario, pedidos, cupones, clientes, reseñas y reglas de compra. |
| Cobro con tarjeta | **Una sola pasarela**, propuesta: WooCommerce Stripe Payment Gateway | Conectar en modo de pruebas antes de habilitar cobros reales; integrar también su interfaz de pago en React. Alternativa a decidir: WooPayments u otra pasarela necesaria para el negocio. |
| Recuperación comercial posterior | Ninguno inicialmente; candidato **AutomateWoo** si hace falta | Evaluar su coste y su conexión real con las sesiones, eventos y checkout de React antes de elegirlo. |

ACF, Yoast y `dipe-core` existentes siguen con sus responsabilidades. No añadir plugins para estrellas, cuentas o carrito básicos. Un plugin que añade una pestaña o un shortcode a la plantilla tradicional no dibuja esa función en React. Menos plugins implica desarrollar y mantener las conexiones necesarias; no elimina ese trabajo.

Stripe ofrece un modo de pruebas y exige configurar la conexión y webhooks. La compatibilidad con Checkout Blocks no acredita por sí sola la compatibilidad de una interfaz React propia. [Configuración de Stripe](https://woocommerce.com/document/stripe/setup-and-configuration/settings-guide/), [pruebas de pagos](https://woocommerce.com/document/stripe/customer-experience/testing/).

## Funciones y límites

| Función | Base disponible | Trabajo del proyecto |
| --- | --- | --- |
| Catálogo y producto | Productos, categorías, atributos, variaciones y existencias en WooCommerce | Vistas React, filtros, galería, selección de variación y estados de disponibilidad. |
| Carrito | Store API y sesiones WooCommerce | Añadir, modificar, eliminar, cupones, resumen, errores y persistencia. El servidor calcula precios y totales. |
| Compra | Checkout de WooCommerce y Store API | Formularios, validación, pago, confirmación, errores y enlaces de correos compatibles con las rutas reales. |
| Usuarios y zona personal | Usuarios WordPress y clientes/pedidos WooCommerce | Acceso, alta, recuperación, cierre de sesión, perfil, direcciones y pedidos del usuario autenticado. |
| Reseñas | Estrellas, moderación, respuestas y comprador verificado en WooCommerce | Lectura y formulario React; envío mediante un endpoint propio limitado al producto y al usuario permitido. |
| FAQ del producto | Campos editoriales existentes ampliables | Preguntas/respuestas redactadas por el administrador mediante ACF y acordeón React; sin plugin adicional. |
| Preguntas de visitantes y respuestas de la tienda | No se consideran cubiertas por las reseñas básicas | Modelo separado en `dipe-core`, moderación, permisos y endpoints; interfaz React. Si crece el alcance, comparar una extensión que exponga una API adecuada. |
| Carrito conservado | Sesión de carrito; comportamiento a concretar al acceder/salir | Restauración y unión del carrito de invitado y cliente, caducidad y actualización de stock/precios. |
| Carrito abandonado y recuperación | Depende de versión y solución elegida | Captura identificada, criterio de abandono, planificación de correos y enlace de recuperación; no basta con conservar productos en el navegador. |

Las reseñas nativas permiten restringir la escritura a compradores verificados y moderar las contribuciones. La Store API documenta lectura pública de reseñas; no debe exponerse su API administrativa para permitir envíos anónimos desde el navegador. El servidor debe calcular la condición de comprador verificado. Las reseñas de productos estarán separadas de las opiniones reales de la Home; una demo no publicará valoraciones ficticias como reales. [Reseñas nativas](https://woocommerce.com/document/product-reviews/), [lectura Store API](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/product-reviews/).

La recuperación nativa requiere revisar la versión instalada: la documentación consultada describe una función experimental en WooCommerce 11.0/11.1 y su retirada en 11.2. No basar el proyecto en su disponibilidad. AutomateWoo incorpora seguimiento y automatizaciones, pero su captura y actividad dependen del flujo del comprador: hay que comprobar/adaptar el carrito y checkout propios antes de contratarlo. Acordar identificación, información al comprador, bajas, caducidad y envío antes de activar campañas. [Disponibilidad por versión](https://woocommerce.com/document/managing-orders/abandoned-cart-recovery-emails/), [carritos en AutomateWoo](https://woocommerce.com/document/automatewoo/abandoned-cart/).

## Orden de implementación

### Alcance confirmado: físicos primero, digitales después

El usuario elige probar ambos tipos, empezando por productos físicos. Esta decisión sustituye su selección inicial de digitales. La primera entrega se centra en catálogo/ficha de físicos; la ampliación digital se incorpora después de completar el recorrido básico de compra.

Propuesta de catálogo ficticio, pendiente de concretar: libreta y bolsa como productos simples, y camiseta con talla/color como producto variable. Servirá para recorrer disponibilidad, cantidades, variaciones y cálculo de envío. Todo se identificará como demostración; no se simulan compras ni reseñas reales.

Después se añadirá un descargable ficticio al mismo catálogo, sin una segunda tienda ni un plugin nuevo por defecto. La fase digital incluirá acceso autorizado a archivos, descargas en la zona personal y un carrito mixto; los archivos de pago no se incluirán como assets públicos de React. WooCommerce permite marcar productos como virtuales y descargables y definir límites/caducidad de descarga. [Productos virtuales y descargables](https://woocommerce.com/document/managing-products/virtual-downloadable/).

### 1. Definir una demo pequeña y configurar WooCommerce

- Preparar primero productos físicos ficticios simples y variables. Concretar nombres y medios del catálogo propuesto; productos digitales en una segunda etapa.
- Fijar moneda, ubicación, impuestos, mercados, zonas y métodos de envío, inventario, compra como invitado y registro. Proponer envío de demostración por tarifa fija y recogida local si se quieren recorrer ambos casos; los importes y destinos quedan pendientes de definir. No inventar tipos impositivos, tarifas comerciales reales, políticas o destinatarios.
- WooCommerce ya está instalado por el usuario. Continuar con su configuración, omitiendo extensiones comerciales sugeridas que no se necesiten. Registrar las versiones reales de WordPress, PHP y WooCommerce y su compatibilidad antes de desarrollar la integración.
- Asignar páginas de tienda, carrito, finalizar compra y cuenta. Utilizar un método sin tarjeta para recorrer pedidos de demostración, elegido expresamente y sin presentarlos como pagados. Mantener los correos dirigidos a buzones de prueba definidos por el propietario.
- Revisar el correo ya configurado en `dipe-core`: utilizar el transporte existente de `wp_mail()` cuando sea compatible, separando los destinatarios de formularios de los avisos de pedidos. No añadir SMTP por defecto.

Entrega: ajustes registrados y catálogo de demo en WordPress; primera propuesta de catálogo/ficha para revisión del usuario en servidor.

### 2. Catálogo y ficha con el diseño de Dipe

- Proponer `/tienda/`, `/producto/{slug}/` y `/categoria-producto/{slug}/`, confirmando que coinciden con los enlaces permanentes nativos. WordPress debe resolverlas sin 404 antes de que React las dibuje.
- Incorporar páginas en `frontend/src/pages/shop/`, estilos propios apoyados en `tokens.css`/`fonts.css` y un cliente de dominio para Store API. `App.jsx` solo compone y selecciona rutas.
- Reutilizar cabecera, pie, anchos, tipografía, naranja y controles; diseñar las tarjetas y la ficha para compra. Productos, imágenes, precios y existencias vienen de WooCommerce, sin duplicarlos en ACF o en constantes React.
- Incluir estados de carga, catálogo vacío, producto inexistente, agotado y variación incompleta; filtros y ordenación conservan una URL utilizable.
- Revisar títulos/metadatos, canonical, sitemap y schema Product sin duplicaciones. No asumir que el HTML inicial contiene descripción y precio porque exista JSON-LD: la aplicación actual renderiza en cliente; su indexabilidad comercial merece una decisión específica antes del lanzamiento.

#### Categorías, búsqueda y filtros incluidos en la primera entrega

El usuario confirma que el catálogo debe incorporar categorías y filtros. Forman parte de la primera etapa de productos físicos, sin instalar un plugin de filtros adicional.

| Elemento | Propuesta para la demo | Origen y comportamiento |
| --- | --- | --- |
| Categorías | Papelería, Bolsas y accesorios, Ropa | Categorías nativas de productos WooCommerce, con nombre, slug, descripción e imagen editables; cada una con archivo propio. «Todos los productos» lleva al catálogo general. |
| Búsqueda | Campo por texto | Consulta de productos, independiente del buscador del blog. |
| Precio | Desde/hasta y botón Aplicar | Rango calculado a partir del catálogo consultado; conservar el formato y moneda de WooCommerce. |
| Disponibilidad | Solo disponibles | Usar el estado real de stock devuelto por WooCommerce. |
| Talla y color | Selección múltiple cuando proceda | Atributos globales de WooCommerce, también usados por las variaciones de la camiseta. No crear campos ACF paralelos para esos datos. |
| Ordenación | Orden de la tienda, novedades y precio ascendente/descendente | Aplicada en servidor junto con los filtros. Añadir valoración cuando existan reseñas reales suficientes para que resulte útil. |
| Resultados | Total, paginación, filtros activos y Limpiar filtros | Consultar el conjunto en servidor; no filtrar únicamente la página de productos ya descargada. |

Las categorías responden a qué es el producto; talla y color describen sus opciones. No se crearán categorías por talla o color. Proponer varios artículos por categoría para recorrer combinaciones útiles; el número y catálogo definitivos se concretan al preparar los datos de demo. La categoría digital se incorpora en la segunda etapa, sin mostrar una sección vacía ahora.

Propuesta visual: barra superior con búsqueda, total y ordenación; panel de filtros en escritorio y desplegable mediante botón «Filtrar» en móvil, con etiquetas visibles y controles de teclado. Mantener tipografía, naranja, bordes y espaciados de Dipe. Compartir lógica de consulta cuando proceda; las tarjetas de tienda tienen diseño propio y no sustituyen las de blog o proyectos.

Guardar categoría, filtros, orden y página en la URL, permitiendo recargar, compartir enlaces y volver atrás. Las categorías usan su ruta nativa; los demás controles se representan como parámetros. Cambiar un filtro reinicia la paginación. Combinar talla/color con la relación definida entre atributos y permitir varias opciones dentro de cada uno. Mostrar solo atributos pertinentes y tratar resultados vacíos sin bloquear Limpiar filtros; conservar el foco y evitar respuestas antiguas que sobrescriban una consulta más reciente.

La ficha vuelve a comprobar la variación concreta, su precio y disponibilidad antes de añadirla al carrito: un resultado de búsqueda por atributos del producto no garantiza por sí solo una combinación comprable. Categorías y filtros no deben exponer archivos de descarga ni datos privados al incorporar digitales.

La copia de WooCommerce aportada al workspace incluye estos parámetros de consulta en su [ruta Products](../wp-content/plugins/woocommerce/src/StoreApi/Routes/V1/Products.php) y cálculo de rangos/recuentos en [ProductCollectionData](../wp-content/plugins/woocommerce/src/StoreApi/Routes/V1/ProductCollectionData.php). Se ha leído el código, sin ejecutar el plugin ni consultar la API del servidor. En implementación, usar Store API para productos y datos de filtros, solicitando solo los recuentos necesarios. Definir con Yoast la indexación/canonical de combinaciones filtradas antes de publicar, conservando las categorías como destinos editoriales.

### 3. Carrito real y continuidad de sesión

- Proponer `/carrito/` y contador de unidades en cabecera; carrito lateral solo si se decide que mejora el recorrido.
- Añadir, actualizar cantidades y eliminar; cupones, envío si aplica y totales devueltos por WooCommerce. React nunca decide el precio final ni reserva existencias por sí mismo.
- Preferir sesión por cookies del mismo origen con el `Nonce` de Store API. Renovar tokens y resolver sesión caducada; no desactivar su validación. Si se opta por `Cart-Token`, tratarlo como credencial del carrito y definir su custodia y continuidad al iniciar sesión, sin asumir que autentica al cliente.
- Distinguir la sesión de invitado del carrito de usuario y concretar su unión al entrar. Evitar copias personales en caché del hosting/CDN y excluir carrito, checkout, cuenta y respuestas privadas.

Los POST de carrito y las peticiones de checkout requieren nonce o Cart Token; un token de carrito identifica ese carrito, no da acceso a todo el historial de un usuario. [Nonces](https://developer.woocommerce.com/docs/apis/store-api/nonce-tokens/), [Cart Tokens](https://developer.woocommerce.com/docs/apis/store-api/cart-tokens/).

### 4. Compra y pedidos

- Proponer `/finalizar-compra/` y las rutas nativas de pedido recibido y pago pendiente, respetando identificadores/claves y autorización. Integrar primero el flujo de pedido de demo y después una única pasarela en sandbox.
- Confirmar el método de pago y desarrollar su contrato de Store API/interfaz React. El servidor crea/procesa el pedido; los webhooks confirman el resultado del proveedor. Una pantalla de éxito del navegador no acredita el cobro.
- Tratar errores de dirección, stock, cupones, pago rechazado, autenticación adicional, cancelación y vuelta del proveedor. Evitar pedidos/cobros duplicados y mostrar el estado persistido.
- Si se prefiere una primera compra nativa de WooCommerce, el tema necesita una salida PHP específica: su `index.php` actual solo monta React. También debe compartirse la sesión de carrito. No basta con asignar una página o pegar un shortcode. Ese paso sería una variante acordada antes de implementarla.

[Checkout API](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/checkout).

### 5. Acceso y zona personal

- Proponer `/mi-cuenta/` y sus endpoints: pedidos, detalle, direcciones, perfil y recuperación de contraseña. Descargas solo si hay productos descargables.
- Utilizar autenticación WordPress por cookies en el mismo origen y nonces REST para las operaciones privadas. Implementar acceso/registro/salida/recuperación con permisos, límites de intentos y respuestas adecuadas; no habilitar un directorio público de clientes.
- Consultar pedidos exclusivamente del usuario actual mediante las API CRUD de WooCommerce, compatibles con HPOS. Autorizar también cada detalle, dirección, descarga y acción; no aceptar un ID de cliente arbitrario enviado por React.
- Resolver enlaces de recuperación, emails, sesión caducada y navegación de endpoints de cuenta. No guardar contraseñas, claves administrativas o datos de tarjeta en el navegador.

### 6. Reseñas y preguntas

- Mostrar solo reseñas aprobadas y medias reales; formulario con validación y estado pendiente de moderación. Activar y respetar las reglas de comprador verificado elegidas.
- Empezar con FAQ editoriales por producto si bastan para el diseño. El usuario ha pedido también preguntas/respuestas: incluir después el envío de preguntas, aprobación y respuesta de la tienda, con almacenamiento separado de las valoraciones, protección frente a abuso y sin publicar el correo del autor.
- No instalar un plugin de reseñas premium para duplicar estrellas/moderación ya disponibles. Valorar extensiones solo ante necesidades concretas como fotos, votaciones o conversaciones avanzadas.

### 7. Abandono y recuperación

- Diferenciar sesión sin terminar, abandono identificado y pedido pendiente de pago; acordar el tiempo de inactividad y métricas necesarias.
- Decidir entre una extensión especializada y un desarrollo propio acotado. No comprometer un sistema completo de marketing dentro de `dipe-core` solo por reducir el número de plugins.
- Si se elige AutomateWoo, confirmar soporte o integración para la sesión de Store API, captura desde React, registro de actividad y enlace de recuperación; no asumir compatibilidad por estar instalado.
- Configurar ejecución programada fiable, deduplicación, cancelación al comprar, bajas, caducidad y correo. Restaurar el carrito en servidor, recalculando precios, stock y cupones; no adjuntar datos personales o tokens permanentes a URL públicas.

## Revisión y siguiente entrega

Cada fase se entrega en una iteración pequeña, con archivos FTP y pasos de administración exactos. El usuario compila cuando haya React, sube por FTP y revisa en servidor. No se ejecutan aquí builds, tests, navegador ni peticiones de prueba al sitio; tampoco se instala/configura el servidor a distancia.

La siguiente iteración propuesta es **configuración básica de WooCommerce + catálogo/ficha de productos físicos de demostración, con categorías, búsqueda, filtros y ordenación**. El orden físico → digital ya está confirmado; quedan por concretar catálogo, medios, alcance geográfico y datos comerciales. La segunda etapa añadirá productos digitales y descargas al recorrido existente. Pagos reales, automatizaciones y campañas se activan en su fase correspondiente.
