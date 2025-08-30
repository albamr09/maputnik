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
    updateSource: (state, action: PayloadAction<{ id: string; source: Partial<SourceSpecification> }>) => {
      const { id, source } = action.payload;
      if (state.sources[id]) {
        state.sources[id] = { ...state.sources[id], ...source } as SourceSpecification;
      }
    },
    removeSource: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.sources[id];
    },
    clearSources: (state) => {
      state.sources = {};
    },
  },
});

export const {
  setSources,
  addSource,
  updateSource,
  removeSource,
  clearSources,
} = sourcesSlice.actions;

export default sourcesSlice.reducer;
