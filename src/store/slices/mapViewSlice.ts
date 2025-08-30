import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppState } from "../index";
import type { MapViewState, MapView } from "../types";
import { createSelector } from "reselect";

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
  name: "mapView",
  initialState,
  reducers: {
    setMapView: (state: MapViewState, action: PayloadAction<MapView>) => {
      state.mapView = action.payload;
    },
  },
});

export const selectMapView = createSelector(
  (state: AppState) => state.mapView,
  (slice: MapViewState) => slice.mapView
);

export const { setMapView } = mapViewSlice.actions;

export default mapViewSlice.reducer;
