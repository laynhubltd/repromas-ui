import type { BillableEventCatalogEntry } from "../types/billable-event";

export const BillableEventFormActionType = {
  SetFormError: "SET_FORM_ERROR",
  SetCatalogEntry: "SET_CATALOG_ENTRY",
  Reset: "RESET",
} as const;

export type BillableEventFormState = {
  formError: string | null;
  catalogEntry: BillableEventCatalogEntry | null;
};

export type BillableEventFormAction =
  | {
      type: typeof BillableEventFormActionType.SetFormError;
      message: string | null;
    }
  | {
      type: typeof BillableEventFormActionType.SetCatalogEntry;
      entry: BillableEventCatalogEntry | null;
    }
  | { type: typeof BillableEventFormActionType.Reset };

export const initialBillableEventFormState: BillableEventFormState = {
  formError: null,
  catalogEntry: null,
};

export function billableEventFormReducer(
  state: BillableEventFormState,
  action: BillableEventFormAction,
): BillableEventFormState {
  switch (action.type) {
    case BillableEventFormActionType.SetFormError:
      return { ...state, formError: action.message };
    case BillableEventFormActionType.SetCatalogEntry:
      return { ...state, catalogEntry: action.entry };
    case BillableEventFormActionType.Reset:
      return initialBillableEventFormState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
