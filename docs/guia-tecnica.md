# Guía técnica · Dipe Agency

[Volver a la portada del proyecto](../README.md)

Una web corporativa a medida: WordPress administra el contenido editorial y React construye la experiencia visual. Este repositorio conserva y explica su implementación: un frontend React, un tema ligero y el plugin propio `dipe-core`.

**Son las fuentes, no una copia completa de la web.** No incluye la biblioteca `uploads`, entradas, proyectos, base de datos, usuarios, contraseñas ni paquetes de plugins de terceros. Copiar React y subirlo a un servidor no reproduce el sitio completo: hace falta instalar WordPress, configurar las integraciones, crear contenido y aportar medios propios. Sí se conservan los textos corporativos escritos en React, iconos, fuentes y capturas de documentación.

## Cómo funciona

```text
Visitante → URL de WordPress → tema dipe-react → React en el navegador
                │                  │                    │
                │                  └─ configuración     └─ REST API
                └─ estado HTTP, SEO y contenido              │
                                                    WordPress / dipe-core
                                                             │
                                                   base de datos y medios
```

Es una arquitectura desacoplada en la presentación, cercana a WordPress headless, con una integración concreta: **React se sirve desde un tema del mismo WordPress**. WordPress conserva las URL, los estados HTTP y los metadatos. No hay un segundo servidor Node en producción ni un frontend alojado por separado.

El cuerpo de las páginas se dibuja en el navegador. Actualmente no hay SSR ni prerender del contenido principal. Yoast genera metadatos y datos estructurados en el HTML inicial; eso no sustituye el cuerpo de React ni garantiza por sí solo indexación o posicionamiento.

| Responsabilidad | Dónde se resuelve |
| --- | --- |
| Entradas, categorías, proyectos, equipo y medios | WordPress, CPT y ACF |
| Menús, logos y configuración pública | WordPress y tema |
| Estructura, textos y medios fijos de páginas corporativas | Componentes React y módulos de medios |
| Campos, REST, formularios y ajustes del negocio | Plugin `dipe-core` |
| Documento HTML, carga de recursos y metadatos | Tema `dipe-react` e integración con Yoast |
| Diseño, interacción y animación | React, CSS, Bootstrap y GSAP |

La ventaja aprovechada es combinar una administración conocida para el equipo editorial con una interfaz propia, sin depender de un constructor visual para maquetar cada sección. Cambiar estructura o texto corporativo requiere editar fuentes y generar una nueva entrega.

## Estructura del proyecto

```text
frontend/
  src/app/           composición y selección de páginas
  src/pages/         páginas y plantillas por dominio
  src/components/    secciones y elementos compartidos
  src/lib/           REST, rutas, configuración y navegación
  src/hooks/         comportamiento compartido
  src/styles/        identidad, estilos globales y responsive
wp-content/
  plugins/dipe-core/ modelo de contenido y lógica propia
  themes/dipe-react/ tema que integra WordPress con React
  mu-plugins/        utilidad opcional de contenido de prueba
docs/                decisiones, guías y planes
```

La utilidad `dipe-pagination-fixtures.php` sirve para ensayar paginación a partir de contenido existente en WordPress. No contiene entradas ni proyectos originales y no forma parte del despliegue normal en producción.

## Crear una web similar desde cero

### 1. Preparar el alojamiento e instalar WordPress

1. Preparar dominio o subdominio, HTTPS, base de datos y usuario de base de datos propios del entorno.
2. Instalar WordPress desde su distribución oficial o el instalador del hosting. Configurar conexión y claves secretas en el servidor, nunca en el repositorio.
3. Crear el administrador y ajustar idioma, zona horaria, título y enlaces permanentes.
4. Mantener el entorno de trabajo protegido a nivel de servidor mientras se prepara. Un `noindex` expresa una preferencia de indexación; no es una contraseña.

