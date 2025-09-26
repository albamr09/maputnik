import {
	Action,
	configureStore,
	ThunkAction,
	ThunkDispatch,
} from "@reduxjs/toolkit";
import styleReducer from "@/store/slices/styleSlice";
import styleStoreReducer from "@/store/slices/styleStoreSlice";
import uiReducer from "@/store/slices/uiSlice";
import type { RootState } from "./types";

// Configure the store
export const store = configureStore({
	reducer: {
		style: styleReducer,
		ui: uiReducer,
		styleStore: styleStoreReducer,
	},
	// Enable Redux DevTools in development
	devTools: process.env.NODE_ENV !== "production",
});

export type AppDispatch = typeof store.dispatch;
export type AppState = RootState;
export type AppThunk<ReturnType = void> = ThunkAction<
	ReturnType,
	RootState,
	unknown,
	Action<string>
>;
export type DispatchThunk = ThunkDispatch<RootState, unknown, Action<string>>;

export default store;
