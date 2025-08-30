import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MapViewState, MapView } from '../types';

const initialState: MapViewState = {
  mapView: {
    zoom: 0,
    center: {
      lng: 0,
      lat: 0,
    },
  },
};

const mapViewSlice = createSlice({
  name: 'mapView',
  initialState,
  reducers: {
    setMapView: (state, action: PayloadAction<MapView>) => {
      state.mapView = action.payload;
    },

  },
});

export const {
  setMapView,
} = mapViewSlice.actions;

export default mapViewSlice.reducer;
