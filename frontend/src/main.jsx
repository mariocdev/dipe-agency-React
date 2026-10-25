import 'vite/modulepreload-polyfill';
import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/styles.css';
import './styles/navigation.css';
import { App, loadAppPage } from './app/App';
import { installNavigationTransitions } from './lib/navigationTransitions';

const root = document.getElementById('dipe-react-root');

async function mountApp() {
  let page;
  try {
    page = await loadAppPage();
    // Las reglas globales de adaptación siguen después de todos los estilos de la vista.
    await import('./styles/responsive.css');
  } catch {
    page = <div className="container py-5" role="alert"><p>No se ha podido cargar la página. Vuelve a intentarlo.</p><button className="btn btn-outline-dark" type="button" onClick={() => window.location.reload()}>Recargar página</button></div>;
  }
  // La captura de destino necesita la cabecera ya montada, sin otro turno de React.
  flushSync(() => {
    createRoot(root).render(<React.StrictMode><App page={page} /></React.StrictMode>);
  });
}

if (root) {
  installNavigationTransitions(root);
  mountApp();
}
