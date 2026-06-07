import type { BillableEventPolicy } from "../types/billable-event-policy";
import {
  FEE_POLICY_FILTER_ALL,
  type FeePolicyOccurrenceFilter,
  type FeePolicyPaymentTimingFilter,
  type FeePolicyVersionStatusFilter,
} from "@/shared/constants/feePolicyOptions";

export type FeePoliciesTabState = {
  selectedEventId: number | null;
  page: number;
  paymentTimingFilter: FeePolicyPaymentTimingFilter;
  occurrenceModeFilter: FeePolicyOccurrenceFilter;
  isActiveFilter: FeePolicyVersionStatusFilter;
  publishOpen: boolean;
  publishDraftPolicy: BillableEventPolicy | null;
  publishBindEventId: number | null;
  publishReviseFromPolicyId: number | null;
  viewPolicy: BillableEventPolicy | null;
  viewOpen: boolean;
  deleteTarget: BillableEventPolicy | null;
  deleteOpen: boolean;
};

export const initialFeePoliciesTabState: FeePoliciesTabState = {
  selectedEventId: null,
  page: 1,
  paymentTimingFilter: FEE_POLICY_FILTER_ALL,
  occurrenceModeFilter: FEE_POLICY_FILTER_ALL,
  isActiveFilter: FEE_POLICY_FILTER_ALL,
  publishOpen: false,
  publishDraftPolicy: null,
  publishBindEventId: null,
  publishReviseFromPolicyId: null,
  viewPolicy: null,
  viewOpen: false,
  deleteTarget: null,
  deleteOpen: false,
};

export const FeePoliciesTabActionType = {
  SetSelectedEventId: "SET_SELECTED_EVENT_ID",
  SetPage: "SET_PAGE",
  SetPaymentTimingFilter: "SET_PAYMENT_TIMING_FILTER",
  SetOccurrenceModeFilter: "SET_OCCURRENCE_MODE_FILTER",
  SetIsActiveFilter: "SET_IS_ACTIVE_FILTER",
  ClearFilters: "CLEAR_FILTERS",
  OpenPublish: "OPEN_PUBLISH",
  ClosePublish: "CLOSE_PUBLISH",
  OpenView: "OPEN_VIEW",
  CloseView: "CLOSE_VIEW",
  OpenDelete: "OPEN_DELETE",
  CloseDelete: "CLOSE_DELETE",
} as const;

type FeePoliciesTabAction =
  | {
      type: typeof FeePoliciesTabActionType.SetSelectedEventId;
      eventId: number | null;
    }
  | { type: typeof FeePoliciesTabActionType.SetPage; page: number }
  | {
      type: typeof FeePoliciesTabActionType.SetPaymentTimingFilter;
      value: FeePolicyPaymentTimingFilter;
    }
  | {
      type: typeof FeePoliciesTabActionType.SetOccurrenceModeFilter;
      value: FeePolicyOccurrenceFilter;
    }
  | {
      type: typeof FeePoliciesTabActionType.SetIsActiveFilter;
      value: FeePolicyVersionStatusFilter;
    }
  | { type: typeof FeePoliciesTabActionType.ClearFilters }
  | {
      type: typeof FeePoliciesTabActionType.OpenPublish;
      draftPolicy?: BillableEventPolicy | null;
      bindEventId?: number | null;
      reviseFromPolicyId?: number | null;
    }
  | { type: typeof FeePoliciesTabActionType.ClosePublish }
  | {
      type: typeof FeePoliciesTabActionType.OpenView;
      policy: BillableEventPolicy;
    }
  | { type: typeof FeePoliciesTabActionType.CloseView }
  | {
      type: typeof FeePoliciesTabActionType.OpenDelete;
      policy: BillableEventPolicy;
    }
  | { type: typeof FeePoliciesTabActionType.CloseDelete };

export function isFeePolicyFilterActive(state: FeePoliciesTabState): boolean {
  return (
    state.selectedEventId !== null ||
    state.paymentTimingFilter !== FEE_POLICY_FILTER_ALL ||
    state.occurrenceModeFilter !== FEE_POLICY_FILTER_ALL ||
    state.isActiveFilter !== FEE_POLICY_FILTER_ALL
  );
}

export function feePoliciesTabReducer(
  state: FeePoliciesTabState,
  action: FeePoliciesTabAction,
): FeePoliciesTabState {
  switch (action.type) {
    case FeePoliciesTabActionType.SetSelectedEventId:
      return {
        ...state,
        selectedEventId: action.eventId,
        page: 1,
      };
    case FeePoliciesTabActionType.SetPage:
      return { ...state, page: action.page };
    case FeePoliciesTabActionType.SetPaymentTimingFilter:
      return {
        ...state,
        paymentTimingFilter: action.value,
        page: 1,
      };
    case FeePoliciesTabActionType.SetOccurrenceModeFilter:
      return {
        ...state,
        occurrenceModeFilter: action.value,
        page: 1,
      };
    case FeePoliciesTabActionType.SetIsActiveFilter:
      return {
        ...state,
        isActiveFilter: action.value,
        page: 1,
      };
    case FeePoliciesTabActionType.ClearFilters:
      return {
        ...state,
        selectedEventId: null,
        paymentTimingFilter: FEE_POLICY_FILTER_ALL,
        occurrenceModeFilter: FEE_POLICY_FILTER_ALL,
        isActiveFilter: FEE_POLICY_FILTER_ALL,
        page: 1,
      };
    case FeePoliciesTabActionType.OpenPublish:
      return {
        ...state,
        publishOpen: true,
        publishDraftPolicy: action.draftPolicy ?? null,
        publishBindEventId: action.bindEventId ?? null,
        publishReviseFromPolicyId: action.reviseFromPolicyId ?? null,
      };
    case FeePoliciesTabActionType.ClosePublish:
      return {
        ...state,
        publishOpen: false,
        publishDraftPolicy: null,
        publishBindEventId: null,
        publishReviseFromPolicyId: null,
      };
    case FeePoliciesTabActionType.OpenView:
      return {
        ...state,
        viewOpen: true,
        viewPolicy: action.policy,
      };
    case FeePoliciesTabActionType.CloseView:
      return {
        ...state,
        viewOpen: false,
        viewPolicy: null,
      };
    case FeePoliciesTabActionType.OpenDelete:
      return {
        ...state,
        deleteOpen: true,
        deleteTarget: action.policy,
      };
    case FeePoliciesTabActionType.CloseDelete:
      return {
        ...state,
        deleteOpen: false,
        deleteTarget: null,
      };
    default:
      return state;
  }
}