La referencia actual de WordPress recomienda PHP 8.3+, MariaDB 10.6+ o MySQL 8.0+ y HTTPS; confirmar compatibilidad con los plugins elegidos. [Requisitos oficiales](https://wordpress.org/about/requirements/).

### 2. Preparar React y Vite

El frontend usa React y React DOM, Vite con su plugin de React, Bootstrap para la base de estilos y GSAP para determinadas animaciones. Las dependencias están en `frontend/package.json`; `pnpm-lock.yaml` conserva la resolución usada por el proyecto.

Para reutilizar la base, restaurar las dependencias con pnpm desde `frontend`, respetando el lockfile. El proyecto declara pnpm 11.25.0 y el rango de Node en `engines`; describen esta base, no una recomendación universal de versiones.

Si se parte de una aplicación React nueva, reproducir estas decisiones:

- Montar la aplicación desde una entrada como `src/main.jsx` sobre `#dipe-react-root`.
- Generar recursos con rutas relativas para servirlos desde la carpeta del tema.
- Activar el manifiesto de Vite y configurar la salida en `wp-content/themes/dipe-react/assets/`.
- Hacer que el tema lea `assets/.vite/manifest.json` para cargar los nombres generados de JS y CSS.

La implementación está en [vite.config.js](../frontend/vite.config.js). La compilación se realiza fuera del hosting; producción recibe archivos estáticos. No hace falta Node en el servidor WordPress. Se mantiene el procedimiento de compilación ya acordado con el propietario, sin repetir sus comandos en esta entrega.

### 3. Crear e instalar el tema

`dipe-react` identifica el tema mediante `style.css`, usa `functions.php` para integrar WordPress y plantillas PHP para imprimir el documento y el contenedor de React. `header.php` conserva `wp_head()` y `footer.php` conserva `wp_footer()`, necesarios para WordPress y sus plugins.

El tema registra menús y logos, carga los recursos del manifiesto y publica `window.dipeSite` con datos públicos: raíz REST, URL del sitio, subdirectorio, navegación y logos. Todo lo que se envíe ahí es visible para el visitante; nunca se deben incluir secretos.

Copiar `wp-content/themes/dipe-react/` al WordPress de destino, incluyendo los assets generados, y activar el tema. El manifiesto y sus recursos deben pertenecer a la misma compilación.

### 4. Crear e instalar el plugin propio

`dipe-core` reúne aquello que debe sobrevivir a un cambio de tema: tipos de contenido, taxonomías, campos, ampliaciones REST, formularios, solicitudes, correo y ajustes de integración. Su entrada carga módulos específicos desde `includes/`.

Para reproducir el enfoque, registrar el modelo con las API de WordPress y definir los grupos ACF en PHP. Exponer por REST únicamente contenido destinado a la web y mantener solicitudes y configuración de correo fuera de la lectura pública.

Copiar `wp-content/plugins/dipe-core/` al destino y activarlo. Los grupos de campos se registran desde código; sus valores se crean en la base de datos de cada instalación. Consultar [modelo de contenido](modelo-contenido.md), [proyectos](proyectos.md) y [entradas](entradas.md).

### 5. Instalar los plugins que completan la solución

| Plugin | Función | Preparación en una instalación nueva |
| --- | --- | --- |
| ACF PRO | Datos estructurados; los repetidores de galerías necesitan PRO | Instalar desde el proveedor y configurar licencia privada; no mantener ACF gratuito en paralelo |
| Yoast SEO | Títulos, descripciones, sociales, schema y sitemap | Configurar identidad, metadatos e indexación; Premium solo si se utiliza con licencia propia |
| WP Rocket | Caché HTML y perfil compatible con React | Instalar paquete oficial y revisar los ajustes preparados por `dipe-core` |
| WebP Express | Entrega de imágenes optimizadas | Configurar conversión y entrega para el servidor; comprobar también imágenes creadas por React |
| CookieYes | Gestión del consentimiento | Completar inventario de servicios, bloqueo previo cuando corresponda y acceso a preferencias |

Yoast, Rocket y WebP Express constan en la continuidad del proyecto; su configuración efectiva en servidor no se deduce de este checkout. CookieYes es el gestor elegido y su revisión final sigue pendiente. Los paquetes externos y sus licencias se obtienen por separado.

Los formularios usan `wp_mail()` y PHPMailer de WordPress mediante código propio. No requieren Elementor ni un plugin SMTP adicional. No se añade por defecto un plugin de seguridad; los controles del hosting y el mantenimiento forman parte de la operación.

### 6. Crear páginas, navegación, contenido y medios propios

Crear las páginas nativas que correspondan a React, configurar portada y página de entradas, guardar enlaces permanentes y asignar menús. WordPress debe reconocer las URL: añadir una condición en React no crea una página en el servidor.

| URL / familia | Contenido |
| --- | --- |
| `/` | Home corporativa en React |
| `/agencia-desarrollo-web/`, `/contacto/` | Páginas corporativas |
| `/desarrollo-web/` y sus hijas | Servicios de desarrollo |
| `/blog/`, `/blog/{slug}/`, `/categoria/{slug}/` | Entradas y categorías de WordPress |
| `/proyectos/`, `/proyectos/{slug}/`, `/proyectos/categoria/{slug}/` | Proyectos y categorías |
| Legales y páginas de gracias | Páginas nativas con plantillas React |

Publicar entradas, proyectos, categorías, servicios relacionados y equipo desde WordPress. Completar ACF y medios; asignar logos y menús desde el administrador. No importar solicitudes de personas como demostración.

Los módulos como `homeMedia.js` construyen URL desde el sitio actual y nombres de archivos. **No contienen los medios:** esta base referencia archivos bajo `wp-content/uploads/2026/10/`. Para una web propia hay que aportar imágenes y vídeos y adaptar nombres y rutas en los módulos correspondientes. No se necesitan las imágenes originales de Dipe.

Los detalles están en [cabecera y footer](maquetacion-cabecera-footer.md). Las páginas corporativas se editan en React; menús y logos sí se editan en WordPress.

### 7. Maquetar y añadir movimiento

Partir del diseño y dividir cada página en secciones. `App.jsx` conserva la composición y selección de rutas; `Home.jsx` y los módulos de `pages/` conservan el contenido. Compartir lógica y componentes cuando coincidan sus responsabilidades, sin obligar a diseños distintos a usar la misma tarjeta.

La identidad se concentra en `src/styles/tokens.css` y `fonts.css`. Los estilos particulares viven junto a su sección; el responsive combina reglas compartidas y ajustes específicos. [Guía visual](guia-visual.md).

El movimiento combina CSS, observación de entrada en pantalla y GSAP en la intro, cargado de forma dinámica. La navegación tiene transiciones propias y el equipo usa un carrusel específico. Distintos componentes contemplan movimiento reducido; las nuevas animaciones deben respetarlo también.

### 8. Conectar formularios y correo

React envía a las rutas permitidas de `dipe-core`; el servidor valida y sanea, aplica honeypot y límite de frecuencia, guarda una solicitud privada e intenta notificar al equipo. Contacto internas, Servicios y Contacto principal tienen destinatarios independientes.

En **Ajustes > Correo Dipe**, configurar host, transporte seguro, usuarios, contraseñas, destinatarios y páginas de gracias reales. Los valores iniciales del plugin todavía referencian pruebas: sustituirlos en el panel para cada instalación. Las contraseñas se cifran en base de datos con material derivado de las claves de WordPress; si cambian esas claves, volver a introducir las contraseñas SMTP.

La confirmación pública acredita recepción en WordPress, sin garantizar llegada al buzón. La entrega real, privacidad, conservación de solicitudes y recuperación de contraseña necesitan revisión antes de abrir el sitio. Los CV y otros flujos siguen pendientes. [Formularios y correo](formularios.md).

### 9. Cerrar SEO, seguridad y optimización

WordPress y Yoast conservan una única salida de metadatos. Configurar títulos, descripciones, canonical, identidad, imágenes sociales y sitemap; revisar HTTP y renderizado de las URL públicas. No prometer posicionamiento por usar React o por una puntuación SEO alta en Lighthouse. [SEO del proyecto](seo.md).

La optimización combina recursos compilados, caché HTML y carga diferida propia de medios fuera de pantalla. Vídeos y GIF pesados requieren tratamiento específico; WebP no sustituye ese trabajo. El perfil de Rocket evita activar de entrada retraso de JS y otras transformaciones que puedan interferir con React. [Caché y rendimiento](cache-rendimiento.md).

Mantener actualizaciones, permisos adecuados, configuración privada y copias recuperables. Usar transporte cifrado para las subidas y proteger pruebas antes de la caché. Headless no elimina los riesgos de WordPress, REST o sus plugins. [Guía oficial de seguridad](https://developer.wordpress.org/advanced-administration/security/hardening/).

## Entrega y estado del proyecto

La entrega normal contiene `wp-content/plugins/dipe-core/` y `wp-content/themes/dipe-react/`, con todos los assets y el manifiesto. Una instalación completa necesita además WordPress, medios, datos y configuración del servidor. Git no despliega esos elementos.

El propietario compila, sube por FTP y revisa en servidor. No se realizan builds ni comprobaciones locales por iniciativa del agente. Una mejora preparada no se considera publicada o validada hasta la confirmación del propietario.

La base visual está aprobada y las funcionalidades descritas están implementadas en las fuentes, con pendientes registrados en [el estado breve](../PLAN_PARA_TERRA.md). Los informes históricos de rendimiento no miden la versión actual. Antes de publicar quedan por cerrar, entre otros, SEO/robots, medios y fuentes, entregabilidad, privacidad y configuración final de plugins.

## Publicación y presentación

- [Revisión de secretos y alcance del repositorio público](repositorio-publico.md).
- [Plan del servidor de pruebas a producción](plan-lanzamiento.md).
- [Prompt para la presentación en ChatGPT Work](prompt-presentacion-work.md), preparado para PageSpeed de varias URL y pruebas de resultados enriquecidos.
- [Auditoría previa de refactor y operación](auditoria-refactor-seguridad-2026-10-19.md).

Hacer público el repositorio no incorpora licencias de terceros ni concede automáticamente una licencia libre a todo su contenido. Antes de redistribuir las fuentes Gordita incluidas, confirmar permiso de redistribución; una licencia de uso web no acredita ese permiso. La licencia del código propio queda pendiente de elección por el titular.
