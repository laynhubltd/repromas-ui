import type { ScoreSheetUploadSummary } from "../types/score-sheet";

export const ScoreSheetUploadActionType = {
  SetSelectedFile: "SET_SELECTED_FILE",
  SetIsUploading: "SET_IS_UPLOADING",
  SetUploadError: "SET_UPLOAD_ERROR",
  SetSummary: "SET_SUMMARY",
  SetSummaryModalOpen: "SET_SUMMARY_MODAL_OPEN",
  SetUploadModalOpen: "SET_UPLOAD_MODAL_OPEN",
  Reset: "RESET",
} as const;

export type ScoreSheetUploadState = {
  selectedFile: File | null;
  isUploading: boolean;
  uploadError: string | null;
  summary: ScoreSheetUploadSummary | null;
  summaryModalOpen: boolean;
  uploadModalOpen: boolean;
};

export type ScoreSheetUploadAction =
  | {
      type: typeof ScoreSheetUploadActionType.SetSelectedFile;
      file: File | null;
    }
  | { type: typeof ScoreSheetUploadActionType.SetIsUploading; value: boolean }
  | {
      type: typeof ScoreSheetUploadActionType.SetUploadError;
      error: string | null;
    }
  | {
      type: typeof ScoreSheetUploadActionType.SetSummary;
      summary: ScoreSheetUploadSummary | null;
    }
  | {
      type: typeof ScoreSheetUploadActionType.SetSummaryModalOpen;
      open: boolean;
    }
  | {
      type: typeof ScoreSheetUploadActionType.SetUploadModalOpen;
      open: boolean;
    }
  | { type: typeof ScoreSheetUploadActionType.Reset };

export const initialScoreSheetUploadState: ScoreSheetUploadState = {
  selectedFile: null,
  isUploading: false,
  uploadError: null,
  summary: null,
  summaryModalOpen: false,
  uploadModalOpen: false,
};

export function scoreSheetUploadReducer(
  state: ScoreSheetUploadState,
  action: ScoreSheetUploadAction,
): ScoreSheetUploadState {
  switch (action.type) {
    case ScoreSheetUploadActionType.SetSelectedFile:
      return {
        ...state,
        selectedFile: action.file,
        uploadError: null,
      };
    case ScoreSheetUploadActionType.SetIsUploading:
      return {
        ...state,
        isUploading: action.value,
      };
    case ScoreSheetUploadActionType.SetUploadError:
      return {
        ...state,
        uploadError: action.error,
      };
    case ScoreSheetUploadActionType.SetSummary:
      return {
        ...state,
        summary: action.summary,
      };
    case ScoreSheetUploadActionType.SetSummaryModalOpen:
      return {
        ...state,
        summaryModalOpen: action.open,
      };
    case ScoreSheetUploadActionType.SetUploadModalOpen:
      return {
        ...state,
        uploadModalOpen: action.open,
      };
    case ScoreSheetUploadActionType.Reset:
      return initialScoreSheetUploadState;
    default:
      return state;
  }
}
