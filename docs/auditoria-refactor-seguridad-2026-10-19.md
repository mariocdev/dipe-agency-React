# Auditoría de código y plan de mejoras de Dipe Agency

Fecha: 19-10-2026. Base aprobada: `5b7fec6c7267e41987418f060d1d384950cf51c8`. Rama local: `codex/auditoria-refactor-2026-10-19`.

La arquitectura actual se puede conservar. Conviene reducir lógica repetida y ordenar estilos de forma gradual; el mayor beneficio inmediato está en completar protección de formularios, permisos editoriales, recuperación del sitio y revisión SEO del servidor. No hace falta rehacer la web ni introducir un constructor, otro plugin SEO o un sistema nuevo de formularios.

Esta entrega guarda primero las fuentes actuales y después propone el trabajo. No cambia componentes, estilos, PHP, configuración de plugins ni datos. La revisión es estática, sobre fuentes y documentación del repositorio: no acredita el estado efectivo del alojamiento ni una web validada en servidor. No se han ejecutado build, tests, lint, navegador, consultas a la API del sitio ni envíos de correo.

## Punto de recuperación

El primer commit conserva los 101 archivos nuevos o modificados del lote local, incluidos tema, plugin propio, React, documentación, `.htaccess` y `robots.txt`. `main` se mantiene en su referencia anterior. No se ha hecho push ni creado PR.

Git permite recuperar estas fuentes, pero **no es una copia completa de WordPress**. Las exclusiones actuales dejan fuera base de datos, uploads, assets compilados, dependencias, configuración privada y el paquete de Rocket. Tampoco guarda las opciones de Yoast, Rocket, WebP Express, usuarios o menús almacenadas en base de datos. El `index.php` raíz está excluido; el del tema sí está guardado.

Para futuras iteraciones:

1. Un cambio concreto por commit en rama de trabajo, con documentación y archivos FTP identificados.
2. Conservar una copia del servidor de base de datos, uploads, configuración y assets completos con su manifiesto antes de cambiar datos o publicar una versión.
3. Para consultar la base sin alterar la rama de trabajo se puede crear otra rama desde `5b7fec6`. Para deshacer una iteración ya incorporada, usar un commit de reversión sobre esa iteración. No usar `reset --hard` como procedimiento habitual.
4. Al revertir React en el servidor, restaurar también los assets y el manifiesto correspondientes. Revertir PHP no revierte automáticamente opciones, migraciones, roles o registros de base de datos.

Estos commits son locales. No hace falta `git pull` para disponer de ellos en este checkout; Cloud y otros equipos no los recibirán hasta publicarlos en GitHub mediante el flujo acordado. No se ha consultado el estado actual de PR remotos.

## Lo que ya está bien resuelto

- WordPress conserva las URL y el estado HTTP; React compone las páginas. Secciones de Home, páginas y componentes compartidos ya tienen una separación útil.
- La identidad está centralizada en `tokens.css` y `fonts.css`; los medios fijos parten de la URL del sitio, sin fijar el dominio temporal en React.
- Los tres formularios conectados comparten procesamiento en `dipe-core`, validan en servidor, usan honeypot y limitan cinco envíos aceptados por IP en quince minutos. Guardan una solicitud privada antes del aviso por correo.
- Solicitudes está fuera de REST público. Su bandeja y acciones exigen permisos de administración; las acciones de gestión llevan nonce. Las contraseñas SMTP se cifran en servidor y no se entregan al frontend.
- El cliente limita los tipos de formulario y las redirecciones de gracias al mismo origen. Los destinatarios se deciden en WordPress.
- Yoast tiene relevo de metadatos, schema integrado y configuración del archivo de proyectos. Rocket tiene un perfil conservador y exclusiones de la aplicación. Ya existen carga diferida de medios y un hook común para loader/scroll de archivos.

No duplicaría estas soluciones con otros plugins ni convertiría todas las tarjetas en un componente genérico: blog y proyectos tienen diseños distintos.

## Refactorizaciones concretas

