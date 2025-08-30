import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppState } from "../index";
import type { LayersState } from "../types";
import { createSelector } from "reselect";

const initialState: LayersState = {
  selectedLayerIndex: 0,
  selectedLayerOriginalId: undefined,
  vectorLayers: {},
};

const layersSlice = createSlice({
  name: "layers",
  initialState,
  reducers: {
    setSelectedLayerIndex: (
      state: LayersState,
      action: PayloadAction<number>
    ) => {
      state.selectedLayerIndex = action.payload;
    },
    setSelectedLayerOriginalId: (
      state: LayersState,
      action: PayloadAction<string | undefined>
    ) => {
      state.selectedLayerOriginalId = action.payload;
    },
    setVectorLayers: (state: LayersState, action: PayloadAction<{}>) => {
      state.vectorLayers = action.payload;
    },
  },
});

export const selectSelectedLayerIndex = createSelector(
  (state: AppState) => state.layers,
  (slice: LayersState) => slice.selectedLayerIndex
);

export const selectSelectedLayerOriginalId = createSelector(
  (state: AppState) => state.layers,
  (slice: LayersState) => slice.selectedLayerOriginalId
);

export const selectVectorLayers = createSelector(
  (state: AppState) => state.layers,
  (slice: LayersState) => slice.vectorLayers
);

export const {
  setSelectedLayerIndex,
  setSelectedLayerOriginalId,
  setVectorLayers,
} = layersSlice.actions;

export default layersSlice.reducer;
