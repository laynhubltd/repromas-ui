import type { ScoreSheetRow } from "../types/score-sheet";

// ---------------------------------------------------------------------------
// Action type constants
// ---------------------------------------------------------------------------

export const ScoreRowActionType = {
  SetDirtyScore: "SET_DIRTY_SCORE",
  SetSavingCell: "SET_SAVING_CELL",
  ClearSavingCell: "CLEAR_SAVING_CELL",
  SetErrorCell: "SET_ERROR_CELL",
  ClearErrorCell: "CLEAR_ERROR_CELL",
  SetLocalEvalStatusCode: "SET_LOCAL_EVAL_STATUS_CODE",
  SetIsSavingEvalStatus: "SET_IS_SAVING_EVAL_STATUS",
  SetEvalStatusError: "SET_EVAL_STATUS_ERROR",
  Reset: "RESET",
} as const;

// ---------------------------------------------------------------------------
// State type
// ---------------------------------------------------------------------------

/**
 * Per-row UI state managed by the reducer.
 *
 * Computed fields (totalScore, grade, gradePoint, wasVetoed, vetoReason) are
 * intentionally absent — they come from the refetched `row` prop after RTK
 * Query cache invalidation, so no local copies are needed.
 */
export type ScoreRowState = {
  /** Scores edited by the user that have not yet been persisted */
  dirtyScores: Record<string, number | null>;
  /** Set of component keys whose save request is currently in-flight */
  savingCells: Set<string>;
  /** Map of component key → error message for cells that failed to save */
  errorCells: Record<string, string>;
  /** Optimistically-updated evaluation status code (reverted on failure) */
  localEvalStatusCode: string;
  /** Whether the evaluation-status PATCH request is in-flight */
  isSavingEvalStatus: boolean;
  /** Error message from the most recent failed evaluation-status save, or null */
  evalStatusError: string | null;
};

// ---------------------------------------------------------------------------
// Action discriminated union
// ---------------------------------------------------------------------------

export type ScoreRowAction =
  | {
      type: typeof ScoreRowActionType.SetDirtyScore;
      payload: { key: string; value: number | null };
    }
  | { type: typeof ScoreRowActionType.SetSavingCell; payload: { key: string } }
  | {
      type: typeof ScoreRowActionType.ClearSavingCell;
      payload: { key: string };
    }
  | {
      type: typeof ScoreRowActionType.SetErrorCell;
      payload: { key: string; message: string };
    }
  | {
      type: typeof ScoreRowActionType.ClearErrorCell;
      payload: { key: string };
    }
  | {
      type: typeof ScoreRowActionType.SetLocalEvalStatusCode;
      payload: { code: string };
    }
  | {
      type: typeof ScoreRowActionType.SetIsSavingEvalStatus;
      payload: { isSaving: boolean };
    }
  | {
      type: typeof ScoreRowActionType.SetEvalStatusError;
      payload: { error: string | null };
    }
  | { type: typeof ScoreRowActionType.Reset; payload: { row: ScoreSheetRow } };

// ---------------------------------------------------------------------------
// Initial state factory
// ---------------------------------------------------------------------------

/**
 * Seeds the 6 UI state fields from the row prop.
 * Called once on mount (via the `useReducer` initializer argument).
 */
export function initialScoreRowState(row: ScoreSheetRow): ScoreRowState {
  return {
    dirtyScores: {},
    savingCells: new Set(),
    errorCells: {},
    localEvalStatusCode: row.evaluationStatusCode,
    isSavingEvalStatus: false,
    evalStatusError: null,
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure reducer — always returns a new object reference; never mutates `state`.
 */
export function scoreRowReducer(
  state: ScoreRowState,
  action: ScoreRowAction,
): ScoreRowState {
  switch (action.type) {
    case ScoreRowActionType.SetDirtyScore:
      return {
        ...state,
        dirtyScores: {
          ...state.dirtyScores,
          [action.payload.key]: action.payload.value,
        },
      };

    case ScoreRowActionType.SetSavingCell: {
      const next = new Set(state.savingCells);
      next.add(action.payload.key);
      return { ...state, savingCells: next };
    }

    case ScoreRowActionType.ClearSavingCell: {
      const next = new Set(state.savingCells);
      next.delete(action.payload.key);
      return { ...state, savingCells: next };
    }

    case ScoreRowActionType.SetErrorCell:
      return {
        ...state,
        errorCells: {
          ...state.errorCells,
          [action.payload.key]: action.payload.message,
        },
      };

    case ScoreRowActionType.ClearErrorCell: {
      const { [action.payload.key]: _removed, ...rest } = state.errorCells;
      return { ...state, errorCells: rest };
    }

    case ScoreRowActionType.SetLocalEvalStatusCode:
      return { ...state, localEvalStatusCode: action.payload.code };

    case ScoreRowActionType.SetIsSavingEvalStatus:
      return { ...state, isSavingEvalStatus: action.payload.isSaving };

    case ScoreRowActionType.SetEvalStatusError:
      return { ...state, evalStatusError: action.payload.error };

    case ScoreRowActionType.Reset:
      return initialScoreRowState(action.payload.row);

    default: {
      const _exhaustive: never = action;
      return state;
    }
  }
}
