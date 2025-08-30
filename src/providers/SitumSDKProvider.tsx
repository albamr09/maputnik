import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import SitumSDK, { Building } from "@situm/sdk-js";
import { useAppSelector } from "../store/hooks";
import { selectMapStyle } from "../store/slices/styleCoreSlice";

interface SitumSDKContextType {
  isAuthenticated: boolean;
  getBuildingById: (id: number) => Promise<Building>;
  getJWT: () => string | undefined;
}

const SitumSDKContext = createContext<SitumSDKContextType | undefined>(
  undefined
);

export const SitumSDKProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Redux
  const mapStyle = useAppSelector(selectMapStyle);

  // State
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const situmAPI = useMemo(() => {
    // @ts-ignore
    const apiKey = mapStyle?.metadata?.["maputnik:situm-apikey"];
    if (!apiKey) return;

    setIsAuthenticated(true);

    return new SitumSDK({
      auth: {
        apiKey: apiKey,
      },
    });
  }, [mapStyle?.metadata]);

  const getBuildingById: SitumSDKContextType["getBuildingById"] = useCallback(
    (id) => {
      if (!situmAPI) {
        return new Promise((_resolve, reject) =>
          reject("Situm API has not been initialized")
        );
      }

      return situmAPI.cartography.getBuildingById(id);
    },
    [situmAPI]
  );

  const getJWT: SitumSDKContextType["getJWT"] = useCallback(
    () => {
      if (!situmAPI) {
        return;
      }

      return situmAPI.jwt;
    },
    [situmAPI]
  );

  return (
    <SitumSDKContext.Provider value={{ isAuthenticated, getBuildingById, getJWT }}>
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
