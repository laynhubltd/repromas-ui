import type { SyncFromCatalogResponse } from "../types/rbac";

export const SyncFromCatalogActionType = {
  SetAssignToSystemAdministrator: "SET_ASSIGN_TO_SYSTEM_ADMINISTRATOR",
  SetLastResult: "SET_LAST_RESULT",
  SetError: "SET_ERROR",
  SetStep: "SET_STEP",
  Reset: "RESET",
} as const;

export type SyncFromCatalogStep = "confirm" | "results";

export type SyncFromCatalogState = {
  step: SyncFromCatalogStep;
  assignToSystemAdministrator: boolean;
  lastResult: SyncFromCatalogResponse | null;
  error: string | null;
};

export type SyncFromCatalogAction =
  | {
      type: typeof SyncFromCatalogActionType.SetAssignToSystemAdministrator;
      value: boolean;
    }
  | {
      type: typeof SyncFromCatalogActionType.SetLastResult;
      result: SyncFromCatalogResponse;
    }
  | { type: typeof SyncFromCatalogActionType.SetError; message: string | null }
  | { type: typeof SyncFromCatalogActionType.SetStep; step: SyncFromCatalogStep }
  | { type: typeof SyncFromCatalogActionType.Reset };

export const initialSyncFromCatalogState: SyncFromCatalogState = {
  step: "confirm",
  assignToSystemAdministrator: true,
  lastResult: null,
  error: null,
};

export function syncFromCatalogReducer(
  state: SyncFromCatalogState,
  action: SyncFromCatalogAction,
): SyncFromCatalogState {
  switch (action.type) {
    case SyncFromCatalogActionType.SetAssignToSystemAdministrator:
      return { ...state, assignToSystemAdministrator: action.value };
    case SyncFromCatalogActionType.SetLastResult:
      return {
        ...state,
        lastResult: action.result,
        step: "results",
        error: null,
      };
    case SyncFromCatalogActionType.SetError:
      return { ...state, error: action.message };
    case SyncFromCatalogActionType.SetStep:
      return { ...state, step: action.step };
    case SyncFromCatalogActionType.Reset:
      return initialSyncFromCatalogState;
    default:
      return state;
  }
}
