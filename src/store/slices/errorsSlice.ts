import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import { AppState } from "../index";
import type { ErrorsState, MappedError } from "../types";

const initialState: ErrorsState = {
  errors: [],
  infos: [],
};

const errorsSlice = createSlice({
  name: "errors",
  initialState,
  reducers: {
    addError: (state: ErrorsState, action: PayloadAction<MappedError>) => {
      state.errors.push(action.payload);
    },
    clearErrors: (state: ErrorsState) => {
      state.errors = [];
    },
    addInfo: (state: ErrorsState, action: PayloadAction<string>) => {
      state.infos.push(action.payload);
    },
    clearInfos: (state: ErrorsState) => {
      state.infos = [];
    },
    clearAllMessages: (state: ErrorsState) => {
      state.errors = [];
      state.infos = [];
    },
  },
});

export const selectErrorMessages = createSelector(
  (state: AppState) => state.errors,
  (slice: ErrorsState) => slice.errors
);

export const selectInfoMessages = createSelector(
  (state: AppState) => state.errors,
  (slice: ErrorsState) => slice.infos
);

export const { addError, clearErrors, addInfo, clearInfos, clearAllMessages } =
  errorsSlice.actions;

export default errorsSlice.reducer;
