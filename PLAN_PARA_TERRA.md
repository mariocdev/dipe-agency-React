# Dipe Agency: estado y siguiente paso

Este archivo es el punto de entrada breve. `AGENTS.md` contiene las reglas de trabajo; `CONTEXTO-PROYECTO.md` conserva el historial y los pendientes detallados. Lee solo el documento de `docs/` que corresponda a la tarea. El estado real de los archivos se obtiene con `git status --short`, no con esta nota.

## Estado conocido (18-10-2026)

- WordPress administra URL, menús, logos, entradas y proyectos; el tema React dibuja la web. Las páginas corporativas tienen contenido fijo en código.
- Contacto ya envía al endpoint de `dipe-core`, registra la solicitud privada y usa el correo configurado en WordPress. El usuario confirmó que un aviso llegó a Gmail, clasificado como spam; no está diagnosticada la entregabilidad general. Los demás formularios siguen sin definir. Detalles en `docs/formularios.md`.
- Home, reseñas, FAQ, animación de entrada y vistas de proyectos tienen cambios recientes. Su versión activa y su aspecto final solo se conocen tras la revisión del usuario en el servidor. Hay trabajo local en curso en la rama `codex/gsap-loader`; preservarlo.
- El blog está aplazado. `/categoria/seo/` mostró una discrepancia entre React y la respuesta de WordPress; consultar `docs/blog-rutas.md` únicamente al retomar esa tarea.

## Próxima acción

Atender solo la petición más reciente del usuario en una iteración pequeña. Tocar la zona implicada y consultar únicamente el contexto imprescindible. El usuario hace builds y subidas FTP; al entregar, indicar solo los archivos necesarios, sin repetir el comando de compilación. Esperar su revisión del servidor. Antes de producción siguen pendientes SEO/indexación, licencias de fuentes, políticas de solicitudes y entregabilidad del correo; consultar las secciones pertinentes de `CONTEXTO-PROYECTO.md` cuando se trabajen esos temas.

