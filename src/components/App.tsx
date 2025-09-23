import { useEffect, useRef, useCallback } from "react";
import buffer from "buffer";
import {
  ExpressionSpecification,
  latest,
} from "@maplibre/maplibre-gl-style-spec";

import AppLayout from "./pages/AppLayout";

import {
  initialStyleUrl,
  loadStyleUrl,
  removeStyleQuerystring,
} from "../libs/urlopen";
import LayerWatcher from "../libs/layerwatcher";
import {
  addFloorFilter,
  hasFloorFilter,
  removeFloorFilter,
} from "../libs/floor-filter";
import { useSitumSDK } from "@/providers/SitumSDKProvider";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSpec,
  selectMapStyle,
  setVectorLayers,
} from "../store/slices/styleCoreSlice";
import {
  setSelectedFloorId,
  setFloorIds,
  selectSelectedFloorId,
  selectFloorIds,
  selectBuildingId,
  setBuildingId,
  selectApiKey,
  selectEnvironment,
  setApiKey,
  setEnvironment,
} from "../store/slices/uiCoreSlice";
import useStyleEdition from "../hooks/useStyleEdition";
import useShortcuts from "../hooks/useShortcuts";
import useStyleStore from "../hooks/useStyleStore";
import useLayerEdition from "../hooks/useLayerEdition";
import {
  APIKEY_METADATA_KEY,
  BUILDING_ID_METADATA_KEY,
  ENVIRONMENT_METADATA_KEY,
} from "@/constants";

// Buffer must be defined globally for @maplibre/maplibre-gl-style-styleSpec validate() function to succeed.
window.Buffer = buffer.Buffer;

const App = () => {
  const dispatch = useAppDispatch();

  const mapStyle = useAppSelector(selectMapStyle);
  const selectedFloorId = useAppSelector(selectSelectedFloorId);
  const floorIds = useAppSelector(selectFloorIds);
  const buildingId = useAppSelector(selectBuildingId);
  const apiKey = useAppSelector(selectApiKey);
  const environment = useAppSelector(selectEnvironment);

  // Refs for stores and watchers
  const layerWatcherRef = useRef<LayerWatcher>();

  // Hooks
  const { onStyleChanged } = useStyleEdition();
  const { onLayersChange } = useLayerEdition();
  useShortcuts();
  const { initializeStoredStyles, loadLatestStoredStyle } = useStyleStore();
  const { getBuildingById } = useSitumSDK();

  // Initialize store on first render
  useEffect(() => {
    initializeStoredStyles();
    const styleUrl = initialStyleUrl();
    if (
      styleUrl &&
      window.confirm(
        "Load style from URL: " + styleUrl + " and discard current changes?",
      )
    ) {
      loadStyleUrl(styleUrl, (mapStyle) => onStyleChanged(mapStyle));
      removeStyleQuerystring();
    } else {
      console.log("Falling back to local storage for storing styles");
      if (styleUrl) {
        removeStyleQuerystring();
      }
      loadLatestStoredStyle((mapStyle) => {
        onStyleChanged(mapStyle, { initialLoad: true });
      });
    }

    // Initialize layer watcher
    layerWatcherRef.current = new LayerWatcher({
      onVectorLayersChange: (v) => dispatch(setVectorLayers(v)),
    });

    // Set initial styleSpec
    dispatch(setSpec(latest));
  }, []);

  // Floor and SitumSDK effects
  useEffect(() => {
    if (selectedFloorId !== undefined) {
      updateLayersForNewFloorId(selectedFloorId);
    }
  }, [selectedFloorId]);

  useEffect(() => {
    if (floorIds.length > 0 && selectedFloorId === undefined) {
      dispatch(setSelectedFloorId(floorIds[0]));
    }
  }, [floorIds, selectedFloorId, dispatch]);

  // Helper functions
  const updateLayersForNewFloorId = useCallback(
    (floorId?: number) => {
      if (floorId == null) return;

      const changedLayers = mapStyle.layers.map((layer) => {
        if (!("filter" in layer)) {
          return layer;
        }

        const existingFilter = layer.filter as ExpressionSpecification;

        if (!hasFloorFilter(existingFilter)) {
          return layer;
        }

        const newFilter = addFloorFilter(
          removeFloorFilter(existingFilter),
          floorId,
        );

        return {
          ...layer,
          filter: newFilter,
        };
      });

      onLayersChange(changedLayers);
    },
    [mapStyle.layers],
  );

  // Sync between style metadata and situm data
  useEffect(() => {
    // @ts-ignore
    const storedBuildingId = mapStyle?.metadata?.[BUILDING_ID_METADATA_KEY];
    // @ts-ignore
    const storedApiKey = mapStyle?.metadata?.[APIKEY_METADATA_KEY];
    // @ts-ignore
    const storedEnvironment = mapStyle?.metadata?.[ENVIRONMENT_METADATA_KEY];

    if (storedBuildingId !== buildingId) {
      dispatch(setBuildingId(storedBuildingId));
    }

    if (storedApiKey !== apiKey) {
      dispatch(setApiKey(storedApiKey));
    }

    if (storedEnvironment !== environment) {
      if (storedEnvironment == null || storedEnvironment == undefined) {
        dispatch(setEnvironment("pro"));
        return;
      }
      dispatch(setEnvironment(storedEnvironment));
    }
  }, [
    //@ts-ignore
    mapStyle?.metadata?.[BUILDING_ID_METADATA_KEY],
    //@ts-ignore
    mapStyle?.metadata?.[APIKEY_METADATA_KEY],
    //@ts-ignore
    mapStyle?.metadata?.[ENVIRONMENT_METADATA_KEY],
  ]);

  // Load situm building data
  useEffect(() => {
    if (buildingId) {
      getBuildingById(buildingId as number)
        .then((building) => {
          const floorIds = building.floors
            .slice()
            .sort((a, b) => b.level - a.level)
            .map((floor) => floor.id);
          dispatch(setFloorIds(floorIds));
        })
        .catch((e) => {
          console.error(`Could not set floors: ${e}`);
        });
    } else if (floorIds.length > 0) {
      dispatch(setFloorIds([]));
    }
  }, [buildingId, dispatch, floorIds.length]);

  return <AppLayout />;
};

export default App;
