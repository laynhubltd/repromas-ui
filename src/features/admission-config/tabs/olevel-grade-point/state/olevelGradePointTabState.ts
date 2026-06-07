import type { OlevelGradePoint } from "../types/olevel-grade-point";

export const OlevelGradePointTabActionType = {
  SetSearch: "SET_SEARCH",
  SetDebouncedSearch: "SET_DEBOUNCED_SEARCH",
  SetPage: "SET_PAGE",
  OpenForm: "OPEN_FORM",
  CloseForm: "CLOSE_FORM",
  OpenDelete: "OPEN_DELETE",
  CloseDelete: "CLOSE_DELETE",
  Reset: "RESET",
} as const;

export type OlevelGradePointTabState = {
  search: string;
  debouncedSearch: string;
  page: number;
  formTarget: OlevelGradePoint | null;
  formOpen: boolean;
  deleteTarget: OlevelGradePoint | null;
  deleteOpen: boolean;
};

export type OlevelGradePointTabAction =
  | { type: typeof OlevelGradePointTabActionType.SetSearch; value: string }
  | {
      type: typeof OlevelGradePointTabActionType.SetDebouncedSearch;
      value: string;
    }
  | { type: typeof OlevelGradePointTabActionType.SetPage; value: number }
  | {
      type: typeof OlevelGradePointTabActionType.OpenForm;
      target: OlevelGradePoint | null;
    }
  | { type: typeof OlevelGradePointTabActionType.CloseForm }
  | {
      type: typeof OlevelGradePointTabActionType.OpenDelete;
      target: OlevelGradePoint;
    }
  | { type: typeof OlevelGradePointTabActionType.CloseDelete }
  | { type: typeof OlevelGradePointTabActionType.Reset };

export const initialOlevelGradePointTabState: OlevelGradePointTabState = {
  search: "",
  debouncedSearch: "",
  page: 1,
  formTarget: null,
  formOpen: false,
  deleteTarget: null,
  deleteOpen: false,
};

export function olevelGradePointTabReducer(
  state: OlevelGradePointTabState,
  action: OlevelGradePointTabAction,
): OlevelGradePointTabState {
  switch (action.type) {
    case OlevelGradePointTabActionType.SetSearch:
      return { ...state, search: action.value };

    case OlevelGradePointTabActionType.SetDebouncedSearch:
      return { ...state, debouncedSearch: action.value, page: 1 };

    case OlevelGradePointTabActionType.SetPage:
      return { ...state, page: action.value };

    case OlevelGradePointTabActionType.OpenForm:
      return { ...state, formTarget: action.target, formOpen: true };

    case OlevelGradePointTabActionType.CloseForm:
      return { ...state, formOpen: false };

    case OlevelGradePointTabActionType.OpenDelete:
      return { ...state, deleteTarget: action.target, deleteOpen: true };

    case OlevelGradePointTabActionType.CloseDelete:
      return { ...state, deleteOpen: false, deleteTarget: null };

    case OlevelGradePointTabActionType.Reset:
      return initialOlevelGradePointTabState;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
