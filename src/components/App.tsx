import { useEffect, useRef, useCallback } from "react";
import cloneDeep from "lodash.clonedeep";
import clamp from "lodash.clamp";
import buffer from "buffer";
import get from "lodash.get";
import { unset } from "lodash";
import { arrayMoveMutable } from "array-move";
import hash from "string-hash";
import { PMTiles } from "pmtiles";
import {
  Map,
  LayerSpecification,
  StyleSpecification,
  ValidationError,
} from "maplibre-gl";
import {
  ExpressionSpecification,
  latest,
  LegacyFilterSpecification,
  validateStyleMin,
} from "@maplibre/maplibre-gl-style-spec";

import MapMaplibreGl from "./MapMaplibreGl";
import MapOpenLayers from "./MapOpenLayers";
import LayerList from "./LayerList";
import LayerEditor from "./LayerEditor";
import AppToolbar, { MapState } from "./AppToolbar";
import AppLayout from "./AppLayout";
import MessagePanel from "./AppMessagePanel";

import ModalSettings from "./ModalSettings";
import ModalExport from "./ModalExport";
import ModalSources from "./ModalSources";
import ModalOpen from "./ModalOpen";
import ModalShortcuts from "./ModalShortcuts";
import ModalDebug from "./ModalDebug";

import {
  downloadGlyphsMetadata,
  downloadSpriteMetadata,
} from "../libs/metadata";
import style from "../libs/style";
import {
  initialStyleUrl,
  loadStyleUrl,
  removeStyleQuerystring,
} from "../libs/urlopen";
import { undoMessages, redoMessages } from "../libs/diffmessage";
import { StyleStore } from "../libs/stylestore";
import { ApiStyleStore } from "../libs/apistore";
import { RevisionStore } from "../libs/revisions";
import LayerWatcher from "../libs/layerwatcher";
import tokens from "../config/tokens.json";
import isEqual from "lodash.isequal";
import Debug from "../libs/debug";
import { SortEnd } from "react-sortable-hoc";
import FloorSelector from "./FloorSelector";
import {
  addFloorFilter,
  hasFloorFilter,
  removeFloorFilter,
} from "../libs/floor-filter";
import SitumSDK from "@situm/sdk-js";

import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { ExtendedStyleSpecification } from '../store/types';
import {
  setMapStyle,
  setDirtyMapStyle,
  setSpec,
  setFileHandle,
} from '../store/slices/styleSlice';
import {
  setMapState,
  toggleModal,
  setSelectedFloorId,
  setFloorIds,
  setSitumSDK,
} from '../store/slices/uiSlice';
import {
  setSelectedLayerIndex,
  setSelectedLayerOriginalId,
  setVectorLayers,
} from '../store/slices/layersSlice';
import {
  setSources,
} from '../store/slices/sourcesSlice';
import {
  addError,
  addInfo,
  clearErrors,
  clearInfos,
} from '../store/slices/errorsSlice';
import {
  setMapView,
} from '../store/slices/mapViewSlice';
import {
  setMaplibreGlDebugOptions,
  setOpenLayersDebugOptions,
} from '../store/slices/debugSlice';

// Buffer must be defined globally for @maplibre/maplibre-gl-style-spec validate() function to succeed.
window.Buffer = buffer.Buffer;

function setFetchAccessToken(url: string, mapStyle: StyleSpecification) {
  const matchesTilehosting = url.match(/\.tilehosting\.com/);
  const matchesMaptiler = url.match(/\.maptiler\.com/);
  const matchesThunderforest = url.match(/\.thunderforest\.com/);
  if (matchesTilehosting || matchesMaptiler) {
    const accessToken = style.getAccessToken("openmaptiles", mapStyle, {
      allowFallback: true,
    });
    if (accessToken) {
      return url.replace("{key}", accessToken);
    }
  } else if (matchesThunderforest) {
    const accessToken = style.getAccessToken("thunderforest", mapStyle, {
      allowFallback: true,
    });
    if (accessToken) {
      return url.replace("{key}", accessToken);
    }
  } else {
    return url;
  }
}

function updateRootSpec(spec: any, fieldName: string, newValues: any) {
  return {
    ...spec,
    $root: {
      ...spec.$root,
      [fieldName]: {
        ...spec.$root[fieldName],
        values: newValues,
      },
    },
  };
}

