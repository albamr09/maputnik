import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ExtendedStyleSpecification, StyleState } from "../types";
import style from "../../libs/style";
import { AppState } from "../index";
import { createSelector } from "reselect";

const initialState: StyleState = {
  mapStyle: style.emptyStyle,
  dirtyMapStyle: undefined,
  spec: null,
  fileHandle: null,
};

const styleSlice = createSlice({
  name: "style",
  initialState,
  reducers: {
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
    // TODO ALBA: what is this?
    setSpec: (state, action: PayloadAction<any>) => {
      state.spec = action.payload;
    },
    // TODO ALBA: what is this?
    setFileHandle: (
      state,
      action: PayloadAction<FileSystemFileHandle | null>
    ) => {
      state.fileHandle = action.payload;
    },
  },
});

export const selectMapStyle = createSelector(
  (state: AppState) => state.style,
  (slice: StyleState) => slice.mapStyle
);

export const selectDirtyMapStyle = createSelector(
  (state: AppState) => state.style,
  (slice: StyleState) => slice.dirtyMapStyle
);

export const selectStyleSpec = createSelector(
  (state: AppState) => state.style,
  (slice: StyleState) => slice.spec
);

export const selectFileHandle = createSelector(
  (state: AppState) => state.style,
  (slice: StyleState) => slice.fileHandle
);

export const { setMapStyle, setDirtyMapStyle, setSpec, setFileHandle } =
  styleSlice.actions;

export default styleSlice.reducer;
