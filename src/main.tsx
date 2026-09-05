// Ensure window.fetch is writable and has a setter for environments that intercept fetch
if (typeof window !== 'undefined') {
  try {
    const origFetch = window.fetch;
    if (typeof origFetch === 'function') {
      let _current = (...args: Parameters<typeof fetch>) => origFetch.apply(window, args);
      const desc = {
        get: () => _current,
        set: (fn: typeof fetch) => {
          _current = fn;
        },
        configurable: true,
        enumerable: true,
      };
      try {
        Object.defineProperty(window, 'fetch', desc);
      } catch (_) {}
      if (typeof Window !== 'undefined' && Window.prototype) {
        try {
          Object.defineProperty(Window.prototype, 'fetch', desc);
        } catch (_) {}
      }
    }
  } catch (_) {}
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
