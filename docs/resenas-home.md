# Siguiente sección de Home: reseñas

Referencias aportadas por el usuario: [sección completa](referencias/resenas-home.png) y [detalle de la valoración](referencias/resenas-rating.png). Implementar **después de `FeaturedProjectsSection`**, como componente React aislado (`ReviewsSection.jsx` y CSS propio). La Home sigue siendo código, sin Elementor ni CPT de reseñas en esta fase.

## Contenido y procedencia

El HTML de Google pegado por el usuario contiene ocho reseñas en total, pero solo **dos con texto**. Estas son las dos tarjetas auténticas que deben usarse, con valoración 5/5:

1. **Santiago Valle:** «Hemos trabajado en diferentes proyectos con ellos y no podemos estar más contentos. Son un equipazo: súper profesionales, cercanos, resolutivos… Enhorabuena a Ana y a todo su equipo. 100% recomendables»
2. **Juan Cristobal Petacas:** «Una de las mejores agencias de diseño web  y marketing de Salamanca, por no decir la mejor. Trato estupendo, equipo de trabajo muy profesional y buenos resultados garantizados. 100% recomendable.»

El usuario quiere **cuatro tarjetas**, aunque haya que repetir. Las posiciones 3 y 4 deben repetir respectivamente a Santiago Valle y Juan Cristobal Petacas, con los mismos textos y autores; no inventar otras opiniones. Mantener un identificador único por tarjeta y un `sourceReviewId` compartido con su original para que la futura integración sustituya las repeticiones con facilidad. Mostrar en las tarjetas repetidas una nota discreta «Reseña repetida para esta demostración», para que nadie las interprete como opiniones adicionales. Son cuatro vistas de carrusel, pero solo **dos reseñas distintas**.

El «5,0 · 8 reseñas» de la referencia es una **captura estática facilitada por el usuario**, no un contador vivo ni el promedio de las cuatro vistas del carrusel. Si se muestra, enlazarlo a la ficha real y etiquetarlo como dato no sincronizado; revisar antes de producción. La fila debe conservar el aspecto visual de la referencia, pero usar por ahora «Reseñas en Google» o «Fuente: Google» en vez de «powered by Google», ya que aún no hay integración. No extraer páginas de Google automáticamente ni hacer pasar el HTML copiado por una API. Cuando haya credenciales, sustituir la fuente de datos, no el componente visual.

## Maquetación

- Sección de ancho completo con fondo `var(--dipe-color-surface)` (`#F6F6F6`). Interior de `var(--dipe-content-width)` (`80%`), alineado con las otras secciones; confirmar en la captura el espaciado vertical.
- En escritorio, dos columnas en una cuadrícula: izquierda `40%`, derecha `60%` del espacio **restante tras el gap de 75 px** (`2fr 3fr`, `minmax(0, …)` para evitar desbordes). En móvil, apilar columnas, reducir el gap y mantener el carrusel usable sin scroll horizontal del documento.
- Izquierda: disposición vertical con `20px` entre bloques. H2 **«Opiniones reales»**: Gordita 700, `38px/41px`, tinta `#1D1D1D`. Debajo, **«Dipe desarrollo web»**: Gordita 400, `18px`; **«Jesús Arambarri, 33, 37003 Salamanca»**: Gordita 400, `18px/26px`, gris `#7E7E7E`.
- Bloque inferior izquierdo: nota **`5,0`**, cinco estrellas naranjas, texto **`8 reseñas`** en gris y debajo la fila de fuente Google con enlace. Seguir las proporciones de la captura pequeña; no calcular el `5,0` a partir de las cuatro tarjetas.
- Derecha: una sola tarjeta visible por vista, blanca, sombra ligera y esquinas redondeadas. Avatar genérico **igual en todas**: círculo naranja con icono blanco de persona, sin apropiarse de la foto de un autor real. Nombre en Gordita negrita, cinco estrellas naranjas, texto de la reseña en la escala general de la web. Evitar fecha relativa congelada; solo mostrar una fecha si se conoce la real.
- Debajo: cuatro indicadores en forma de **líneas horizontales**; gris suave visible sobre `#F6F6F6` y línea activa en el naranja corporativo `var(--dipe-color-orange)` (`#FF8600`). El usuario llamó «rojo corporativo» al activo, pero el color de marca documentado es naranja: usar el token existente, sin crear un rojo nuevo.
- Carrusel controlado por indicadores (botones accesibles con `aria-label`/estado activo), una reseña a la vez; sin reproducción automática. Mantener foco visible y respetar movimiento reducido. Usar `blockquote`/`cite` o estructura semántica equivalente, con texto escapado normalmente por React.

## Iconos y código

El usuario puede descargar iconos desde su cuenta de Font Awesome. Usar **estrella sólida** y **persona** como SVG locales optimizados, importados desde `frontend/src/assets/icons/`; descargar solo los necesarios y respetar la licencia de esa cuenta. No añadir toda la librería para dos iconos ni depender de un CDN. El avatar circular se compone con CSS y el icono de persona. Para la marca Google usar el recurso oficial permitido o texto enlazado; el icono `fa-google` monocromo no reproduce el logotipo multicolor de la captura. No insertar SVG/HTML de la página de resultados copiada.

Los datos pueden vivir en un módulo pequeño cercano al componente, con campos estables (`id`, `sourceReviewId`, `author`, `rating`, `text`, `sourceUrl`, `isRepeat`). Filtrar para mostrar solo entradas con `rating >= 4` y texto no vacío/suficiente; las cuatro tarjetas previstas tienen cinco estrellas. Separar datos y vista para reemplazar el array por una respuesta normalizada de API más adelante, sin crear hoy endpoints, ACF ni una capa de abstracción general.

## Entrega y revisión en el servidor

**Corrección ARIA (19-10-2026):** a partir de las auditorías facilitadas por el usuario en móvil y escritorio, las tarjetas usan `div role="group"` con su nombre y `aria-roledescription="diapositiva"`, evitando el rol `group` no permitido sobre `article`. Las estrellas usan `span role="img"` con la valoración como nombre accesible y sus iconos decorativos ocultos. Contenedor del carrusel, resumen de valoración y grupo de indicadores declaran `role="group"` para admitir sus nombres accesibles. Se conservan clases/CSS, contenido real, repeticiones identificadas, controles y comportamiento del carrusel. No se han ejecutado auditorías ni comprobaciones locales; queda pendiente repetir la auditoría en servidor tras la subida.

El fallo de rastreo de la prueba de resultados enriquecidos de Google aportado en otra captura es independiente de estos errores ARIA. La captura no despliega su causa detallada. Si el usuario ha protegido el frontal con contraseña en el `index.php` raíz, Google no puede acceder para probarlo; no se ha inspeccionado ni modificado ese archivo ni se confirma el motivo concreto del fallo. Referencias: [patrón de carrusel WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) y [ayuda de la prueba de Google](https://support.google.com/webmasters/answer/7445569?hl=es).

El usuario compila y sube `wp-content/themes/dipe-react/assets/` completo, incluido `.vite/manifest.json`, y revisa en el servidor escritorio y móvil, una tarjeta por vista, cuatro indicadores, teclado, textos, fuentes, iconos y señalización de las dos repeticiones. Esperar sus observaciones antes de ajustar. No ejecutar comprobaciones locales; la revisión pendiente de imágenes ACF también la realizará el usuario en el servidor.
