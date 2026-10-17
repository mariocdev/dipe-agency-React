# Proyectos: configuración inicial

El CPT `dipe_proyecto` es el primer contenido real y se muestra tanto en la
Home como en `/proyectos/`. Su registro y sus campos viven en `dipe-core` para
que todos los entornos reciban la misma configuración al actualizar el plugin.

## Requisito

Instala y activa **ACF Pro**. No se debe crear ningún grupo de campos manual en
el administrador: al activarse ACF Pro, `dipe-core` registra el grupo “Tarjeta
de inicio” automáticamente.

## Campos disponibles hoy

| Campo | Origen | Obligatorio | Uso |
| --- | --- | --- | --- |
| Título | WordPress | Sí | Título de la tarjeta y del detalle |
| Imagen de tarjeta de inicio | ACF (`dipe_project_home_card_image`) | Sí | Imagen de la tarjeta en la Home, archivo y detalle temporal |

La imagen se devuelve como objeto ACF y está expuesta en la REST API. React la
consume desde `acf.dipe_project_home_card_image.url`.

## Comprobación

1. Activa ACF Pro y actualiza `dipe-core` por FTP.
2. En **Ajustes > Enlaces permanentes**, pulsa “Guardar cambios” tras la
   primera subida de esta versión.
3. Crea un proyecto con título e imagen ACF, y publícalo.
4. Confirma que aparece en `/`, `/proyectos/`, su URL individual y
   `/wp-json/wp/v2/dipe-proyectos?status=publish`.

Los proyectos de prueba del antiguo CPT `dipe_item` no se borran de la base de
datos; el CPT deja de registrarse y ya no se muestra en WordPress.
