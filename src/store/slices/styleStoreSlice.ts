import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import { AppState } from "../index";
import { ExtendedStyleSpecification, StyleStoreState } from "../types";

const initialState: StyleStoreState = {
	// Revision
	revisions: [],
	currentIdx: -1,

	// Style store
	storedStyles: [],
};

const styleStoreSlice = createSlice({
	name: "styleStore",
	initialState,
	reducers: {
		// Revisions actions
		appendRevision: (
			state,
			action: PayloadAction<ExtendedStyleSpecification>,
		) => {
			// Clear any "redo" revisions once a change is made
			// and ensure current index is at end of list
			const newRevisions = state.revisions.slice(0, state.currentIdx + 1);
			// @ts-ignore
			newRevisions.push(action.payload);
			state.revisions = newRevisions;
			state.currentIdx += 1;
		},
		setRevisions: (
			state,
			action: PayloadAction<ExtendedStyleSpecification[]>,
		) => {
			state.revisions = action.payload;
			state.currentIdx = action.payload.length;
		},
		setCurrentRevisionIdx: (state, action: PayloadAction<number>) => {
			state.currentIdx = action.payload;
		},
		setStoredStyles: (state, action: PayloadAction<string[]>) => {
			state.storedStyles = action.payload;
		},
		addStoredStyles: (state, action: PayloadAction<string>) => {
			state.storedStyles.push(action.payload);
		},
		resetStoredStyles: (state) => {
			state.storedStyles = [];
		},
	},
});

export const selectRevisions = createSelector(
	(state: AppState) => state.styleStore,
	(slice: StyleStoreState) => slice.revisions,
);

export const selectRevisionCurrentIdx = createSelector(
	(state: AppState) => state.styleStore,
	(slice: StyleStoreState) => slice.currentIdx,
);

export const selectStoredStyles = createSelector(
	(state: AppState) => state.styleStore,
	(slice: StyleStoreState) => slice.storedStyles,
);

// Export actions
export const {
	// Revisions actions
	appendRevision,
	setRevisions,
	setCurrentRevisionIdx,
	// Stored styles actions
	setStoredStyles,
	addStoredStyles,
	resetStoredStyles,
} = styleStoreSlice.actions;

export default styleStoreSlice.reducer;
