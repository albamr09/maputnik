import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  ExtendedStyleSpecification,
  MaplibreGlDebugOptions,
  StyleCoreState,
} from "../types";
import style from "../../libs/style";
import { AppState } from "../index";
import { createSelector } from "reselect";
import { SourceSpecification, TerrainSpecification } from "maplibre-gl";

const initialState: StyleCoreState = {
  // Style
  mapStyle: style.emptyStyle,
  dirtyMapStyle: undefined,
  spec: null,
  fileHandle: null,

  // Sources
  sources: {},

  // Layers
  selectedLayerIndex: 0,
  selectedLayerOriginalId: undefined,
  vectorLayers: {},

  // Debug
  maplibreGlDebugOptions: {
    showTileBoundaries: false,
    showCollisionBoxes: false,
    showOverdrawInspector: false,
  },
};

const styleCoreSlice = createSlice({
  name: "styleCore",
  initialState,
  reducers: {
    // Style actions
    setMapStyle: (state, action: PayloadAction<ExtendedStyleSpecification>) => {
      // @ts-ignore
      state.mapStyle = action.payload;
      state.dirtyMapStyle = undefined;
    },
    setDirtyMapStyle: (
      state,
      action: PayloadAction<ExtendedStyleSpecification>,
    ) => {
      state.dirtyMapStyle = action.payload;
    },
    setSpec: (state, action: PayloadAction<any>) => {
      state.spec = action.payload;
    },
    setFileHandle: (
      state,
      action: PayloadAction<FileSystemFileHandle | null>,
    ) => {
      state.fileHandle = action.payload;
    },

    // Sources actions
    setSources: (
      state,
      action: PayloadAction<{ [key: string]: SourceSpecification }>,
    ) => {
      state.sources = action.payload;
    },
    addSource: (
      state,
      action: PayloadAction<{ id: string; source: SourceSpecification }>,
    ) => {
      const { id, source } = action.payload;
      state.sources[id] = source;
    },

    // Layers actions
    setSelectedLayerIndex: (state, action: PayloadAction<number>) => {
      state.selectedLayerIndex = action.payload;
    },
    setSelectedLayerOriginalId: (
      state,
      action: PayloadAction<string | undefined>,
    ) => {
      state.selectedLayerOriginalId = action.payload;
    },
    setVectorLayers: (state, action: PayloadAction<{}>) => {
      state.vectorLayers = action.payload;
    },

    // Debug actions
    setMaplibreGlDebugOptions: (
      state,
      action: PayloadAction<Partial<MaplibreGlDebugOptions>>,
    ) => {
      state.maplibreGlDebugOptions = {
        ...state.maplibreGlDebugOptions,
        ...action.payload,
      };
    },
    resetDebugOptions: (state) => {
      state.maplibreGlDebugOptions = initialState.maplibreGlDebugOptions;
    },
  },
});

const sliceData = (state: AppState) => state.styleCore;

// Selectors
export const selectMapStyle = createSelector(
  sliceData,
  (slice: StyleCoreState) => slice.mapStyle,
);

export const selectMapStyleTerrain = createSelector(
  sliceData,
  (slice: StyleCoreState) => slice.mapStyle.terrain,
);

export const selectMapStyleTransition = createSelector(
  sliceData,
  (slice: StyleCoreState) => slice.mapStyle.transition,
);

export const selectMapStyleLight = createSelector(
  sliceData,
  (slice: StyleCoreState) => slice.mapStyle.light,
);

export const selectDirtyMapStyle = createSelector(
  sliceData,
  (slice: StyleCoreState) => slice.dirtyMapStyle,
);

export const selectMapStyleToRender = createSelector(
  [selectMapStyle, selectDirtyMapStyle],
  (mapStyle, dirtyMapStyle) => dirtyMapStyle || mapStyle,
);

export const selectStyleSpec = createSelector(
  sliceData,
  (slice: StyleCoreState) => slice.spec,
);

export const selectFileHandle = createSelector(
  sliceData,
  (slice: StyleCoreState) => slice.fileHandle,
);

export const selectSources = createSelector(
  sliceData,
  (slice: StyleCoreState) => slice.sources,
);

export const selectSelectedLayerIndex = createSelector(
  sliceData,
  (slice: StyleCoreState) => slice.selectedLayerIndex,
);

export const selectSelectedLayer = createSelector(
  [selectMapStyle, selectSelectedLayerIndex],
  (mapStyle, selectedLayerIndex) => {
    if (!mapStyle || !mapStyle.layers) return undefined;
    return mapStyle.layers[selectedLayerIndex];
  },
);

export const selectSelectedLayerOriginalId = createSelector(
  sliceData,
  (slice: StyleCoreState) => slice.selectedLayerOriginalId,
);

export const selectVectorLayers = createSelector(
  sliceData,
  (slice: StyleCoreState) => slice.vectorLayers,
);

export const selectMapStyleLayers = createSelector(
  sliceData,
  (slice: StyleCoreState) => slice.mapStyle?.layers ?? [],
);

export const selectMaplibreGlDebugOptions = createSelector(
  sliceData,
  (slice: StyleCoreState) => slice.maplibreGlDebugOptions,
);

// Export actions
export const {
  // Style actions
  setMapStyle,
  setDirtyMapStyle,
  setSpec,
  setFileHandle,

  // Sources actions
  setSources,
  addSource,

  // Layers actions
  setSelectedLayerIndex,
  setSelectedLayerOriginalId,
  setVectorLayers,

  // Debug actions
  setMaplibreGlDebugOptions,
  resetDebugOptions,
} = styleCoreSlice.actions;

export default styleCoreSlice.reducer;
