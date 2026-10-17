# Formularios: React, dipe-core y correo del hosting

Estado: **configuración SMTP, bandeja de solicitudes y Contacto preparados**. El usuario quiere conservar rendimiento y sencillez, y evitar Elementor y nuevos plugins para los formularios. CookieYes será el gestor de cookies. El SMTP disponible en Dinahosting basta como **transporte de correo** si se configuran las cuentas autorizadas y se comprueba la entrega real; no aporta por sí mismo formularios, validación ni registro de entradas.

## Flujo propuesto

1. **React + Bootstrap** dibuja los campos, etiquetas, estados y mensajes con los tokens de Dipe. Componentes visuales compartidos para evitar repetición; configuración explícita por tipo de formulario. Las páginas corporativas siguen maquetadas por código.
2. **`dipe-core`**, ya instalado, añade una ruta pública de envío por tipo, por ejemplo `POST /wp-json/dipe/v1/forms/contacto`. Define una lista cerrada de tipos y campos, valida y sanea en servidor, aplica antispam y guarda cada envío antes de intentar la notificación. Nunca acepta desde React destinatarios, remitente, asunto arbitrario ni cabeceras de correo.
3. **Registro en WordPress:** `dipe-core` ya registra el tipo privado `dipe_solicitud`, oculto de la web y de REST público. Los campos saneados se guardan como JSON en el contenido privado; el tipo, correo y estado del aviso se guardan en metadatos protegidos. La pantalla **Solicitudes** del menú principal de `wp-admin` muestra una bandeja de solo lectura, con filtros por formulario, estado del correo y mes, búsqueda de nombre/correo/texto, paginación y ficha de cada envío. Solo acceden administradores (`manage_options`). Por ahora está vacía: aún no existe una ruta de envío ni formulario conectado. El estado distingue pendiente, enviado, parcial y fallido; indica aceptación por el servidor de correo, no entrega final al buzón. Definir conservación y borrado de datos antes de publicar.
4. **Correo:** usar `wp_mail()` y el PHPMailer incluido en WordPress, configurado desde `dipe-core` mediante `phpmailer_init` para el servidor SMTP autenticado de Dinahosting. **La configuración ya tiene pantalla en `wp-admin > Ajustes > Correo Dipe`** (`includes/mail-settings.php`); no hace falta editar `wp-config.php` ni instalar un plugin SMTP. La captura del panel confirma el host `bonsolis-servidordepruebas-net.correoseguro.dinaserver.com`, **SMTPS con TLS implícito en puerto 465** (opción recomendada por el panel) y **STARTTLS en puerto 587** como alternativa. Autenticación SMTP: sí. Se usarán dos buzones distintos según la clase de notificación; cada uno tendrá usuario (dirección completa) y contraseña propios. Las contraseñas se guardan cifradas en una opción de WordPress sin autoload, no se muestran de vuelta en el formulario y no entran en Git ni en React. Si se cambian las claves secretas de WordPress, hay que volver a introducirlas. No usar los puertos IMAPS/POPS, que son de entrada.

## Notificaciones y entrega

- **Avisos al equipo:** autenticarse y enviar como `formularios@bonsolis.servidordepruebas.net`. En estos mensajes, el correo validado del visitante puede ser `Reply-To` para responderle directamente. Los destinatarios se configuran en servidor por tipo de formulario; no se reciben del frontend.
- **Confirmaciones al visitante:** cuando se habiliten, autenticarse y enviar como `noreply@bonsolis.servidordepruebas.net`. Serán mensajes breves y separados de los avisos al equipo. Su `Reply-To` se decidirá según si la empresa quiere recibir respuestas; no usar el email del visitante como remitente.
- **Ejemplo de reparto aportado por el usuario, aún no definitivo para todos los formularios:** un contacto podría notificarse a `ana@bonsolis.servidordepruebas.net`, `mario@bonsolis.servidordepruebas.net`, `mario@dipe.es` y `mariocdev@gmail.com`. Enviar una notificación individual a cada destinatario evita exponer el resto de direcciones y permite registrar fallos parciales. La dirección externa `mario@dipe.es` es **destinatario**, no remitente de estos avisos.
- La selección de identidad SMTP debe hacerse **en servidor y por mensaje** dentro de un módulo de correo pequeño de `dipe-core`; no cambiar credenciales globales basándose en valores enviados por React. Dejar definido por separado qué cuenta usará WordPress para sus otros correos (p. ej. recuperación de contraseña) antes de activar una configuración SMTP global.
- Usar TLS y los ajustes reales del buzón. Revisar SPF, DKIM y DMARC del dominio de envío. La llamada correcta a `wp_mail()` solo confirma que el servidor aceptó el mensaje; no garantiza que llegue a la bandeja de entrada. El usuario verificará en el entorno real la entrada en WordPress, el correo de dominio y el externo.
- Registrar fallos de `wp_mail()` de forma limitada, sin contraseñas ni datos del formulario en logs públicos. La entrada en WordPress es el registro principal y el correo es el aviso.
- La pantalla **Correo Dipe** permite enviar un mensaje de prueba con cualquiera de los dos remitentes a una dirección que indique el administrador. Ese mensaje comprueba aceptación por el servidor SMTP; el usuario debe verificar también la llegada a la bandeja. Las pruebas no crean solicitudes de formulario.
- No instalar simultáneamente Elementor Site Mailer, FluentSMTP o WP Mail SMTP mientras usemos esta configuración SMTP en código. Si en el futuro se cambia de proveedor, sustituir el transporte sin alterar los formularios ni sus entradas.

