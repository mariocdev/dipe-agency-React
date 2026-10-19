# Encargo de cabecera y pie globales

La cabecera global ya se ha implementado según [su captura](referencias/cabecera.png), y el pie según [su referencia](referencias/footer.png). Gordita ya se carga desde los archivos OTF aportados por el usuario, como explica la [guía visual](guia-visual.md). Las marcas azules de las capturas son artefactos de selección del diseño; no forman parte de la interfaz. No maquetes todavía las páginas interiores.

## Tokens visuales compartidos

Los valores confirmados están guardados en `frontend/src/tokens.css`, ya importado por `frontend/src/main.jsx` después de Bootstrap. **Usa esas variables en la cabecera y después en el pie y las demás páginas; no repitas los hexadecimales ni la pila tipográfica en cada componente.** Incluye la [paleta y escala tipográfica](guia-visual.md), el negro específico de la cabecera `#020202`, el ancho interior del 80 % y su sombra. Añade nuevos valores globales cuando sean recurrentes o estén confirmados. No fijes como token medidas deducidas únicamente de la captura.

## Alcance y fuente de datos

- La estructura, los estilos y el comportamiento responsive viven en React/CSS. Las páginas corporativas continúan maquetadas por código.
- **Excepción editorial acordada:** los enlaces de la cabecera son menús nativos editables desde WordPress; el logo se cambia desde la identidad del sitio. En la siguiente iteración, se aplicará el mismo patrón a los enlaces del pie. No usar Elementor, ACF ni otro maquetador para estos elementos.
- El favicon se gestiona con el **Site Icon nativo de WordPress**; no crear un campo ACF duplicado. Comprobar que `wp_head()` sigue presente en el tema.
- El logo visible en el servidor está gestionado desde WordPress. Los archivos Gordita OTF aportados por el usuario se cargan mediante `fonts.css`; comprobar la [licencia web y el futuro kit WOFF2](guia-visual.md) antes de producción.
- Los enlaces iniciales de navegación deben tener `href="#"`, según la indicación actual. Conserva las URL que el editor cambie más adelante en WordPress.

## Cabecera

Dos bandas de ancho completo. El contenido interior ocupa el **80 % del ancho disponible** en escritorio y se centra. En pantallas estrechas, usar `width: min(80%, ...)` solo mientras sea legible; ampliar el interior mediante media query para que nunca desborde ni aplaste el menú.

1. **Banda superior:** fondo `#FF8600`, `padding-block: 15px`. Menú alineado al extremo derecho. Texto `#1D1D1D`, Gordita, 14 px, peso 500, estilo y line-height normales. Elementos iniciales: `Agencia Desarrollo Web`, `Proyectos Web`, `Blog`. Separadores verticales visuales `|` entre elementos; no incluirlos en los títulos de WordPress.
2. **Banda principal:** fondo `#020202`; sombra `0 4px 4px 0 rgba(0, 0, 0, 0.25)`. Logo a la izquierda, menú a la derecha. Texto principal blanco, Gordita, 18 px, peso 500. Orden inicial: `Desarrollo Web`, `Transformación Digital`, `Marketing Online`, `Contacto`, `¿Hablamos?`. El último elemento es un botón naranja con texto oscuro y bordes ligeramente redondeados; identificarlo por clase de menú `menu-cta`, **no por comparar el título**. El logo enlaza al inicio.
3. Los tres primeros elementos principales tienen submenú. Texto de submenú blanco, Gordita, 14 px, peso 400; panel oscuro con contraste suficiente, separación y estados hover/focus visibles. Hijos iniciales: para Desarrollo Web, los cuatro servicios de desarrollo enumerados en el pie; para Transformación Digital, los tres servicios digitales; para Marketing Online, los cuatro servicios de marketing. Todos sus enlaces empiezan con `#`.
4. En móvil, el menú principal se abre con control tipo hamburguesa, con `aria-expanded` y nombre accesible. Los submenús deben abrirse por clic/teclado, además de hover en escritorio. Mantener banda superior visible y permitir que sus enlaces se ajusten en líneas si hace falta. Respetar el orden de tabulación y Escape para cerrar el menú/submenú.

