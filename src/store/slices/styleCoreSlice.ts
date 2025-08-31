import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
    ExtendedStyleSpecification,
    MaplibreGlDebugOptions,
    OpenLayersDebugOptions,
    StyleCoreState
} from "../types";
import style from "../../libs/style";
import { AppState } from "../index";
import { createSelector } from "reselect";
import { SourceSpecification } from "maplibre-gl";

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
    openLayersDebugOptions: {
        debugToolbox: false,
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
            action: PayloadAction<ExtendedStyleSpecification>
        ) => {
            state.dirtyMapStyle = action.payload;
        },
        setSpec: (state, action: PayloadAction<any>) => {
            state.spec = action.payload;
        },
        setFileHandle: (
            state,
            action: PayloadAction<FileSystemFileHandle | null>
        ) => {
            state.fileHandle = action.payload;
        },

        // Sources actions
        setSources: (
            state,
            action: PayloadAction<{ [key: string]: SourceSpecification }>
        ) => {
            state.sources = action.payload;
        },
        addSource: (
            state,
            action: PayloadAction<{ id: string; source: SourceSpecification }>
        ) => {
            const { id, source } = action.payload;
            state.sources[id] = source;
        },

        // Layers actions
        setSelectedLayerIndex: (
            state,
            action: PayloadAction<number>
        ) => {
            state.selectedLayerIndex = action.payload;
        },
        setSelectedLayerOriginalId: (
            state,
            action: PayloadAction<string | undefined>
        ) => {
            state.selectedLayerOriginalId = action.payload;
        },
        setVectorLayers: (state, action: PayloadAction<{}>) => {
            state.vectorLayers = action.payload;
        },

        // Debug actions
        setMaplibreGlDebugOptions: (
            state,
            action: PayloadAction<Partial<MaplibreGlDebugOptions>>
        ) => {
            state.maplibreGlDebugOptions = {
                ...state.maplibreGlDebugOptions,
                ...action.payload,
            };
        },
        setOpenLayersDebugOptions: (
            state,
            action: PayloadAction<Partial<OpenLayersDebugOptions>>
        ) => {
            state.openLayersDebugOptions = {
                ...state.openLayersDebugOptions,
                ...action.payload,
            };
        },
        resetDebugOptions: (state) => {
            state.maplibreGlDebugOptions = initialState.maplibreGlDebugOptions;
            state.openLayersDebugOptions = initialState.openLayersDebugOptions;
        },
    },
});

// Selectors
export const selectMapStyle = createSelector(
    (state: AppState) => state.styleCore,
    (slice: StyleCoreState) => slice.mapStyle
);

export const selectDirtyMapStyle = createSelector(
    (state: AppState) => state.styleCore,
    (slice: StyleCoreState) => slice.dirtyMapStyle
);

export const selectStyleSpec = createSelector(
    (state: AppState) => state.styleCore,
    (slice: StyleCoreState) => slice.spec
);

export const selectFileHandle = createSelector(
    (state: AppState) => state.styleCore,
    (slice: StyleCoreState) => slice.fileHandle
);

export const selectSources = createSelector(
    (state: AppState) => state.styleCore,
    (slice: StyleCoreState) => slice.sources
);

export const selectSelectedLayerIndex = createSelector(
    (state: AppState) => state.styleCore,
    (slice: StyleCoreState) => slice.selectedLayerIndex
);

export const selectSelectedLayerOriginalId = createSelector(
    (state: AppState) => state.styleCore,
    (slice: StyleCoreState) => slice.selectedLayerOriginalId
);

export const selectVectorLayers = createSelector(
    (state: AppState) => state.styleCore,
    (slice: StyleCoreState) => slice.vectorLayers
);

export const selectMaplibreGlDebugOptions = createSelector(
    (state: AppState) => state.styleCore,
    (slice: StyleCoreState) => slice.maplibreGlDebugOptions
);

export const selectOpenLayersDebugOptions = createSelector(
    (state: AppState) => state.styleCore,
    (slice: StyleCoreState) => slice.openLayersDebugOptions
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
    setOpenLayersDebugOptions,
    resetDebugOptions,
} = styleCoreSlice.actions;

export default styleCoreSlice.reducer;
