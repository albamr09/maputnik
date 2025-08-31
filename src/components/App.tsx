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
import LayerWatcher from "../libs/layerwatcher";
import { SortEnd } from "react-sortable-hoc";
import FloorSelector from "./FloorSelector";
import {
  addFloorFilter,
  hasFloorFilter,
  removeFloorFilter,
} from "../libs/floor-filter";
import { useSitumSDK } from "../providers/SitumSDKProvider";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setSpec,
  setFileHandle,
  selectMapStyle,
  selectDirtyMapStyle,
  selectStyleSpec,
  selectFileHandle,
  selectSources,
  selectSelectedLayerIndex,
  selectSelectedLayerOriginalId,
  selectVectorLayers,
  setSelectedLayerIndex,
  setSelectedLayerOriginalId,
  setVectorLayers,
  selectMaplibreGlDebugOptions,
  selectOpenLayersDebugOptions,
  setMaplibreGlDebugOptions,
  setOpenLayersDebugOptions,
} from "../store/slices/styleCoreSlice";
import {
  setMapState,
  toggleModal,
  setSelectedFloorId,
  setFloorIds,
  selectMapViewMode,
  selectIsModalOpen,
  selectSelectedFloorId,
  selectFloorIds,
  selectMapView,
  setMapView,
  selectErrorMessages,
  selectInfoMessages,
} from "../store/slices/uiCoreSlice";
import useStyleEdition from "../hooks/useStyleEdition";
import AppToolbar from "./AppToolbar";
import useShortcuts from "../hooks/useShortcuts";
import useStyleStore from "../hooks/useStyleStore";

// Buffer must be defined globally for @maplibre/maplibre-gl-style-styleSpec validate() function to succeed.
window.Buffer = buffer.Buffer;

