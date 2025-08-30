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
    setZoom: (state, action: PayloadAction<number>) => {
      state.mapView.zoom = action.payload;
    },
    setCenter: (state, action: PayloadAction<{ lng: number; lat: number }>) => {
      state.mapView.center = action.payload;
    },
    setLongitude: (state, action: PayloadAction<number>) => {
      state.mapView.center.lng = action.payload;
    },
    setLatitude: (state, action: PayloadAction<number>) => {
      state.mapView.center.lat = action.payload;
    },
    zoomIn: (state) => {
      state.mapView.zoom = Math.min(state.mapView.zoom + 1, 22);
    },
    zoomOut: (state) => {
      state.mapView.zoom = Math.max(state.mapView.zoom - 1, 0);
    },
  },
});

export const {
  setMapView,
  setZoom,
  setCenter,
  setLongitude,
  setLatitude,
  zoomIn,
  zoomOut,
} = mapViewSlice.actions;

export default mapViewSlice.reducer;
