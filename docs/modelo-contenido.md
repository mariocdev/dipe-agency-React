# Modelo de contenido inicial

Este contrato es intencionadamente pequeño y sustituible: todavía no se han entregado diseños, imágenes ni textos finales. El contenido de Home, Quiénes somos, Contacto y Trabaja con nosotros se mantiene completamente en código React/Bootstrap. WordPress edita entradas/CPT y, como única excepción para esas páginas fijas, sus metadatos SEO.

## Páginas y rutas de la prueba vertical

| URL | Origen | Vista React |
| --- | --- | --- |
| `/` | Ruta fija React; página WordPress solo como ancla URL/SEO | Presentación técnica mínima |
| `/proyectos/` | Archivo del CPT `Proyectos` | Listado REST |
| `/proyectos/{slug}/` | Elemento individual del CPT | Detalle REST |
| URL inexistente | Plantilla 404 de WordPress | Estado 404 React |

WordPress conserva la decisión HTTP, enlaces permanentes y plantillas. React sólo decide la presentación dentro de la página que ya ha resuelto WordPress.

## CPT inicial: `dipe_proyecto`

| Elemento | Decisión |
| --- | --- |
| Etiqueta editorial | Proyectos |
| Archivo público | Sí, en `/proyectos/` |
| REST | Sí, en `/wp-json/wp/v2/dipe-proyectos` |
| Soportes | título y campos personalizados |
| Campo ACF | `dipe_project_home_card_image` (imagen obligatoria de la tarjeta de Inicio) |

El campo ACF se registra en PHP dentro de `dipe-core`, no se crea manualmente en el administrador. Al activar ACF Pro aparece automáticamente en cada nuevo proyecto y se expone por REST en `acf.dipe_project_home_card_image`. Los campos futuros del proyecto se añadirán al mismo grupo versionado.

## Pendiente de los diseños

- Inventario de rutas fijas en código y sus URL definitivas; las páginas WordPress correspondientes solo contendrán datos URL/SEO, sin contenido editable.
- Bloques reutilizables y orden de secciones.
- Campos repetibles, taxonomías y relaciones solo para entradas/CPT.
- Textos, medios fijos, CTA, pie, redes y vista de formularios mantenidos en código; contenido de entradas/CPT desde WordPress.
- Requisitos SEO por plantilla y estrategia para que el contenido indexable exista en el HTML inicial si React no basta.
