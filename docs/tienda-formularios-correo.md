# Privacidad, protección de formularios y correos de tienda

**Transporte SMTP, ampliación 0.4.31 (25-10-2026):** ante fallos en «Nuevo pedido»/«Pedido a la espera» del pedido #477, Correo Dipe añade asignación explícita de cuenta SMTP para Woo y para otros correos de WordPress; conserva cuentas/cifrado/listas y reorganiza el panel. El SMTP previo solo reconocía los remitentes de formularios. Tras FTP es necesario elegir cuenta Woo y guardar; no se activa sola ni se reintentan correos fallidos. Los destinatarios y el contenido nativo permanecen en WooCommerce. No cambia `shop-emails.php` ni el diseño del mensaje de la entrega 0.4.29. Archivos, orden FTP y revisión pendiente en [SMTP unificado](formularios.md#smtp-unificado-y-correo-dipe-25-10-2026-core-0431). Sin envíos ni comprobaciones locales.

Entrega local del 25-10-2026, `dipe-core` **0.4.29**. El usuario exige privacidad y protección en preguntas/opiniones, compradores identificados para valorar y correos con identidad Dipe. Aclara después que también se puede preguntar sin cuenta, con validación previa en WordPress. Sin pruebas locales, navegador, lint, API de prueba, compilación, envío de correos, FTP ni operaciones Git. Pendiente revisión del usuario en servidor.

## Quién puede enviar y cuándo se publica

| Formulario y visitante | Envío | Publicación |
| --- | --- | --- |
| Pregunta de invitado | Permitido, con privacidad y controles. | Pendiente de aprobación; autor público «Invitado». |
| Pregunta de usuario identificado sin compra | Permitido, con privacidad y controles. | Pendiente de aprobación; conserva su nombre de perfil. |
| Pregunta de comprador identificado | Permitido, con privacidad y controles. | Publicada, aunque todavía no tenga respuesta. |
| Opinión de comprador identificado | Permitido, con privacidad y controles. | Pendiente de aprobación, como en la entrega anterior. |
| Opinión de invitado o usuario sin compra | No permitido. | No se guarda. |

Las preguntas permiten consultar antes de comprar. Solo una compra reconocida por `wc_customer_bought_product()` permite publicación directa de una pregunta; registrar una cuenta por sí solo no basta. La valoración siempre exige sesión y compra del producto. Se usa la comprobación nativa de WooCommerce, también para productos variables; no se inventa una condición de «comprador verificado» ni se modifica el estado de pedidos.

No se añaden campos de nombre o correo a la pregunta de invitado: solo texto, privacidad y controles técnicos. No hay mensajes al visitante ni destinatarios nuevos. Preguntas/opiniones antiguas conservan su estado. La aprobación se gestiona desde las pantallas de Productos preparadas en [Moderación](tienda-moderacion.md).

## Controles del servidor

- Casilla de privacidad sin marcar por defecto, obligatoria en ambos formularios y validada en servidor. Enlace a `/politica-de-privacidad/` generado con `home_url()`, sin crear o modificar el texto legal.
- Token firmado ligado a propósito, producto y sesión del usuario, o a la identidad de IP del invitado. Caduca en una hora y solo se consume tras un envío guardado. No necesita cookies nuevas.
- Comprobación de origen/referer cuando están presentes, campo trampa, validación/saneado de texto y bloqueo simultáneo por identidad.
- Un envío por minuto y diez por hora, compartidos entre preguntas y opiniones por usuario o IP de invitado. Duplicados de texto normalizado para ese producto/tipo/identidad se rechazan durante 24 horas. Los límites se contabilizan al guardar, no al fallar un formulario.
- Las opiniones tienen además un nonce nativo de WordPress ligado al usuario/producto y comprobación de compra en cada envío. Se conservan la moderación y los controles nativos de WordPress/WooCommerce. El tipo de comentario manipulado no permite evitar las comprobaciones: el formulario público solo crea opiniones principales; las respuestas oficiales se gestionan en el administrador con sus permisos/nonces nativos.
- El texto de pregunta admite 10–2000 caracteres; la opinión tiene límite de 5000. Se trata como texto, sin permitir HTML enviado por el visitante.

No se almacena la IP en claro en preguntas/opiniones o en los contadores: las claves usan HMAC con la sal de WordPress. Se toma `REMOTE_ADDR`, no cabeceras de proxy libres del cliente. Contadores y tokens consumidos caducan en una hora; huellas de duplicados, en 24 horas; los bloqueos se liberan al terminar y disponen de recuperación si la petición se interrumpe. No incorpora servicios externos de CAPTCHA o seguimiento.

Cada pregunta/opinión nueva aceptada guarda `_dipe_privacy_accepted_at` (UTC) y `_dipe_privacy_policy_url` en sus metadatos privados. No versiona ni almacena una copia del texto legal. La conservación definitiva de contenidos y su integración con exportación/borrado de datos siguen pendientes, igual que en el resto de formularios.