### Cabecera responsive: hamburguesa desde 1024 px (19-10-2026)

**Apertura al pasar el cursor por el padre (19-10-2026, ajuste posterior):** por petición del usuario, en >1024 px `Header.jsx` abre el submenú al entrar con el ratón en el ítem del enlace padre y lo mantiene abierto al pasar a sus hijos. Al salir del conjunto lo cierra, salvo que contenga el foco. Utiliza el estado React existente, por lo que icono y `aria-expanded` siguen sincronizados y Escape/cierre por botón siguen funcionando. Este ajuste sustituye la decisión anterior de apertura exclusivamente explícita en escritorio; no se recuperan reglas CSS de hover/`:focus-within`. Se conservan navegación de enlaces reales, toggle de padres `#`, controles táctiles y comportamiento de hamburguesa en <=1024 px. Sin cambios CSS, comprobaciones locales ni compilación; pendiente revisión del usuario en servidor. FTP tras compilación del usuario: `wp-content/themes/dipe-react/assets/` completo con `.vite/manifest.json`.

**Escritorio, apertura y cierre unificados (19-10-2026):** el usuario precisa que el panel debe empezar en el **borde izquierdo de su enlace padre** y medir lo que necesite, conservando su inicio vertical donde termina la cabecera. En >1024 px, nav/lista/ítems se estiran al alto de la barra; cada ítem queda como anclaje relativo y su submenú usa `top: 100%`, `left: 0`, `width: max-content`, mínimo del ancho del padre y máximo de 90vw, con 20 px de padding y scroll vertical si hace falta. Esto sustituye el ancho completo de la primera iteración de escritorio. Se usa el mismo control explícito que en la hamburguesa: botón para abrir/cerrar; un padre con URL `#` también alterna su submenú, mientras un padre con URL real conserva la navegación nativa. Se elimina la apertura automática por hover/`:focus-within`, que podía mantener el panel visible tras cerrar el estado. Se cierra al pulsar fuera, al llevar el foco fuera, al navegar, al abrir otro o con Escape; Escape devuelve el foco al botón del submenú en escritorio. El cierre exterior también se aplica al desplegable de 440–1024 px; el diálogo inferior a 440 mantiene su comportamiento modal. Las etiquetas de botones alternan Abrir/Cerrar y `aria-expanded` refleja el estado. Reglas en `Header.css`, con eliminación de la apertura CSS antigua de `styles.css`; revisión en servidor pendiente, sin comprobaciones locales ni build.

En **1024 px o menos**, la barra muestra logo, CTA «¿Hablamos?» fuera del desplegable y hamburguesa. El CTA conserva URL, texto y destino del elemento nativo de WordPress identificado mediante `menu-cta`; su versión dentro del menú se oculta en este corte y la exterior se oculta en escritorio, por lo que solo una es visible y accesible cada vez. No hay URL ni etiqueta de CTA fija en React.

El desplegable se posiciona respecto a la barra negra y ocupa **todo el ancho de pantalla**; sus enlaces se alinean con el ancho global mediante padding lateral compartido. Muestra el resto de enlaces y permite abrir/cerrar sus submenús por botón y teclado. Tiene desplazamiento vertical si supera el alto disponible. La hamburguesa actualiza su nombre y `aria-expanded`; Escape cierra y devuelve el foco al botón; navegar y cruzar el corte cierran el estado abierto. La franja superior conserva sus reglas.

Reglas de menú colapsado trasladadas de `styles.css` (antes 860 px) al nuevo `components/layout/Header.css`, importado por `Header.jsx`. Escritorio mantiene el menú y CTA originales. El desplegable con CTA exterior corresponde al tramo de 440 a 1024 px; por debajo de 440 px se usa la adaptación siguiente. Sin comprobaciones locales ni build; pendiente revisión en servidor. FTP tras compilación del usuario: `wp-content/themes/dipe-react/assets/` completo con `.vite/manifest.json`; sin PHP nuevo.

