import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against generic third-party cross-origin script errors (e.g. Disqus / external embeds)
// where the browser censors error details to "Script error." without filename or line number.
if (typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (event) => {
      if (
        event.message === 'Script error.' ||
        event.message?.includes('Script error') ||
        (!event.filename && !event.lineno)
      ) {
        event.preventDefault();
        event.stopImmediatePropagation?.();
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reason = String(event.reason?.message || event.reason || '');
      if (reason.includes('Script error')) {
        event.preventDefault();
        event.stopImmediatePropagation?.();
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
