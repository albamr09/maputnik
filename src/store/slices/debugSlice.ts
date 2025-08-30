import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DebugState, MaplibreGlDebugOptions, OpenLayersDebugOptions } from '../types';

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
  name: 'debug',
  initialState,
  reducers: {
    setMaplibreGlDebugOptions: (state, action: PayloadAction<Partial<MaplibreGlDebugOptions>>) => {
      state.maplibreGlDebugOptions = { ...state.maplibreGlDebugOptions, ...action.payload };
      state.maplibreGlDebugOptions = state.maplibreGlDebugOptions;
    },
    toggleMaplibreGlDebugOption: (state, action: PayloadAction<keyof MaplibreGlDebugOptions>) => {
      const option = action.payload;
      state.maplibreGlDebugOptions[option] = !state.maplibreGlDebugOptions[option];
    },
    setOpenLayersDebugOptions: (state, action: PayloadAction<Partial<OpenLayersDebugOptions>>) => {
      state.openLayersDebugOptions = { ...state.openLayersDebugOptions, ...action.payload };
    },
    toggleOpenLayersDebugOption: (state, action: PayloadAction<keyof OpenLayersDebugOptions>) => {
      const option = action.payload;
      state.openLayersDebugOptions[option] = !state.openLayersDebugOptions[option];
    },
    resetDebugOptions: (state) => {
      state.maplibreGlDebugOptions = initialState.maplibreGlDebugOptions;
      state.openLayersDebugOptions = initialState.openLayersDebugOptions;
    },
  },
});

export const {
  setMaplibreGlDebugOptions,
  toggleMaplibreGlDebugOption,
  setOpenLayersDebugOptions,
  toggleOpenLayersDebugOption,
  resetDebugOptions,
} = debugSlice.actions;

export default debugSlice.reducer;
