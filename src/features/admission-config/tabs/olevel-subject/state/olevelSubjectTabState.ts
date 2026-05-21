import type { OlevelSubject } from "../types/olevel-subject";

export const OlevelSubjectTabActionType = {
  SetSearch: "SET_SEARCH",
  SetDebouncedSearch: "SET_DEBOUNCED_SEARCH",
  SetPage: "SET_PAGE",
  OpenForm: "OPEN_FORM",
  CloseForm: "CLOSE_FORM",
  OpenDelete: "OPEN_DELETE",
  CloseDelete: "CLOSE_DELETE",
  Reset: "RESET",
} as const;

export type OlevelSubjectTabState = {
  search: string;
  debouncedSearch: string;
  page: number;
  formTarget: OlevelSubject | null;
  formOpen: boolean;
  deleteTarget: OlevelSubject | null;
  deleteOpen: boolean;
};

export type OlevelSubjectTabAction =
  | { type: typeof OlevelSubjectTabActionType.SetSearch; value: string }
  | {
      type: typeof OlevelSubjectTabActionType.SetDebouncedSearch;
      value: string;
    }
  | { type: typeof OlevelSubjectTabActionType.SetPage; value: number }
  | {
      type: typeof OlevelSubjectTabActionType.OpenForm;
      target: OlevelSubject | null;
    }
  | { type: typeof OlevelSubjectTabActionType.CloseForm }
  | {
      type: typeof OlevelSubjectTabActionType.OpenDelete;
      target: OlevelSubject;
    }
  | { type: typeof OlevelSubjectTabActionType.CloseDelete }
  | { type: typeof OlevelSubjectTabActionType.Reset };

export const initialOlevelSubjectTabState: OlevelSubjectTabState = {
  search: "",
  debouncedSearch: "",
  page: 1,
  formTarget: null,
  formOpen: false,
  deleteTarget: null,
  deleteOpen: false,
};

export function olevelSubjectTabReducer(
  state: OlevelSubjectTabState,
  action: OlevelSubjectTabAction,
): OlevelSubjectTabState {
  switch (action.type) {
    case OlevelSubjectTabActionType.SetSearch:
      return { ...state, search: action.value };

    case OlevelSubjectTabActionType.SetDebouncedSearch:
      return { ...state, debouncedSearch: action.value, page: 1 };

    case OlevelSubjectTabActionType.SetPage:
      return { ...state, page: action.value };

    case OlevelSubjectTabActionType.OpenForm:
      return { ...state, formTarget: action.target, formOpen: true };

    case OlevelSubjectTabActionType.CloseForm:
      return { ...state, formOpen: false };

    case OlevelSubjectTabActionType.OpenDelete:
      return { ...state, deleteTarget: action.target, deleteOpen: true };

    case OlevelSubjectTabActionType.CloseDelete:
      return { ...state, deleteOpen: false, deleteTarget: null };

    case OlevelSubjectTabActionType.Reset:
      return initialOlevelSubjectTabState;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
