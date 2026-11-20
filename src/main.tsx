import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// A refresh always starts at the hero (and replays the opening), never mid-page:
// no restored scroll position, and no stale #section in the address bar.
if (window.location.hash) {
  history.replaceState(history.state, '', window.location.pathname + window.location.search);
}
// Set after replaceState, which can reset the mode.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
// Some browsers restore the old position only once loading finishes; pin to the top again then.
window.addEventListener('load', () => window.scrollTo(0, 0), { once: true });
window.addEventListener('pageshow', (ev) => {
  if (ev.persisted) window.scrollTo(0, 0);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