const App = () => {
  const dispatch = useAppDispatch();

  const mapStyle = useAppSelector(selectMapStyle);
  const dirtyMapStyle = useAppSelector(selectDirtyMapStyle);
  const styleSpec = useAppSelector(selectStyleSpec);
  const fileHandle = useAppSelector(selectFileHandle);
  const mapViewMode = useAppSelector(selectMapViewMode);
  const isOpen = useAppSelector(selectIsModalOpen);
  const selectedFloorId = useAppSelector(selectSelectedFloorId);
  const floorIds = useAppSelector(selectFloorIds);

  const selectedLayerIndex = useAppSelector(selectSelectedLayerIndex);
  const selectedLayerOriginalId = useAppSelector(selectSelectedLayerOriginalId);
  const vectorLayers = useAppSelector(selectVectorLayers);
  const sources = useAppSelector(selectSources);
  const errors = useAppSelector(selectErrorMessages);
  const infos = useAppSelector(selectInfoMessages);
  const mapView = useAppSelector(selectMapView);
  const maplibreGlDebugOptions = useAppSelector(selectMaplibreGlDebugOptions);
  const openlayersDebugOptions = useAppSelector(selectOpenLayersDebugOptions);

  // Refs for stores and watchers
  const layerWatcherRef = useRef<LayerWatcher>();

  // Hooks
  const { onStyleChanged, fetchSources, setStateInUrl } = useStyleEdition();
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

  const onChangeMetadataProperty = useCallback(
    (property: string, value: any) => {
      // If we're changing renderer reset the map state.
      if (
        property === "maputnik:renderer" &&
        value !== get(mapStyle, ["metadata", "maputnik:renderer"], "mlgljs")
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
    },
    [mapStyle, dispatch]
  );

  const onLayerSelect = useCallback(
    (index: number) => {
      dispatch(setSelectedLayerIndex(index));
      if (mapStyle.layers[index]) {
        dispatch(setSelectedLayerOriginalId(mapStyle.layers[index].id));
      }
      setStateInUrl();
    },
    [dispatch, mapStyle.layers, setStateInUrl]
  );

  const onMoveLayer = useCallback(
    (move: SortEnd) => {
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
    },
    [mapStyle.layers, selectedLayerIndex, dispatch]
  );

  const onLayersChange = useCallback(
    (changedLayers: LayerSpecification[]) => {
      const changedStyle = {
        ...mapStyle,
        layers: changedLayers,
      };
      onStyleChanged(changedStyle);
    },
    [mapStyle, onStyleChanged]
  );

  const onLayerDestroy = useCallback(
    (index: number) => {
      const layers = mapStyle.layers;
      const remainingLayers = layers.slice(0);
      remainingLayers.splice(index, 1);
      onLayersChange(remainingLayers);
    },
    [mapStyle.layers, onLayersChange]
  );

  const onLayerCopy = useCallback(
    (index: number) => {
      const layers = mapStyle.layers;
      const changedLayers = layers.slice(0);

      const clonedLayer = cloneDeep(changedLayers[index]);
      clonedLayer.id = clonedLayer.id + "-copy";
      changedLayers.splice(index, 0, clonedLayer);
      onLayersChange(changedLayers);
    },
    [mapStyle.layers, onLayersChange]
  );

  const onLayerFloorFilterToggle = useCallback(
    (index: number) => {
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
    },
    [mapStyle.layers, selectedFloorId, onLayersChange]
  );

  const onLayerVisibilityToggle = useCallback(
    (index: number) => {
      const layers = mapStyle.layers;
      const changedLayers = layers.slice(0);

      const layer = { ...changedLayers[index] };
      const changedLayout = "layout" in layer ? { ...layer.layout } : {};
      changedLayout.visibility =
        changedLayout.visibility === "none" ? "visible" : "none";

      layer.layout = changedLayout;
      changedLayers[index] = layer;
      onLayersChange(changedLayers);
    },
    [mapStyle.layers, onLayersChange]
  );

  const onLayerIdChange = useCallback(
    (index: number, _oldId: string, newId: string) => {
      const changedLayers = mapStyle.layers.slice(0);
      changedLayers[index] = {
        ...changedLayers[index],
        id: newId,
      };

      onLayersChange(changedLayers);
    },
    [mapStyle.layers, onLayersChange]
  );

  const onLayerChanged = useCallback(
    (index: number, layer: LayerSpecification) => {
      const changedLayers = mapStyle.layers.slice(0);
      changedLayers[index] = layer;

      onLayersChange(changedLayers);
    },
    [mapStyle.layers, onLayersChange]
  );

  const setDefaultValues = useCallback(
    (styleObj: StyleSpecification & { id: string }) => {
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
    },
    []
  );

  const openStyle = useCallback(
    (
      styleObj: StyleSpecification & { id: string },
      fileHandle: FileSystemFileHandle | null
    ) => {
      dispatch(setFileHandle(fileHandle));
      styleObj = setDefaultValues(styleObj);
      onStyleChanged(styleObj);
    },
    [dispatch, setDefaultValues, onStyleChanged]
  );

  const _getRenderer = useCallback(() => {
    const metadata: { [key: string]: string } =
      mapStyle.metadata || ({} as any);
    return metadata["maputnik:renderer"] || "mlgljs";
  }, [mapStyle.metadata]);

  const onMapChange = useCallback(
    (mapView: { zoom: number; center: LngLat }) => {
      dispatch(
        setMapView({
          ...mapView,
          center: { lat: mapView.center.lat, lng: mapView.center.lng },
        })
      );
    },
    [dispatch]
  );

  // TODO ALBA: This should be a component
  const mapRenderer = useCallback(() => {
    // Ensure we have a valid mapStyle before rendering
    if (!mapStyle || !mapStyle.layers) {
      return (
        <div className="maputnik-map__container">
          <div>Loading map...</div>
        </div>
      );
    }

    // Ensure we have a valid mapStyle before creating mapProps
    const validMapStyle = dirtyMapStyle || mapStyle;
    if (!validMapStyle || !validMapStyle.sources) {
      return (
        <div className="maputnik-map__container">
          <div>Loading map style...</div>
        </div>
      );
    }

    const mapProps = {
      // This forces a re-render of the component
      key: validMapStyle.id,
      mapStyle: validMapStyle,
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
          options={maplibreGlDebugOptions as any}
          inspectModeEnabled={mapViewMode === "inspect"}
          highlightedLayer={mapStyle?.layers?.[selectedLayerIndex]}
          onLayerSelect={onLayerSelect}
        />
      );
    }

    let filterName;
    if (mapViewMode.match(/^filter-/)) {
      filterName = mapViewMode.replace(/^filter-/, "");
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
  }, [
    dirtyMapStyle,
    mapStyle,
    mapViewMode,
    selectedLayerIndex,
    maplibreGlDebugOptions,
    openlayersDebugOptions,
    onMapChange,
    onLayerSelect,
    _getRenderer,
  ]);

  const toggleModalHandler = useCallback(
    (modalName: keyof typeof isOpen) => {
      dispatch(toggleModal(modalName));
    },
    [dispatch]
  );

  const onSetFileHandle = useCallback(
    (fileHandle: FileSystemFileHandle | null) => {
      dispatch(setFileHandle(fileHandle));
    },
    [dispatch]
  );

  const onChangeOpenlayersDebug = useCallback(
    (key: keyof typeof openlayersDebugOptions, value: boolean) => {
      dispatch(setOpenLayersDebugOptions({ [key]: value }));
    },
    [dispatch]
  );

  const onChangeMaplibreGlDebug = useCallback(
    (key: keyof typeof maplibreGlDebugOptions, value: any) => {
      dispatch(setMaplibreGlDebugOptions({ [key]: value }));
    },
    [dispatch]
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

  const layers = mapStyle.layers || [];
  const selectedLayer =
    layers.length > 0 ? layers[selectedLayerIndex] : undefined;

  // TODO ALBA: This should be a component
  const toolbar = (
    <AppToolbar
      renderer={_getRenderer()}
      mapState={mapViewMode}
      mapStyle={mapStyle}
      inspectModeEnabled={mapViewMode === "inspect"}
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
      isLastLayer={selectedLayerIndex === mapStyle.layers.length - 1}
      sources={sources}
      vectorLayers={vectorLayers}
      spec={styleSpec}
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
      onFloorSelected={(floorId) => dispatch(setSelectedFloorId(floorId))}
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
};

export default App;
