import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SourceSpecification } from 'maplibre-gl';
import type { SourcesState } from '../types';

const initialState: SourcesState = {
  sources: {},
};

const sourcesSlice = createSlice({
  name: 'sources',
  initialState,
  reducers: {
    setSources: (state, action: PayloadAction<{ [key: string]: SourceSpecification }>) => {
      state.sources = action.payload;
    },
    addSource: (state, action: PayloadAction<{ id: string; source: SourceSpecification }>) => {
      const { id, source } = action.payload;
      state.sources[id] = source;
    },
  },
});

export const {
  setSources,
  addSource,
} = sourcesSlice.actions;

export default sourcesSlice.reducer;