## Seguridad y candidaturas

- Validar campos, longitudes, email y consentimiento en servidor; devolver errores por campo sin datos sensibles. Deshabilitar envíos duplicados en React. Usar honeypot y límite de frecuencia del lado servidor; añadir protección adicional solo si el spam real lo exige. Un nonce público no es defensa antispam suficiente.
- La ruta de lectura de entradas queda fuera de REST público. La bandeja actual solo permite lectura a administradores; antes de abrir el flujo al público, definir plazo de conservación, borrado y si otros roles necesitan acceso. No enviar información sensible en mensajes de error.
- El formulario de candidaturas con **CV** se hará después de Contacto. Limitar tamaño y extensiones, guardar fuera de la biblioteca pública de medios o restringir realmente la descarga, y definir quién puede abrir el archivo y cuándo se borra. No adjuntar CV a correos externos.
- El texto de privacidad, los destinatarios reales y el plazo de conservación los proporciona la empresa. El consentimiento del formulario es distinto del consentimiento de cookies que gestiona CookieYes.

## Orden de trabajo para Terra

1. Confirmar tipos de formulario, campos obligatorios, destinatarios definitivos por tipo y si habrá confirmación al visitante. El usuario creará los buzones `formularios@bonsolis.servidordepruebas.net` y `noreply@bonsolis.servidordepruebas.net`, y pondrá sus contraseñas en **Ajustes > Correo Dipe** tras subir el plugin por FTP. **No pedir ni guardar contraseñas en el repositorio.** La licencia Elementor One no se necesita para esta arquitectura.
2. **Contacto** ya usa `POST /wp-json/dipe/v1/forms/contacto`: Nombre, Email, Teléfono, Mensaje y la aceptación de privacidad son obligatorios. React evita duplicados durante el envío; el servidor valida, aplica honeypot y un límite de 5 envíos por IP en 15 minutos, guarda la solicitud con `dipe_core_record_submission()` y actualiza el aviso mediante `dipe_core_set_submission_mail_status()`. La bandeja de `wp-admin > Solicitudes` y el SMTP permanecen separados del procesamiento.
3. Preparar los archivos para FTP. El usuario revisará en el servidor el guardado, los errores y la recepción en una cuenta del dominio y otra externa. Ajustar con su resultado; no ejecutar comprobaciones locales por iniciativa propia.
4. Reutilizar el patrón para otros formularios; abordar CV solo con almacenamiento y descarga protegidos. Configurar CookieYes cuando se inventaríen scripts y cookies reales, y revisar su funcionamiento con la navegación React.

## Pendiente de definir

- Qué formularios habrá y los campos de cada uno; si Presupuesto es independiente de Contacto.
- Destinatarios definitivos por formulario y contenido de la eventual confirmación automática. Los destinatarios de Contacto se administran en **Ajustes > Correo Dipe** y se reciben individualmente; las dos direcciones remitentes y el servidor SMTP ya constan arriba. Falta decidir el transporte de otros correos nativos de WordPress. Las contraseñas no se documentan ni se solicitan por chat.
- Texto de privacidad, plazo de conservación y, para candidaturas, formatos/tamaño de CV y personas con acceso.

## Fuentes técnicas

- [WordPress: `wp_mail()` y límites del resultado](https://developer.wordpress.org/reference/functions/wp_mail/)
- [WordPress: hook `phpmailer_init` para configurar SMTP](https://developer.wordpress.org/reference/hooks/phpmailer_init/)
- [Dinahosting: datos del correo saliente y TLS](https://dinahosting.com/ayuda/configuracion-ssl-cuenta-de-correo/) · [DKIM](https://dinahosting.com/ayuda/correo-sobre-este-correo/)
- [CookieYes en WordPress](https://www.cookieyes.com/documentation/cookieyes-plugin-setup/) y [compatibilidad con SPA](https://www.cookieyes.com/documentation/cookieyes-with-single-page-applications/)
