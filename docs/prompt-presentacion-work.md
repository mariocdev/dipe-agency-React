# Prompt para la presentación en ChatGPT Work

Copiar el bloque siguiente en Work y adjuntar README y evidencias disponibles. PageSpeed de varias URL y pruebas de resultados enriquecidos se pueden aportar después; los espacios quedan preparados sin inventar datos. No adjuntar credenciales, base de datos, solicitudes de clientes o configuración privada del hosting.

---

Crea una presentación breve, visual e interesante sobre el proyecto web Dipe Agency, en español de España. Audiencia: negocio y diseño con curiosidad tecnológica, sin asumir conocimientos de programación. Duración aproximada: 8–10 minutos y 10 diapositivas, con anexo de evidencias solo si hace falta. Entrega la presentación editable y notas breves para explicar cada diapositiva.

Cuenta cómo hemos construido una web de diseño propio con WordPress y React, qué decisiones hemos tomado y qué resultados podemos demostrar. Relaciona cada tecnología con su utilidad. Usa diagramas sencillos, capturas reales que te facilite, poco texto y títulos con una idea concreta. Tono cercano y profesional, sin exageraciones.

## Fuentes y rigor

Te aportaré README y, si procede, documentación, capturas, informes PageSpeed Insights de varias URL y resultados de Rich Results Test u otra herramienta de schema. Usa esos materiales como base. Si te doy un enlace al repositorio, revisa su README actual antes de describir la implementación.

Separa lo implementado en código, lo confirmado en servidor y las mejoras futuras. Un archivo o plan no acredita publicación. No presentes cifras históricas como resultados actuales si no las identifico como parte de una comparación. Si hay contradicciones entre evidencias, indícalas en las notas.

Si faltan informes o capturas, crea igualmente la presentación y marca el espacio correspondiente «Pendiente de aportar». No inventes métricas, gráficas, reseñas, porcentajes ni capturas de herramientas. No esperes esos datos para preparar el resto.

## Arquitectura que debes explicar correctamente

- WordPress administra entradas, categorías, proyectos, equipo, medios, menús y logos. La estructura y textos de páginas corporativas están en React; no todo es editable en WordPress.
- Explica headless como separar gestión de contenido y presentación mediante una API. Aclara después nuestro enfoque: React se carga dentro de un tema del mismo WordPress, que conserva URL, estados HTTP y metadatos. No hay un segundo servidor Node en producción.
- React y Vite generan interfaz y recursos estáticos. El tema `dipe-react` carga esos recursos y configuración pública. El plugin `dipe-core` define contenido estructurado, campos, REST, formularios y ajustes.
- El cuerpo se dibuja en el navegador; no hay SSR ni prerender en la versión documentada. No atribuyas mejoras automáticas de SEO o velocidad a React o headless.
- ACF PRO estructura datos; Yoast aporta metadatos, schema y sitemap; Rocket se usa para caché; WebP Express para imágenes; CookieYes es el gestor de consentimiento elegido. Distingue configuración confirmada de pendientes según los materiales.
- Diseño con CSS propio, tokens y base Bootstrap; GSAP en la intro y movimiento mediante CSS y observadores. Hay tratamientos de movimiento reducido, sin que eso certifique accesibilidad.
- Formularios propios: validación y protecciones básicas en servidor, solicitudes privadas y avisos con WordPress/PHPMailer. Guardado correcto y recepción en el buzón son diferentes. No se usa un constructor visual o un plugin de formularios para este flujo.
- El repositorio comparte fuentes, tema y plugin propio; no uploads, base de datos, entradas, proyectos, secretos o paquetes externos. Clonarlo no reconstruye la web completa. El diseño y textos corporativos escritos en React sí son visibles.

## Guion de diez diapositivas

