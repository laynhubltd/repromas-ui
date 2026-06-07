export const SetupUiActionType = {
  SetPanelOpen: "SET_PANEL_OPEN",
  SetPanelDismissed: "SET_PANEL_DISMISSED",
  SetSpotlightShown: "SET_SPOTLIGHT_SHOWN",
  Reset: "RESET",
} as const;

export type SetupUiState = {
  isPanelOpen: boolean;
  isPanelDismissed: boolean;
  spotlightStepIdShown: string | null;
};

export type SetupUiAction =
  | { type: typeof SetupUiActionType.SetPanelOpen; value: boolean }
  | { type: typeof SetupUiActionType.SetPanelDismissed; value: boolean }
  | { type: typeof SetupUiActionType.SetSpotlightShown; stepId: string }
  | { type: typeof SetupUiActionType.Reset };

export const initialSetupUiState: SetupUiState = {
  isPanelOpen: false,
  isPanelDismissed: false,
  spotlightStepIdShown: null,
};

export function setupUiReducer(
  state: SetupUiState,
  action: SetupUiAction,
): SetupUiState {
  switch (action.type) {
    case SetupUiActionType.SetPanelOpen:
      return { ...state, isPanelOpen: action.value };
    case SetupUiActionType.SetPanelDismissed:
      return { ...state, isPanelDismissed: action.value, isPanelOpen: false };
    case SetupUiActionType.SetSpotlightShown:
      return { ...state, spotlightStepIdShown: action.stepId };
    case SetupUiActionType.Reset:
      return initialSetupUiState;
  }
}

const DISMISS_STORAGE_KEY = "repromas_setup_panel_dismissed";

export function readSetupPanelDismissed(tenantKey: string): boolean {
  try {
    return sessionStorage.getItem(`${DISMISS_STORAGE_KEY}:${tenantKey}`) === "1";
  } catch {
    return false;
  }
}

export function writeSetupPanelDismissed(tenantKey: string, dismissed: boolean): void {
  try {
    if (dismissed) {
      sessionStorage.setItem(`${DISMISS_STORAGE_KEY}:${tenantKey}`, "1");
    } else {
      sessionStorage.removeItem(`${DISMISS_STORAGE_KEY}:${tenantKey}`);
    }
  } catch {
    // ignore storage errors
  }
}
