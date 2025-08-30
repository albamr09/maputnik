import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { SourceSpecification } from "maplibre-gl";
import { AppState } from "../index";
import type { SourcesState } from "../types";
import { createSelector } from "reselect";

const initialState: SourcesState = {
  sources: {},
};

const sourcesSlice = createSlice({
  name: "sources",
  initialState,
  reducers: {
    setSources: (
      state: SourcesState,
      action: PayloadAction<{ [key: string]: SourceSpecification }>
    ) => {
      state.sources = action.payload;
    },
    addSource: (
      state: SourcesState,
      action: PayloadAction<{ id: string; source: SourceSpecification }>
    ) => {
      const { id, source } = action.payload;
      state.sources[id] = source;
    },
  },
});

export const selectSources = createSelector(
  (state: AppState) => state.sources,
  (slice: SourcesState) => slice.sources
);

export const { setSources, addSource } = sourcesSlice.actions;

export default sourcesSlice.reducer;
