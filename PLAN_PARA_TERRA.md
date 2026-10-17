# Dipe Agency — encargo inicial para GPT-5.6 Terra

Trabaja en esta carpeta. Objetivo: web corporativa con WordPress como CMS y React + Bootstrap como interfaz pública. El contenido se edita en `wp-admin` y aparece en la web al publicar, sin Elementor ni despliegue del front por cada entrada. El usuario instalará WordPress, creará la base de datos y subirá los archivos por FTP. Aún faltan los diseños, imágenes y textos definitivos.

## Decisión técnica inicial

- Un solo WordPress en el dominio del sitio. Crear un **tema propio ligero** que cargue el bundle de React; WordPress conserva las URL, las respuestas 404 y los metadatos SEO. Las vistas y componentes visuales se implementan en React. Así basta un hosting PHP: Node se usa solo para compilar en local.
- Crear `dipe-core`, un plugin propio para CPT, taxonomías, campos, ajustes y endpoints. Los datos siguen disponibles aunque cambie el tema.
- Usar REST API de WordPress, misma procedencia, para contenido publicado. `posts` para el blog; añadir CPT **solo cuando el inventario de diseños/contenido lo justifique** (por ejemplo, proyectos o servicios). CPT y taxonomías con `show_in_rest`; metadatos con `register_post_meta`, tipos/esquemas, permisos y saneado. Para cada CPT con metadatos REST, incluir soporte `custom-fields`.
- Contenido editorial largo: editor de bloques nativo. Zonas de diseño fijo: campos estructurados con nombres claros, imagen de medios y validación. Ajustes globales del sitio para cabecera, pie, redes y CTA. Evitar valores de contenido incrustados en componentes.
- React + Vite + Bootstrap 5, rutas y plantillas por tipo de contenido. Compartir funciones de consumo REST, normalización de datos y estados de carga/error/404. No exponer credenciales en el navegador.
- El tema imprimirá título, descripción, canonical y Open Graph según la URL de WordPress. **Antes de declarar resuelto el SEO**, comprobar HTML inicial e indexación de páginas de contenido; el cuerpo renderizado solo por React puede requerir una estrategia adicional. No prometer SSR sin verificar que el hosting lo permita.

## Orden de trabajo

1. **Git antes de nada.** Comprobar Git y configurar nombre/correo para este repositorio si faltan; ejecutar `git init`, crear `.gitignore` y hacer un primer commit. Excluir `node_modules`, secretos, `.env`, `wp-config.php`, núcleo de WordPress, medios subidos y base de datos. Trabajar con commits pequeños. Un remoto privado es opcional y requiere que el usuario indique dónde alojarlo; FTP no sustituye a Git.
2. **Inventario y contrato.** Revisar archivos existentes; cuando lleguen diseños y contenidos, listar páginas, bloques reutilizables, CPT, taxonomías, campos y URL. Registrar decisiones en `docs/modelo-contenido.md`. Mientras falten diseños, no inventar secciones finales: usar una prueba pequeña y sustituible.
3. **Esqueleto.** Crear `frontend/`, `wp-content/plugins/dipe-core/`, `wp-content/themes/dipe-react/` y `docs/`. Añadir `README.md` con requisitos, comandos y despliegue FTP.
4. **Prueba vertical mínima.** Implementar en WordPress un CPT de ejemplo con título, extracto, imagen destacada y 1–2 campos; publicar dos elementos de prueba. Crear listado y detalle en React, además de una página 404. Confirmar que alta, edición y despublicación en `wp-admin` cambian el front sin recompilar.
5. **Integración del tema.** Compilar Vite hacia assets versionados del tema y cargarlos desde PHP usando el manifiesto de build. Mantener las URL gestionadas por WordPress; comprobar entrada directa, recarga, navegación interna, paginación y 404. No depender de una regla SPA que convierta errores reales en HTTP 200.
6. **Sitio real.** Implementar componentes a partir de los diseños entregados; convertir textos, imágenes, enlaces, orden de secciones y contenido repetible en campos de WordPress según el contrato. Añadir blog, archivos y detalles de CPT necesarios, diseño adaptable y accesibilidad básica.
7. **Validación y entrega.** Probar API, slugs, imágenes, estados vacíos, móvil, enlaces, SEO inicial y formularios si los hay. Verificar que Varnish no sirva datos obsoletos tras publicar (TTL o purga configurada en el hosting). Entregar carpeta exacta para FTP: plugin, tema y assets compilados; documentar instalación/activación, enlaces permanentes, HTTPS, copias de seguridad y comprobación posterior a subida.

## Entregas por iteración

En cada iteración: cambio pequeño y funcional, archivos tocados, prueba realizada y siguiente paso. Primero entregar la **prueba vertical**; esperar diseños y contenido antes de maquetar páginas definitivas. No instalar ni tocar el servidor real: el usuario hará WordPress, BBDD y FTP. Si una decisión depende de la configuración real del hosting o de un diseño ausente, anotar el supuesto y avanzar con trabajo independiente.

## Datos conocidos del hosting

La captura indica DinaHosting Linux, PHP 8.2, MariaDB 10.11, Varnish y acceso FTP/SSH. Verificar versión real de WordPress, URL definitiva, HTTPS, límite de memoria, rutas y comportamiento de caché al disponer del acceso. Nunca guardar accesos en el repositorio.
