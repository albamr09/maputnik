import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppState } from "../index";
import { createSelector } from "reselect";
import type {
  DebugState,
  MaplibreGlDebugOptions,
  OpenLayersDebugOptions,
} from "../types";

const initialState: DebugState = {
  maplibreGlDebugOptions: {
    showTileBoundaries: false,
    showCollisionBoxes: false,
    showOverdrawInspector: false,
  },
  openLayersDebugOptions: {
    debugToolbox: false,
  },
};

const debugSlice = createSlice({
  name: "debug",
  initialState,
  reducers: {
    setMaplibreGlDebugOptions: (
      state: DebugState,
      action: PayloadAction<Partial<MaplibreGlDebugOptions>>
    ) => {
      state.maplibreGlDebugOptions = {
        ...state.maplibreGlDebugOptions,
        ...action.payload,
      };
      state.maplibreGlDebugOptions = state.maplibreGlDebugOptions;
    },
    setOpenLayersDebugOptions: (
      state: DebugState,
      action: PayloadAction<Partial<OpenLayersDebugOptions>>
    ) => {
      state.openLayersDebugOptions = {
        ...state.openLayersDebugOptions,
        ...action.payload,
      };
    },
    resetDebugOptions: (state: DebugState) => {
      state.maplibreGlDebugOptions = initialState.maplibreGlDebugOptions;
      state.openLayersDebugOptions = initialState.openLayersDebugOptions;
    },
  },
});

export const selectMaplibreGlDebugOptions = createSelector(
  (state: AppState) => state.debug,
  (slice: DebugState) => slice.maplibreGlDebugOptions
);

export const selectOpenLayersDebugOptions = createSelector(
  (state: AppState) => state.debug,
  (slice: DebugState) => slice.openLayersDebugOptions
);

export const {
  setMaplibreGlDebugOptions,
  setOpenLayersDebugOptions,
  resetDebugOptions,
} = debugSlice.actions;

export default debugSlice.reducer;
