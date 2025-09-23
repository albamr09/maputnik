import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppState } from "../index";
import type { ModalStates, UICoreState } from "../types";
import { createSelector } from "reselect";

const initialState: UICoreState = {
  // UI
  mapViewMode: "map",
  modalsState: {
    metadata: false,
    sources: false,
    import: false,
    profile: false,
    shortcuts: false,
    debug: false,
  },

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

const uiCoreSlice = createSlice({
  name: "uiCore",
  initialState,
  reducers: {
    // UI actions
    toggleModal: (state, action: PayloadAction<keyof ModalStates>) => {
      const modalName = action.payload;
      state.modalsState[modalName] = !state.modalsState[modalName];
    },
    openModal: (state, action: PayloadAction<keyof ModalStates>) => {
      const modalName = action.payload;
      state.modalsState[modalName] = true;
    },
    closeModal: (state, action: PayloadAction<keyof ModalStates>) => {
      const modalName = action.payload;
      state.modalsState[modalName] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modalsState).forEach((key) => {
        state.modalsState[key as keyof ModalStates] = false;
      });
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

const sliceState = (state: AppState) => state.uiCore;

// Selectors
export const selectMapViewMode = createSelector(
  sliceState,
  (slice: UICoreState) => slice.mapViewMode,
);

export const selectModalsState = createSelector(
  sliceState,
  (slice: UICoreState) => slice.modalsState,
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
  closeAllModals,

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
} = uiCoreSlice.actions;

export default uiCoreSlice.reducer;
