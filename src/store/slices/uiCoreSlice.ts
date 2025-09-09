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
  isOpen: {
    settings: false,
    sources: false,
    open: false,
    shortcuts: false,
    export: false,
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
      state.isOpen[modalName] = !state.isOpen[modalName];
    },
    openModal: (state, action: PayloadAction<keyof ModalStates>) => {
      const modalName = action.payload;
      state.isOpen[modalName] = true;
    },
    closeModal: (state, action: PayloadAction<keyof ModalStates>) => {
      const modalName = action.payload;
      state.isOpen[modalName] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.isOpen).forEach((key) => {
        state.isOpen[key as keyof ModalStates] = false;
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
  },
});

// Selectors
export const selectMapViewMode = createSelector(
  (state: AppState) => state.uiCore,
  (slice: UICoreState) => slice.mapViewMode
);

export const selectIsModalOpen = createSelector(
  (state: AppState) => state.uiCore,
  (slice: UICoreState) => slice.isOpen
);

export const selectFloorIds = createSelector(
  (state: AppState) => state.uiCore,
  (slice: UICoreState) => slice.floorIds
);

export const selectSelectedFloorId = createSelector(
  (state: AppState) => state.uiCore,
  (slice: UICoreState) => slice.selectedFloorId
);

export const selectErrorMessages = createSelector(
  (state: AppState) => state.uiCore,
  (slice: UICoreState) => slice.errors
);

export const selectInfoMessages = createSelector(
  (state: AppState) => state.uiCore,
  (slice: UICoreState) => slice.infos
);

export const selectMapView = createSelector(
  (state: AppState) => state.uiCore,
  (slice: UICoreState) => slice.mapView
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
} = uiCoreSlice.actions;

export default uiCoreSlice.reducer;
