# Dipe Agency — propuesta editorial y de plugins

Estado: propuesta para definir con los diseños. WordPress, `dipe-core` y el tema React ya están instalados en el entorno de pruebas. **El contenido editable en WordPress son entradas y CPT; los metadatos SEO de todas las URL también se editarán allí.** Las páginas corporativas, su texto, imágenes fijas, menú y pie se mantienen en código React/tema y se versionan en Git. El SEO se deja preparado, sin convertirlo ahora en la prioridad de maquetación.

## Plugins

| Necesidad | Decisión propuesta | Instalación |
| --- | --- | --- |
| SEO | Pendiente de elegir proveedor. Yoast SEO gratuito es una opción; Premium solo si sus funciones hacen falta. El requisito es una única fuente de metadatos editable en WordPress para páginas fijas, entradas, CPT y archivos. | No hace falta instalarlo para empezar la maquetación. Si se elige Yoast, el propietario puede instalarlo desde WP y Premium con su ZIP/cuenta; no guardar licencia en Git. |
| Campos | ACF PRO exclusivamente para datos estructurados de entradas/CPT. Incluye lo necesario de ACF gratuito; no mantener ambos activos. Activar “Show in REST API” en los grupos usados por React. | El propietario instala el ZIP y activa su licencia. El equipo guarda el esquema de campos como JSON/PHP en `dipe-core`. |
| Formularios | Gravity Forms como candidato para contacto, solicitud de presupuesto y candidaturas con CV. Permite validación, notificaciones y entradas en el admin. | Elegir licencia después de definir formularios. React enviará a un endpoint propio de `dipe-core` que invoque la API PHP del plugin; no poner credenciales REST en el navegador. |
| Entrega de correo | Un único plugin SMTP, por ejemplo FluentSMTP o WP Mail SMTP, si las pruebas de envío lo requieren. | Configurar con credenciales fuera de Git y probar recepción real. |
| Consentimiento | Preferencia: Complianz, independiente de Elementor. Elementor Cookie Consent es otra opción independiente de Elementor Pro, pero requiere probar su bloqueo de scripts en nuestro front React. | Instalar un solo CMP cuando exista inventario de cookies y servicios externos. No instalar Elementor como maquetador ni usar un simple popup como sustituto del consentimiento. |

No instalar todavía plugins de CPT, redirecciones, caché o copias de seguridad que dupliquen lo que ya hacen `dipe-core`, el futuro proveedor SEO o el hosting. Mantener inventario de versiones y licencias en documentación privada, sin claves.

## Estructura de contenido y rutas

| URL pública propuesta | Origen | Edición y plantilla |
| --- | --- | --- |
| `/` | Página WordPress solo como ancla de URL/SEO | Home completa en React/Bootstrap. Textos, imágenes fijas, hero y CTA en código. Puede mostrar listados automáticos de CPT publicados/destacados. |
| `/quienes-somos/` | Página WordPress solo como ancla de URL/SEO | Diseño y textos en React/Bootstrap; puede mostrar empleados publicados desde el CPT. |
| `/servicios/` y `/servicios/{slug}/` | CPT `dipe_servicio` | Archivo y detalle. Título, resumen, imagen, contenido, beneficios, FAQ y CTA. |
| `/equipo/` y `/equipo/{slug}/` | CPT `dipe_empleado` | Archivo y perfil. Nombre, puesto, foto, biografía, orden y enlaces profesionales. Valorar si cada perfil necesita URL indexable. |
| `/proyectos/` y `/proyectos/{slug}/` | CPT `dipe_proyecto` | Archivo y caso de estudio. Cliente, reto, solución, resultados, galería y relación con servicios. Campo `destacado` para Home: no crear un CPT separado “Proyectos destacados”. |
| `/contacto/` | Página WordPress solo como ancla de URL/SEO | Diseño, textos y datos de contacto en código React; backend del formulario en WordPress. |
| `/trabaja-con-nosotros/` | Página WordPress solo como ancla de URL/SEO | Diseño y textos en código React; backend de candidatura en WordPress. Crear CPT `dipe_oferta` solo cuando haya vacantes publicables. |
| `/blog/` y entrada | `post` nativo | Categorías, extracto, imagen destacada, contenido Gutenberg y plantilla React de archivo/detalle. |

