# Contexto del proyecto Dipe Agency

**Corte de estado: 17 de octubre de 2026.** Este documento resume el árbol local y lo confirmado en la conversación. No se ejecutaron pruebas locales ni se consultó el servidor para prepararlo. El usuario instala/sube por FTP y valida los cambios en el WordPress real. No incluye credenciales, claves ni contenido de solicitudes.

## Objetivo y decisiones firmes

- WordPress como backend editorial y de administración; React 19 + Bootstrap 5, compilado con Vite 8, como frontend dentro de un tema propio ligero. PHP 8.2 y MariaDB en el hosting Dinahosting de pruebas. Git ya está configurado.
- Home y páginas corporativas fijas se maquetan por código; sus textos e imágenes fijas no se editan en WordPress. Logo, favicon y menús se administran desde WordPress. Entradas nativas y CPT publicados se consumen por REST y deben aparecer sin recompilar React.
- Sin Elementor para maquetación o formularios. ACF Pro se reserva para datos estructurados de CPT. CookieYes es el gestor de cookies elegido. Se busca evitar plugins adicionales de formulario y SMTP.
- SEO editable desde WordPress más adelante, con un único proveedor y sin metadatos duplicados. El entorno de pruebas está bloqueado para indexación desde `dipe-core`.
- Revisión: el usuario sube cambios por FTP y comunica el resultado. No hacer pruebas locales; build único cuando cambie React/CSS para obtener assets.

## Continuidad, Git y publicación

### Últimas funcionalidades completadas

- La base de Home y Contacto está implementada en el tema React y `dipe-core`: el formulario Contacto registra solicitudes privadas y usa el flujo de correo configurado desde WordPress.
- La administración de Solicitudes, los ajustes de Correo Dipe, proyectos por CPT/REST, el tratamiento de imágenes ACF y la sección de reseñas con dos opiniones reales repetidas están presentes en el código. Las confirmaciones de servidor siguen limitadas a las indicadas más abajo.

### Estado actual del desarrollo

- **Verificado al iniciar esta documentación (17 de octubre de 2026):** el árbol local estaba limpio; `main` apuntaba a `7182e1df7126e7f33091f77491e0446730d9ffb0` (`feat: complete home and contact foundation with project handoff`) y seguía a `origin/main` en `https://github.com/mariocdev/dipe-agency-React.git`.
- La rama `docs-github-workflow` se creó desde ese commit exclusivamente para documentar el flujo de trabajo. Su commit y publicación en GitHub se registrarán al cerrarla; no se asumen hasta que se completen.
- GitHub es la fuente de verdad. Codex Desktop edita el checkout local; Codex Cloud debe usar ramas independientes y pull requests. No se integra nada en `main` sin autorización expresa.

### Decisiones técnicas importantes

- WordPress resuelve URL y estado HTTP; React proporciona las vistas. `dipe-core` conserva CPT, ACF y REST, y el tema conserva el shell y la configuración pública.
- Las páginas corporativas son fijas en código; contenido editorial, menús y logos siguen siendo administrables desde WordPress según las reglas ya descritas en este documento.
- Cada tarea relevante actualiza este contexto con hechos comprobados. El código y su documentación relacionada se versionan juntos en el commit de la tarea cuando corresponda. No se ejecutan operaciones Git destructivas, despliegues FTP automáticos ni push/merge directo a `main`.

### Producción y FTP

- **Última versión confirmada como publicada en producción:** pendiente de identificar. No consta en el repositorio un commit, etiqueta o lista de archivos que pueda vincularse con certeza a la versión activa en el servidor.
- **Archivos pendientes de subir por FTP:** ninguno generado por esta tarea, que solo modifica documentación. El estado de despliegue de cambios anteriores debe confirmarlo el usuario antes de marcarlo como publicado. Cuando cambie React/CSS, la entrega deberá enumerar también los assets generados por el único `pnpm build` permitido.

## Lo que existe en código

- `wp-content/themes/dipe-react/`: tema que deja a WordPress resolver la petición, monta React en `#dipe-react-root` y carga `assets/.vite/manifest.json`. `functions.php` registra y prepara menús, logo principal y logo de pie, imprime `window.dipeSite` con datos públicos y emite metadatos SEO básicos. `404.php` fija estado 404. El HTML inicial del cuerpo es principalmente el contenedor de React.
- `wp-content/plugins/dipe-core/dipe-core.php` (cabecera versión 0.4.2): CPT público `dipe_proyecto`, taxonomía `dipe_project_tag` con término `destacados`, campo ACF para imagen de tarjeta y campo REST alternativo. Configura rutas del blog y redirecciones antiguas; aplica `noindex`/`nofollow`, cabecera `X-Robots-Tag`, `robots.txt` restrictivo y visibilidad privada del sitio de pruebas.
- `frontend/src/App.jsx`: cabecera y pie compartidos, Home, archivo/detalle de proyectos, archivo/detalle del blog y categorías; una vista de 404 React para rutas no reconocidas. `Home.jsx` reúne hero, servicios, proceso, proyectos destacados, reseñas, FAQ, blog, Contacto y carrusel de logos.
- `frontend/src/ContactSection.jsx` y `api.js`: formulario de Contacto integrado en Home, con estados de envío y POST a `dipe/v1/forms/contacto`. La página independiente `/contacto/` aún no tiene una ruta React propia en `App.jsx`.
- `includes/form-submissions.php`: endpoint Contacto con Nombre, Email, Teléfono, Mensaje y privacidad obligatorios; honeypot y límite de frecuencia. Registra solicitudes como CPT privado `dipe_solicitud` y permite verlas en `wp-admin > Solicitudes` con búsqueda, filtros, paginación y detalle de solo lectura. Guarda estado de notificación pendiente/enviado/parcial/fallido.
- `includes/mail-settings.php`: `wp-admin > Ajustes > Correo Dipe` guarda configuración SMTP y dos identidades remitentes, con contraseñas cifradas en `wp_options`; destinatarios de Contacto configurables. Envía avisos individualmente con `wp_mail()`/PHPMailer y permite mensajes de prueba. El correo del visitante va en `Reply-To`, no en `From`. El remitente para confirmaciones al visitante está preparado, pero no hay confirmación automática implementada.
- `frontend/src/tokens.css` y `fonts.css`: colores corporativos, escala tipográfica y Gordita OTF Regular/Medium/Bold. `Home.css` y varios CSS de sección ya separan estilos; `styles.css` conserva estilos globales que se extraerán gradualmente.
- `ReviewsSection.jsx`: cuatro posiciones de carrusel que muestran dos reseñas reales repetidas y señaladas como tales. No hay integración viva con Google.

