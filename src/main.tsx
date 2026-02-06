import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { RestTimerProvider } from './contexts/RestTimerContext';
import { App } from './App';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <HashRouter>
      <RestTimerProvider>
        <App />
      </RestTimerProvider>
    </HashRouter>
  </StrictMode>,
);
