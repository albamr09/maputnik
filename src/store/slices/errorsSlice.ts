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
    clearErrors: (state) => {
      state.errors = [];
    },
    addInfo: (state, action: PayloadAction<string>) => {
      state.infos.push(action.payload);
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
  clearErrors,
  addInfo,
  clearInfos,
  clearAllMessages,
} = errorsSlice.actions;

export default errorsSlice.reducer;
