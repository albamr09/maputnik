import { useEffect, useRef, useCallback } from "react";
import cloneDeep from "lodash.clonedeep";
import clamp from "lodash.clamp";
import buffer from "buffer";
import get from "lodash.get";
import { arrayMoveMutable } from "array-move";
import {
  Map,
  LayerSpecification,
  StyleSpecification,
  LngLat,
} from "maplibre-gl";
import {
  ExpressionSpecification,
  latest,
  LegacyFilterSpecification,
} from "@maplibre/maplibre-gl-style-spec";

import MapMaplibreGl from "./MapMaplibreGl";
import MapOpenLayers from "./MapOpenLayers";
import LayerList from "./LayerList";
import LayerEditor from "./LayerEditor";
import AppLayout from "./AppLayout";
import MessagePanel from "./AppMessagePanel";

import ModalSettings from "./ModalSettings";
import ModalExport from "./ModalExport";
import ModalSources from "./ModalSources";
import ModalOpen from "./ModalOpen";
import ModalShortcuts from "./ModalShortcuts";
import ModalDebug from "./ModalDebug";

import style from "../libs/style";
import {
  initialStyleUrl,
  loadStyleUrl,
  removeStyleQuerystring,
} from "../libs/urlopen";
import { StyleStore } from "../libs/stylestore";
import { ApiStyleStore } from "../libs/apistore";
import { RevisionStore } from "../libs/revisions";
import LayerWatcher from "../libs/layerwatcher";
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
import {
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
  setMapView,
} from '../store/slices/mapViewSlice';
import {
  setMaplibreGlDebugOptions,
  setOpenLayersDebugOptions,
} from '../store/slices/debugSlice';
import useStyleEdition from "../hooks/useStyleEdition";
import AppToolbar from "./AppToolbar";
import useShortcuts from "../hooks/useShortcuts";

// Buffer must be defined globally for @maplibre/maplibre-gl-style-spec validate() function to succeed.
window.Buffer = buffer.Buffer;

const App = () => {
  const dispatch = useAppDispatch();

  // TODO ALBA: These should be selectors
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
  // TODO ALBA: What are these for?
  const revisionStoreRef = useRef<RevisionStore>();
  const styleStoreRef = useRef<StyleStore | ApiStyleStore>();
  const layerWatcherRef = useRef<LayerWatcher>();

  // Hooks
  const { onStyleChanged, fetchSources, setStateInUrl } = useStyleEdition();
  useShortcuts();

  // TODO ALBA: see if this is needed
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



  const onLayerSelect = useCallback((index: number) => {
    dispatch(setSelectedLayerIndex(index));
    if (mapStyle.layers[index]) {
      dispatch(setSelectedLayerOriginalId(mapStyle.layers[index].id));
    }
    setStateInUrl();
  }, [dispatch, mapStyle.layers, setStateInUrl]);

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



  const _getRenderer = useCallback(() => {
    const metadata: { [key: string]: string } =
      mapStyle.metadata || ({} as any);
    return metadata["maputnik:renderer"] || "mlgljs";
  }, [mapStyle.metadata]);

  const onMapChange = useCallback((mapView: {
    zoom: number;
    center: LngLat;
  }) => {
    dispatch(setMapView({ ...mapView, center: { lat: mapView.center.lat, lng: mapView.center.lng } }));
  }, [dispatch]);

  // TODO ALBA: This should be a component
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

  // TODO ALBA: This should be a component
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

  // TODO ALBA: This should be a component
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

  // TODO ALBA: This should be a component
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

  // TODO ALBA: This should be a component
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

  // TODO ALBA: This should be a component
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

  // TODO ALBA: This should be a component
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