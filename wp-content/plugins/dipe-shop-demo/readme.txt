=== Dipe — preparación de tienda demo ===
Version: 1.0.0
Requires PHP: 8.2
Requires Plugins: woocommerce

Plugin temporal e independiente de dipe-core. No modifica datos al activarse.

Instalación:
1. Instalar el ZIP desde Plugins > Añadir plugin > Subir plugin y activarlo.
2. Abrir Herramientas > Tienda demo Dipe con un administrador.
3. Pulsar Crear / completar catálogo demo y mantener la pantalla abierta.
4. Revisar el formulario y pulsar Aplicar estos ajustes si se desean esos cambios.

Crea 12 productos físicos ficticios, 20 variaciones, 3 categorías, 4 etiquetas,
Color y Talla globales, ofertas, productos agotados y una imagen provisional.
Los productos se publican como DEMO. No se crean pedidos, usuarios o reseñas.
Las ediciones de productos ya completados se respetan al repetir la creación.

Los ajustes son opcionales y afectan a toda la tienda: moneda elegida,
gestión de stock, visibilidad de agotados, reseñas de compradores verificados
y páginas nativas que falten. El envío de ejemplo está desmarcado por defecto;
solo crea una zona si no hay previamente zonas ni métodos de envío.

No configura pasarelas ni desactiva las existentes. Utilizar en la instalación
de pruebas, con los cobros reales desactivados. No cambia reglas fiscales,
datos del negocio, cuentas, destinatarios o enlaces permanentes existentes.
Los productos y el envío de esta demo se crean sin impuestos.

Retirada:
- Enviar productos demo a la papelera afecta solo a los productos marcados
  y sus variaciones. Conserva categorías, etiquetas, atributos, imagen,
  páginas y ajustes. No elimina pedidos ni productos ajenos.
- Si la papelera está desactivada, se rechaza la retirada para evitar borrar
  definitivamente. WordPress conserva su política habitual de vaciado.
- Crear de nuevo restaura los productos demo que estén en papelera.
- Desactivar o borrar el plugin conserva el catálogo y la configuración.

No añade pantallas a React ni hace FTP. Revisar el resultado en el servidor.
No incluye WooCommerce; debe instalarse por separado.
