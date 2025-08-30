import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ErrorsState, MappedError } from '../types';

const initialState: ErrorsState = {
  errors: [],
  infos: [],
};

const errorsSlice = createSlice({
  name: 'errors',
  initialState,
  reducers: {
    addError: (state, action: PayloadAction<MappedError>) => {
      state.errors.push(action.payload);
    },
    removeError: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      state.errors.splice(index, 1);
    },
    clearErrors: (state) => {
      state.errors = [];
    },
    addInfo: (state, action: PayloadAction<string>) => {
      state.infos.push(action.payload);
    },
    removeInfo: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      state.infos.splice(index, 1);
    },
    clearInfos: (state) => {
      state.infos = [];
    },
    clearAllMessages: (state) => {
      state.errors = [];
      state.infos = [];
    },
  },
});

export const {
  addError,
  removeError,
  clearErrors,
  addInfo,
  removeInfo,
  clearInfos,
  clearAllMessages,
} = errorsSlice.actions;

export default errorsSlice.reducer;
