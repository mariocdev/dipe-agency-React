import 'vite/modulepreload-polyfill';
import React from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/styles.css';
import { App } from './app/App';

const root = document.getElementById('dipe-react-root');

if (root) {
  createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);
}