### Menú a pantalla completa por debajo de 440 px (19-10-2026)

**Menú unificado y animación (19-10-2026):** el usuario pide que todos los enlaces parezcan un mismo menú con el estilo del principal. El popup presenta `utility` y `primary` consecutivos en un único `nav`/lista, usando `PrimaryItem`: misma tipografía, filas, separadores, foco y controles de submenú; sin hueco ni estilos de grupo secundario. La configuración nativa de WordPress mantiene sus ubicaciones; logo y CTA siguen antes/después de la lista. Eliminados los estilos específicos de la antigua lista secundaria del diálogo.

Entrada desde la **derecha** y salida por la **derecha**, de 320 ms, mediante Web Animations. La salida mantiene el diálogo modal, foco y bloqueo del fondo hasta terminar; después cierra/restaura. Si se cierra durante la entrada, parte de la posición visible actual. Al cerrar, solo el contenido de la cabecera (`.dipe-header__main-inner`) aparece desde arriba con opacidad 0 → 1 durante esos mismos 320 ms: el header y su barra conservan altura y fondo negro opaco inmóviles. El atributo temporal `data-menu-closing` aplica `overflow: clip` y se limpia al terminar/cancelar, evitando franjas blancas o contenido fuera de la barra. La navegación HTTP(S) a la misma ventana espera la salida; clics modificados, descargas y otros destinos conservan su comportamiento nativo. Cruzar breakpoints o desmontar cancela ambas animaciones y limpia el modal. `prefers-reduced-motion: reduce` omite las animaciones. Backdrop tenue durante el desplazamiento; el panel abierto sigue siendo negro y ocupa todo el viewport. Sin comprobaciones locales ni build; revisión en servidor pendiente.

Por indicación del usuario, en **width < 440 px** desaparece el CTA exterior de la barra. La hamburguesa abre un `dialog` nativo con `showModal()`, a ancho completo y 100dvh, con fondo negro. Contenido en vertical: logo configurable de WordPress, navegación secundaria (`utility`), principal sin CTA y finalmente el botón o botones con clase `menu-cta`. Los submenús principales reutilizan sus controles y usan ID distintos a los de la navegación exterior. El diálogo conserva el ancho global para alinear su contenido y permite scroll interior si hace falta.

Botón de cierre y Escape cierran el menú; navegación también cierra. El diálogo modal mantiene el foco dentro, deja inerte el fondo y restaura el foco al cerrar. Mientras está abierto se bloquea el scroll únicamente de la raíz y se restaura su valor previo al cerrar, desmontar o cruzar el corte. El overflow del body se conserva para evitar convertirlo en un contenedor de scroll que altere la posición sticky del header. El cambio entre los modos de 440 y 1024 px reinicia menú/submenús. A 440 px exactos continúa el desplegable con CTA exterior. No se oculta la banda superior cuando el popup está cerrado ni se cambia su configuración.

Cambios en `Header.jsx` y `Header.css`, más este documento y `CONTEXTO-PROYECTO.md`. Sin comprobaciones locales, compilación, FTP ni operaciones Git; revisión en servidor pendiente. FTP tras compilación del usuario: assets completos del tema con `.vite/manifest.json`; sin PHP ni configuración administrativa nueva.

## Pie global implementado

Fondo carbón oscuro próximo a `#1D1D1D`, a confirmar cuando haya archivo de diseño original. Interior centrado del 80 % en escritorio, con adaptación móvil. Texto blanco; viñetas de enlaces naranja `#FF8600`. Usar Gordita y pesos visualmente equivalentes a la captura; **no inventar tamaños exactos que no se han facilitado**.

