import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ExtendedStyleSpecification, StyleState } from '../types';
import style from '../../libs/style';

const initialState: StyleState = {
  mapStyle: style.emptyStyle,
  dirtyMapStyle: undefined,
  spec: null,
  fileHandle: null,
};

const styleSlice = createSlice({
  name: 'style',
  initialState,
  reducers: {
    setMapStyle: (state, action: PayloadAction<ExtendedStyleSpecification>) => {
      // @ts-ignore
      state.mapStyle = action.payload;
      state.dirtyMapStyle = undefined;
    },
    setDirtyMapStyle: (state, action: PayloadAction<ExtendedStyleSpecification>) => {
      state.dirtyMapStyle = action.payload;
    },
    clearDirtyMapStyle: (state) => {
      state.dirtyMapStyle = undefined;
    },
    setSpec: (state, action: PayloadAction<any>) => {
      state.spec = action.payload;
    },
    setFileHandle: (state, action: PayloadAction<FileSystemFileHandle | null>) => {
      state.fileHandle = action.payload;
    },
    updateStyleProperty: (state, action: PayloadAction<{ path: string; value: any }>) => {
      // TODO ALBA: This is a placeholder - you'll need to implement deep property updates
      // using a library like lodash.set or similar
    },
  },
});

export const {
  setMapStyle,
  setDirtyMapStyle,
  clearDirtyMapStyle,
  setSpec,
  setFileHandle,
  updateStyleProperty,
} = styleSlice.actions;

export default styleSlice.reducer;
