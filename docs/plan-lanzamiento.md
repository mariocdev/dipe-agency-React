# Paso del servidor de pruebas a producción

Plan del 19-10-2026. **No ejecutado.** Cada fase necesita revisión del propietario en servidor; este documento no acredita publicación o validación de la web.

## 1. Cerrar el alcance y reservar el corte

El resultado buscado es una versión identificada del código en el dominio definitivo, con sus medios, contenido y configuración, y con posibilidad de volver atrás. El repositorio público seguirá sin incluir datos, uploads o configuración privada.

| Decisión / pendiente | Resultado necesario |
| --- | --- |
| Dominio y alojamiento | Host preferido con/sin `www`, HTTPS y base de datos definidos; no asumir cambio de DNS si se conserva el alojamiento |
| Web real anterior, si existe | Inventario privado de URL, contenido que conservar y redirecciones a destinos equivalentes |
| Versión | Commit o etiqueta acordados, assets de esa versión e inventario privado de WordPress y plugins |
| Contenido | Páginas, menús, entradas, proyectos, equipo y medios definitivos; enlaces sin destino resueltos o retirados del lanzamiento |
| Categorías y robots | Cerrar la incidencia HTTP/metadatos de `/categoria/seo/` y la lectura pública de robots pendientes en continuidad |
| Correo | Buzones definitivos, destinatarios por formulario, recuperación de contraseña y recepción real comprobadas |
| Privacidad | Conservación/borrado de solicitudes, textos y CookieYes revisados; CV fuera de alcance hasta tener protección definida |
| Recursos y plugins | Licencia web de fuentes y paquetes oficiales mantenidos; revisar la advertencia histórica sobre Rocket sin asumir que describe el paquete instalado hoy |
| Rendimiento | Evaluación actual de varias plantillas y decisión sobre medios pesados y pendientes aceptables |

No anunciar como operativos los formularios de candidaturas o CV aún pendientes. Definir quién autoriza el corte, quién restaura y qué ventana de interrupción se acepta.

## 2. Preparar copias privadas y recuperación

Conservar una copia recuperable de pruebas y otra de la producción anterior, si existe: base de datos, uploads, tema y assets, plugin propio, plugins externos y configuración necesaria del servidor. Guardar claves y credenciales por un canal privado, fuera de Git y del directorio público.

Identificar cada copia con fecha, origen y versión. Preparar acceso para restaurar archivos y datos sin depender del WordPress migrado. El propietario debe verificar una restauración en un entorno separado antes del corte.

## 3. Preparar el destino restringido

1. Preparar alojamiento con HTTPS, base de datos y usuario propios; mantenerlo aislado de pruebas.
2. Habilitar una revisión previa del dominio final mediante la opción disponible en el hosting o resolución controlada, sin mover todavía el tráfico público si falta validar el destino.
3. Restringir el acceso en servidor/proxy, **antes de la caché**. La contraseña de un `index.php` no protege por sí sola HTML servido por Rocket; `robots.txt` tampoco es control de acceso.
4. Instalar WordPress y los plugins oficiales necesarios. Llevar las carpetas propias y los recursos de la versión acordada.
5. Usar SFTP o FTPS si el hosting lo ofrece para el flujo de subida acordado. No guardar perfiles de conexión con contraseñas en Git.

No copiar indiscriminadamente reglas, cachés o el `index.php` personalizado de pruebas sobre el destino. Conservar las reglas que necesite el alojamiento real.

## 4. Migrar medios y datos

Para trasladar esta misma web hay que llevar de forma privada **los uploads y datos necesarios para conservar entradas, proyectos, ACF, páginas, menús y opciones**, además de las fuentes. El repositorio no los sustituye.

- Una copia completa de la base de datos de pruebas traslada también usuarios y opciones: revisar cuentas, solicitudes, correos, licencias e integraciones antes de abrir el destino.
- Si ya hay producción con contenido o solicitudes que conservar, acordar migración selectiva; no sobrescribir su base de datos con la de pruebas.
- Sustituir URL mediante una herramienta compatible con datos serializados de WordPress, con copia y previsualización cuando esté disponible. Evitar reemplazos SQL indiscriminados; no modificar GUID masivamente por defecto.
- Ajustar `home`/`siteurl`, rutas y enlaces incrustados cuando corresponda. Los helpers React toman la URL del sitio, pero no corrigen valores antiguos guardados dentro del contenido.
- Usar configuración privada del destino. Si cambian las claves de WordPress, volver a introducir contraseñas SMTP: el cifrado propio depende de ellas.
- Regenerar reglas, configuración y caché del destino; no trasladar caché generada como contenido.
- Inventariar y retirar del destino copias de prueba con la herramienta prevista, copia previa y revisión del propietario. No desplegar el mu-plugin de fixtures en producción por defecto.