- **Primera fila:** logo a la izquierda (el mismo logo configurable, adaptado al fondo oscuro); después `Oficina Salamanca` y `Jesús Arambarri, 33 – 37003 Salamanca`; luego `(+34) 923 623 738`; luego `info@dipe.es`.
- **Segunda fila, cuatro columnas** con títulos escritos en el componente y enlaces procedentes de menús nativos:
  1. `Soluciones de desarrollo web a medida`: `Desarrollo web con WordPress`; `Desarrollo web con PrestaShop`; `Desarrollo de aplicaciones web (custom)`; `Apps móviles (iOS · Android · PWA)`.
  2. `Transformación digital que impulsa tu negocio`: `Odoo`; `Integraciones y automatizaciones`; `Consultoría tecnológica`.
  3. `Marketing online orientado a resultados`: `SEO: estrategia, técnica y contenidos`; `SEM: Google Ads & Social Ads`; `Gestión de redes sociales para empresas`; `Inbound Marketing & automatización`.
  4. `Sobre dipe`: `Agencia de desarrollo web`; `Blog`; `Contacto`.
- **Franja inferior:** línea divisoria fina; izquierda `© {año actual} Todos los derechos reservados.`; derecha enlaces `Aviso legal | Política de privacidad | Política de cookies`. El año de la captura (`2025`) era el del diseño, así que generarlo dinámicamente. En móvil, apilar bloques y evitar scroll horizontal.

El tema registra las cinco ubicaciones de menú de WordPress (`footer_web`, `footer_digital`, `footer_marketing`, `footer_about` y `footer_legal`) y crea sus menús de ejemplo con `#` solo si aún no existen. Teléfono, correo y dirección forman parte del componente global. El logo del pie es independiente: se configura en «Apariencia → Personalizar → Identidad del sitio», debajo del logo del sitio. El fondo se expresa mediante el token semántico `--dipe-color-footer`.

### Destinos disponibles para el footer (18-10-2026)

**Decisión confirmada:** el usuario los asignará desde **Apariencia > Menús**. Usar las páginas nativas publicadas, editar o sustituir los elementos con `#` para no duplicarlos y guardar cada menú en su ubicación. Para custom, seleccionar la página de la URL Salamanca y conservar la etiqueta «Desarrollo de aplicaciones web (custom)». No añadir fallback de enlaces en React. Asignación real en servidor pendiente de confirmación; este ajuste administrativo no necesita build ni FTP.

El usuario pide enlazar las páginas ya maquetadas y confirma que «Desarrollo de aplicaciones web (custom)» lleva a la página cuyo slug conserva Salamanca. El footer lee `siteConfig.navigation.footer`; las ubicaciones nativas siguen siendo la fuente de sus menús. El código PHP del tema no está disponible en este checkout. No inventar destinos para Apps móviles, Transformación digital ni Marketing, cuyas páginas aún no están implementadas en las rutas React actuales.

| Ubicación | Etiqueta | Destino |
| --- | --- | --- |
| `footer_web` | Desarrollo web | `/desarrollo-web/` |
| `footer_web` | Desarrollo web con WordPress | `/desarrollo-web/desarrollo-web-wordpress/` |
| `footer_web` | Desarrollo web con PrestaShop | `/desarrollo-web/desarrollo-web-prestashop/` |
| `footer_web` | Desarrollo de aplicaciones web (custom) | `/desarrollo-web/desarrollo-web-salamanca/` |
| `footer_about` | Agencia de desarrollo web | `/agencia-desarrollo-web/` |
| `footer_about` | Proyectos web | `/proyectos/` |
| `footer_about` | Blog | `/blog/` |
| `footer_about` | Contacto | `/contacto/` |
| `footer_legal` | Aviso legal | `/aviso-legal/` |
| `footer_legal` | Política de privacidad | `/politica-de-privacidad/` |
| `footer_legal` | Política de cookies | `/politica-de-cookies/` |

