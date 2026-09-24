import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces/opsz.css';
import './styles/tokens.css';
import './styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const container = document.getElementById('root');
if (!container) throw new Error('Elemento #root não encontrado no index.html.');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
