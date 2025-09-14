import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppState } from "../index";
import type {
  MapViewMode,
  ModalStates,
  MappedError,
  MapView,
  UICoreState,
} from "../types";
import { createSelector } from "reselect";

const initialState: UICoreState = {
  // UI
  mapViewMode: "map",
  modalsState: {
    settings: false,
    sources: false,
    open: false,
    shortcuts: false,
    debug: false,
  },
  selectedFloorId: undefined,
  floorIds: [],

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
    setMapState: (state, action: PayloadAction<MapViewMode>) => {
      state.mapViewMode = action.payload;
    },
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
    setSelectedFloorId: (state, action: PayloadAction<number | undefined>) => {
      state.selectedFloorId = action.payload;
    },
    setFloorIds: (state, action: PayloadAction<number[]>) => {
      state.floorIds = action.payload;
    },

    // Errors actions
    addError: (state: UICoreState, action: PayloadAction<MappedError>) => {
      state.errors.push(action.payload);
    },
    clearErrors: (state: UICoreState) => {
      state.errors = [];
    },
    addInfo: (state: UICoreState, action: PayloadAction<string>) => {
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
    setMapView: (state: UICoreState, action: PayloadAction<MapView>) => {
      state.mapView = action.payload;
    },
    setMapViewMode: (
      state: UICoreState,
      action: PayloadAction<MapViewMode>,
    ) => {
      state.mapViewMode = action.payload;
    },
  },
});

// Selectors
export const selectMapViewMode = createSelector(
  (state: AppState) => state.uiCore,
  (slice: UICoreState) => slice.mapViewMode,
);

export const selectModalsState = createSelector(
  (state: AppState) => state.uiCore,
  (slice: UICoreState) => slice.modalsState,
);

export const selectFloorIds = createSelector(
  (state: AppState) => state.uiCore,
  (slice: UICoreState) => slice.floorIds,
);

export const selectSelectedFloorId = createSelector(
  (state: AppState) => state.uiCore,
  (slice: UICoreState) => slice.selectedFloorId,
);

export const selectErrorMessages = createSelector(
  (state: AppState) => state.uiCore,
  (slice: UICoreState) => slice.errors,
);

export const selectInfoMessages = createSelector(
  (state: AppState) => state.uiCore,
  (slice: UICoreState) => slice.infos,
);

export const selectMapView = createSelector(
  (state: AppState) => state.uiCore,
  (slice: UICoreState) => slice.mapView,
);

// Export actions
export const {
  // UI actions
  setMapState,
  toggleModal,
  openModal,
  closeModal,
  closeAllModals,
  setSelectedFloorId,
  setFloorIds,

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
