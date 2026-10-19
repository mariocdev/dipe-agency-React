// Rutas y títulos de las plantillas disponibles. El destino después de enviar
// se configura en Correo Dipe y lo devuelve el servidor.
export const formThankYouPages = {
  contacto: {
    path: '/gracias-por-contactar-internas/',
    title: 'Muchas gracias por tu mensaje',
  },
  'contacto-servicios': {
    path: '/gracias-por-contactar-servicios/',
    title: 'Muchas gracias por tu consulta',
  },
  'contacto-general': {
    path: '/gracias-por-contactar/',
    title: 'Muchas gracias por contactar',
  },
};

// Llamar solo después de recibir una respuesta de envío aceptado.
export function redirectToFormThankYou(redirectUrl) {
  if (typeof redirectUrl !== 'string' || !redirectUrl.trim()) return false;
  try {
    const destination = new URL(redirectUrl, window.location.href);
    if (!['http:', 'https:'].includes(destination.protocol) || destination.origin !== window.location.origin || destination.username || destination.password) return false;
    window.location.assign(destination.href);
    return true;
  } catch {
    return false;
  }
}
