# Proyectos: configuración inicial

**Base aprobada (18-10-2026):** el usuario confirma como «PERFECTO» el estado actual de todos los archivos locales y autoriza consolidarlo en `main`. La ficha mantiene el centrado vertical/CSS anterior y toma el servicio enlazado de las nuevas etiquetas compartidas. Esta aprobación prevalece sobre las notas históricas de revisión pendientes; no cambiar estilos en tareas solo de lógica. Referencia Git vigente en `CONTEXTO-PROYECTO.md` y `PLAN_PARA_TERRA.md`.

El CPT `dipe_proyecto` es el primer contenido real y se muestra tanto en la
Home como en `/proyectos/`. Su registro y sus campos viven en `dipe-core` para
que todos los entornos reciban la misma configuración al actualizar el plugin.

## Requisito

Instala y activa **ACF Pro**. No se debe crear ningún grupo de campos manual en
el administrador: al activarse ACF Pro, `dipe-core` registra automáticamente
los grupos “Tarjeta de inicio” y “Detalle del proyecto”.

## Campos disponibles hoy

| Campo | Origen | Obligatorio | Uso |
| --- | --- | --- | --- |
| Título | WordPress | Sí | Título de la tarjeta y del detalle |
| Contenido | Editor nativo de WordPress | No | Cuerpo del detalle del proyecto |
| Imagen principal | Imagen destacada nativa de WordPress | Sí | Imagen de la tarjeta en los archivos de proyectos |
| Imagen de tarjeta de inicio | ACF (`dipe_project_home_card_image`) | Sí | Imagen de la tarjeta en la Home y detalle temporal |
| Imagen de banner principal | ACF (`dipe_project_banner_image`) | No | Imagen del banner de la página interna; es el primer campo de “Detalle del proyecto” |
| Fecha de desarrollo | ACF (`dipe_project_development_date`) | No | Fecha real de desarrollo, independiente de la publicación; se guarda como `YYYY-MM-DD` |
| Vídeo de YouTube | ACF (`dipe_project_youtube_url`) | No | URL pública del vídeo que precede a la galería |
| Página web lanzada | ACF (`dipe_project_live_url`) | No | URL pública de la web una vez lanzada |
| Galería multimedia | ACF (`dipe_project_gallery`) | No | Elementos ordenables con un archivo de imagen, GIF o vídeo por fila |
| Proyectos destacados | ACF (`dipe_project_featured_projects`) | No | Proyectos relacionados y ordenados para la sección final del detalle |

La galería se configura con un repetidor y no con el campo Galería de ACF, ya
que ese campo solo admite imágenes. Cada archivo admite JPG, PNG, GIF, WebP,
AVIF, MP4 o WebM. Los campos nuevos se exponen por REST mediante ACF. La
cabecera del detalle ya consume la imagen de banner, fecha, URL publicada y
jerarquía de categorías. Su primer bloque muestra el contenido HTML nativo y
el vídeo de YouTube. La galería multimedia se presenta como carrusel de cuatro
elementos altos en escritorio, tres hasta 1500 px, dos hasta 860 px y uno hasta 560 px, con avance
mediante flechas, paginación o arrastre horizontal. No captura la rueda ni centra
la página automáticamente. Permite ampliar los archivos y navegar entre ellos;
los vídeos y GIF se mantienen como archivos del ACF. El visor conserva el
archivo original y permite ampliar imágenes y GIF por clic y recorrerlos con
el ratón; la lupa es el cursor, sin iconos superpuestos. El zoom se adapta a
las proporciones y resolución de cada imagen, sin forzar un ancho común ni
superar las dimensiones originales. Las partes que exceden el visor se
recorren con el ratón.
## Servicios relacionados compartidos con el blog (18-10-2026)

