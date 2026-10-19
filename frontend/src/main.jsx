import 'vite/modulepreload-polyfill';
import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/styles.css';
import './styles/navigation.css';
import { App } from './app/App';
import './styles/responsive.css';
import { installNavigationTransitions } from './lib/navigationTransitions';

const root = document.getElementById('dipe-react-root');

if (root) {
  installNavigationTransitions(root);
  // La captura de destino necesita la cabecera ya montada, sin otro turno de React.
  flushSync(() => {
    createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);
  });
}
