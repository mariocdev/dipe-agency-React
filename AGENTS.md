# Dipe Agency: instrucciones de trabajo

## Inicio y alcance

- Lee `PLAN_PARA_TERRA.md` para el estado breve. Antes de editar, ejecuta `git status --short` una vez y conserva el trabajo ajeno. Consulta solo las secciones de `CONTEXTO-PROYECTO.md` imprescindibles para continuidad o decisiones de alcance; abre únicamente los archivos específicos de la tarea. Evita volcados extensos de archivos o diffs y no amplíes el trabajo más allá de lo pedido.
- El usuario publica por FTP y revisa todos los cambios en el servidor. Trabaja en iteraciones pequeñas, entrega los archivos exactos para subir y espera sus observaciones. No declares una vista validada antes de esa revisión.

## Arquitectura y contenido

- WordPress resuelve URL y estado HTTP y administra menús, logos, entradas y CPT. `dipe-core` define CPT/ACF/REST; el tema aporta shell, configuración pública y metadatos. Home y páginas corporativas tienen estructura, texto e imágenes fijas en React; menús y logos sí son editables en WordPress.
- Rutas: `/blog/`, `/blog/{slug}/`, `/categoria/{slug}/` y `/proyectos/`. Mantén `App.jsx` como composición y rutas; usa componentes por sección/plantilla y `Home.jsx` para contenido fijo de Home. Comparte lógica de dominio, no tarjetas visuales de diseños distintos.
- Usa `tokens.css` y `fonts.css` para identidad visual. Deja los ajustes únicos en CSS de sección y separa `styles.css` gradualmente al tocar cada sección, conservando cascada y responsive.
- No añadas el dominio temporal de pruebas a React/CSS. Centraliza los medios fijos desde la URL del sitio o assets locales; el contenido editorial viene de REST. Para imágenes ACF usa `acf_format=standard` cuando necesites el objeto completo, reutiliza `projectHomeCardImage` y basa correcciones en respuestas reales del servidor. Prefiere texto a HTML inyectado en títulos.
- Las cuatro tarjetas de reseñas representan dos opiniones reales repetidas e identificadas; no inventes testimonios ni infles la valoración. Detalles en `docs/resenas-home.md`.
- Contacto ya está conectado: React envía y `dipe-core` valida, registra y usa `wp_mail()`/PHPMailer. Para cambios de formularios lee `docs/formularios.md`. Los demás formularios, confirmaciones, retención/borrado y CV protegidos siguen pendientes. No supongas campos o destinatarios. Buzones y contraseñas se configuran en **Ajustes > Correo Dipe**, nunca en Git. Prioriza sencillez y rendimiento; evita por defecto Elementor y plugins nuevos de formularios/SMTP. CookieYes será el único gestor de cookies.

## Revisión y cierre

- No hagas comprobaciones locales por iniciativa propia: servidor de desarrollo, navegador, capturas, tests, lint, `git diff --check`, llamadas de prueba a API ni rondas visuales. No compiles: el usuario hará sus builds y subidas FTP. El comando se le entrega una sola vez en la conversación del 18-10-2026; no lo repitas en futuras entregas. Las instrucciones antiguas de prueba quedan subordinadas a esta regla.
- En una tarea de programación relevante, actualiza `CONTEXTO-PROYECTO.md` con hechos, decisiones y pendientes; versiona la documentación junto al código correspondiente. No crees abstracciones o pruebas que dupliquen código existente.
- GitHub es la fuente de verdad. Codex Desktop edita localmente y Codex Cloud trabaja mediante ramas y PR. No sobrescribas cambios ajenos ni uses Git destructivo. Prepara commit/push en rama de trabajo cuando esté autorizado y sea seguro; nunca hagas merge o push directo a `main` sin autorización expresa. Indica PR pendientes y si hace falta `git pull` local.
- Git no despliega: no hagas FTP automático ni modifiques producción sin autorización expresa. Registra una versión como publicada solo tras confirmación del usuario. Al cerrar, enumera archivos modificados, archivos FTP y siguiente paso.
