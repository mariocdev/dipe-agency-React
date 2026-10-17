# Encargo para Terra: cabecera ahora, pie después

Implementa esta iteración sobre el estado actual de `main`: **solo la cabecera global** según [su captura](referencias/cabecera.png). El [pie](referencias/footer.png) será la iteración inmediatamente siguiente; sus requisitos quedan aquí preparados, pero **no lo maquetes ni crees sus menús todavía**. Las marcas azules de las capturas son artefactos de selección del diseño; no forman parte de la interfaz. No maquetes todavía las páginas interiores.

## Tokens visuales compartidos

Los valores confirmados están guardados en `frontend/src/tokens.css`, ya importado por `frontend/src/main.jsx` después de Bootstrap. **Usa esas variables en la cabecera y después en el pie y las demás páginas; no repitas los hexadecimales ni la pila tipográfica en cada componente.** Incluye naranja `#FF8600`, tinta `#1D1D1D`, negro `#020202`, blanco, Gordita con fallback, ancho interior del 80 % y sombra de cabecera. Los tamaños/pesos específicos de menú van en sus reglas de componente; incorpora nuevos valores globales al archivo de tokens solo cuando sean recurrentes o estén confirmados. No fijas como token medidas deducidas únicamente de la captura.

## Alcance y fuente de datos

- La estructura, los estilos y el comportamiento responsive viven en React/CSS. Las páginas corporativas continúan maquetadas por código.
- **Excepción editorial acordada:** los enlaces de la cabecera son menús nativos editables desde WordPress; el logo se cambia desde la identidad del sitio. En la siguiente iteración, se aplicará el mismo patrón a los enlaces del pie. No usar Elementor, ACF ni otro maquetador para estos elementos.
- El favicon se gestiona con el **Site Icon nativo de WordPress**; no crear un campo ACF duplicado. Comprobar que `wp_head()` sigue presente en el tema.
- No hay archivos del logo ni de la fuente Gordita en el repositorio. Preparar una sustitución de texto accesible mientras no exista logo configurado; no inventar un logotipo ni descargar una fuente sin licencia. Dejar `font-family: Gordita, ...` con una alternativa de sistema, y documentar cómo añadir los archivos `.woff2` cuando se entreguen.
- Los enlaces iniciales de navegación deben tener `href="#"`, según la indicación actual. Conserva las URL que el editor cambie más adelante en WordPress.

## Cabecera

Dos bandas de ancho completo. El contenido interior ocupa el **80 % del ancho disponible** en escritorio y se centra. En pantallas estrechas, usar `width: min(80%, ...)` solo mientras sea legible; ampliar el interior mediante media query para que nunca desborde ni aplaste el menú.

1. **Banda superior:** fondo `#FF8600`, `padding-block: 15px`. Menú alineado al extremo derecho. Texto `#1D1D1D`, Gordita, 14 px, peso 500, estilo y line-height normales. Elementos iniciales: `Agencia Desarrollo Web`, `Proyectos Web`, `Blog`. Separadores verticales visuales `|` entre elementos; no incluirlos en los títulos de WordPress.
2. **Banda principal:** fondo `#020202`; sombra `0 4px 4px 0 rgba(0, 0, 0, 0.25)`. Logo a la izquierda, menú a la derecha. Texto principal blanco, Gordita, 18 px, peso 500. Orden inicial: `Desarrollo Web`, `Transformación Digital`, `Marketing Online`, `Contacto`, `¿Hablamos?`. El último elemento es un botón naranja con texto oscuro y bordes ligeramente redondeados; identificarlo por clase de menú `menu-cta`, **no por comparar el título**. El logo enlaza al inicio.
3. Los tres primeros elementos principales tienen submenú. Texto de submenú blanco, Gordita, 14 px, peso 400; panel oscuro con contraste suficiente, separación y estados hover/focus visibles. Hijos iniciales: para Desarrollo Web, los cuatro servicios de desarrollo enumerados en el pie; para Transformación Digital, los tres servicios digitales; para Marketing Online, los cuatro servicios de marketing. Todos sus enlaces empiezan con `#`.
4. En móvil, el menú principal se abre con control tipo hamburguesa, con `aria-expanded` y nombre accesible. Los submenús deben abrirse por clic/teclado, además de hover en escritorio. Mantener banda superior visible y permitir que sus enlaces se ajusten en líneas si hace falta. Respetar el orden de tabulación y Escape para cerrar el menú/submenú.

## Próxima iteración: pie (no implementar aún)

Fondo carbón oscuro próximo a `#1D1D1D`, a confirmar cuando haya archivo de diseño original. Interior centrado del 80 % en escritorio, con adaptación móvil. Texto blanco; viñetas de enlaces naranja `#FF8600`. Usar Gordita y pesos visualmente equivalentes a la captura; **no inventar tamaños exactos que no se han facilitado**.

