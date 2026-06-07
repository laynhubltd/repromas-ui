import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialSetupUiState } from "./setupUiState";

const setupUiSlice = createSlice({
  name: "setupUi",
  initialState: initialSetupUiState,
  reducers: {
    setupPanelOpened(state) {
      state.isPanelOpen = true;
      state.isPanelDismissed = false;
    },
    setupPanelClosed(state) {
      state.isPanelOpen = false;
    },
    setupPanelDismissed(state) {
      state.isPanelDismissed = true;
      state.isPanelOpen = false;
    },
    setupSpotlightShown(state, action: PayloadAction<string>) {
      state.spotlightStepIdShown = action.payload;
    },
    setupUiReset() {
      return initialSetupUiState;
    },
  },
});

export const {
  setupPanelOpened,
  setupPanelClosed,
  setupPanelDismissed,
  setupSpotlightShown,
  setupUiReset,
} = setupUiSlice.actions;

export default setupUiSlice.reducer;