[La guía de migración de WordPress](https://developer.wordpress.org/advanced-administration/upgrade/migrating/) explica los cambios de ubicación y URL, incluidos los valores serializados.

## 5. Revisar en el servidor de destino

Estas comprobaciones corresponden al propietario en el servidor; no son comprobaciones locales que deba ejecutar el agente automáticamente.

| Área | Evidencia de aceptación |
| --- | --- |
| Plantillas | Home, Agencia, servicios e hijas, Contacto, proyectos/archivo/ficha, blog/entrada/categoría, legales, gracias y 404 revisados |
| Recursos | Manifiesto y assets presentes, fuentes autorizadas y medios sin enlaces a pruebas o contenido mixto |
| HTTP | Carga directa y recarga de rutas internas; 404 reales; redirecciones sin bucles; categorías y archivos correctos |
| Formularios | Envío controlado por tipo; errores, consentimiento, registro privado, destinatarios y gracias correctos; llegada al buzón |
| Privacidad | Solicitudes inaccesibles públicamente, permisos revisados y consentimiento de servicios externos comprobado |
| SEO | Títulos, descripciones, canonical, robots, sitemap, sociales y schema coherentes con el dominio definitivo |
| Caché | Visita pública sin sesión con contenido vigente, REST y formularios funcionando y datos privados sin cachear |

Guardar resultados en el registro privado del lanzamiento, sin introducir datos personales de envíos o credenciales en Git.

## 6. Medir varias URL y guardar evidencias

El propietario aportará PageSpeed de varias URL y, si lo utiliza, Rich Results Test u otra herramienta de datos estructurados. Muestra sugerida: Home, un servicio, archivo y ficha de proyecto, blog y entrada; añadir una categoría para documentar el cierre de su incidencia.

Registrar URL, fecha, móvil/escritorio y entorno. Separar puntuaciones de Lighthouse de datos de usuarios reales de CrUX, indicando si son de URL, de origen o no están disponibles. El rendimiento de pruebas no acredita el del dominio final. [Qué mide PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about).

Guardar LCP, CLS y TBT de laboratorio si están disponibles; LCP, CLS e INP de campo si se ofrecen. TBT no es INP. No confundir puntuación SEO con posicionamiento. Para comparar cambios, conservar condiciones comparables e identificar todas las ejecuciones consideradas.

Para datos estructurados, registrar herramienta, tipos detectados, errores, advertencias y alcance. Un resultado válido no garantiza que Google muestre un resultado enriquecido. [Datos estructurados y búsqueda](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data).

## 7. Ejecutar el corte autorizado

1. Acordar una pausa de edición y tratamiento de nuevos envíos. Hacer copia final y trasladar datos/medios modificados desde el ensayo.
2. Si cambian DNS, modificar solo registros necesarios y conservar la zona previa. No cambiar MX ni correo por mover la web. Coordinar TTL y tiempos con el proveedor.
3. Activar el host definitivo y redirecciones permanentes previstas conservando destinos equivalentes, sin enviar todas las URL antiguas a Home.
4. Revisar HTTPS y host preferido. Actualizar el sitemap del `robots.txt` estático, que aún referencia pruebas, o acordar servir el generado; evitar instrucciones competidoras.
5. Retirar en producción las restricciones de acceso y bloqueos globales de indexación que correspondan. Revisar Ajustes > Lectura y Yoast conservando exclusiones intencionadas. El plugin ya no mantiene el antiguo bloqueo global de pruebas.
6. Regenerar enlaces permanentes cuando corresponda y purgar hosting/Rocket/CDN si existe; regenerar caché para el dominio real.
7. Mantener pruebas restringido y evitar envíos accidentales a destinatarios reales. Revisar su indexación de forma independiente.
8. Revisar públicamente y sin sesión páginas, HTTP, robots, sitemap, medios, formularios y correo. Registrar como publicado solo tras confirmación del propietario.

Este plan no autoriza al agente a ejecutar FTP, cambios DNS o modificaciones de producción. Esas operaciones requieren autorización expresa.

## 8. Seguimiento y vuelta atrás

Durante la ventana acordada, revisar errores, contactos, correo, recursos y redirecciones. Después revisar Search Console y mediciones del dominio real. Enviar sitemap o superar Rich Results Test no confirma indexación.

Ante errores bloqueantes, restaurar archivos/configuración de la versión anterior y su base de datos compatible cuando proceda. Si se cambió alojamiento, valorar también revertir enrutado/DNS teniendo en cuenta cachés y propagación.

**Antes de restaurar una base de datos anterior, preservar solicitudes y ediciones nuevas desde el corte.** Congelar escrituras cuando corresponda y reconciliar esos datos para no perder contactos. Registrar causa, elementos restaurados y pendientes.

## Paquete y registro

| Canal | Contenido |
| --- | --- |
| Repositorio público | Fuentes React, `dipe-core`, tema y documentación; sin uploads ni datos |
| Subida de código | `wp-content/plugins/dipe-core/` completo y `wp-content/themes/dipe-react/` completo con `assets/` y `.vite/manifest.json` |
| Migración privada | Datos acordados, uploads, configuración del destino y acceso a paquetes oficiales/licencias |
| Excluir de producción por defecto | Fixtures, dumps, copias públicas, perfiles FTP, contraseñas y caché copiada de pruebas |
| Registro privado | Fecha, dominio, commit, assets correspondientes, inventario de plugins, revisión, copias y responsable de reversión |

Próximo paso: cerrar fase 1 y preparar el ensayo en destino. No hay fecha fijada ni publicación ejecutada por esta documentación.
