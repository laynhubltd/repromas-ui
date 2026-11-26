import type {
  CandidateEntryMode,
  CapsBulkUploadSummary,
} from "../types/admission-candidate";

export const CapsBulkUploadActionType = {
  SetSelectedFile: "SET_SELECTED_FILE",
  ClearSelectedFile: "CLEAR_SELECTED_FILE",
  SetUploadEntryMode: "SET_UPLOAD_ENTRY_MODE",
  SetIsUploading: "SET_IS_UPLOADING",
  SetSummaryResult: "SET_SUMMARY_RESULT",
  CloseSummary: "CLOSE_SUMMARY",
  Reset: "RESET",
} as const;

export type CapsBulkUploadState = {
  selectedFile: File | null;
  uploadEntryMode: CandidateEntryMode | undefined;
  isUploading: boolean;
  summary: CapsBulkUploadSummary | null;
  summaryModalOpen: boolean;
};

export type CapsBulkUploadAction =
  | { type: typeof CapsBulkUploadActionType.SetSelectedFile; file: File | null }
  | { type: typeof CapsBulkUploadActionType.ClearSelectedFile }
  | {
      type: typeof CapsBulkUploadActionType.SetUploadEntryMode;
      entryMode: CandidateEntryMode | undefined;
    }
  | {
      type: typeof CapsBulkUploadActionType.SetIsUploading;
      isUploading: boolean;
    }
  | {
      type: typeof CapsBulkUploadActionType.SetSummaryResult;
      summary: CapsBulkUploadSummary;
    }
  | { type: typeof CapsBulkUploadActionType.CloseSummary }
  | { type: typeof CapsBulkUploadActionType.Reset };

export const initialCapsBulkUploadState: CapsBulkUploadState = {
  selectedFile: null,
  uploadEntryMode: undefined,
  isUploading: false,
  summary: null,
  summaryModalOpen: false,
};

export function capsBulkUploadReducer(
  state: CapsBulkUploadState,
  action: CapsBulkUploadAction,
): CapsBulkUploadState {
  switch (action.type) {
    case CapsBulkUploadActionType.SetSelectedFile:
      return { ...state, selectedFile: action.file };
    case CapsBulkUploadActionType.ClearSelectedFile:
      return { ...state, selectedFile: null };
    case CapsBulkUploadActionType.SetUploadEntryMode:
      return { ...state, uploadEntryMode: action.entryMode };
    case CapsBulkUploadActionType.SetIsUploading:
      return { ...state, isUploading: action.isUploading };
    case CapsBulkUploadActionType.SetSummaryResult:
      return {
        ...state,
        summary: action.summary,
        summaryModalOpen: true,
        isUploading: false,
      };
    case CapsBulkUploadActionType.CloseSummary:
      return {
        ...state,
        selectedFile: null,
        summary: null,
        summaryModalOpen: false,
      };
    case CapsBulkUploadActionType.Reset:
      return initialCapsBulkUploadState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
