import type {
  BillableEvent,
  PaymentTiming,
} from "../types/billable-event";

export const BillablesTabActionType = {
  SetSearch: "SET_SEARCH",
  SetDebouncedSearch: "SET_DEBOUNCED_SEARCH",
  SetPage: "SET_PAGE",
  SetIsActiveFilter: "SET_IS_ACTIVE_FILTER",
  SetPaymentTimingFilter: "SET_PAYMENT_TIMING_FILTER",
  ClearFilters: "CLEAR_FILTERS",
  OpenForm: "OPEN_FORM",
  CloseForm: "CLOSE_FORM",
  OpenDelete: "OPEN_DELETE",
  CloseDelete: "CLOSE_DELETE",
  Reset: "RESET",
} as const;

export type BillablesTabState = {
  search: string;
  debouncedSearch: string;
  page: number;
  isActiveFilter: boolean | undefined;
  paymentTimingFilter: PaymentTiming | undefined;
  formTarget: BillableEvent | null;
  formOpen: boolean;
  deleteTarget: BillableEvent | null;
  deleteOpen: boolean;
};

export type BillablesTabAction =
  | { type: typeof BillablesTabActionType.SetSearch; value: string }
  | {
      type: typeof BillablesTabActionType.SetDebouncedSearch;
      value: string;
    }
  | { type: typeof BillablesTabActionType.SetPage; value: number }
  | {
      type: typeof BillablesTabActionType.SetIsActiveFilter;
      value: boolean | undefined;
    }
  | {
      type: typeof BillablesTabActionType.SetPaymentTimingFilter;
      value: PaymentTiming | undefined;
    }
  | { type: typeof BillablesTabActionType.ClearFilters }
  | {
      type: typeof BillablesTabActionType.OpenForm;
      target: BillableEvent | null;
    }
  | { type: typeof BillablesTabActionType.CloseForm }
  | {
      type: typeof BillablesTabActionType.OpenDelete;
      target: BillableEvent;
    }
  | { type: typeof BillablesTabActionType.CloseDelete }
  | { type: typeof BillablesTabActionType.Reset };

export const initialBillablesTabState: BillablesTabState = {
  search: "",
  debouncedSearch: "",
  page: 1,
  isActiveFilter: undefined,
  paymentTimingFilter: undefined,
  formTarget: null,
  formOpen: false,
  deleteTarget: null,
  deleteOpen: false,
};

export function billablesTabReducer(
  state: BillablesTabState,
  action: BillablesTabAction,
): BillablesTabState {
  switch (action.type) {
    case BillablesTabActionType.SetSearch:
      return { ...state, search: action.value };

    case BillablesTabActionType.SetDebouncedSearch:
      return { ...state, debouncedSearch: action.value, page: 1 };

    case BillablesTabActionType.SetPage:
      return { ...state, page: action.value };

    case BillablesTabActionType.SetIsActiveFilter:
      return { ...state, isActiveFilter: action.value, page: 1 };

    case BillablesTabActionType.SetPaymentTimingFilter:
      return { ...state, paymentTimingFilter: action.value, page: 1 };

    case BillablesTabActionType.ClearFilters:
      return {
        ...state,
        isActiveFilter: undefined,
        paymentTimingFilter: undefined,
        page: 1,
      };

    case BillablesTabActionType.OpenForm:
      return { ...state, formTarget: action.target, formOpen: true };

    case BillablesTabActionType.CloseForm:
      return { ...state, formOpen: false };

    case BillablesTabActionType.OpenDelete:
      return { ...state, deleteTarget: action.target, deleteOpen: true };

    case BillablesTabActionType.CloseDelete:
      return { ...state, deleteOpen: false, deleteTarget: null };

    case BillablesTabActionType.Reset:
      return initialBillablesTabState;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