El teléfono conserva naranja en reposo y pasa a blanco en hover/foco de teclado, invirtiendo la interacción de los demás enlaces de contacto. Estilo trasladado junto con el resto del footer a `frontend/src/components/layout/Footer.css`; revisión en servidor pendiente. No se han ejecutado comprobaciones locales ni compilación.

### Responsive definido por el usuario (19-10-2026)

El usuario marca cada breakpoint y su disposición; no extender todavía los cambios al resto de la web ni añadir otros cortes al footer.

- **1260 px o menos:** logo centrado en una fila completa. Dirección, teléfono y correo pasan a la fila siguiente, en horizontal con `space-between` y alineados verticalmente al centro. Menús en dos columnas iguales, con las alturas de títulos igualadas por la lógica existente para alinear los comienzos de las listas.
- **Espacios desde 1260 px:** separación de contactos a menús reducida de 4.8 a 3.5 rem, y de menús a la franja legal de 3.4 a 2.5 rem.
- **Entre 681 y 960 px:** teléfono y correo se agrupan en un contenedor vertical, con el correo debajo y ambos alineados a la izquierda, separados por 0.5 rem. La dirección permanece a su lado, con `space-between` entre ambos bloques. Por encima de 960 px, el contenedor usa `display: contents` para conservar la distribución independiente de los tres enlaces. El corte de agrupación se adelanta de 880 a 960 px; los ajustes de espaciado siguen en 880 px.
- **680 px o menos:** todo en vertical, con logo centrado a ancho completo y el resto alineado a la izquierda. El contenedor de teléfono/correo vuelve a `display: contents`: dirección, teléfono y correo participan del mismo gap de 1.25 rem. Menús en una columna con gap de 1.75 rem; títulos con altura natural y margen inferior de 1.65 rem (recupera la mitad de la reducción inicial de 2.3 a 1 rem); enlaces separados por 0.65 rem. Políticas apiladas, sin separadores verticales, y copyright al final mediante `order: 1` en ese corte; en horizontal conserva el orden anterior. Los paddings recuperan la mitad de la reducción inicial, según la progresión siguiente; no cambia la tipografía.
- **Márgenes y gaps graduales:** margen de título a lista en escritorio → 1260 → 880 → 680 px: **2.3 → 2.05 → 1.85 → 1.65 rem**. Gap de enlaces: **0.94 → 0.85 → 0.75 → 0.65 rem**; de viñeta a enlace: **0.65 → 0.6 → 0.55 → 0.5 rem**; de la franja inferior: **2 → 1.65 → 1.25 → 0.85 rem**. Desde la recolocación de 1260 → 880 → 680 px, gap vertical de contactos **2 → 1.625 → 1.25 rem** y entre grupos de menús **2.5 → 2.1 → 1.75 rem**. La separación interna de teléfono/correo entre 681 y 960 px sigue en 0.5 rem.
- **Paddings graduales (rem):** escritorio → 1260 → 880 → 680 px: exterior superior **4.8 → 4.4 → 4 → 3.65**; exterior inferior **1.35 → 1.34 → 1.32 → 1.3**; contactos a menús **4.8 → 3.5 → 3.1 → 2.75**; menús a franja legal **3.4 → 2.5 → 2.3 → 2.125**; padding superior de franja legal **1.35 → 1.3 → 1.25 → 1.175**. Los valores finales de 680 px son el punto medio entre los anteriores a ese corte y su primera reducción.
- CSS propio en `frontend/src/components/layout/Footer.css`, importado desde `Footer.jsx`; retirados de `styles.css` tanto el bloque base como los overrides antiguos del footer a 860 y 420 px. Escritorio conserva su disposición y los tokens compartidos no cambian.
- Pendiente revisión en servidor y definición por el usuario de los siguientes cortes. Esta iteración requiere compilación del usuario y FTP de `wp-content/themes/dipe-react/assets/` completo con `.vite/manifest.json`; sin PHP nuevo. Documentación y fuentes no se suben por FTP.

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
