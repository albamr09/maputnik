import { configureStore } from '@reduxjs/toolkit';
import type { RootState } from './types';

// Import all slices
import styleReducer from './slices/styleSlice';
import uiReducer from './slices/uiSlice';
import layersReducer from './slices/layersSlice';
import sourcesReducer from './slices/sourcesSlice';
import errorsReducer from './slices/errorsSlice';
import mapViewReducer from './slices/mapViewSlice';
import debugReducer from './slices/debugSlice';

// Configure the store
export const store = configureStore({
  reducer: {
    style: styleReducer,
    ui: uiReducer,
    layers: layersReducer,
    sources: sourcesReducer,
    errors: errorsReducer,
    mapView: mapViewReducer,
    debug: debugReducer,
  },
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production',
});

// Export types
export type AppDispatch = typeof store.dispatch;
export type AppState = RootState;

// Export the store instance
export default store;