- **Primera fila:** logo a la izquierda (el mismo logo configurable, adaptado al fondo oscuro); después `Oficina Salamanca` y `Jesús Arambarri, 33 – 37003 Salamanca`; luego `(+34) 923 623 738`; luego `info@dipe.es`.
- **Segunda fila, cuatro columnas** con títulos escritos en el componente y enlaces procedentes de menús nativos:
  1. `Soluciones de desarrollo web a medida`: `Desarrollo web con WordPress`; `Desarrollo web con PrestaShop`; `Desarrollo de aplicaciones web (custom)`; `Apps móviles (iOS · Android · PWA)`.
  2. `Transformación digital que impulsa tu negocio`: `Odoo`; `Integraciones y automatizaciones`; `Consultoría tecnológica`.
  3. `Marketing online orientado a resultados`: `SEO: estrategia, técnica y contenidos`; `SEM: Google Ads & Social Ads`; `Gestión de redes sociales para empresas`; `Inbound Marketing & automatización`.
  4. `Sobre dipe`: `Agencia de desarrollo web`; `Blog`; `Contacto`.
- **Franja inferior:** línea divisoria fina; izquierda `© {año actual} Todos los derechos reservados.`; derecha enlaces `Aviso legal | Política de privacidad | Política de cookies`. El año de la captura (`2025`) era el del diseño, así que generarlo dinámicamente. En móvil, apilar bloques y evitar scroll horizontal.

Al abordar esta iteración, crear sus cinco ubicaciones de menú de WordPress y poner inicialmente `#` en los enlaces del pie. El teléfono y el email pueden aparecer como texto. Reutilizar el logo y los tokens de la cabecera; si se confirma un color distinto para el fondo, añadirlo como token en vez de dejar un hexadecimal disperso.

## Integración WordPress ↔ React para la cabecera

1. En `wp-content/themes/dipe-react/functions.php`, añadir soporte `custom-logo` y registrar **solo** las ubicaciones de menú `utility` y `primary`. Esto pertenece al tema; no moverlo a `dipe-core`. Las ubicaciones `footer_web`, `footer_digital`, `footer_marketing`, `footer_about` y `footer_legal` se añaden en la siguiente iteración.
2. En una rutina de inicialización **idempotente y versionada** del tema, ejecutada en administración también cuando se actualice un tema ya activo, crear **solo si faltan** menús de muestra con los títulos anteriores y URLs `#`, y asignarlos a ubicaciones vacías. No sobrescribir menús existentes ni duplicar ítems en reactivaciones. Añadir `menu-cta` al ítem `¿Hablamos?`. Si una ubicación no tiene menú asignado, el front debe seguir funcionando sin errores.
3. Extender la configuración `window.dipeSite` que ya se imprime desde PHP para pasar `logo` (URL, texto alternativo razonable) y un árbol mínimo por ubicación (`id`, `title`, `url`, `target`, `classes`, `children`). Obtener menús desde la ubicación asignada mediante API de WordPress; conservar el orden y `menu_item_parent`. Enviar únicamente datos públicos y URL seguras; no exponer objetos completos de WordPress. Evitar una segunda petición REST para este shell.
4. En React, extraer `Header` del `Shell` de `frontend/src/App.jsx` en un componente reutilizable y renderizarlo una vez antes de `<main>`. El `Footer` se añadirá en la siguiente iteración. No duplicar la maqueta en `header.php`. Revisar el helper de enlaces: debe preservar `#`, rutas relativas al `basePath`, URL absolutas y `mailto:`/`tel:` futuros sin convertir `#` en `/#` ni admitir esquemas inseguros. Los títulos del menú se renderizan como texto, sin `dangerouslySetInnerHTML`.
5. Consumir los tokens de `frontend/src/tokens.css`; usar Bootstrap para grid/utilidades y CSS propio para fidelidad al diseño. La pantalla de proyectos y el resto de rutas deben conservar su funcionamiento.
6. Incluir una nota breve de administración: dónde cambiar logo, favicon y los dos menús; cómo añadir/quitar un submenú o aplicar la clase `menu-cta`. El Site Icon se cambia desde **Ajustes → Generales** en WordPress actual; verificar la versión instalada si la ruta difiere.

## Criterios de aceptación

- Cabecera visible y consistente en inicio, archivo, detalle y 404, incluidos accesos directos a URL internas.
- Cambio de logo o de los menús de cabecera desde `wp-admin` visible al recargar la web sin recompilar React (sujeto a vaciar Varnish si está cacheada).
- Menús y submenús navegables con ratón, táctil y teclado; CTA diferenciada por clase; foco visible.
- Sin enlaces rotos por el prefijo `basePath` ni scroll horizontal a 320/375 px.
- `pnpm build` y comprobación visual de escritorio/móvil. Informar qué queda pendiente por falta del logo/fuente originales, sin afirmar fidelidad exacta mientras falten esos assets.

## Referencia WordPress

- [Soporte de logotipo en temas clásicos](https://developer.wordpress.org/themes/classic-themes/functionality/custom-logo/)
- [Registro de ubicaciones de menú](https://developer.wordpress.org/reference/functions/register_nav_menus/) y [lectura de sus elementos](https://developer.wordpress.org/reference/functions/wp_get_nav_menu_items/)
- [Site Icon / favicon](https://wordpress.org/documentation/article/create-a-favicon/)