Prioridad de refactor: primero lógica sin cambios visuales; después organización de PHP; por último CSS y carga por página. El riesgo describe el cambio propuesto, no un fallo demostrado de la web.

| Propuesta | Evidencia en el código | Beneficio y precaución | Riesgo |
| --- | --- | --- | --- |
| Extraer la lógica de envío a un hook pequeño | `components/contact/ContactSection.jsx` y `pages/contact/ContactSections.jsx` repiten bloqueo de doble envío, estados, petición, reset y redirección | Mantener los dos formularios y sus campos/HTML/CSS; compartir solo el ciclo de envío. Facilita incorporar antispam de manera consistente | Bajo a medio |
| Separar transporte REST y normalización de contenido | `lib/api.js` reúne URL, fetch, paginación, envíos, títulos e imágenes | Extraer por responsabilidad manteniendo temporalmente sus exports para no cambiar todos los consumidores. Conservar `acf_format=standard` y los helpers de imagen existentes | Bajo a medio |
| Homogeneizar cancelación y errores de peticiones | Blog usa `AbortController` y versión de petición; proyectos usa una bandera `active` y su cliente no recibe `signal` | Añadir cancelación a proyectos sin reemplazar la lógica estable de blog. Proyectos conserva tarjetas durante carga, pero las vacía al fallar; cualquier cambio de ese comportamiento irá aparte | Medio |
| Completar la separación del CSS de cabecera | La base está en `styles/styles.css`; `components/layout/Header.css` añade reglas y overrides; `responsive.css` también ajusta el menú | Mover reglas sin alterar valores, especificidad, orden efectivo ni breakpoints. No eliminar reglas por tener el mismo selector | Medio |
| Llevar ajustes propios de Home a sus secciones | `styles.css` aún contiene responsive de servicios, proceso, hero y proyectos destacados; `Home.css` también contiene sus estilos | Migrar una sección por iteración. Conservar en `responsive.css` únicamente las reglas que realmente se decida compartir, manteniendo la cascada aprobada | Medio |
| Convertir el cargador PHP en un punto de entrada más claro | `dipe-core.php` aún reúne rutas de blog, migraciones, CPT, ACF y campos REST; `form-submissions.php` reúne registro, envío y bandeja; el tema agrupa menús, assets y social | Separar módulos pequeños preservando nombres de función, hooks, prioridades, constantes y orden de carga. No migrar a clases ni cambiar API por estética | Bajo a medio |
| Limitar HTML inyectado a contenido editorial | Home renderiza el título de proyecto con `dangerouslySetInnerHTML`; existe `plainText()` | Usar texto para ese título conservando entidades legibles. Mantener HTML donde es necesario en `EditorialContent`; `DOMParser` construye el índice, no sanea HTML | Bajo para títulos; medio para contenido |
| Estudiar carga de páginas bajo demanda | `App.jsx` importa estáticamente Home, archivos, contacto, legales y desarrollo; `main.jsx` importa Bootstrap completo | Cargar páginas secundarias con `lazy`/`Suspense` solo en una iteración específica. Mantener Home y shell iniciales; revisar cómo el tema sirve CSS/imports de Vite y cómo queda el responsive al cargar tarde | Medio a alto |
| Retirar restos pequeños de prototipo | `Failure` no tiene uso en `App.jsx`; `.sample-image` y `.detail-image` solo aparecen en su definición dentro de `frontend/src` | Quitar el componente sin uso; antes de quitar clases, confirmar que tampoco se usan en contenido editorial de WordPress. No retirar dependencias sin revisar sus usos | Bajo |

La longitud de un archivo no justifica por sí sola dividirlo. `App.jsx` ya cumple su función de composición/rutas. `Header.jsx` tiene lógica real de foco, móvil y animación: no sería el primer archivo para una extracción profunda. Conservar también `FitText`, títulos responsive, alturas igualadas y componentes de carga que ya resuelven necesidades reales.

## Formularios y antispam

### Refuerzo del límite actual

