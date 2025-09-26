import SitumSDK, { Building } from "@situm/sdk-js";
import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { selectApiKey, selectEnvironment } from "@/store/slices/uiSlice";
import { useAppSelector } from "../store/hooks";

interface SitumSDKContextType {
	isAuthenticated: boolean;
	getBuildingById: (id: number) => Promise<Building>;
	getJWT: () => string | undefined;
}

const SitumSDKContext = createContext<SitumSDKContextType | undefined>(
	undefined,
);

export const SitumSDKProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	// Redux
	const apiKey = useAppSelector(selectApiKey);
	const environment = useAppSelector(selectEnvironment);

	// State
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const situmAPI = useMemo(() => {
		if (!apiKey) return;

		setIsAuthenticated(true);

		const situmSDK = new SitumSDK({
			auth: {
				apiKey,
			},
			domain: `https://${environment}.situm.com`,
		});

		// Authenticate: only needed so JWT is not null
		situmSDK.authSession;

		return situmSDK;
	}, [apiKey, environment]);

	const getBuildingById: SitumSDKContextType["getBuildingById"] = useCallback(
		(id) => {
			if (!situmAPI) {
				return new Promise((_resolve, reject) =>
					reject("Situm API has not been initialized"),
				);
			}

			return situmAPI.cartography.getBuildingById(id);
		},
		[situmAPI],
	);

	const getJWT: SitumSDKContextType["getJWT"] = useCallback(() => {
		if (!situmAPI) {
			return;
		}

		return situmAPI.jwt;
	}, [situmAPI]);

	return (
		<SitumSDKContext.Provider
			value={{ isAuthenticated, getBuildingById, getJWT }}
		>
			{children}
		</SitumSDKContext.Provider>
	);
};

export const useSitumSDK = (): SitumSDKContextType => {
	const context = useContext(SitumSDKContext);
	if (context === undefined) {
		throw new Error("useSitumSDK must be used within a SitumSDKProvider");
	}
	return context;
};
