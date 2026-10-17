# Prueba vertical: Muestras

Ejecutar después de instalar WordPress, activar `dipe-core` y compilar/activar el tema.

1. En **Muestras > Añadir nueva**, crea y publica dos elementos con título, extracto, imagen destacada, cliente y URL externa opcional.
2. Visita `/muestras/`: deben aparecer ambos elementos, sus imágenes (si existen) y enlaces de detalle.
3. Abre cada detalle y después recarga directamente la URL: WordPress debe responder 200 y React debe mostrar el mismo elemento.
4. Despublica uno desde `wp-admin`, vuelve al listado sin recompilar y confirma que ya no aparece.
5. Visita una ruta inexistente: debe devolver HTTP 404 y mostrar la pantalla de “Página no encontrada”; no debe responder 200 como una SPA genérica.
6. Comprueba el endpoint publicado: `/wp-json/wp/v2/dipe-items?status=publish`.
7. Si Varnish está activo, repite el paso 4 después de purgar la URL o esperar al TTL. Anota el comportamiento real del hosting antes de configurar producción.

Resultado esperado: el contenido cambia al publicar/despublicar en WordPress; sólo los cambios de código requieren `npm run build` y una nueva subida del tema.