En `includes/form-submissions.php`, el contador se consulta después de validar, aumenta después de guardar y utiliza `get_transient()` seguido de `set_transient()`. Cada envío renueva el vencimiento de quince minutos. Es una defensa básica, no un contador atómico: peticiones simultáneas pueden superar el umbral. Tampoco limita igual el coste de intentos inválidos y no frena bots repartidos entre muchas IP.

Conviene añadir un límite temprano de intentos y tamaño de petición, conservar el límite de aceptados y revisar la concurrencia según el alojamiento. No dar por hecho que un transient es un cortafuegos. La clave usa `REMOTE_ADDR`: comprobar cómo entrega la IP el proxy del hosting. No confiar en `X-Forwarded-For` enviado por cualquiera; solo aceptar cabeceras de proxies conocidos. Evitar bloqueos generales por IP que perjudiquen a usuarios de una misma oficina.

### CAPTCHA adicional

No hay integración de CAPTCHA o Turnstile en los formularios revisados. La guía actual del proyecto plantea añadir protección adicional si el spam lo exige. Si se quiere reforzar antes de abrir más tráfico, propondría **Turnstile integrado en los formularios existentes**, manteniendo honeypot y límite, sin otro constructor de formularios.

La implementación debe validar el token en PHP mediante Siteverify antes de guardar o enviar correo, comprobar hostname/acción esperados, gestionar expiración, fallo y reintento, y mantener la clave secreta solo en servidor. Los tokens duran cinco minutos y son de un solo uso; mostrar el widget sin validación del backend no protege el endpoint. Revisar carga del script con Rocket y su tratamiento en privacidad/CookieYes. [Documentación oficial de Turnstile](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

La ruta pública con `permission_callback => __return_true` es necesaria para recibir contactos anónimos. No sustituirla por login ni presentar un nonce público como defensa antispam. Un fallo de CAPTCHA debe mantener los campos y ofrecer un reintento comprensible, sin aceptar silenciosamente el envío como si se hubiese guardado.

### Accesibilidad y recepción

El formulario principal relaciona errores de campo mediante `aria-describedby`; el formulario compartido marca `aria-invalid` y muestra el mensaje general, pero no explica cada error junto a su campo. Añadir mensajes asociados y foco al primer error en una iteración funcional independiente.

La solicitud se conserva si falla el correo, lo cual es correcto. Falta cerrar la operativa de avisos fallidos/parciales, destinatarios definitivos y entrega real en dominio y cuenta externa. Revisar SPF/DKIM/DMARC con el hosting y decidir el transporte de recuperación de contraseña: la configuración actual selecciona SMTP para los dos remitentes Dipe, no garantiza el de todos los correos nativos. Un eventual reintento manual debe evitar duplicar avisos ya enviados.

## Usuarios y permisos editoriales

No hay que dar Administrador a quien redacta entradas. Partir de roles nativos y de las capacidades de Yoast; crear un rol específico solo cuando sea necesario separar ámbitos. La configuración real de usuarios y permisos está en base de datos y debe revisarse en WordPress.

| Trabajo de la persona | Punto de partida | Límite que debe quedar claro |
| --- | --- | --- |
| Redactar para revisión | Colaborador | No publica y, por defecto, no sube medios; si necesita imágenes se decide una ampliación concreta |
| Publicar sus propias entradas | Autor | No gestiona entradas de otras personas ni configuración del sitio |
| Revisar y publicar contenido de varios redactores | Editor | Tiene permisos amplios sobre contenido; valorar un rol limitado al blog si no debe gestionar otras áreas |
| Editar SEO editorial | Capacidades o rol SEO Editor de Yoast | Dar acceso solo al contenido y controles que necesite; comprobar permisos efectivos de la versión instalada |
| Gestionar configuración SEO global | SEO Manager cuando proceda | No conceder administración completa para esta tarea |
| Mantener plugins, correo, copias y configuración | Administrador técnico | Cuentas nominales, pocas personas y segundo factor |

Los roles nativos y su alcance están documentados por [WordPress](https://wordpress.org/documentation/article/roles-and-capabilities/); los roles y capacidades SEO, por [Yoast](https://developer.yoast.com/customization/yoast-seo/filters/capability-roles-filter/).

**Particularidad del proyecto:** `dipe_proyecto` y `dipe_equipo` no declaran capacidades propias y utilizan las de entradas por defecto. Asignar Editor o Autor puede dar acceso a más contenido del esperado, según sus capacidades. Si el redactor debe gestionar solo blog, separar capacidades de Proyectos/Equipo antes de invitarlo. Ocultar menús no controla permisos. [Registro de CPT y capacidades](https://developer.wordpress.org/reference/functions/register_post_type/).

`Solicitudes`, `Correo Dipe` y `Proyectos > SEO del archivo` exigen actualmente `manage_options`. No relajar ese permiso global para que un SEO edite el archivo: añadir, si se necesita, una capacidad concreta solo para esa pantalla, comprobada tanto al mostrar como al guardar. Mantener solicitudes y credenciales fuera del acceso editorial.

## Seguridad y recuperación del alojamiento

Son tareas que requieren revisar configuración real; su ausencia en el repositorio no demuestra que falten en el servidor.

- **Copias y actualizaciones:** inventario de WordPress, PHP y plugins con versiones, procedencia y licencia; copias fuera del directorio público y recuperación comprobada en un entorno separado. La documentación histórica advierte de un paquete local de Rocket alterado; no acredita qué paquete está instalado hoy. Confirmar copia oficial mantenida, sin manipular el proveedor.
- **Acceso:** segundo factor para administración, límites de intentos y protección del login desde hosting o un mecanismo específico. Cuentas individuales, baja de accesos antiguos y recuperación de contraseña operativa. Revisar también Application Passwords y XML-RPC si existen integraciones; no desactivarlos a ciegas.
- **Archivos:** revisar HTTPS, permisos, protección de configuración/copias/logs y bloqueo de ejecución de PHP en uploads según el servidor. Valorar `DISALLOW_FILE_EDIT` en configuración privada. Evitar duplicar cortafuegos si el hosting ya cubre esa función. [Guía oficial de endurecimiento de WordPress](https://developer.wordpress.org/advanced-administration/security/hardening/).
- **SVG:** el tema permite subir SVG solo con `manage_options`, pero no incorpora un saneador SVG en el código revisado. Conservar esa restricción; usar únicamente SVG revisados o añadir saneamiento mantenido si se necesita admitir archivos de terceros. No ampliar el MIME a redactores por comodidad.
- **HTML editorial:** `EditorialContent` inserta HTML recibido de WordPress. Limitar quién puede publicar HTML sin filtrar y revisar los bloques/embeds permitidos; no sustituir todo el contenido por texto ni implantar un saneador casero que rompa entradas.
- **Cabeceras:** revisar las del servidor y añadir las adecuadas. Una CSP estricta necesita contemplar configuración inline, estilos dinámicos, WordPress, CookieYes y CAPTCHA; empezar por observación y ajustar antes de bloquear recursos. No activar HSTS sin revisar HTTPS y subdominios.
- **Caché y privacidad:** Rocket está configurado para caché pública permanente por decisión expresa. Una contraseña dentro del `index.php` no protege el HTML servido antes por caché. Si se necesita restringir un entorno de pruebas, protegerlo en servidor/proxy antes de la caché; no cambiar ahora la decisión vigente.

## Datos personales y cookies

El borrado manual y por lotes de solicitudes ya existe. Falta definir conservación de solicitudes activas, quién las gestiona y cómo se atienden exportación/supresión y copias de seguridad. No fijar un plazo arbitrario ni programar borrados hasta que la empresa lo confirme. Si se necesita delegar Solicitudes, crear una capacidad propia, sin conceder `manage_options`.

CookieYes sigue siendo el gestor elegido. Revisar su configuración efectiva, inventario de scripts, rechazo, retirada del consentimiento y enlace para reabrir preferencias. Incorporar al inventario cualquier agenda, analítica, vídeo externo o CAPTCHA que se añada; no instalar un segundo gestor.

El futuro formulario con CV necesita almacenamiento y descarga protegidos, tamaño/tipos admitidos, destinatarios y borrado definidos. Un adjunto en uploads con una URL difícil de adivinar no es privado. No habilitarlo como una ampliación automática de Contacto.

## SEO técnico y rendimiento

### Aspectos SEO que conviene cerrar

1. **Estado público y HTTP:** resolver la incidencia histórica de `/categoria/seo/` y el bloqueo comunicado por Google con evidencia de respuesta sin sesión. Que React muestre contenido no demuestra un HTTP 200 ni metadatos correctos. Mantener WordPress como autoridad de rutas/404.
2. **HTML inicial:** el tema imprime un contenedor React vacío; el contenido principal llega después con JavaScript. Yoast aporta el head, no el cuerpo. Esto añade dependencia de renderizado y REST, sin implicar que Google sea incapaz de indexar. Primero comprobar la versión renderizada; después valorar HTML inicial de contenido esencial si sigue habiendo un problema. SSR o prerender es un proyecto aparte, no una limpieza pequeña. [Google y SEO con JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
3. **Paginación:** blog y proyectos tienen botones que cambian estado sin URL propia. No permiten compartir o recargar una página concreta y no ofrecen enlaces de paginación rastreables. Definir rutas/estado desde WordPress, enlaces reales y navegación atrás/adelante antes de incorporarlos a React. Google generalmente descubre enlaces `a href`, no pulsa botones para pedir más resultados. [Paginación según Google](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading).
4. **Política de indexación:** el código aplica `noindex, follow` y omite canonical en búsqueda y paginación reconocidas por WordPress, por petición previa. Mantener esa decisión hasta revisar su objetivo: para una secuencia paginada indexable Google plantea URL propias y canonical propio. No cambiar esta política como efecto colateral del refactor.
5. **Robots y sitemap:** `robots.txt` conserva el sitemap del dominio temporal. Al migrar, actualizarlo y revisar el sitemap real de Yoast, redirecciones y host preferido. Los grupos específicos de bots no heredan automáticamente todas las restricciones de `*`; simplificar solo cuando se cierre la incidencia actual. No usar robots.txt como control de acceso.
6. **Contenido de prueba:** existe un mu-plugin que puede crear 80 copias publicadas. Antes de producción, identificar si se crearon, retirar solo las copias marcadas usando su herramienta y retirar la herramienta del servidor cuando deje de ser necesaria. Es un mu-plugin: no basta con desactivarlo en la lista normal. No se ha borrado nada en esta auditoría.
7. **Metadatos y schema:** revisar títulos/descripciones reales, imágenes sociales, datos de negocio, ALT, sitemaps y tipos internos excluidos. Mantener el grafo conectado de Yoast y las dos reseñas reales, sin inflar opiniones. [Integración de schema con Yoast](https://developer.yoast.com/features/schema/integration-guidelines/).

### Mejoras de rendimiento con beneficio probable

La referencia documental previa a confirmar la instalación actual de WebP Express registraba 67 móvil y LCP de 19 s. No es una medición de esta versión. El vídeo principal y los medios pesados merecen más atención que una reorganización estética de JSX.

- **WebP Express y React:** confirmar el modo de entrega. Cambiar HTML en PHP no alcanza por sí solo imágenes creadas después por React ni fondos CSS. La entrega por reglas del servidor puede cubrir peticiones a JPG/PNG aunque la URL no termine en `.webp`; verificar el tipo servido y su compatibilidad con caché/proxy. No renombrar todas las URL ni asumir que instalar el plugin transforma todo. La copia local no contiene el plugin ni sus ajustes. [Modos de WebP Express](https://wordpress.org/plugins/webp-express/).
- **Vídeos y GIF:** preparar versiones de menor peso y dimensiones adecuadas, con poster cuando proceda. `autoPlay` puede iniciar descarga aunque figure `preload="metadata"`. Los GIF animados y MP4 requieren tratamiento separado de la conversión de JPG/PNG. Conservar encuadre, animación y legibilidad; el usuario revisará el resultado.
- **Fuentes:** estudiar WOFF2 de los tres pesos actuales de Gordita solo con licencia web válida. Mantener tipografía, pesos y fallback; no convertir la licencia en una suposición.
- **Rocket:** conservar de entrada el perfil conservador: minificación adicional, retraso JS, CSS no usado y lazyload del proveedor están desactivados; la aplicación ya tiene build y carga diferida propia. Cambiar una opción por iteración, manteniendo exclusiones. [Funcionamiento de Delay JavaScript en Rocket](https://docs.wp-rocket.me/article/1349-delay-javascript-execution).
- **REST y CSS inicial:** tras confirmar medios, estudiar campos REST necesarios, tamaños de imagen y carga por página. No reducir respuestas sin conservar ACF, medios y categorías que usan las tarjetas. No retirar Bootstrap entero sin revisar sus usos.

## Plan de acción por entregas

No mezclar refactor, cambios visuales, permisos e indexación en un mismo lote. La revisión del usuario en servidor cierra cada entrega antes de pasar a otra que dependa de ella.

| Orden | Entrega | Archivos o configuración previstos | Criterio de cierre |
| --- | --- | --- | --- |
| 0 | Base recuperable, completada en fuentes | Commit `5b7fec6`; documentación de esta entrega | Conservar también copia del servidor antes del siguiente despliegue |
| 1 | Seguridad y permisos de operación | WordPress/hosting: copias, versiones oficiales, acceso, correo y matriz de usuarios | Saber quién accede a cada área y disponer de recuperación; sin conceder permisos por aproximación |
| 2 | Primer refactor pequeño | Nuevo hook de envío, `ContactSection.jsx` y `ContactSections.jsx` | Mismos campos, diseño, tres endpoints, errores, doble envío y gracias en servidor |
| 3 | Protección de formularios, separada del refactor | `form-submissions.php`, módulo antispam/configuración y frontend si se elige Turnstile | Límite coherente, CAPTCHA validado si se activa, reintento sin pérdida de campos, registro/correo conservados |
| 4 | Cliente REST y títulos como texto | `lib/api.js`, módulos extraídos y `FeaturedProjectsSection.jsx` | Contratos y tarjetas conservados; ninguna dependencia de datos inventados; cancelación de proyectos en commit separado |
| 5 | Organización PHP | `dipe-core.php`, `includes/` y, después, módulos del tema | Mismo orden de hooks, rutas, CPT, campos, opciones y metadatos; subir módulos antes del cargador |
| 6 | CSS por sección | Primero `styles.css`/`Header.css`; después una sección Home cada vez; `responsive.css` solo cuando corresponda | Aspecto y responsive aprobados por el usuario antes de retirar la siguiente capa |
| 7 | Medios y fuentes | Configuración WebP Express, assets de medios y `fonts.css` si procede | Evidencia del servidor sobre recursos servidos, peso y experiencia; sin atribuir mejoras solo por instalar un plugin |
| 8 | SEO de navegación y carga inicial | Archivos, rutas WordPress, `seo.php`, `App.jsx`, `functions.php`; dividir en entregas | HTTP/metadatos públicos coherentes; paginación compartible; cualquier carga bajo demanda con CSS correcto |

Las incidencias públicas de seguridad, recepción de contactos o indexación se atienden antes que una limpieza de código. Las entregas 2, 4, 5 y 6 pueden posponerse si no existe necesidad de mantenimiento; no son motivo para retrasar la corrección de una incidencia real.

## Entrega actual y siguiente paso

Archivos documentales de esta auditoría: este informe, `CONTEXTO-PROYECTO.md` y `PLAN_PARA_TERRA.md`. **No hay archivos para subir por FTP ni hace falta compilación por el informe.** Las fuentes actuales quedan guardadas en el primer commit, sin modificarlas durante la auditoría.

Siguiente paso recomendado: confirmar copias y distribución de responsabilidades en WordPress; como primer cambio de código, extraer únicamente el ciclo de envío de los formularios. La incorporación de CAPTCHA, permisos específicos y cualquier cambio SEO se realiza en iteraciones propias con las decisiones de configuración necesarias.
