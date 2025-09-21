import { IconContext } from "react-icons";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import "@/styles/index.scss";
import "@/i18n";
import App from "@/components/App";
import { store } from "@/store";
import { SitumSDKProvider } from "@/providers/SitumSDKProvider";
import { Toaster } from "@/components/atoms/sonner";

const appContainer = document.querySelector("#app");
if (!appContainer) {
  throw new Error("App container element not found");
}

const root = createRoot(appContainer);

root.render(
  <Provider store={store}>
    <SitumSDKProvider>
      <IconContext.Provider value={{ className: "react-icons" }}>
        <App />
      </IconContext.Provider>
      <Toaster richColors />
    </SitumSDKProvider>
  </Provider>,
);

// Hide the loader.
const loader = document.querySelector(".loading") as HTMLElement | null;
if (loader) {
  loader.style.display = "none";
}
