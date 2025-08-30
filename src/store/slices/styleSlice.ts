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
    setSpec: (state, action: PayloadAction<any>) => {
      state.spec = action.payload;
    },
    setFileHandle: (state, action: PayloadAction<FileSystemFileHandle | null>) => {
      state.fileHandle = action.payload;
    },
  },
});

export const {
  setMapStyle,
  setDirtyMapStyle,
  setSpec,
  setFileHandle,
} = styleSlice.actions;

export default styleSlice.reducer;
