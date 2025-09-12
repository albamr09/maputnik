import { useCallback, useMemo } from "react";
import MapMaplibreGl from "../MapMaplibreGl";
import { StyleSpecification, Map, LngLat } from "maplibre-gl";
import ScrollContainer from "../ScrollContainer";
import { withTranslation } from "react-i18next";
import LayerList from "../LayerList";
import FloorSelector from "../FloorSelector";
import MessagePanel from "../AppMessagePanel";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import get from "lodash.get";
import {
  selectErrorMessages,
  selectFloorIds,
  selectInfoMessages,
  selectModalsState,
  selectMapView,
  selectMapViewMode,
  selectSelectedFloorId,
  setMapView,
  setSelectedFloorId,
  toggleModal,
} from "../../store/slices/uiCoreSlice";
import ModalDebug from "../ModalDebug";
import {
  selectFileHandle,
  selectMaplibreGlDebugOptions,
  selectMapStyle,
  selectMapStyleLayers,
  selectMapStyleToRender,
  selectSelectedLayer,
  selectSelectedLayerIndex,
  selectSelectedLayerOriginalId,
  selectSources,
  selectStyleSpec,
  selectVectorLayers,
  setFileHandle,
  setMaplibreGlDebugOptions,
} from "../../store/slices/styleCoreSlice";
import ModalShortcuts from "../ModalShortcuts";
import ModalSettings from "../ModalSettings";
import ModalExport from "../ModalExport";
import ModalOpen from "../ModalOpen";
import ModalSources from "../ModalSources";
import useStyleEdition from "../../hooks/useStyleEdition";
import { setMapState } from "../../store/slices/uiCoreSlice";
import { ExtendedStyleSpecification } from "../../store/types";
import LayerEditor from "../LayerEditor";
import useLayerEdition from "../../hooks/useLayerEdition";
import style from "../../libs/style";
import Toolbar from "@/components/organisms/toolbar";
import ModalManager from "@/components/organisms/modal-manager";

