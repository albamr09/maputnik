import { configureStore } from '@reduxjs/toolkit';
import type { RootState } from './types';

// Import merged slices
import styleCoreReducer from './slices/styleCoreSlice';
import uiCoreReducer from './slices/uiCoreSlice';

// Configure the store
export const store = configureStore({
  reducer: {
    styleCore: styleCoreReducer,
    uiCore: uiCoreReducer,
  },
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production',
});

// Export types
export type AppDispatch = typeof store.dispatch;
export type AppState = RootState;

// Export the store instance
export default store;