Nueva taxonomía no jerárquica **Servicios relacionados** (`dipe_related_service`), asignable tanto a proyectos como a entradas. Cada término configura una página de servicio nativa y una imagen opcional; no sustituye las categorías de proyectos ni la etiqueta «Destacados». Por petición del usuario, el metadato **Servicio**, junto a **Fecha**, toma ahora `dipe_related_services` y enlaza cada etiqueta al permalink de su página publicada. Con varias etiquetas muestra **Servicios** y separadores «·». Ya no deriva este valor de las categorías raíz ni repite servicios en la caja de categorías/enlace externo. Sin término/destino publicado se omite el metadato; hay que asignar la nueva etiqueta al proyecto, sin migraciones automáticas desde categorías. El usuario aclara que este cambio debía ser solo de lógica: se restauran el centrado vertical original de los metadatos (`align-items: center`, sin `flex-wrap`) y el hover anterior. No alterar estilos por una tarea de lógica. No se añaden tarjetas del sidebar del blog al diseño de Proyectos. El HTML del proyecto usa `EditorialContent.jsx/.css`, compartiendo valores tipográficos con la entrada sin cambiar columnas ni padding de este detalle. Configuración y FTP inicial del plugin 0.4.11 en `docs/entradas.md`; este último ajuste solo requiere assets completos del tema con manifiesto tras compilación del usuario. Sin comprobaciones locales; revisión en servidor pendiente.

## Más proyectos destacados

El detalle termina con el h2 «Más proyectos destacados». En el campo ACF
**Proyectos destacados** de cada proyecto, selecciona y ordena los proyectos
que deben aparecer. Se muestran únicamente los publicados, sin repetir el
proyecto actual; si no hay una selección disponible, la sección se omite.
Esta selección es independiente de la etiqueta «Destacados» de la Home.

Las tarjetas comparten componente y estilos con el archivo: imagen destacada
nativa de WordPress, categoría enlazada y título h3. El grid muestra tres
columnas en escritorio; desde 1240 px muestra dos y oculta desde la tercera
tarjeta. En 767 px pasa a una columna y recupera las tarjetas ocultas, igual
que Recursos y Blog de Home. No requiere
cambios del plugin ni campos nuevos. Pendiente de revisión en el servidor.

## Cierre del detalle

Al apilar contenido y vídeo en 1240 px, el contenido editorial del proyecto
elimina sus 50 px de padding superior e inferior, conservando el padding
exterior compartido de la sección. Ajustes responsive preparados el 19-10-2026;
pendiente revisión en servidor, sin comprobaciones locales ni compilación.

Después de «Más proyectos destacados» aparece el mismo bloque de contacto,
imagen flotante y logos que en el archivo, compartido en `ProjectsContact`.
Mantiene el título «¿Empezamos?» y utiliza este texto en el detalle:

> Cuéntanos el caso de uso y te devolvemos un plan claro para tu **App:** blueprint, tiempos y presupuesto. Menos clics inútiles, más negocio en el bolsillo.

Reutiliza el formulario y el origen `proyectos` existentes, sin cambios PHP.
El archivo conserva su texto anterior. Pendiente de revisión en el servidor.

## Archivo de proyectos

**Loader y scroll a los filtros (19-10-2026):** el usuario rechaza el fundido/parpadeo anterior. Lo sustituye `ArchiveLoadingOverlay`, compartido con blog mediante `useArchiveGridFeedback`: fondo blanco al 72 % por encima de las tarjetas, spinner naranja y «Cargando…», visible durante la actualización de número/filtro y al menos 350 ms. Los datos no se retrasan; el mínimo afecta a la capa. Conserva tarjetas previas mientras llegan las nuevas y el skeleton inicial. Tras una respuesta válida hace scroll suave al comienzo de los filtros, con altura de cabecera + 20 px; en categorías, que no tienen selector, al enlace «Todos los proyectos». No desplaza al entrar por primera vez ni en errores. Movimiento reducido: spinner estático y scroll inmediato. Mantiene tamaños, filtros, números, activo naranja y foco. Cambian `ProjectsArchive.jsx/.css`, hook y componente/CSS compartidos; sin PHP, rutas ni cambios SEO. FTP de assets completos con manifiesto tras compilación del usuario; sin comprobaciones locales, publicación ni revisión confirmadas.