const _AppLayout = () => {
  const dispatch = useAppDispatch();
  const selectedFloorId = useAppSelector(selectSelectedFloorId);
  const floorIds = useAppSelector(selectFloorIds);
  const maplibreGlDebugOptions = useAppSelector(selectMaplibreGlDebugOptions);
  const modalsState = useAppSelector(selectModalsState);
  const mapStyle = useAppSelector(selectMapStyle);
  const errors = useAppSelector(selectErrorMessages);
  const infos = useAppSelector(selectInfoMessages);
  const selectedLayerIndex = useAppSelector(selectSelectedLayerIndex);
  const selectedLayer = useAppSelector(selectSelectedLayer);
  const selectedLayerOriginalId = useAppSelector(selectSelectedLayerOriginalId);
  const sources = useAppSelector(selectSources);
  const vectorLayers = useAppSelector(selectVectorLayers);
  const styleSpec = useAppSelector(selectStyleSpec);
  const mapStyleLayers = useAppSelector(selectMapStyleLayers);
  const mapViewMode = useAppSelector(selectMapViewMode);
  const mapStyleToRender = useAppSelector(selectMapStyleToRender);

  const { onStyleChanged, fetchSources } = useStyleEdition();
  const {
    onMoveLayer,
    onLayerSelect,
    onLayerChanged,
    onLayerDestroy,
    onLayerCopy,
    onLayerVisibilityToggle,
    onLayerIdChange,
    onLayerFloorFilterToggle,
    onLayersChange,
  } = useLayerEdition();

  // TODO ALBA: Most of these functions should be inside of each component
  const toggleModalHandler = useCallback(
    (modalName: keyof typeof modalsState) => {
      dispatch(toggleModal(modalName));
    },
    [dispatch],
  );

  const onChangeMaplibreGlDebug = useCallback(
    (key: keyof typeof maplibreGlDebugOptions, value: any) => {
      dispatch(setMaplibreGlDebugOptions({ [key]: value }));
    },
    [dispatch],
  );

  const onSetFileHandle = useCallback(
    (fileHandle: FileSystemFileHandle | null) => {
      dispatch(setFileHandle(fileHandle));
    },
    [dispatch],
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
    [mapStyle, dispatch],
  );

  const openStyle = useCallback(
    (
      styleObj: ExtendedStyleSpecification,
      fileHandle: FileSystemFileHandle | null,
    ) => {
      dispatch(setFileHandle(fileHandle));
      onStyleChanged(styleObj);
    },
    [dispatch, onStyleChanged],
  );

  const onMapChange = useCallback(
    (mapView: { zoom: number; center: LngLat }) => {
      dispatch(
        setMapView({
          ...mapView,
          center: { lat: mapView.center.lat, lng: mapView.center.lng },
        }),
      );
    },
    [dispatch],
  );

  const isMapLoaded = useMemo(() => {
    return (
      mapStyleToRender && mapStyleToRender.layers && mapStyleToRender.sources
    );
  }, [mapStyleToRender]);

  const mapElementStyle = useMemo(() => {
    let filterName;
    if (mapViewMode.match(/^filter-/)) {
      filterName = mapViewMode.replace(/^filter-/, "");
    }
    const elementStyle: { filter?: string } = {};
    if (filterName) {
      elementStyle.filter = `url('#${filterName}')`;
    }
    return elementStyle;
  }, [mapViewMode]);

  return (
    <div>
      <Toolbar />
      <div className="maputnik-layout-main">
        <div className="maputnik-layout-list">
          <LayerList
            onMoveLayer={onMoveLayer}
            onLayerDestroy={onLayerDestroy}
            onLayerCopy={onLayerCopy}
            onLayerVisibilityToggle={onLayerVisibilityToggle}
            onLayerFloorFilterToggle={onLayerFloorFilterToggle}
            onLayersChange={onLayersChange}
            onLayerSelect={onLayerSelect}
            selectedLayerIndex={selectedLayerIndex}
            layers={mapStyleLayers}
            sources={sources}
            errors={errors}
          />
        </div>
        {selectedLayer && (
          <div className="maputnik-layout-drawer">
            <ScrollContainer>
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
            </ScrollContainer>
          </div>
        )}
        {isMapLoaded && (
          <div
            style={mapElementStyle}
            className="maputnik-map__container"
            data-wd-key="maplibre:container"
          >
            <MapMaplibreGl
              key={mapStyleToRender.id}
              mapStyle={mapStyleToRender}
              replaceAccessTokens={(mapStyle: StyleSpecification) => {
                return style.replaceAccessTokens(mapStyle, {
                  allowFallback: true,
                });
              }}
              onDataChange={(_e: { map: Map }) => {
                // TODO ALBA: I should restore this some time
                //layerWatcherRef.current?.analyzeMap(e.map);
                fetchSources();
              }}
              onChange={onMapChange}
              options={maplibreGlDebugOptions as any}
              inspectModeEnabled={mapViewMode === "inspect"}
              highlightedLayer={mapStyleLayers?.[selectedLayerIndex]}
              onLayerSelect={onLayerSelect}
            />
          </div>
        )}
      </div>
      {/* TODO ALBA: Does this even work? */}
      {errors.length + infos.length > 0 && (
        <div className="maputnik-layout-bottom">
          <MessagePanel
            currentLayer={selectedLayer}
            selectedLayerIndex={selectedLayerIndex}
            onLayerSelect={onLayerSelect}
            mapStyle={mapStyle}
            errors={errors}
            infos={infos}
          />
        </div>
      )}

      {/*Modals*/}
      <ModalManager />

      {/*Floor selector*/}
      <FloorSelector
        selectedFloorId={selectedFloorId}
        floorIds={floorIds}
        onFloorSelected={(floorId) => dispatch(setSelectedFloorId(floorId))}
      />
    </div>
  );
};

const AppLayout = withTranslation()(_AppLayout);
export default AppLayout;