## Confirmaciones recibidas del usuario

- WordPress está instalado con el tema y plugin activos; el usuario usa Git y FTP.
- El usuario indicó que el envío del formulario funciona y que un aviso llegó a una cuenta Gmail, pero **en spam**. Esto confirma recepción de ese mensaje, no entregabilidad general ni llegada al resto de destinatarios.
- La bandeja de solicitudes se preparó y el usuario siguió con el envío; no hay evidencia aquí de una revisión exhaustiva de filtros, paginación o estados.
- Las imágenes ACF y las reseñas tuvieron cambios de código; la documentación previa conserva algunas verificaciones pendientes. No afirmar que estén validadas en todos los contextos sin nueva confirmación del usuario.

## Problemas conocidos y límites

1. **Gmail clasifica al menos un aviso como spam.** La causa aún no está diagnosticada. Pedir al usuario los resultados SPF/DKIM/DMARC de «Mostrar original» y los dominios `From`/`Return-Path`, ocultando datos personales; después revisar configuración DNS/DKIM del dominio remitente y, si autentica correctamente, reputación del dominio temporal y contenido. No cambiar SMTP o añadir plugins a ciegas. El estado `sent` de WordPress solo indica que el servidor aceptó el correo.
2. **Blog/categorías:** el usuario mostró que `/categoria/seo/` pintaba contenido React pero WordPress emitía un título de «Página no encontrada». Puede haber estado HTTP o consulta WordPress incorrectos. El usuario lo aplazó; `docs/blog-rutas.md` contiene el antecedente. No dar esas rutas por resueltas.
3. **SEO:** `dipe-core` fuerza no indexación en el entorno de pruebas. El tema emite description/canonical/Open Graph básicos; falta decidir un proveedor editable desde WordPress, retirar duplicados y resolver contenido significativo en el HTML inicial antes de producción.
4. **Modelo incompleto:** solo está registrado el CPT de proyectos. Servicios, empleados, páginas interiores y casos de proyecto completos esperan diseños, contenidos y campos definitivos. El detalle de proyecto actual es mínimo.
5. **Formularios adicionales:** solo Contacto está implementado. Quedan tipos, campos y rutas definitivas; confirmaciones al visitante; política de privacidad, conservación y borrado; candidaturas con CV almacenado de forma protegida. La bandeja no tiene exportación ni borrado.
6. **Fuentes y reseñas:** se usa Gordita OTF aportada para pruebas; confirmar licencia web y kit WOFF2 antes de publicación comercial. Las reseñas mostradas no son un feed vivo ni cuatro opiniones distintas.
7. **Caché/despliegue:** el hosting tiene Varnish. Tras FTP, el usuario puede necesitar purgarlo para ver CSS/JS o respuestas recientes. El build generado está ignorado por Git y debe acompañar las subidas del tema cuando cambie el front.

## Siguientes pasos recomendados

1. Resolver la clasificación de Gmail con la evidencia de «Mostrar original». Si falla SPF, DKIM o DMARC, corregir el DNS/servicio de correo correspondiente; si pasan, revisar reputación y contenido. No registrar contraseñas ni cabeceras completas con datos personales en el repositorio.
2. Cerrar Contacto: confirmar destinatarios definitivos, observar en el servidor el estado de `Solicitudes` y la recepción en buzones de dominio y externos. Acordar texto de privacidad y retención. Mantener el registro incluso cuando falle el correo.
3. Continuar maquetación según diseños aportados, comenzando por las páginas interiores que el usuario priorice. Crear CPT/ACF solo cuando sus campos estén claros; preservar la separación entre contenido editorial y páginas fijas en código.
4. Retomar el blog solo cuando el usuario lo pida y resolver primero la respuesta WordPress/HTTP, luego la vista React.
5. Antes de producción: plan de SEO e indexación, licencia/formatos de fuente, cookies, retención de solicitudes, CV protegido y entregabilidad del dominio definitivo.

## Estado del repositorio y documentación

Al preparar este documento, `git status --short` mostraba **numerosos archivos modificados y sin seguimiento**, incluido el `AGENTS.md` de raíz, los includes del plugin y componentes nuevos del frontend. No asumir que los cambios están comprometidos ni limpiar el árbol. La raíz ya tenía `AGENTS.md`; por la orden de no modificar archivos existentes, las instrucciones nuevas están en `continuacion/AGENTS.md`. Este documento se creó nuevo en la raíz. `PLAN_PARA_TERRA.md` y varios documentos de `docs/` contienen frases históricas que describen Contacto como pendiente; el código actual y la confirmación del usuario prevalecen para el estado presente.

Lectura útil: `continuacion/AGENTS.md`, `docs/formularios.md`, `docs/blog-rutas.md`, `docs/proyectos.md`, `docs/modelo-contenido.md`, `docs/arquitectura-editorial.md` y `docs/guia-visual.md`.
