import { clamp } from "lodash";
import cloneDeep from "lodash.clonedeep";
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addFloorFilter,
  hasFloorFilter,
  removeFloorFilter,
} from "@/libs/floor-filter";
import {
  selectMapStyle,
  selectSelectedLayerIndex,
  setSelectedLayerIndex,
  setSelectedLayerOriginalId,
} from "@/store/slices/styleSlice";
import { arrayMoveMutable } from "array-move";
import { SortEnd } from "react-sortable-hoc";
import {
  LayerSpecification,
  ExpressionSpecification,
  LegacyFilterSpecification,
} from "maplibre-gl";
import useStyleEdition from "./useStyleEdition";
import { selectSelectedFloorId } from "@/store/slices/uiSlice";

const useLayerEdition = () => {
  const dispatch = useAppDispatch();
  const mapStyle = useAppSelector(selectMapStyle);
  const selectedLayerIndex = useAppSelector(selectSelectedLayerIndex);
  const selectedFloorId = useAppSelector(selectSelectedFloorId);

  const { onStyleChanged, setStateInUrl } = useStyleEdition();

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

  const onLayerChanged = useCallback(
    (index: number, layer: LayerSpecification) => {
      const changedLayers = mapStyle.layers.slice(0);
      changedLayers[index] = layer;

      onLayersChange(changedLayers);
    },
    [mapStyle.layers, onLayersChange]
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

  return {
    onMoveLayer,
    onLayerSelect,
    onLayersChange,
    onLayerChanged,
    onLayerDestroy,
    onLayerCopy,
    onLayerVisibilityToggle,
    onLayerIdChange,
    onLayerFloorFilterToggle,
  };
};

export default useLayerEdition;
