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
    setOpenLayersDebugOptions: (state, action: PayloadAction<Partial<OpenLayersDebugOptions>>) => {
      state.openLayersDebugOptions = { ...state.openLayersDebugOptions, ...action.payload };
    },
    resetDebugOptions: (state) => {
      state.maplibreGlDebugOptions = initialState.maplibreGlDebugOptions;
      state.openLayersDebugOptions = initialState.openLayersDebugOptions;
    },
  },
});

export const {
  setMaplibreGlDebugOptions,
  setOpenLayersDebugOptions,
  resetDebugOptions,
} = debugSlice.actions;

export default debugSlice.reducer;
