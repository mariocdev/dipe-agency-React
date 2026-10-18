# Dipe Agency: estado y siguiente paso

Este archivo es el punto de entrada breve. `AGENTS.md` contiene las reglas de trabajo; `CONTEXTO-PROYECTO.md` conserva el historial y los pendientes detallados. Lee solo el documento de `docs/` que corresponda a la tarea. El estado real de los archivos se obtiene con `git status --short`, no con esta nota.

## Estado conocido (18-10-2026)

**Base aprobada:** el usuario confirma expresamente que el estado actual de los archivos locales es «PERFECTO» y autoriza incorporar todo a `main`. Esta aprobación prevalece sobre los pendientes de revisión visual de iteraciones anteriores. No confirma un commit exacto publicado por FTP ni resuelve incidencias técnicas/editoriales sin evidencia específica.

- WordPress administra URL, menús, logos, entradas y proyectos; el tema React dibuja la web. Las páginas corporativas tienen contenido fijo en código.
- **Consolidado en `main` y publicado en GitHub:** checkpoint de fuentes aprobadas `dcb13d1511ad2120a74e437f5d8ca19959e8c57c` (`feat: consolidate approved agency, services and blog implementation`), con 63 archivos del lote local. Integración por avance directo desde `codex/desarrollo-web`, sin conflictos ni cambios al código aprobado; incluye también sus 13 commits anteriores. El checkout local queda en `main`, sincronizado con el remoto; no necesita pull. Un commit documental posterior cierra estas notas. No hay PR abiertos ni se han eliminado ramas. Assets compilados, uploads y configuración privada mantienen las exclusiones existentes.
- Páginas maquetadas: Desarrollo web, sus tres hijas (WordPress, PrestaShop y Aplicaciones web bajo el slug Salamanca) y Agencia / Quiénes somos. Medios aportados ya conectados. Para maquetar otra página, leer primero **`docs/guia-visual.md`**, que reúne rutas, componentes reutilizables y ajustes vigentes. El PDF y la URL final los aporta el usuario para cada nueva página.
- Agencia tiene CPT Equipo DIPE sin URL individual y carrusel ordenable desde el admin; detalles en `docs/equipo.md`. El usuario da por buenas las alturas igualadas y el carrusel, incluida la última recolocación suave. Esto no equivale a validar toda la web o confirmar un commit publicado.
- Contacto internas y Contacto Servicios están implementados, con configuración de destinatarios independiente. Agencia usa internas; las páginas de desarrollo usan Servicios. Otros tipos siguen pendientes de definir. El usuario confirmó un aviso en Gmail clasificado como spam; la entregabilidad general sigue pendiente. Detalles en `docs/formularios.md`.
- Blog y entrada forman parte de la base aprobada: grid de 30 px, paneles de filtros bajo la barra, actualización sin salto de carga, búsqueda nativa y servicios relacionados compartidos con proyectos. La ficha de proyecto conserva su centrado vertical original y solo cambia el origen/enlace del servicio. Detalles en `docs/entradas.md`, `docs/blog-rutas.md` y `docs/proyectos.md`. Siguen pendientes el recurso definitivo del fondo del hero del archivo y la incidencia previa HTTP/metadatos de `/categoria/seo/`, sin resolución confirmada.

## Próxima acción

- Consolidación completada: las futuras tareas parten de `main` y del checkpoint aprobado anterior, sin reabrir ajustes ya aprobados ni modificar estilos al cambiar solo lógica. No hace falta compilar ni subir FTP por la actualización documental/Git.
- Entrada interna `/blog/{slug}/` aprobada como parte del estado local: dos ACF (banner imagen/vídeo y subtítulo), cuerpo HTML/índice, sidebar, búsqueda nativa y navegación anterior/siguiente. Plugin 0.4.11; configuración y archivos de despliegue en `docs/entradas.md`.

Continuar con la página que indique el usuario, usando su PDF/Figma y los patrones existentes; no exigir otra revisión de Agencia para empezar. Mantener iteraciones pequeñas y consultar solo los archivos implicados. No ejecutar servidor, navegador, capturas, tests, lint, comprobaciones de API, `git diff --check` ni builds. El usuario compila, sube por FTP y revisa en servidor; entregar archivos exactos, sin repetir el comando de compilación. Los cambios documentales no requieren FTP. Antes de producción siguen pendientes SEO/indexación, licencias de fuentes, políticas de solicitudes y entregabilidad; no ampliar una tarea de maquetación a esos asuntos.