type OnStyleChangedOpts = {
  save?: boolean;
  addRevision?: boolean;
  initialLoad?: boolean;
};

const App = () => {
  const dispatch = useAppDispatch();

  // Redux state selectors
  const mapStyle = useAppSelector(state => state.style.mapStyle);
  const dirtyMapStyle = useAppSelector(state => state.style.dirtyMapStyle);
  const spec = useAppSelector(state => state.style.spec);
  const fileHandle = useAppSelector(state => state.style.fileHandle);

  const mapState = useAppSelector(state => state.ui.mapState);
  const isOpen = useAppSelector(state => state.ui.isOpen);
  const selectedFloorId = useAppSelector(state => state.ui.selectedFloorId);
  const floorIds = useAppSelector(state => state.ui.floorIds);
  const situmSDK = useAppSelector(state => state.ui.situmSDK);

  const selectedLayerIndex = useAppSelector(state => state.layers.selectedLayerIndex);
  const selectedLayerOriginalId = useAppSelector(state => state.layers.selectedLayerOriginalId);
  const vectorLayers = useAppSelector(state => state.layers.vectorLayers);

  const sources = useAppSelector(state => state.sources.sources);

  const errors = useAppSelector(state => state.errors.errors);
  const infos = useAppSelector(state => state.errors.infos);

  const mapView = useAppSelector(state => state.mapView.mapView);

  const maplibreGlDebugOptions = useAppSelector(state => state.debug.maplibreGlDebugOptions);
  const openlayersDebugOptions = useAppSelector(state => state.debug.openLayersDebugOptions);

  // Refs for stores and watchers
  const revisionStoreRef = useRef<RevisionStore>();
  const styleStoreRef = useRef<StyleStore | ApiStyleStore>();
  const layerWatcherRef = useRef<LayerWatcher>();

  // Initialize stores on first render
  useEffect(() => {
    revisionStoreRef.current = new RevisionStore();

    const params = new URLSearchParams(window.location.search.substring(1));
    let port = params.get("localport");
    if (
      port == null &&
      window.location.port !== "80" &&
      window.location.port !== "443"
    ) {
      port = window.location.port;
    }

    styleStoreRef.current = new ApiStyleStore({
      onLocalStyleChange: (mapStyle) =>
        onStyleChanged(mapStyle, { save: false }),
      port: port,
      host: params.get("localhost"),
    });

    // Initialize style store
    const styleUrl = initialStyleUrl();
    if (
      styleUrl &&
      window.confirm(
        "Load style from URL: " + styleUrl + " and discard current changes?"
      )
    ) {
      styleStoreRef.current = new StyleStore();
      loadStyleUrl(styleUrl, (mapStyle) => onStyleChanged(mapStyle));
      removeStyleQuerystring();
    } else {
      if (styleUrl) {
        removeStyleQuerystring();
      }
      styleStoreRef.current.init((err) => {
        if (err) {
          console.log("Falling back to local storage for storing styles");
          styleStoreRef.current = new StyleStore();
        }
        styleStoreRef.current!.latestStyle((mapStyle) =>
          onStyleChanged(mapStyle, { initialLoad: true })
        );

        if (Debug.enabled()) {
          Debug.set("maputnik", "styleStore", styleStoreRef.current);
          Debug.set("maputnik", "revisionStore", revisionStoreRef.current);
        }
      });
    }

    if (Debug.enabled()) {
      Debug.set("maputnik", "revisionStore", revisionStoreRef.current);
      Debug.set("maputnik", "styleStore", styleStoreRef.current);
    }

    // Initialize layer watcher
    layerWatcherRef.current = new LayerWatcher({
      onVectorLayersChange: (v) => dispatch(setVectorLayers(v)),
    });

    // Set initial spec
    dispatch(setSpec(latest));
  }, [dispatch]);

  // Keyboard shortcuts
  useEffect(() => {
    const shortcuts = [
      {
        key: "?",
        handler: () => {
          dispatch(toggleModal("shortcuts"));
        },
      },
      {
        key: "o",
        handler: () => {
          dispatch(toggleModal("open"));
        },
      },
      {
        key: "e",
        handler: () => {
          dispatch(toggleModal("export"));
        },
      },
      {
        key: "d",
        handler: () => {
          dispatch(toggleModal("sources"));
        },
      },
      {
        key: "s",
        handler: () => {
          dispatch(toggleModal("settings"));
        },
      },
      {
        key: "i",
        handler: () => {
          dispatch(setMapState(mapState === "map" ? "inspect" : "map"));
        },
      },
      {
        key: "m",
        handler: () => {
          (
            document.querySelector(".maplibregl-canvas") as HTMLCanvasElement
          ).focus();
        },
      },
      {
        key: "!",
        handler: () => {
          dispatch(toggleModal("debug"));
        },
      },
    ];

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        (e.target as HTMLElement).blur();
        document.body.focus();
      } else if (
        isOpen.shortcuts ||
        document.activeElement === document.body
      ) {
        const shortcut = shortcuts.find((shortcut) => {
          return shortcut.key === e.key;
        });

        if (shortcut) {
          dispatch(toggleModal("shortcuts"));
          shortcut.handler();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (navigator.platform.toUpperCase().indexOf("MAC") >= 0) {
        if (e.metaKey && e.shiftKey && e.keyCode === 90) {
          e.preventDefault();
          onRedo();
        } else if (e.metaKey && e.keyCode === 90) {
          e.preventDefault();
          onUndo();
        }
      } else {
        if (e.ctrlKey && e.keyCode === 90) {
          e.preventDefault();
          onUndo();
        } else if (e.ctrlKey && e.keyCode === 89) {
          e.preventDefault();
          onRedo();
        }
      }
    };

    document.body.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, isOpen.shortcuts, mapState]);

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
  const updateLayersForNewFloorId = useCallback((floorId?: number) => {
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
  }, [mapStyle.layers]);

  const saveStyle = useCallback((snapshotStyle: StyleSpecification & { id: string }) => {
    styleStoreRef.current?.save(snapshotStyle);
  }, []);

  const updateFonts = useCallback((urlTemplate: string) => {
    const metadata: { [key: string]: string } =
      mapStyle.metadata || ({} as any);
    const accessToken =
      metadata["maputnik:openmaptiles_access_token"] || tokens.openmaptiles;

    const glyphUrl =
      typeof urlTemplate === "string"
        ? urlTemplate.replace("{key}", accessToken)
        : urlTemplate;
    downloadGlyphsMetadata(glyphUrl, (fonts) => {
      dispatch(setSpec(updateRootSpec(spec, "glyphs", fonts)));
    });
  }, [mapStyle.metadata, spec, dispatch]);

  const updateIcons = useCallback((baseUrl: string) => {
    downloadSpriteMetadata(baseUrl, (icons) => {
      dispatch(setSpec(updateRootSpec(spec, "sprite", icons)));
    });
  }, [spec, dispatch]);

  const onChangeMetadataProperty = useCallback((property: string, value: any) => {
    // If we're changing renderer reset the map state.
    if (
      property === "maputnik:renderer" &&
      value !==
      get(mapStyle, ["metadata", "maputnik:renderer"], "mlgljs")
    ) {
      dispatch(setMapState("map"));
    }

    const changedStyle = {
      ...mapStyle,
      metadata: {
        ...(mapStyle as any).metadata,
        [property]: value,
      },
    };

    onStyleChanged(changedStyle);
  }, [mapStyle, dispatch]);

  const onStyleChanged = useCallback((
    newStyle: ExtendedStyleSpecification,
    opts: OnStyleChangedOpts = {}
  ) => {
    opts = {
      save: true,
      addRevision: true,
      initialLoad: false,
      ...opts,
    };

    // For the style object, find the urls that has "{key}" and insert the correct API keys
    // Without this, going from e.g. MapTiler to OpenLayers and back will lose the maptlier key.

    if (newStyle.glyphs && typeof newStyle.glyphs === "string") {
      newStyle.glyphs = setFetchAccessToken(newStyle.glyphs, newStyle);
    }

    if (newStyle.sprite && typeof newStyle.sprite === "string") {
      newStyle.sprite = setFetchAccessToken(newStyle.sprite, newStyle);
    }

    for (const [_sourceId, source] of Object.entries(newStyle.sources)) {
      if (source && "url" in source && typeof source.url === "string") {
        source.url = setFetchAccessToken(source.url, newStyle);
      }
    }

    if (opts.initialLoad) {
      getInitialStateFromUrl(newStyle);
    }

    const errors: ValidationError[] = validateStyleMin(newStyle) || [];

    // The validate function doesn't give us errors for duplicate error with
    // empty string for layer.id, manually deal with that here.
    const layerErrors: (Error | ValidationError)[] = [];
    if (newStyle && newStyle.layers) {
      const foundLayers = new global.Map();
      newStyle.layers.forEach((layer, index) => {
        if (layer.id === "" && foundLayers.has(layer.id)) {
          const error = new Error(
            `layers[${index}]: duplicate layer id [empty_string], previously used`
          );
          layerErrors.push(error);
        }
        foundLayers.set(layer.id, true);
      });
    }

    const mappedErrors = layerErrors.concat(errors).map((error) => {
      // Special case: Duplicate layer id
      const dupMatch = error.message.match(
        /layers\[(\d+)\]: (duplicate layer id "?(.*)"?, previously used)/
      );
      if (dupMatch) {
        const [, index, message] = dupMatch;
        return {
          message: error.message,
          parsed: {
            type: "layer",
            data: {
              index: parseInt(index, 10),
              key: "id",
              message,
            },
          },
        };
      }

      // Special case: Invalid source
      const invalidSourceMatch = error.message.match(
        /layers\[(\d+)\]: (source "(?:.*)" not found)/
      );
      if (invalidSourceMatch) {
        const [, index, message] = invalidSourceMatch;
        return {
          message: error.message,
          parsed: {
            type: "layer",
            data: {
              index: parseInt(index, 10),
              key: "source",
              message,
            },
          },
        };
      }

      const layerMatch = error.message.match(
        /layers\[(\d+)\]\.(?:(\S+)\.)?(\S+): (.*)/
      );
      if (layerMatch) {
        const [, index, group, property, message] = layerMatch;
        const key = group && property ? [group, property].join(".") : property;
        return {
          message: error.message,
          parsed: {
            type: "layer",
            data: {
              index: parseInt(index, 10),
              key,
              message,
            },
          },
        };
      } else {
        return {
          message: error.message,
        };
      }
    });

    let dirtyMapStyle: StyleSpecification | undefined = undefined;
    if (errors.length > 0) {
      dirtyMapStyle = cloneDeep(newStyle);

      errors.forEach((error) => {
        const { message } = error;
        if (message) {
          try {
            const objPath = message.split(":")[0];
            // Errors can be deply nested for example 'layers[0].filter[1][1][0]' we only care upto the property 'layers[0].filter'
            const unsetPath = objPath.match(/^\S+?\[\d+\]\.[^[]+/)![0];
            unset(dirtyMapStyle, unsetPath);
          } catch (err) {
            console.warn(err);
          }
        }
      });
    }

    if (newStyle.glyphs !== mapStyle.glyphs) {
      updateFonts(newStyle.glyphs as string);
    }
    if (newStyle.sprite !== mapStyle.sprite) {
      updateIcons(newStyle.sprite as string);
    }

    if (opts.addRevision) {
      revisionStoreRef.current?.addRevision(newStyle);
    }
    if (opts.save) {
      saveStyle(newStyle as StyleSpecification & { id: string });
    }

    dispatch(setMapStyle(newStyle));
    if (dirtyMapStyle) {
      dispatch(setDirtyMapStyle(dirtyMapStyle));
    }
    dispatch(clearErrors());
    mappedErrors.forEach(error => dispatch(addError(error)));

    // Fetch sources and update URL after state update
    setTimeout(() => {
      fetchSources();
      setStateInUrl();
    }, 0);
  }, [mapStyle, dispatch, updateFonts, updateIcons, saveStyle]);

  const onUndo = useCallback(() => {
    const activeStyle = revisionStoreRef.current?.undo();
    if (!activeStyle) return;

    const messages = undoMessages(mapStyle, activeStyle);
    onStyleChanged(activeStyle, { addRevision: false });
    dispatch(clearInfos());
    messages.forEach(info => dispatch(addInfo(info)));
  }, [mapStyle, onStyleChanged, dispatch]);

  const setStateInUrl = useCallback(() => {
    const url = new URL(location.href);
    const hashVal = hash(JSON.stringify(mapStyle));
    url.searchParams.set("layer", `${hashVal}~${selectedLayerIndex}`);

    const openModals = Object.entries(isOpen)
      .map(([key, val]) => (val === true ? key : null))
      .filter((val) => val !== null);

    if (openModals.length > 0) {
      url.searchParams.set("modal", openModals.join(","));
    } else {
      url.searchParams.delete("modal");
    }

    if (mapState === "map") {
      url.searchParams.delete("view");
    } else if (mapState === "inspect") {
      url.searchParams.set("view", "inspect");
    }

    history.replaceState({ selectedLayerIndex }, "Maputnik", url.href);
  }, [mapStyle, selectedLayerIndex, isOpen, mapState]);

  const onLayerSelect = useCallback((index: number) => {
    dispatch(setSelectedLayerIndex(index));
    if (mapStyle.layers[index]) {
      dispatch(setSelectedLayerOriginalId(mapStyle.layers[index].id));
    }
    setStateInUrl();
  }, [dispatch, mapStyle.layers, setStateInUrl]);

  const onRedo = useCallback(() => {
    const activeStyle = revisionStoreRef.current?.redo();
    if (!activeStyle) return;

    const messages = redoMessages(mapStyle, activeStyle);
    onStyleChanged(activeStyle, { addRevision: false });
    dispatch(clearInfos());
    messages.forEach(info => dispatch(addInfo(info)));
  }, [mapStyle, onStyleChanged, dispatch]);

  const onMoveLayer = useCallback((move: SortEnd) => {
    let { oldIndex, newIndex } = move;
    let layers = mapStyle.layers;
    oldIndex = clamp(oldIndex, 0, layers.length - 1);
    newIndex = clamp(newIndex, 0, layers.length - 1);
    if (oldIndex === newIndex) return;

    if (oldIndex === selectedLayerIndex) {
      dispatch(setSelectedLayerIndex(newIndex));
    }

    layers = layers.slice(0);
    arrayMoveMutable(layers, oldIndex, newIndex);
    onLayersChange(layers);
  }, [mapStyle.layers, selectedLayerIndex, dispatch]);

  const onLayersChange = useCallback((changedLayers: LayerSpecification[]) => {
    const changedStyle = {
      ...mapStyle,
      layers: changedLayers,
    };
    onStyleChanged(changedStyle);
  }, [mapStyle, onStyleChanged]);

  const onLayerDestroy = useCallback((index: number) => {
    const layers = mapStyle.layers;
    const remainingLayers = layers.slice(0);
    remainingLayers.splice(index, 1);
    onLayersChange(remainingLayers);
  }, [mapStyle.layers, onLayersChange]);

  const onLayerCopy = useCallback((index: number) => {
    const layers = mapStyle.layers;
    const changedLayers = layers.slice(0);

    const clonedLayer = cloneDeep(changedLayers[index]);
    clonedLayer.id = clonedLayer.id + "-copy";
    changedLayers.splice(index, 0, clonedLayer);
    onLayersChange(changedLayers);
  }, [mapStyle.layers, onLayersChange]);

  const onLayerFloorFilterToggle = useCallback((index: number) => {
    const layers = mapStyle.layers;
    const changedLayers = layers.slice(0);

    const layer = { ...changedLayers[index] };
    if (!("filter" in layer)) return;
    // @ts-ignore
    let changedFilter = [...layer.filter] as
      | ExpressionSpecification
      | LegacyFilterSpecification;
    const metadata = { ...(layer.metadata || {}) };

    if (!hasFloorFilter(changedFilter) && selectedFloorId) {
      changedFilter = addFloorFilter(changedFilter, selectedFloorId);
    } else {
      changedFilter = removeFloorFilter(changedFilter);
    }

    // Update values
    layer.filter = changedFilter;
    if (Object.keys(metadata).length > 0) {
      layer.metadata = metadata;
    } else {
      delete layer.metadata;
    }

    changedLayers[index] = layer;
    onLayersChange(changedLayers);
  }, [mapStyle.layers, selectedFloorId, onLayersChange]);

  const onLayerVisibilityToggle = useCallback((index: number) => {
    const layers = mapStyle.layers;
    const changedLayers = layers.slice(0);

    const layer = { ...changedLayers[index] };
    const changedLayout = "layout" in layer ? { ...layer.layout } : {};
    changedLayout.visibility =
      changedLayout.visibility === "none" ? "visible" : "none";

    layer.layout = changedLayout;
    changedLayers[index] = layer;
    onLayersChange(changedLayers);
  }, [mapStyle.layers, onLayersChange]);

  const onLayerIdChange = useCallback((index: number, _oldId: string, newId: string) => {
    const changedLayers = mapStyle.layers.slice(0);
    changedLayers[index] = {
      ...changedLayers[index],
      id: newId,
    };

    onLayersChange(changedLayers);
  }, [mapStyle.layers, onLayersChange]);

  const onLayerChanged = useCallback((index: number, layer: LayerSpecification) => {
    const changedLayers = mapStyle.layers.slice(0);
    changedLayers[index] = layer;

    onLayersChange(changedLayers);
  }, [mapStyle.layers, onLayersChange]);

  const setDefaultValues = useCallback((styleObj: StyleSpecification & { id: string }) => {
    const metadata: { [key: string]: string } =
      styleObj.metadata || ({} as any);
    if (metadata["maputnik:renderer"] === undefined) {
      const changedStyle = {
        ...styleObj,
        metadata: {
          ...(styleObj.metadata as any),
          "maputnik:renderer": "mlgljs",
        },
      };
      return changedStyle;
    } else {
      return styleObj;
    }
  }, []);

  const openStyle = useCallback((
    styleObj: StyleSpecification & { id: string },
    fileHandle: FileSystemFileHandle | null
  ) => {
    dispatch(setFileHandle(fileHandle));
    styleObj = setDefaultValues(styleObj);
    onStyleChanged(styleObj);
  }, [dispatch, setDefaultValues, onStyleChanged]);

  const fetchSources = useCallback(() => {
    const sourceList: { [key: string]: any } = {};

    for (const [key, val] of Object.entries(mapStyle.sources)) {
      if (
        !Object.prototype.hasOwnProperty.call(sources, key) &&
        val.type === "vector" &&
        Object.prototype.hasOwnProperty.call(val, "url")
      ) {
        sourceList[key] = {
          type: val.type,
          layers: [],
        };

        let url = val.url;

        try {
          url = setFetchAccessToken(url!, mapStyle);
        } catch (err) {
          console.warn("Failed to setFetchAccessToken: ", err);
        }

        const setVectorLayers = (json: any) => {
          if (!Object.prototype.hasOwnProperty.call(json, "vector_layers")) {
            return;
          }

          // Create new objects before setState
          const newSources = Object.assign(
            {},
            {
              [key]: sources[key],
            }
          );

          for (const layer of json.vector_layers) {
            (newSources[key] as any).layers.push(layer.id);
          }

          dispatch(setSources(newSources));
        };

        if (url!.startsWith("pmtiles://")) {
          new PMTiles(url!.substr(10))
            .getTileJson("")
            .then((json) => setVectorLayers(json))
            .catch((err) => {
              console.error("Failed to process sources for '%s'", url, err);
            });
        } else {
          fetch(url!, {
            mode: "cors",
          })
            .then((response) => response.json())
            .then((json) => setVectorLayers(json))
            .catch((err) => {
              console.error("Failed to process sources for '%s'", url, err);
            });
        }
      } else {
        sourceList[key] =
          sources[key] || mapStyle.sources[key];
      }
    }

    if (!isEqual(sources, sourceList)) {
      console.debug("Setting sources");
      dispatch(setSources(sourceList));
    }
  }, [mapStyle.sources, sources, dispatch]);

  const _getRenderer = useCallback(() => {
    const metadata: { [key: string]: string } =
      mapStyle.metadata || ({} as any);
    return metadata["maputnik:renderer"] || "mlgljs";
  }, [mapStyle.metadata]);

  const onMapChange = useCallback((mapView: {
    zoom: number;
    center: {
      lng: number;
      lat: number;
    };
  }) => {
    dispatch(setMapView(mapView));
  }, [dispatch]);

  const mapRenderer = useCallback(() => {
    const mapProps = {
      mapStyle: dirtyMapStyle || mapStyle,
      replaceAccessTokens: (mapStyle: StyleSpecification) => {
        return style.replaceAccessTokens(mapStyle, {
          allowFallback: true,
        });
      },
      onDataChange: (e: { map: Map }) => {
        layerWatcherRef.current?.analyzeMap(e.map);
        fetchSources();
      },
    };

    const renderer = _getRenderer();

    let mapElement;

    // Check if OL code has been loaded?
    if (renderer === "ol") {
      mapElement = (
        <MapOpenLayers
          {...mapProps}
          onChange={onMapChange}
          debugToolbox={openlayersDebugOptions.debugToolbox}
          onLayerSelect={onLayerSelect}
        />
      );
    } else {
      mapElement = (
        <MapMaplibreGl
          {...mapProps}
          onChange={onMapChange}
          options={maplibreGlDebugOptions}
          inspectModeEnabled={mapState === "inspect"}
          highlightedLayer={
            mapStyle.layers[selectedLayerIndex]
          }
          onLayerSelect={onLayerSelect}
        />
      );
    }

    let filterName;
    if (mapState.match(/^filter-/)) {
      filterName = mapState.replace(/^filter-/, "");
    }
    const elementStyle: { filter?: string } = {};
    if (filterName) {
      elementStyle.filter = `url('#${filterName}')`;
    }

    return (
      <div
        style={elementStyle}
        className="maputnik-map__container"
        data-wd-key="maplibre:container"
      >
        {mapElement}
      </div>
    );
  }, [dirtyMapStyle, mapStyle, mapState, selectedLayerIndex, maplibreGlDebugOptions, openlayersDebugOptions, onMapChange, onLayerSelect, fetchSources, _getRenderer]);

  const getInitialStateFromUrl = useCallback((mapStyle: StyleSpecification) => {
    const url = new URL(location.href);
    const modalParam = url.searchParams.get("modal");

    if (modalParam && modalParam !== "") {
      const modals = modalParam.split(",");
      const modalObj: { [key: string]: boolean } = {};
      modals.forEach((modalName) => {
        modalObj[modalName] = true;
      });

      // Update modal states
      Object.entries(modalObj).forEach(([modalName, isOpen]) => {
        if (isOpen) {
          dispatch(toggleModal(modalName as keyof typeof isOpen));
        }
      });
    }

    const view = url.searchParams.get("view");
    if (view && view !== "") {
      dispatch(setMapState(view as MapState));
    }

    const path = url.searchParams.get("layer");
    if (path) {
      try {
        const parts = path.split("~");
        const [hashVal, selectedLayerIndex] = [
          parts[0],
          parseInt(parts[1], 10),
        ];

        let valid = true;
        if (hashVal !== "-") {
          const currentHashVal = hash(JSON.stringify(mapStyle));
          if (currentHashVal !== parseInt(hashVal, 10)) {
            valid = false;
          }
        }
        if (valid) {
          dispatch(setSelectedLayerIndex(selectedLayerIndex));
          if (mapStyle.layers[selectedLayerIndex]) {
            dispatch(setSelectedLayerOriginalId(mapStyle.layers[selectedLayerIndex].id));
          }
        }
      } catch (err) {
        console.warn(err);
      }
    }
  }, [dispatch, mapStyle]);

  const toggleModalHandler = useCallback((modalName: keyof typeof isOpen) => {
    dispatch(toggleModal(modalName));
  }, [dispatch]);

  const onSetFileHandle = useCallback((fileHandle: FileSystemFileHandle | null) => {
    dispatch(setFileHandle(fileHandle));
  }, [dispatch]);

  const onChangeOpenlayersDebug = useCallback((
    key: keyof typeof openlayersDebugOptions,
    value: boolean
  ) => {
    dispatch(setOpenLayersDebugOptions({ [key]: value }));
  }, [dispatch]);

  const onChangeMaplibreGlDebug = useCallback((
    key: keyof typeof maplibreGlDebugOptions,
    value: any
  ) => {
    dispatch(setMaplibreGlDebugOptions({ [key]: value }));
  }, [dispatch]);

  // SitumSDK effect
  useEffect(() => {
    // @ts-ignore
    const apiKey = mapStyle?.metadata?.["maputnik:situm-apikey"];
    // @ts-ignore
    const buildingID = mapStyle?.metadata?.["maputnik:situm-building-id"];

    if (apiKey && (apiKey as string).trim().length > 0) {
      const newSitumSDK = new SitumSDK({
        auth: {
          apiKey: apiKey as string,
        },
      });
      dispatch(setSitumSDK(newSitumSDK));

      // Load building information
      if (buildingID) {
        newSitumSDK.cartography
          .getBuildingById(buildingID as number)
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
      }
    } else if (floorIds.length > 0) {
      dispatch(setFloorIds([]));
    }
  }, [mapStyle.metadata, dispatch, floorIds.length]);

  const layers = mapStyle.layers || [];
  const selectedLayer =
    layers.length > 0 ? layers[selectedLayerIndex] : undefined;

  const toolbar = (
    <AppToolbar
      renderer={_getRenderer()}
      mapState={mapState}
      mapStyle={mapStyle}
      inspectModeEnabled={mapState === "inspect"}
      sources={sources}
      onStyleChanged={onStyleChanged}
      onStyleOpen={onStyleChanged}
      onSetMapState={(newState) => dispatch(setMapState(newState))}
      onToggleModal={toggleModalHandler}
      selectedFloorId={selectedFloorId ?? 0}
    />
  );

  const layerList = (
    <LayerList
      onMoveLayer={onMoveLayer}
      onLayerDestroy={onLayerDestroy}
      onLayerCopy={onLayerCopy}
      onLayerVisibilityToggle={onLayerVisibilityToggle}
      onLayerFloorFilterToggle={onLayerFloorFilterToggle}
      onLayersChange={onLayersChange}
      onLayerSelect={onLayerSelect}
      selectedLayerIndex={selectedLayerIndex}
      layers={layers}
      sources={sources}
      errors={errors}
    />
  );

  const layerEditor = selectedLayer ? (
    <LayerEditor
      key={selectedLayerOriginalId}
      layer={selectedLayer}
      layerIndex={selectedLayerIndex}
      isFirstLayer={selectedLayerIndex < 1}
      isLastLayer={
        selectedLayerIndex ===
        mapStyle.layers.length - 1
      }
      sources={sources}
      vectorLayers={vectorLayers}
      spec={spec}
      onMoveLayer={onMoveLayer}
      onLayerChanged={onLayerChanged}
      onLayerDestroy={onLayerDestroy}
      onLayerCopy={onLayerCopy}
      onLayerVisibilityToggle={onLayerVisibilityToggle}
      onLayerIdChange={onLayerIdChange}
      errors={errors}
      selectedFloorId={selectedFloorId}
    />
  ) : undefined;

  const bottomPanel =
    errors.length + infos.length > 0 ? (
      <MessagePanel
        currentLayer={selectedLayer}
        selectedLayerIndex={selectedLayerIndex}
        onLayerSelect={onLayerSelect}
        mapStyle={mapStyle}
        errors={errors}
        infos={infos}
      />
    ) : undefined;

  const modals = (
    <div>
      <ModalDebug
        renderer={_getRenderer()}
        maplibreGlDebugOptions={maplibreGlDebugOptions}
        openlayersDebugOptions={openlayersDebugOptions}
        onChangeMaplibreGlDebug={onChangeMaplibreGlDebug}
        onChangeOpenlayersDebug={onChangeOpenlayersDebug}
        isOpen={isOpen.debug}
        onOpenToggle={() => toggleModalHandler("debug")}
        mapView={mapView}
      />
      <ModalShortcuts
        isOpen={isOpen.shortcuts}
        onOpenToggle={() => toggleModalHandler("shortcuts")}
      />
      <ModalSettings
        mapStyle={mapStyle}
        onStyleChanged={onStyleChanged}
        onChangeMetadataProperty={onChangeMetadataProperty}
        isOpen={isOpen.settings}
        onOpenToggle={() => toggleModalHandler("settings")}
      />
      <ModalExport
        mapStyle={mapStyle}
        onStyleChanged={onStyleChanged}
        isOpen={isOpen.export}
        onOpenToggle={() => toggleModalHandler("export")}
        fileHandle={fileHandle}
        onSetFileHandle={onSetFileHandle}
      />
      <ModalOpen
        isOpen={isOpen.open}
        onStyleOpen={openStyle}
        onOpenToggle={() => toggleModalHandler("open")}
        fileHandle={fileHandle}
      />
      <ModalSources
        mapStyle={mapStyle}
        situmSDK={situmSDK}
        onStyleChanged={onStyleChanged}
        isOpen={isOpen.sources}
        onOpenToggle={() => toggleModalHandler("sources")}
      />
    </div>
  );

  const floorSelector = (
    <FloorSelector
      selectedFloorId={selectedFloorId}
      floorIds={floorIds}
      onFloorSelected={(floorId) =>
        dispatch(setSelectedFloorId(floorId))
      }
    />
  );

  return (
    <AppLayout
      toolbar={toolbar}
      layerList={layerList}
      layerEditor={layerEditor}
      map={mapRenderer()}
      bottom={bottomPanel}
      modals={modals}
      floorSelector={floorSelector}
    />
  );
}

export default App;