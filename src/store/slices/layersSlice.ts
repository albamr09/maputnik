import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { LayersState } from '../types';

const initialState: LayersState = {
  selectedLayerIndex: 0,
  selectedLayerOriginalId: undefined,
  vectorLayers: {},
};

const layersSlice = createSlice({
  name: 'layers',
  initialState,
  reducers: {
    setSelectedLayerIndex: (state, action: PayloadAction<number>) => {
      state.selectedLayerIndex = action.payload;
    },
    setSelectedLayerOriginalId: (state, action: PayloadAction<string | undefined>) => {
      state.selectedLayerOriginalId = action.payload;
    },
    setVectorLayers: (state, action: PayloadAction<{}>) => {
      state.vectorLayers = action.payload;
    },
  },
});

export const {
  setSelectedLayerIndex,
  setSelectedLayerOriginalId,
  setVectorLayers,
} = layersSlice.actions;

export default layersSlice.reducer;
