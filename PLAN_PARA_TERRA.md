# Dipe Agency — continuación para GPT-5.6 Terra

Trabaja en esta carpeta. Objetivo: web corporativa con WordPress para entradas y CPT, y React + Bootstrap como interfaz pública. **Home, Quiénes somos, Contacto y Trabaja con nosotros se maquetan por código: textos, imágenes fijas, menú y pie no se editan en WordPress. Sus metadatos SEO sí deberán poder actualizarse desde `wp-admin`.** Los posts y CPT se editan en `wp-admin` y aparecen al publicar, sin Elementor ni despliegue del front por cada entrada. WordPress y la base de datos ya están instalados; el usuario sube cambios por FTP. Faltan diseños, imágenes y textos definitivos.

## Punto de reanudación (17-10-2026)

**Continúa desde el estado actual; no reinicies el proyecto.** Git ya está configurado en `main` con remoto `origin`, y el usuario indica que está sincronizado. WordPress tiene activos `dipe-core` y el tema. React/React DOM 19.3.1, Vite 8.3.4, `@vitejs/plugin-react` 6.1.2, Bootstrap 5.3.8 y pnpm están configurados. Inspecciona `git status` antes de editar; no repitas `git init` ni reviertas las dependencias. Los assets de build quedan fuera de Git; recompila antes de cada subida FTP. Lee [la propuesta editorial](docs/arquitectura-editorial.md), que incorpora la separación entre páginas fijas en código y contenido editable.

## Decisión técnica inicial

- Un solo WordPress en el dominio del sitio. Crear un **tema propio ligero** que cargue el bundle de React; WordPress conserva las URL, las respuestas 404 y los metadatos SEO. Las vistas y componentes visuales se implementan en React. Así basta un hosting PHP: Node se usa solo para compilar en local.
- Mantener `dipe-core` como plugin propio para CPT, taxonomías, campos y endpoints. Los datos siguen disponibles aunque cambie el tema.
- Usar REST API de WordPress, misma procedencia, para contenido publicado. `posts` para el blog; añadir CPT **solo cuando el inventario de diseños/contenido lo justifique** (por ejemplo, proyectos o servicios). CPT y taxonomías con `show_in_rest`; metadatos con `register_post_meta`, tipos/esquemas, permisos y saneado. Para cada CPT con metadatos REST, incluir soporte `custom-fields`.
- Contenido editorial largo de posts/CPT: editor de bloques nativo; datos estructurados de CPT: ACF con nombres claros, medios y validación. Las páginas corporativas fijas, cabecera, pie y CTA se mantienen en React/código. Solo las tarjetas/listados de CPT insertadas en esas páginas cambian desde WordPress.
- React + Vite + Bootstrap 5, rutas y plantillas por tipo de contenido. Compartir funciones de consumo REST, normalización de datos y estados de carga/error/404. No exponer credenciales en el navegador.
- Crear páginas WordPress solo como anclas de URL/SEO para las rutas corporativas fijas, con el editor de contenido desactivado. React ignora su cuerpo. Antes de producción, elegir una sola fuente de metadatos editable desde WordPress (Yoast u otra), evitar duplicados y comprobar HTML inicial e indexación. No bloquear la maquetación actual por el SEO ni prometer SSR sin verificar el hosting.

## Próximos pasos, en orden

1. **Revisar el estado actual.** Comprobar `git status`, instalación desde lockfile y build; respetar cambios existentes. Conservar pnpm y versiones estables compatibles.
2. **Validar la prueba vertical en WordPress.** Auditar `dipe_item`, campos REST, listado/detalle, enlaces, rutas, HTTP 404 y carga del tema. Publicar/editar/despublicar dos muestras sin recompilar; verificar API, URL directa, HTTPS y Varnish. Documentar resultados en `docs/prueba-vertical.md`.
3. **Fijar el contrato real.** Con los diseños, definir por separado rutas/páginas fijas en código y posts/CPT editables; especificar servicios, empleados, proyectos y blog, sus archivos, campos ACF y relaciones en `docs/modelo-contenido.md`.
4. **Construcción y entrega.** Maquetar páginas fijas a mano en React/Bootstrap y plantillas de CPT/posts desde WordPress. Usar las páginas ancla solo para URL/SEO, sin contenido editable. Reservar integración con un proveedor SEO único para todas las URL y dejar la revisión del HTML inicial antes de producción. Recompilar y entregar plugin/tema para FTP.

## Entregas por iteración

En cada iteración: cambio pequeño y funcional, archivos tocados, prueba realizada y siguiente paso. Primero cerrar la prueba vertical; esperar diseños antes de maquetar páginas definitivas. El usuario hace las subidas por FTP. Si una decisión depende de la configuración real del hosting o de un diseño ausente, anotar el supuesto y avanzar con trabajo independiente.

## Datos conocidos del hosting

La captura indica DinaHosting Linux, PHP 8.2, MariaDB 10.11, Varnish y acceso FTP/SSH. Verificar versión real de WordPress, URL definitiva, HTTPS, límite de memoria, rutas y comportamiento de caché al disponer del acceso. Nunca guardar accesos en el repositorio.
