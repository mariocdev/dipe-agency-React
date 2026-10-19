# Revisión para hacer público el repositorio

Fecha: 19-10-2026. Fuentes revisadas desde `c904c3f`, rama local `codex/auditoria-refactor-2026-10-19`, antes de esta entrega documental.

## Resultado y alcance

**No se han encontrado contraseñas, claves privadas ni tokens incrustados en los textos examinados.** Sí hay identificadores del servidor de pruebas y correos personales que conviene decidir conscientemente si se publican.

El objetivo confirmado es publicar React, tema y plugin propio, sin distribuir una instalación completa con medios y contenido originales. Ese reparto ya existe: clonar el repositorio y subir el frontend no entrega los uploads, entradas ni proyectos. No se busca impedir que se copie el diseño o código.

Se examinó el estado actual y el historial accesible desde todas las referencias Git presentes localmente: **49 commits, 588 blobs únicos, de los que 576 eran texto**. Se buscaron patrones de tokens, claves privadas, credenciales en URL, asignaciones de contraseñas y nombres de archivos sensibles. Los candidatos encontrados en versiones de `mail-settings.php` eran referencias al algoritmo de cifrado y controles HTML de contraseña, sin credenciales literales.

Es una inspección estática solicitada para esta publicación, sin garantía de detectar cualquier secreto posible. No se inspeccionaron visualmente capturas ni otros binarios, ni archivos ignorados del equipo. No se consultaron referencias exclusivas del remoto, PR, issues, acciones, logs, artefactos de GitHub o configuración del hosting. No se ejecutaron pruebas funcionales, builds ni subidas.

## Qué no se distribuye

| Elemento | Resultado en las fuentes e historial local revisados |
| --- | --- |
| `wp-config.php`, claves de WordPress y credenciales de base de datos | Sin archivos encontrados en Git; configuración excluida |
| `.env` con datos reales | Solo aparece `frontend/.env.example`, con URL local de ejemplo |
| Contraseñas SMTP | Valores iniciales vacíos; se configuran en la base de datos de WordPress |
| Clave del cifrado SMTP | Se deriva de `wp_salt('auth')`; el código no contiene las claves reales del servidor |
| Tokens reconocibles y claves privadas | Sin coincidencias confirmadas en el texto revisado |
| Dumps SQL / SQLite y biblioteca `uploads` | No aparecen como archivos en el historial local examinado |
| Assets compilados del tema y paquetes de plugins de terceros | No aparecen como archivos en el historial local examinado |

Las exclusiones de `.gitignore` ayudan con futuras incorporaciones; no eliminan archivos previamente versionados ni secretos del historial.

## Referencias que sí serán visibles

| Referencia | Dónde aparece | Alcance |
| --- | --- | --- |
| Host SMTP y dos usuarios de correo de pruebas | Valores iniciales de `wp-content/plugins/dipe-core/includes/mail-settings.php`; documentación de formularios y arquitectura | Identificadores reales, sin contraseña. Los ajustes guardados en WordPress pueden sustituirlos |
| Correos de personas usados como ejemplo de destinatarios | `docs/formularios.md` y referencias de continuidad | Se pueden sustituir por ejemplos si no se desean públicos |
| Dominio de pruebas y rutas de medios | `robots.txt`, documentación y su historial | No son claves; revelan el entorno. El sitemap debe actualizarse al lanzar |
| Email personal del autor | Metadatos de commits | Se publica con el historial aunque no aparezca en un archivo actual |
| Datos corporativos públicos | Footer, contacto, legales y documentación | Contenido de la web; no equivale a credenciales |

Este informe evita volver a copiar direcciones personales o valores del servidor. No se han anonimizado fuentes ni reescrito commits en esta entrega.

## Qué obtiene quien copie el proyecto

Obtiene diseño y textos corporativos en código, componentes, CSS, rutas, lógica, nombres de medios, iconos, fuentes y capturas conservadas en Git. También el esquema de ACF y el código que consulta entradas y proyectos.

**No obtiene los archivos de `uploads`, registros de entradas y proyectos, sus valores ACF, menús guardados, usuarios, ajustes privados, solicitudes ni licencias de terceros.** Necesita instalar y configurar WordPress, aportar medios y crear o importar contenido propio. La utilidad de paginación solo duplica contenido que ya exista en ese WordPress; no lleva el contenido original dentro.

Las capturas de documentación y la imagen del tema no son la biblioteca de medios. Los archivos OTF y SVG sí se distribuyen en las fuentes. La web pública permite descargar recursos accesibles al visitante; el objetivo es compartir fuentes sin entregar el sitio completo, no establecer una protección anticopia.

## Decisiones antes de cambiar la visibilidad

1. Decidir si se aceptan públicos los correos personales, usuarios SMTP y dominio de pruebas identificados. No se ha encontrado una contraseña que obligue a rotar credenciales por esta revisión.
2. Si se quieren retirar referencias personales, sustituirlas en los archivos correspondientes. Eso no las elimina de commits anteriores; una limpieza histórica requiere trabajo aparte y coordinación de ramas y clones.
3. Confirmar licencia del código propio y permiso para redistribuir Gordita. No se ha encontrado un archivo de licencia en el repositorio. Los paquetes comerciales siguen fuera de Git; no añadir sus ZIP o claves de activación.
4. Revisar la superficie de GitHub no incluida aquí: PR, issues, acciones, logs y adjuntos, según la información que tenga allí el proyecto.

Si posteriormente aparece una credencial real, primero revocarla o rotarla y después tratar su retirada. Borrar el archivo actual no basta. [Procedimiento oficial de GitHub para datos sensibles](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

No se ha cambiado la visibilidad de GitHub, saneado historial ni modificado código ejecutable o exclusiones. Esta entrega no requiere FTP.
