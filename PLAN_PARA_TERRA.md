# Dipe Agency — continuación para GPT-5.6 Terra

Trabaja en esta carpeta. Objetivo: web corporativa con WordPress como CMS y React + Bootstrap como interfaz pública. El contenido se edita en `wp-admin` y aparece en la web al publicar, sin Elementor ni despliegue del front por cada entrada. El usuario instalará WordPress, creará la base de datos y subirá los archivos por FTP. Aún faltan los diseños, imágenes y textos definitivos.

## Punto de reanudación (17-10-2026)

**Continúa desde el estado actual; no reinicies el proyecto.** Git ya está configurado en `main` con remoto `origin`. Ya existen el esqueleto, `dipe-core`, el tema y una prueba vertical en código. Acabamos de actualizar a React/React DOM 19.3.1, Vite 8.3.4, `@vitejs/plugin-react` 6.1.2 y Bootstrap 5.3.8; se añadió `frontend/pnpm-lock.yaml`, desarrollo con pnpm y carga del bundle como módulo en WordPress. `pnpm install --frozen-lockfile` y `pnpm build` pasaron. **Estos últimos cambios siguen sin commit**: inspecciona `git status` y el diff, verifica lo necesario y crea un commit descriptivo antes de seguir. No repitas `git init` ni reviertas la actualización. Los assets de build quedan fuera de Git; recompila antes de cada subida FTP.

## Decisión técnica inicial

- Un solo WordPress en el dominio del sitio. Crear un **tema propio ligero** que cargue el bundle de React; WordPress conserva las URL, las respuestas 404 y los metadatos SEO. Las vistas y componentes visuales se implementan en React. Así basta un hosting PHP: Node se usa solo para compilar en local.
- Crear `dipe-core`, un plugin propio para CPT, taxonomías, campos, ajustes y endpoints. Los datos siguen disponibles aunque cambie el tema.
- Usar REST API de WordPress, misma procedencia, para contenido publicado. `posts` para el blog; añadir CPT **solo cuando el inventario de diseños/contenido lo justifique** (por ejemplo, proyectos o servicios). CPT y taxonomías con `show_in_rest`; metadatos con `register_post_meta`, tipos/esquemas, permisos y saneado. Para cada CPT con metadatos REST, incluir soporte `custom-fields`.
- Contenido editorial largo: editor de bloques nativo. Zonas de diseño fijo: campos estructurados con nombres claros, imagen de medios y validación. Ajustes globales del sitio para cabecera, pie, redes y CTA. Evitar valores de contenido incrustados en componentes.
- React + Vite + Bootstrap 5, rutas y plantillas por tipo de contenido. Compartir funciones de consumo REST, normalización de datos y estados de carga/error/404. No exponer credenciales en el navegador.
- El tema imprimirá título, descripción, canonical y Open Graph según la URL de WordPress. **Antes de declarar resuelto el SEO**, comprobar HTML inicial e indexación de páginas de contenido; el cuerpo renderizado solo por React puede requerir una estrategia adicional. No prometer SSR sin verificar que el hosting lo permita.

## Próximos pasos, en orden

1. **Cerrar la actualización actual.** Revisar el diff sin pisar trabajo existente; confirmar instalación desde lockfile y build; corregir cualquier incompatibilidad real y hacer commit. Usar versiones estables compatibles y conservar pnpm como gestor del proyecto.
2. **Terminar la prueba vertical.** Auditar el CPT temporal `dipe_item`, sus campos REST, listado/detalle React, enlaces, rutas, 404 y carga de assets del tema. Arreglar defectos encontrados y dejar instrucciones claras en `docs/prueba-vertical.md`. La prueba está implementada en código, pero **aún no está validada en un WordPress real**.
3. **Validar cuando haya WordPress.** Con la instalación preparada por el usuario, activar plugin y tema; publicar dos muestras y comprobar alta, edición y despublicación sin recompilar. Verificar URL directa/recarga, HTTP 404, API, HTTPS y caché Varnish. Documentar hallazgos; no declarar completada esta etapa antes de probarla.
4. **Inventario del sitio real.** Cuando lleguen diseños y contenidos, definir páginas, secciones, componentes, CPT, taxonomías, campos, medios y URL en `docs/modelo-contenido.md`. No inventar la maquetación definitiva mientras falten esos materiales.
5. **Construcción y entrega.** Implementar plantillas React y campos editables según el inventario; añadir blog y CPT necesarios, accesibilidad, adaptación móvil, metadatos y revisión SEO del HTML inicial. Recompilar y entregar las carpetas exactas de plugin y tema para FTP con guía de instalación y comprobaciones posteriores.

## Entregas por iteración

En cada iteración: cambio pequeño y funcional, archivos tocados, prueba realizada y siguiente paso. Primero entregar la **prueba vertical**; esperar diseños y contenido antes de maquetar páginas definitivas. No instalar ni tocar el servidor real: el usuario hará WordPress, BBDD y FTP. Si una decisión depende de la configuración real del hosting o de un diseño ausente, anotar el supuesto y avanzar con trabajo independiente.

## Datos conocidos del hosting

La captura indica DinaHosting Linux, PHP 8.2, MariaDB 10.11, Varnish y acceso FTP/SSH. Verificar versión real de WordPress, URL definitiva, HTTPS, límite de memoria, rutas y comportamiento de caché al disponer del acceso. Nunca guardar accesos en el repositorio.
