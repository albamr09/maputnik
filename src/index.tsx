import { createRoot } from "react-dom/client";
import { IconContext } from "react-icons";
import { Provider } from "react-redux";

import "@/styles/index.scss";
import "@/i18n";
import App from "@/components/App";
import { Toaster } from "@/components/atoms/sonner";
import { SitumSDKProvider } from "@/providers/SitumSDKProvider";
import { store } from "@/store";

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
