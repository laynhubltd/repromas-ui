import type { BillableEventCatalogEntry } from "@/features/billing/tabs/fee-events/types/billable-event";

export type BillingPolicyFormState = {
  formError: string | null;
  catalogEntry: BillableEventCatalogEntry | null;
};

export const initialBillingPolicyFormState: BillingPolicyFormState = {
  formError: null,
  catalogEntry: null,
};

export const BillingPolicyFormActionType = {
  SetFormError: "SET_FORM_ERROR",
  SetCatalogEntry: "SET_CATALOG_ENTRY",
  Reset: "RESET",
} as const;

type BillingPolicyFormAction =
  | {
      type: typeof BillingPolicyFormActionType.SetFormError;
      message: string | null;
    }
  | {
      type: typeof BillingPolicyFormActionType.SetCatalogEntry;
      entry: BillableEventCatalogEntry | null;
    }
  | { type: typeof BillingPolicyFormActionType.Reset };

export function billingPolicyFormReducer(
  state: BillingPolicyFormState,
  action: BillingPolicyFormAction,
): BillingPolicyFormState {
  switch (action.type) {
    case BillingPolicyFormActionType.SetFormError:
      return { ...state, formError: action.message };
    case BillingPolicyFormActionType.SetCatalogEntry:
      return { ...state, catalogEntry: action.entry };
    case BillingPolicyFormActionType.Reset:
      return initialBillingPolicyFormState;
    default:
      return state;
  }
}
