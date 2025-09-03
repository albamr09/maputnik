import { useEffect, useRef, useCallback } from "react";
import buffer from "buffer";
import { Map, StyleSpecification, LngLat } from "maplibre-gl";
import {
  ExpressionSpecification,
  latest,
} from "@maplibre/maplibre-gl-style-spec";

import MapMaplibreGl from "./MapMaplibreGl";
import MapOpenLayers from "./MapOpenLayers";
import AppLayout from "./pages/AppLayout";

import style from "../libs/style";
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
import { useSitumSDK } from "../providers/SitumSDKProvider";

import { useAppDispatch, useAppSelector } from "../store/hooks";
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
} from "../store/slices/uiCoreSlice";
import useStyleEdition from "../hooks/useStyleEdition";
import useShortcuts from "../hooks/useShortcuts";
import useStyleStore from "../hooks/useStyleStore";
import useLayerEdition from "../hooks/useLayerEdition";

// Buffer must be defined globally for @maplibre/maplibre-gl-style-styleSpec validate() function to succeed.
window.Buffer = buffer.Buffer;

const App = () => {
  const dispatch = useAppDispatch();

  const mapStyle = useAppSelector(selectMapStyle);
  const selectedFloorId = useAppSelector(selectSelectedFloorId);
  const floorIds = useAppSelector(selectFloorIds);

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
        "Load style from URL: " + styleUrl + " and discard current changes?"
      )
    ) {
      loadStyleUrl(styleUrl, (mapStyle) => onStyleChanged(mapStyle));
      removeStyleQuerystring();
    } else {
      console.log("Falling back to local storage for storing styles");
      styleUrl && removeStyleQuerystring();
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
          floorId
        );

        return {
          ...layer,
          filter: newFilter,
        };
      });

      onLayersChange(changedLayers);
    },
    [mapStyle.layers]
  );

  // Floor and SitumSDK effects
  useEffect(() => {
    // @ts-ignore
    const buildingID = mapStyle?.metadata?.["maputnik:situm-building-id"];

    if (buildingID) {
      getBuildingById(buildingID as number)
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
  }, [mapStyle.metadata, dispatch, floorIds.length]);

  return <AppLayout />;
};

export default App;