La ruta pública `GET dipe/v1/shop/products/{id}/question-form` entrega un token para el producto, URL de privacidad y estado de publicación del usuario actual con respuesta privada/no-store. `POST .../questions` exige `question`, `privacy: true`, `form_token` y acepta `website` vacío. Las cookies y nonce REST se conservan para usuarios identificados; el invitado no necesita iniciar sesión. No devuelve preguntas pendientes al listado público.

El frontend prepara el token al abrir la ficha y permite renovarlo sin borrar el texto. Solo actualiza listado/contador cuando el servidor indica que la pregunta está publicada; nunca muestra una pregunta pendiente como si estuviera aprobada. Las opiniones conservan su envío nativo y las respuestas administrativas no tienen que simular compra o consentimiento de cliente.

## Correos de WooCommerce

El nuevo módulo `shop-emails.php` usa filtros nativos y `assets/shop-emails.css`, sin copiar las plantillas de pedidos/cuenta ni enviar mensajes de prueba. Aplica a los correos HTML: logo, cabecera negra, acento y botones `#ff8600`, texto `#1d1d1d`, cuerpo blanco, fondo `#f6f6f6`, tablas suaves y ajustes para móvil. WooCommerce mantiene su conversión de CSS a estilos inline.

El logo configurado expresamente en **WooCommerce → Ajustes → Correos electrónicos** tiene prioridad. Si está vacío, se usa el logo de WordPress (`custom_logo`). No se añade un dominio temporal ni una imagen inventada. Los colores de identidad se aplican por filtros reversibles, conservando las opciones originales de la base de datos. El editor por bloques recibe también valores base de tipografía/colores; estilos explícitos de plantillas personalizadas pueden prevalecer y necesitan revisión con las plantillas realmente instaladas.

Se reutilizan las fuentes Gordita emitidas por Vite desde los assets del tema. Los clientes que admitan fuentes remotas podrán utilizarlas; el resto dispone de **Arial/Helvetica/sans-serif**. No promete idéntica tipografía en todos los clientes de correo. No hay descarga de fuentes de terceros. Los mensajes de texto plano mantienen su formato.

Se conservan textos transaccionales, importes, impuestos, descargas, enlaces de pago, recuperación, destinatarios, remitentes, asuntos, notificaciones habilitadas, footer configurado y transporte. No cambia las credenciales ni la configuración SMTP, ni los correos de Contacto. La identidad visual no confirma entregabilidad.

## Archivos modificados

- Nuevos `wp-content/plugins/dipe-core/includes/shop-form-security.php`, `includes/shop-emails.php` y `assets/shop-emails.css`.
- Modificados `wp-content/plugins/dipe-core/dipe-core.php`, `includes/shop-features.php`, `includes/shop-discussions-admin.php` e `includes/class-shop-questions-table.php`.
- Frontend: `frontend/src/pages/shop/ProductQuestions.jsx`, `ProductDetail.css` y `NativeCommerce.css`.
- Documentación: esta guía, formularios, moderación, interacciones, `CONTEXTO-PROYECTO.md` y `PLAN_PARA_TERRA.md`.

## FTP exacto y siguiente revisión

1. Subir los tres archivos nuevos: `wp-content/plugins/dipe-core/includes/shop-form-security.php`, `wp-content/plugins/dipe-core/includes/shop-emails.php` y `wp-content/plugins/dipe-core/assets/shop-emails.css`.
2. Subir `wp-content/plugins/dipe-core/includes/shop-discussions-admin.php` y `wp-content/plugins/dipe-core/includes/class-shop-questions-table.php`.
3. Subir **`wp-content/plugins/dipe-core/includes/shop-features.php`**, que carga directamente su dependencia de seguridad.
4. Subir **`wp-content/plugins/dipe-core/dipe-core.php`** (0.4.29), al final del PHP.
5. Subir los assets completos generados por el usuario a **`wp-content/themes/dipe-react/assets/`**, con `.vite/manifest.json` y sus fuentes.

El módulo de seguridad debe estar subido antes de shop-features. Este carga su dependencia incluso mientras siga activo un principal anterior, permitiendo subir el principal al final sin duplicar las funciones administrativas antiguas. Mantener el resto de dependencias anteriores de `dipe-core`. No requiere reactivar, instalar plugins, cambiar ajustes de comentarios o subir PHP del tema.

Revisar en servidor: invitado/sesión sin compra/comprador, ausencia de privacidad, moderación antes de publicar, preguntas sin respuesta, aprobación y respuesta administrativas, errores/reintento/duplicados, y vista previa de correos de pedido/cuenta desde WooCommerce. Revisar también logo, enlaces, tablas y fuentes en los clientes de correo usados por la empresa. No se han ejecutado estas comprobaciones ni se considera validado el resultado.
