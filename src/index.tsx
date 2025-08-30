import { IconContext } from "react-icons";
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import './favicon.ico'
import './styles/index.scss'
import './i18n';
import App from './components/App';
import { store } from './store';

const appContainer = document.querySelector("#app");
if (!appContainer) {
  throw new Error('App container element not found');
}
const root = createRoot(appContainer);
root.render(
  <Provider store={store}>
    <IconContext.Provider value={{ className: 'react-icons' }}>
      <App />
    </IconContext.Provider>
  </Provider>
);

// Hide the loader.
const loader = document.querySelector(".loading") as HTMLElement | null;
if (loader) {
  loader.style.display = "none";
}
