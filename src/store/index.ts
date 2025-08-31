import { configureStore } from '@reduxjs/toolkit';
import type { RootState } from './types';

import styleCoreReducer from './slices/styleCoreSlice';
import uiCoreReducer from './slices/uiCoreSlice';
import styleStoreReducer from "./slices/styleStoreSlice";

// Configure the store
export const store = configureStore({
  reducer: {
    styleCore: styleCoreReducer,
    uiCore: uiCoreReducer,
    styleStore: styleStoreReducer
  },
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production',
});

export type AppDispatch = typeof store.dispatch;
export type AppState = RootState;

export default store;
