import type { FeeItem } from "../types/fee-item";

export const FeeItemsTabActionType = {
  SetSearch: "SET_SEARCH",
  SetDebouncedSearch: "SET_DEBOUNCED_SEARCH",
  SetPage: "SET_PAGE",
  SetIsActiveFilter: "SET_IS_ACTIVE_FILTER",
  ClearFilters: "CLEAR_FILTERS",
  OpenForm: "OPEN_FORM",
  CloseForm: "CLOSE_FORM",
  OpenDelete: "OPEN_DELETE",
  CloseDelete: "CLOSE_DELETE",
  Reset: "RESET",
} as const;

export type FeeItemsTabState = {
  search: string;
  debouncedSearch: string;
  page: number;
  isActiveFilter: boolean | undefined;
  formTarget: FeeItem | null;
  formOpen: boolean;
  deleteTarget: FeeItem | null;
  deleteOpen: boolean;
};

export type FeeItemsTabAction =
  | { type: typeof FeeItemsTabActionType.SetSearch; value: string }
  | {
      type: typeof FeeItemsTabActionType.SetDebouncedSearch;
      value: string;
    }
  | { type: typeof FeeItemsTabActionType.SetPage; value: number }
  | {
      type: typeof FeeItemsTabActionType.SetIsActiveFilter;
      value: boolean | undefined;
    }
  | { type: typeof FeeItemsTabActionType.ClearFilters }
  | {
      type: typeof FeeItemsTabActionType.OpenForm;
      target: FeeItem | null;
    }
  | { type: typeof FeeItemsTabActionType.CloseForm }
  | {
      type: typeof FeeItemsTabActionType.OpenDelete;
      target: FeeItem;
    }
  | { type: typeof FeeItemsTabActionType.CloseDelete }
  | { type: typeof FeeItemsTabActionType.Reset };

export const initialFeeItemsTabState: FeeItemsTabState = {
  search: "",
  debouncedSearch: "",
  page: 1,
  isActiveFilter: undefined,
  formTarget: null,
  formOpen: false,
  deleteTarget: null,
  deleteOpen: false,
};

export function feeItemsTabReducer(
  state: FeeItemsTabState,
  action: FeeItemsTabAction,
): FeeItemsTabState {
  switch (action.type) {
    case FeeItemsTabActionType.SetSearch:
      return { ...state, search: action.value };

    case FeeItemsTabActionType.SetDebouncedSearch:
      return { ...state, debouncedSearch: action.value, page: 1 };

    case FeeItemsTabActionType.SetPage:
      return { ...state, page: action.value };

    case FeeItemsTabActionType.SetIsActiveFilter:
      return { ...state, isActiveFilter: action.value, page: 1 };

    case FeeItemsTabActionType.ClearFilters:
      return { ...state, isActiveFilter: undefined, page: 1 };

    case FeeItemsTabActionType.OpenForm:
      return { ...state, formTarget: action.target, formOpen: true };

    case FeeItemsTabActionType.CloseForm:
      return { ...state, formOpen: false };

    case FeeItemsTabActionType.OpenDelete:
      return { ...state, deleteTarget: action.target, deleteOpen: true };

    case FeeItemsTabActionType.CloseDelete:
      return { ...state, deleteOpen: false, deleteTarget: null };

    case FeeItemsTabActionType.Reset:
      return initialFeeItemsTabState;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