**SEO editable en admin (19-10-2026):** `dipe-core` 0.4.24 añade **Proyectos > SEO del archivo** para título SEO, metadescripción e indexación del listado general. Reutiliza las opciones de archivo de Yoast y su salida actual; no crea una página `/proyectos/` duplicada ni cambia el H1/diseño de React. Requiere Yoast activo y permisos de administrador; sin guardado expreso conserva los valores anteriores. Las categorías y fichas mantienen sus editores propios. FTP: nuevo `wp-content/plugins/dipe-core/includes/project-archive-seo.php` antes de `wp-content/plugins/dipe-core/dipe-core.php`; sin compilación ni assets del tema. Purgar otras cachés si existen y revisar en servidor; la herramienta solicita purga Rocket al cambiar valores. Sin comprobaciones locales ni publicación confirmada. Detalles en `docs/seo.md`.

`/proyectos/` muestra los 12 proyectos publicados más recientes por página. Las
tarjetas usan la imagen principal de WordPress y la categoría de proyecto
asignada. La imagen ACF permanece reservada para la Home.

**Paginación, ajuste del 19-10-2026:** conserva los números, tamaños y disposición existentes; la página activa pasa a fondo naranja corporativo (`--dipe-color-orange`) con número en tinta para mantener contraste. Se aplica tanto al archivo general como a categorías. Sin cambios de lógica, rutas o PHP. Pendiente revisión del usuario en servidor tras compilación/FTP de assets completos con manifiesto; sin comprobaciones locales.

Para los filtros del archivo, crea y asigna estas categorías de proyectos en
WordPress con estos *slugs* exactos:

| Nombre visible | Slug |
| --- | --- |
| WordPress | `wordpress` |
| PrestaShop | `prestashop` |

El plugin crea esas dos categorías al actualizarse. Se muestran en el archivo
como filtros “Proyectos con WordPress” y “Proyectos con PrestaShop”.

**Filtro responsive (19-10-2026):** los botones se mantienen en una fila sin
saltos. Según el ancho real disponible, reducen progresivamente letra de
18 a un mínimo de 16 px y padding lateral de 42 a un mínimo de 20 px.
Si no caben con esos mínimos, pasan a un selector nativo alineado a la
izquierda, con borde redondeado, fondo blanco (también en las opciones) y
flecha del diseño existente.
Comparte selección, categorías disponibles y reinicio de paginación con los
botones. Recalcula al cambiar el ancho y cargar fuentes; recupera los botones
al ampliar y conserva el foco si cambia de control. Pendiente revisión en
servidor; sin comprobaciones locales ni compilación.

Las cabeceras de categorías de proyectos muestran su nombre de WordPress
como H1, convertido a texto plano, en lugar del título general del archivo.

## Etiquetas y categorías

**Etiquetas de proyectos** y **Categorías de proyectos** son taxonomías
independientes. La etiqueta `Destacados` se reserva para elegir los proyectos
del grid de la Home; no interviene en el archivo ni se muestra en las tarjetas.
Asigna WordPress o PrestaShop como categoría a cada proyecto para que pueda
aparecer en el filtro y en su tarjeta.

El enlace de cada categoría lleva a su archivo propio, con el mismo grid y
paginación que `/proyectos/`, sin filtros y con un enlace de vuelta al archivo
general.

La imagen está expuesta en la REST API. ACF devuelve por defecto el formato
ligero, que para imágenes puede ser solo el ID aunque el campo esté configurado
para devolver un array. React consulta los proyectos con `acf_format=standard`
para recibir `acf.dipe_project_home_card_image.url`. Si esa estructura falta,
utiliza el campo público `dipe_project_card_image` del plugin cuando tenga URL.

## Comprobación

1. Activa ACF Pro y actualiza `dipe-core` por FTP.
2. En **Ajustes > Enlaces permanentes**, pulsa “Guardar cambios” tras la
   primera subida de esta versión.
3. Crea un proyecto con título e imagen ACF, y publícalo.
4. Confirma que aparece en `/`, `/proyectos/`, su URL individual y
   `/wp-json/wp/v2/dipe-proyectos?status=publish`.

Los proyectos de prueba del antiguo CPT `dipe_item` no se borran de la base de
datos; el CPT deja de registrarse y ya no se muestra en WordPress.
