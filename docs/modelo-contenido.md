# Modelo de contenido inicial

Este contrato es intencionadamente pequeño y sustituible: todavía no se han entregado diseños, imágenes ni textos finales.

## Páginas y rutas de la prueba vertical

| URL | Origen | Vista React |
| --- | --- | --- |
| `/` | Página inicial de WordPress | Presentación técnica mínima |
| `/muestras/` | Archivo del CPT `Muestras` | Listado REST |
| `/muestras/{slug}/` | Elemento individual del CPT | Detalle REST |
| URL inexistente | Plantilla 404 de WordPress | Estado 404 React |

WordPress conserva la decisión HTTP, enlaces permanentes y plantillas. React sólo decide la presentación dentro de la página que ya ha resuelto WordPress.

## CPT temporal: `dipe_item`

| Elemento | Decisión |
| --- | --- |
| Etiqueta editorial | Muestras |
| Archivo público | Sí, en `/muestras/` |
| REST | Sí, en `/wp-json/wp/v2/dipe-items` |
| Soportes | título, extracto, imagen destacada, campos personalizados |
| Metadatos | `dipe_item_client`, `dipe_item_url` |

Los dos metadatos son cadenas, se saneán al guardar y se exponen en REST. Se sustituirán o eliminarán cuando el inventario determine si este contenido pasa a ser Proyectos, Servicios u otro CPT.

## Pendiente de los diseños

- Inventario de páginas y sus URL definitivas.
- Bloques reutilizables y orden de secciones.
- Campos repetibles, taxonomías y relaciones entre contenidos.
- Textos, medios, CTA, pie, redes y formulario.
- Requisitos SEO por plantilla y estrategia para que el contenido indexable exista en el HTML inicial si React no basta.