Crear una página WordPress para cada ruta corporativa fija **solo como ancla de permalink y SEO**; deshabilitar su editor de contenido y no leer su cuerpo desde React. Así el diseño/texto sigue exclusivamente en código y la ficha SEO puede actualizarse desde `wp-admin` con el proveedor que elijamos. Las taxonomías personalizadas se añaden cuando haya una necesidad real de filtros. Las relaciones ACF usarán IDs de entradas, no títulos copiados. Menú, pie y textos introductorios de los archivos se mantienen en código. El contenido de las tarjetas y detalles proviene de posts/CPT.

## Reglas de ACF y maquetación

- ACF para datos estructurados de cada servicio, empleado y proyecto; Gutenberg para texto largo del blog y biografías/casos si encaja. Evitar Flexible Content como maquetador genérico.
- Definir grupos de contenido únicamente para servicio, empleado, proyecto y, si hace falta, entrada u oferta. No crear grupos ACF de contenido para Home, Quiénes somos, Contacto, Trabaja con nosotros, menú, pie ni ajustes globales. El proveedor SEO podrá añadir sus propios campos a las páginas ancla. Campos de imagen de CPT como ID/objeto consistente y enlaces como URL + texto + destino.
- Versionar grupos ACF con Local JSON o PHP dentro de `dipe-core`. Si se modifica un grupo en el WordPress remoto, exportarlo y llevarlo de vuelta a Git antes del siguiente despliegue; los contenidos permanecen en la base de datos.
- Los CPT se registran en `dipe-core` con `show_in_rest`; los grupos ACF consumidos por React tienen `Show in REST API` activo. Probar el JSON público de cada tipo sin sesión.

## SEO y consentimiento: tareas previas a producción

1. **Entorno de pruebas:** `dipe-core` fuerza `noindex`, `nofollow`, `X-Robots-Tag` y `Disallow: /`. Mantenerlo en pruebas; antes del lanzamiento, sustituir el bloqueo fijo por una configuración de entorno y verificar el HTML/robots/sitemap reales. Activar Yoast ahora no anula ese bloqueo.
2. **Una sola fuente de metadatos:** elegir antes de producción un proveedor único (Yoast u otro) para título SEO, descripción, canonical y Open Graph de páginas ancla, entradas y CPT; configurar también archivos. Retirar o condicionar los metadatos actuales del tema para que no se dupliquen. Los campos SEO son la única excepción editable de las páginas fijas.
3. **HTML inicial:** hoy el cuerpo del tema monta React en un `div` vacío. Un plugin SEO no convierte automáticamente el contenido React en HTML inicial. Antes de producción, validar una ruta fija, un detalle y un archivo de CPT con HTML descargado, rastreo e indexación. Si se exige contenido completo en la primera respuesta, diseñar una capa HTML semántica en WordPress o una solución SSR viable para el hosting. No bloquear la maquetación actual por esta decisión.
4. **Cookies:** inventariar Analytics, mapas, vídeos, píxeles, captcha y scripts externos. Bloquear los no esenciales antes del consentimiento; mostrar aceptar y rechazar al mismo nivel y permitir cambiar la elección. Probar el CMP también tras navegación React.
5. **Formularios:** diseño, etiquetas y mensajes visibles en React/código; WordPress gestiona validación, entradas y notificaciones. Acordar campos, destinatarios, privacidad y conservación de CV antes de implementarlos. Validación y adjuntos en servidor, antispam, límite de tamaño/tipo y prueba de entrega de correo.

## Siguiente iteración

Entregar diseños de Home, un archivo y un detalle para fijar componentes. Implementar primero **Home en código** y **un servicio completo** (admin → ACF/REST → React), dejando la página ancla y el punto de integración SEO previstos. Revisar ambos patrones y reutilizarlos para el resto.

## Referencias

- [Yoast: CPT y sitemaps](https://yoast.com/help/does-yoast-seo-work-with-custom-post-types/) · [sitemaps](https://yoast.com/help/how-to-customize-the-sitemap-index/)
- [ACF PRO](https://www.advancedcustomfields.com/resources/upgrade-guide-acf-pro/) · [REST](https://www.advancedcustomfields.com/resources/wp-rest-api-integration/) · [Local JSON](https://www.advancedcustomfields.com/resources/local-json/)
- [Gravity Forms: GFAPI::submit_form](https://docs.gravityforms.com/submitting-forms-with-the-gfapi/)
- [Elementor Cookie Consent](https://elementor.com/help/get-started-with-elementor-cookie-consent/) · [Complianz](https://wordpress.org/plugins/complianz-gdpr/) · [AEPD: guía de cookies](https://www.aepd.es/guias/guia-cookies.pdf)
