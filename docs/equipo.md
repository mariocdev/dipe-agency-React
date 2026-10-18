# Equipo DIPE y página de agencia

Estado al 18-10-2026: el usuario aprueba expresamente el estado actual de todos los archivos locales como «PERFECTO», incluida Agencia y el equipo, y autoriza su consolidación en `main`. Las aprobaciones concretas del carrusel/alturas/recolocación se mantienen. No se conoce un commit exacto desplegado ni se presupone comprobado todo el flujo administrativo. Para nuevas páginas, consultar `docs/guia-visual.md`; para el checkpoint Git, `CONTEXTO-PROYECTO.md`.

## Página corporativa

El usuario crea y publica la página de WordPress con slug `agencia-desarrollo-web`. React resuelve `/agencia-desarrollo-web/`; WordPress mantiene el control de su URL, estado HTTP y metadatos.

`frontend/src/pages/agency/Agency.jsx` compone el contenido fijo del PDF: cabecera, quiénes somos, misión/visión/valores, servicios, equipo, proceso, FAQ y contacto. `agencyMedia.js` ya conecta `Banner-agencia.png`, `Mision.png`, `Vision.png`, `Valores.png` y `Como-trabajamos.png` mediante `homeMedia`; banner y proceso usan imagen, con vídeo nulo expresamente. Las tres tarjetas de servicios reutilizan las imágenes existentes. Las FAQ empiezan cerradas; la primera respuesta viene del PDF, dos se reutilizan de Home y las de tecnología y presupuesto son borradores a revisar. Solo esta página elimina el margen exterior anterior a las FAQ; no generalizarlo a los servicios.

No se copia el texto de instrucción «Aquí va una cuadrícula…» ni se crean las personas de ejemplo repetidas del PDF.

## Añadir personas

En **Equipo DIPE > Añadir persona**:

1. Escribir el **Nombre** en el campo principal de título.
2. Subir o elegir la **Imagen**.
3. Introducir el **Cargo**.
4. Añadir una **Frase** personal, opcional.
5. Publicar para que aparezca en el carrusel. Un borrador conserva la ficha sin mostrarla en la web.

El nombre utiliza el título nativo. Imagen, Cargo y Frase son campos ACF registrados por `dipe-core/includes/team.php`; requieren el ACF Pro existente. El icono del menú procede del icono del sitio (favicon) configurado en WordPress; si falta, se usa el icono nativo de grupo.

`dipe_equipo` dispone de administración, pero no de archivo, URL individual, búsqueda pública ni REST individual. No se crean reglas de reescritura ni hace falta regenerarlas por este CPT.

## Orden del carrusel

En **Equipo DIPE > Ordenar carrusel**, arrastrar las personas o utilizar las flechas Subir/Bajar y pulsar **Guardar orden**. Se utiliza el orden nativo `menu_order`; en caso de empate, el ID ascendente. También puede ajustarse el número Orden en la ficha.

La pantalla incluye borradores y otras fichas no eliminadas, pero el carrusel solo toma las publicadas. El guardado requiere nonce, permiso de edición y la lista completa vigente; si otra edición cambia el conjunto de personas, se solicita recargar antes de guardar.

## Datos públicos y carrusel

`GET /wp-json/dipe/v1/equipo` devuelve únicamente fichas publicadas, sin contraseña y con nombre, ordenadas en el servidor. El contrato es una lista de `{ id, name, image, role, quote }`; `image` es nulo o contiene `{ url, width, height, alt }`. No expone enlaces, datos privados ni operaciones de escritura.

React usa `getTeamMembers()` y `TeamCarousel.jsx`: desplazamiento nativo con touch/trackpad, arrastre con ratón y captura del puntero, botones, flechas de teclado e Inicio/Fin. Se ven 4/3/2/1 tarjetas completas según el ancho; el degradado solo afecta a tarjetas recortadas durante el desplazamiento. Incluye indicador de avance y hover de tarjeta/foto. No repite personas ni reproduce automáticamente el carrusel. Si no hay personas publicadas, se omite la sección; si falla la carga, se muestra un mensaje de error. No se debe confundir una API ausente con una lista vacía.

`useEqualizedBlockSize` iguala por separado nombres y cargos al mayor alto de toda la colección, incluso en tarjetas fuera de pantalla; recibe `state.members` como clave para recalcular tras la carga REST, además del redimensionado y las fuentes. Se conserva el espacio de un cargo vacío. Al soltar el ratón se aplica inercia limitada a un paso y recolocación de 720 ms con aceleración/frenado suaves. Mantener `scroll-snap-type: none` durante arrastre **y** recolocación, restaurándolo solo al llegar: activarlo antes provocaba el salto corregido. Nueva interacción interrumpe la animación y se respeta movimiento reducido.

El formulario de esta página reutiliza **Contacto internas**, con origen `agencia`, mostrado como **Agencia / Quiénes somos**, y su URL concreta. Conserva los campos, destinatarios y transporte ya configurados; no crea un tipo ni una lista de destinatarios adicionales.

## Entrega

Subir primero los archivos nuevos `dipe-core/includes/team.php`, `dipe-core/admin/team.css` y `dipe-core/admin/team-order.js`; también `dipe-core/includes/form-submissions.php`, que añade la etiqueta de origen. Subir `dipe-core/dipe-core.php` después de sus dependencias.

Tras la compilación del usuario, subir los assets completos del tema con `assets/.vite/manifest.json`. El código fuente y esta documentación no se suben como archivos públicos.

Sin confirmación específica del flujo completo en servidor: icono del menú, altas/campos, publicación/borradores, guardado del orden, todos los anchos responsive, FAQ, anclas y envío del formulario. El usuario sí ha aprobado el carrusel y las alturas; no pedir repetir esa revisión como requisito para seguir maquetando. Codex no ha ejecutado builds, pruebas, navegador ni comprobaciones locales.
