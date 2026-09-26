import type { EvaluationStatusSource, ScoreSheetRow } from "../types/score-sheet";

// ---------------------------------------------------------------------------
// Action type constants
// ---------------------------------------------------------------------------

export const ScoreRowActionType = {
  SetDirtyScore: "SET_DIRTY_SCORE",
  SetSavingCell: "SET_SAVING_CELL",
  ClearSavingCell: "CLEAR_SAVING_CELL",
  SetErrorCell: "SET_ERROR_CELL",
  ClearErrorCell: "CLEAR_ERROR_CELL",
  SetLocalEvalStatusId: "SET_LOCAL_EVAL_STATUS_ID",
  SetLocalEvalStatusCode: "SET_LOCAL_EVAL_STATUS_CODE",
  SetLocalEvalStatusSource: "SET_LOCAL_EVAL_STATUS_SOURCE",
  ClearLocalEvalStatus: "CLEAR_LOCAL_EVAL_STATUS",
  SetIsSavingEvalStatus: "SET_IS_SAVING_EVAL_STATUS",
  SetEvalStatusError: "SET_EVAL_STATUS_ERROR",
  Reset: "RESET",
} as const;

// ---------------------------------------------------------------------------
// State type
// ---------------------------------------------------------------------------

export type ScoreRowState = {
  /** Scores edited by the user that have not yet been persisted */
  dirtyScores: Record<string, number | null>;
  /** Set of component keys whose save request is currently in-flight */
  savingCells: Set<string>;
  /** Map of component key → error message for cells that failed to save */
  errorCells: Record<string, string>;
  /** Optimistically-updated evaluation status ID */
  localEvalStatusId: number | null;
  /** Optimistically-updated evaluation status code (reverted on failure) */
  localEvalStatusCode: string;
  /** Optimistically-updated evaluation status source ("SYSTEM" | "MANUAL" | null) */
  localEvalStatusSource: EvaluationStatusSource;
  /** Optimistically-updated display grade */
  localDisplayGrade: string;
  /** Whether the evaluation-status request is in-flight */
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
      type: typeof ScoreRowActionType.SetLocalEvalStatusId;
      payload: {
        statusId: number | null;
        code?: string;
        source?: EvaluationStatusSource;
        displayGrade?: string;
      };
    }
  | {
      type: typeof ScoreRowActionType.SetLocalEvalStatusCode;
      payload: { code: string };
    }
  | {
      type: typeof ScoreRowActionType.SetLocalEvalStatusSource;
      payload: { source: EvaluationStatusSource };
    }
  | {
      type: typeof ScoreRowActionType.ClearLocalEvalStatus;
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

export function initialScoreRowState(row: ScoreSheetRow): ScoreRowState {
  const defaultStatus = row.evaluationStatuses?.find((s) => s.isDefault);
  const initialStatusId =
    row.evaluationStatusId ??
    (row.evaluationStatusCode
      ? row.evaluationStatuses?.find(
          (s) =>
            s.code === row.evaluationStatusCode ||
            s.code?.toLowerCase() === row.evaluationStatusCode?.toLowerCase(),
        )?.id
      : undefined) ??
    defaultStatus?.id ??
    null;

  const initialCode =
    row.evaluationStatuses?.find((s) => s.id === initialStatusId)?.code ??
    row.evaluationStatusCode ??
    defaultStatus?.code ??
    "";

  const initialSource = row.evaluationStatusSource ?? null;
  const initialDisplayGrade = row.displayGrade ?? row.grade ?? "NR";

  return {
    dirtyScores: {},
    savingCells: new Set(),
    errorCells: {},
    localEvalStatusId: initialStatusId,
    localEvalStatusCode: initialCode,
    localEvalStatusSource: initialSource,
    localDisplayGrade: initialDisplayGrade,
    isSavingEvalStatus: false,
    evalStatusError: null,
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

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
      const rest = { ...state.errorCells };
      delete rest[action.payload.key];
      return { ...state, errorCells: rest };
    }

    case ScoreRowActionType.SetLocalEvalStatusId:
      return {
        ...state,
        localEvalStatusId: action.payload.statusId,
        ...(action.payload.code ? { localEvalStatusCode: action.payload.code } : {}),
        ...(action.payload.source !== undefined ? { localEvalStatusSource: action.payload.source } : {}),
        ...(action.payload.displayGrade !== undefined ? { localDisplayGrade: action.payload.displayGrade } : {}),
      };

    case ScoreRowActionType.SetLocalEvalStatusCode:
      return { ...state, localEvalStatusCode: action.payload.code };

    case ScoreRowActionType.SetLocalEvalStatusSource:
      return { ...state, localEvalStatusSource: action.payload.source };

    case ScoreRowActionType.ClearLocalEvalStatus:
      return {
        ...state,
        localEvalStatusId: null,
        localEvalStatusCode: "",
        localEvalStatusSource: null,
      };

    case ScoreRowActionType.SetIsSavingEvalStatus:
      return { ...state, isSavingEvalStatus: action.payload.isSaving };

    case ScoreRowActionType.SetEvalStatusError:
      return { ...state, evalStatusError: action.payload.error };

    case ScoreRowActionType.Reset:
      return initialScoreRowState(action.payload.row);

    default:
      return state;
  }
}