1. **Una web de agencia con identidad propia.** Objetivo y captura protagonista real si la aporto. Reto: diseño a medida y administración sencilla del contenido.
2. **WordPress gestiona; React presenta.** Explica headless con un diagrama y sitúa la integración concreta: visitante → WordPress/tema → React ↔ REST/contenido.
3. **Tres piezas con funciones claras.** React, tema y plugin propio, cada uno relacionado con un ejemplo visible y comprensible.
4. **Del WordPress vacío a una web propia.** Alojamiento/WordPress → modelo editorial/ACF → tema/React → maquetación/responsive → animaciones → integraciones/entrega. No incluyas instalar Git ni configurar el ordenador.
5. **Diseño propio y contenido que se puede mantener.** Tabla de qué se edita en WordPress y qué requiere código. Enseña corporativas, blog y proyectos con ejemplos reales; explica identidad y movimiento.
6. **Cada integración tiene una función.** ACF, Yoast, Rocket, WebP Express, CookieYes y formularios propios. Beneficios buscados, mantenimiento, permisos y copias. No afirmes que la web sea invulnerable ni que todo esté configurado si no hay evidencia.
7. **Rendimiento medido en varias páginas.** Tabla o gráfica por URL y modo con los PageSpeed aportados. No limitarse a Home ni seleccionar solo el mejor resultado. Lectura breve: qué funciona y qué mejora respalda el informe.
8. **SEO técnico y datos estructurados con evidencias.** Puntuaciones SEO de Lighthouse y pruebas de resultados enriquecidos, explicando su distinto alcance. Captura recortada legible y resumen de tipos, errores y advertencias; detalles al anexo.
9. **De pruebas al dominio real.** Copia recuperable, migración privada de medios/datos, dominio y correo, revisión pública, caché/SEO y vuelta atrás. Indica el estado real, sin dar el lanzamiento por ejecutado.
10. **Qué hemos conseguido y qué sigue.** Tres resultados o aprendizajes respaldados: diseño propio, gestión editorial y separación de responsabilidades. Pendientes reales y repositorio para aprender, sin entregar el contenido original completo.

## Integración de PageSpeed y resultados enriquecidos

Para cada informe conserva URL exacta, plantilla, fecha, móvil/escritorio y enlace o nombre del archivo. Indica pruebas/producción y estado del loader si se conoce. Una ejecución es una medición puntual; si hay varias comparables, explica cómo las resumes sin escoger solo la mejor.

En la diapositiva principal incluye rendimiento, SEO, LCP y CLS según espacio. Lleva accesibilidad, buenas prácticas, FCP, TBT y detalles al anexo cuando haga falta. Conserva unidades. Separa laboratorio Lighthouse de campo CrUX; indica si los datos reales son de URL, de origen o no están disponibles. TBT no es INP. No mezcles móvil con escritorio ni uses una media global que oculte diferencias entre plantillas.

La puntuación SEO revisa aspectos técnicos concretos; no demuestra ranking, tráfico o indexación. La puntuación de accesibilidad tampoco certifica conformidad completa. Los datos de campo pueden reflejar un periodo anterior a la última versión: evita atribuirlos sin más al último cambio.

En Rich Results Test indica URL, fecha, tipos compatibles detectados, errores y advertencias. Si empleo otra herramienta, identifica si valida sintaxis/schema o elegibilidad para funciones de Google. «Marcado válido» no significa «Google mostrará un resultado enriquecido». No asumas que todo schema válido sea compatible con resultados enriquecidos ni añadas estrellas o reseñas sin acreditar.

Un antes/después necesita informes comparables. Expresa las diferencias de puntuación en puntos (por ejemplo, de 70 a 80 son 10 puntos) y usa porcentajes solo para variaciones relativas calculadas con base válida. No atribuyas causalidad a un plugin sin evidencia que permita aislarla.

## Diseño y entrega

Usa blanco, negro y naranja según la identidad aportada. No inventes el logo ni distribuyas fuentes comerciales: si no tienes autorización o acceso a Gordita, usa una alternativa disponible. Una idea principal y pocas frases por diapositiva; detalles en notas. Prioriza capturas reales, diagramas y gráficas de datos facilitados.

Coloca fuentes y fechas junto a las evidencias o en sus notas. No incluyas correos personales, usuarios SMTP, secretos, solicitudes reales o configuración privada. Al entregar señala qué diapositivas tienen datos pendientes y qué material falta, sin bloquear las demás.

---

Referencias para interpretar informes: [PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about), [datos estructurados de Google](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data) y [SEO con JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
