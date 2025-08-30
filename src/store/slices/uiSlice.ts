import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UIState, MapState, ModalStates } from '../types';

const initialState: UIState = {
  mapState: 'map',
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
  situmSDK: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMapState: (state, action: PayloadAction<MapState>) => {
      state.mapState = action.payload;
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
    // TODO ALBA: This maybe should not be here
    setFloorIds: (state, action: PayloadAction<number[]>) => {
      state.floorIds = action.payload;
    },
    // TODO ALBA: This maybe should not be here
    setSitumSDK: (state, action: PayloadAction<any>) => {
      state.situmSDK = action.payload;
    },
  },
});

export const {
  setMapState,
  toggleModal,
  openModal,
  closeModal,
  closeAllModals,
  setSelectedFloorId,
  setFloorIds,
  setSitumSDK,
} = uiSlice.actions;

export default uiSlice.reducer;
