import type { AdmissionDocumentType } from "../types/document-type";

// ─── 1. Action type constants ─────────────────────────────────────────────────

export const DocumentTypeTabActionType = {
  SetSearch: "SET_SEARCH",
  SetDebouncedSearch: "SET_DEBOUNCED_SEARCH",
  SetIsActiveFilter: "SET_IS_ACTIVE_FILTER",
  SetIsRequiredFilter: "SET_IS_REQUIRED_FILTER",
  SetPage: "SET_PAGE",
  OpenForm: "OPEN_FORM",
  CloseForm: "CLOSE_FORM",
  OpenDelete: "OPEN_DELETE",
  CloseDelete: "CLOSE_DELETE",
  Reset: "RESET",
} as const;

// ─── 2. State shape ───────────────────────────────────────────────────────────

export type DocumentTypeTabState = {
  search: string;
  debouncedSearch: string;
  isActiveFilter: boolean | undefined;
  isRequiredFilter: boolean | undefined;
  page: number;
  formTarget: AdmissionDocumentType | null;  // null = create mode
  formOpen: boolean;
  deleteTarget: AdmissionDocumentType | null;
};

// ─── 3. Action union ──────────────────────────────────────────────────────────

export type DocumentTypeTabAction =
  | { type: typeof DocumentTypeTabActionType.SetSearch; value: string }
  | { type: typeof DocumentTypeTabActionType.SetDebouncedSearch; value: string }
  | { type: typeof DocumentTypeTabActionType.SetIsActiveFilter; value: boolean | undefined }
  | { type: typeof DocumentTypeTabActionType.SetIsRequiredFilter; value: boolean | undefined }
  | { type: typeof DocumentTypeTabActionType.SetPage; page: number }
  | { type: typeof DocumentTypeTabActionType.OpenForm; target: AdmissionDocumentType | null }
  | { type: typeof DocumentTypeTabActionType.CloseForm }
  | { type: typeof DocumentTypeTabActionType.OpenDelete; target: AdmissionDocumentType }
  | { type: typeof DocumentTypeTabActionType.CloseDelete }
  | { type: typeof DocumentTypeTabActionType.Reset };

// ─── 4. Initial state ─────────────────────────────────────────────────────────

export const initialDocumentTypeTabState: DocumentTypeTabState = {
  search: "",
  debouncedSearch: "",
  isActiveFilter: undefined,
  isRequiredFilter: undefined,
  page: 1,
  formTarget: null,
  formOpen: false,
  deleteTarget: null,
};

// ─── 5. Pure reducer ──────────────────────────────────────────────────────────

export function documentTypeTabReducer(
  state: DocumentTypeTabState,
  action: DocumentTypeTabAction,
): DocumentTypeTabState {
  switch (action.type) {
    case DocumentTypeTabActionType.SetSearch:
      return { ...state, search: action.value };
    case DocumentTypeTabActionType.SetDebouncedSearch:
      return { ...state, debouncedSearch: action.value, page: 1 };
    case DocumentTypeTabActionType.SetIsActiveFilter:
      return { ...state, isActiveFilter: action.value, page: 1 };
    case DocumentTypeTabActionType.SetIsRequiredFilter:
      return { ...state, isRequiredFilter: action.value, page: 1 };
    case DocumentTypeTabActionType.SetPage:
      return { ...state, page: action.page };
    case DocumentTypeTabActionType.OpenForm:
      return { ...state, formTarget: action.target, formOpen: true };
    case DocumentTypeTabActionType.CloseForm:
      return { ...state, formOpen: false };
    case DocumentTypeTabActionType.OpenDelete:
      return { ...state, deleteTarget: action.target };
    case DocumentTypeTabActionType.CloseDelete:
      return { ...state, deleteTarget: null };
    case DocumentTypeTabActionType.Reset:
      return initialDocumentTypeTabState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
