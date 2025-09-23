import { configureStore } from '@reduxjs/toolkit';
import type { RootState } from './types';

import styleReducer from '@/store/slices/styleSlice';
import uiReducer from '@/store/slices/uiSlice';
import styleStoreReducer from "@/store/slices/styleStoreSlice";

// Configure the store
export const store = configureStore({
  reducer: {
    style: styleReducer,
    ui: uiReducer,
    styleStore: styleStoreReducer
  },
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production',
});

export type AppDispatch = typeof store.dispatch;
export type AppState = RootState;

export default store;
