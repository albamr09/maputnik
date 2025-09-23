import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppState } from "../index";
import type { ModalName, UICoreState } from "../types";
import { createSelector } from "reselect";

const initialState: UICoreState = {
  // UI
  mapViewMode: "map",
  modalOpenName: undefined,

  // Situm
  apikey: undefined,
  buildingId: undefined,
  selectedFloorId: undefined,
  floorIds: [],
  environment: "pro",

  // Errors
  errors: [],
  infos: [],

  // MapView
  mapView: {
    zoom: 0,
    center: {
      lng: 0,
      lat: 0,
    },
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // UI actions
    toggleModal: (state, action: PayloadAction<ModalName>) => {
      if (action.payload !== state.modalOpenName) {
        state.modalOpenName = action.payload;
      } else {
        state.modalOpenName = undefined;
      }
    },
    openModal: (state, action: PayloadAction<ModalName>) => {
      state.modalOpenName = action.payload;
    },
    closeModal: (state) => {
      state.modalOpenName = undefined;
    },

    // Situm actions
    setApiKey: (
      state: UICoreState,
      action: PayloadAction<UICoreState["apikey"]>,
    ) => {
      state.apikey = action.payload;
    },
    setBuildingId: (
      state: UICoreState,
      action: PayloadAction<UICoreState["buildingId"]>,
    ) => {
      state.buildingId = action.payload;
    },
    setSelectedFloorId: (
      state,
      action: PayloadAction<UICoreState["selectedFloorId"]>,
    ) => {
      state.selectedFloorId = action.payload;
    },
    setFloorIds: (state, action: PayloadAction<UICoreState["floorIds"]>) => {
      state.floorIds = action.payload;
    },
    setEnvironment: (
      state,
      action: PayloadAction<UICoreState["environment"]>,
    ) => {
      state.environment = action.payload;
    },

    // Errors actions
    addError: (
      state: UICoreState,
      action: PayloadAction<UICoreState["errors"][number]>,
    ) => {
      state.errors.push(action.payload);
    },
    clearErrors: (state: UICoreState) => {
      state.errors = [];
    },
    addInfo: (
      state: UICoreState,
      action: PayloadAction<UICoreState["infos"][number]>,
    ) => {
      state.infos.push(action.payload);
    },
    clearInfos: (state: UICoreState) => {
      state.infos = [];
    },
    clearAllMessages: (state: UICoreState) => {
      state.errors = [];
      state.infos = [];
    },

    // MapView actions
    setMapView: (
      state: UICoreState,
      action: PayloadAction<UICoreState["mapView"]>,
    ) => {
      state.mapView = action.payload;
    },
    setMapViewMode: (
      state: UICoreState,
      action: PayloadAction<UICoreState["mapViewMode"]>,
    ) => {
      state.mapViewMode = action.payload;
    },
  },
});

const sliceState = (state: AppState) => state.ui;

// Selectors
export const selectMapViewMode = createSelector(
  sliceState,
  (slice: UICoreState) => slice.mapViewMode,
);

export const selectModalOpenName = createSelector(
  sliceState,
  (slice: UICoreState) => slice.modalOpenName,
);

export const selectFloorIds = createSelector(
  sliceState,
  (slice: UICoreState) => slice.floorIds,
);

export const selectSelectedFloorId = createSelector(
  sliceState,
  (slice: UICoreState) => slice.selectedFloorId,
);

export const selectErrorMessages = createSelector(
  sliceState,
  (slice: UICoreState) => slice.errors,
);

export const selectInfoMessages = createSelector(
  sliceState,
  (slice: UICoreState) => slice.infos,
);

export const selectMapView = createSelector(
  sliceState,
  (slice: UICoreState) => slice.mapView,
);

export const selectApiKey = createSelector(
  sliceState,
  (slice: UICoreState) => slice.apikey,
);

export const selectBuildingId = createSelector(
  sliceState,
  (slice: UICoreState) => slice.buildingId,
);

export const selectEnvironment = createSelector(
  sliceState,
  (slice: UICoreState) => slice.environment,
);

// Export actions
export const {
  // UI actions
  toggleModal,
  openModal,
  closeModal,

  // Situm actions
  setApiKey,
  setBuildingId,
  setSelectedFloorId,
  setFloorIds,
  setEnvironment,

  // Errors actions
  addError,
  clearErrors,
  addInfo,
  clearInfos,
  clearAllMessages,

  // MapView actions
  setMapView,
  setMapViewMode,
} = uiSlice.actions;

export default uiSlice.reducer;
