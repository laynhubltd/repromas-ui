import type { BillableEventPolicySeedResult } from "../types/billable-event-policy";
import type { BillableEventPolicy } from "../types/billable-event-policy";

export type BillingPoliciesTabState = {
  selectedEventId: number | null;
  page: number;
  publishOpen: boolean;
  publishDraftPolicy: BillableEventPolicy | null;
  publishBindEventId: number | null;
  publishReviseFromPolicyId: number | null;
  viewPolicy: BillableEventPolicy | null;
  viewOpen: boolean;
  deleteTarget: BillableEventPolicy | null;
  deleteOpen: boolean;
  seedResult: BillableEventPolicySeedResult | null;
  seedSummaryOpen: boolean;
};

export const initialBillingPoliciesTabState: BillingPoliciesTabState = {
  selectedEventId: null,
  page: 1,
  publishOpen: false,
  publishDraftPolicy: null,
  publishBindEventId: null,
  publishReviseFromPolicyId: null,
  viewPolicy: null,
  viewOpen: false,
  deleteTarget: null,
  deleteOpen: false,
  seedResult: null,
  seedSummaryOpen: false,
};

export const BillingPoliciesTabActionType = {
  SetSelectedEventId: "SET_SELECTED_EVENT_ID",
  SetPage: "SET_PAGE",
  OpenPublish: "OPEN_PUBLISH",
  ClosePublish: "CLOSE_PUBLISH",
  OpenView: "OPEN_VIEW",
  CloseView: "CLOSE_VIEW",
  OpenDelete: "OPEN_DELETE",
  CloseDelete: "CLOSE_DELETE",
  SetSeedResult: "SET_SEED_RESULT",
  CloseSeedSummary: "CLOSE_SEED_SUMMARY",
} as const;

type BillingPoliciesTabAction =
  | {
      type: typeof BillingPoliciesTabActionType.SetSelectedEventId;
      eventId: number | null;
    }
  | { type: typeof BillingPoliciesTabActionType.SetPage; page: number }
  | {
      type: typeof BillingPoliciesTabActionType.OpenPublish;
      draftPolicy?: BillableEventPolicy | null;
      bindEventId?: number | null;
      reviseFromPolicyId?: number | null;
    }
  | { type: typeof BillingPoliciesTabActionType.ClosePublish }
  | {
      type: typeof BillingPoliciesTabActionType.OpenView;
      policy: BillableEventPolicy;
    }
  | { type: typeof BillingPoliciesTabActionType.CloseView }
  | {
      type: typeof BillingPoliciesTabActionType.OpenDelete;
      policy: BillableEventPolicy;
    }
  | { type: typeof BillingPoliciesTabActionType.CloseDelete }
  | {
      type: typeof BillingPoliciesTabActionType.SetSeedResult;
      result: BillableEventPolicySeedResult;
    }
  | { type: typeof BillingPoliciesTabActionType.CloseSeedSummary };

export function billingPoliciesTabReducer(
  state: BillingPoliciesTabState,
  action: BillingPoliciesTabAction,
): BillingPoliciesTabState {
  switch (action.type) {
    case BillingPoliciesTabActionType.SetSelectedEventId:
      return {
        ...state,
        selectedEventId: action.eventId,
        page: 1,
      };
    case BillingPoliciesTabActionType.SetPage:
      return { ...state, page: action.page };
    case BillingPoliciesTabActionType.OpenPublish:
      return {
        ...state,
        publishOpen: true,
        publishDraftPolicy: action.draftPolicy ?? null,
        publishBindEventId: action.bindEventId ?? null,
        publishReviseFromPolicyId: action.reviseFromPolicyId ?? null,
      };
    case BillingPoliciesTabActionType.ClosePublish:
      return {
        ...state,
        publishOpen: false,
        publishDraftPolicy: null,
        publishBindEventId: null,
        publishReviseFromPolicyId: null,
      };
    case BillingPoliciesTabActionType.OpenView:
      return {
        ...state,
        viewOpen: true,
        viewPolicy: action.policy,
      };
    case BillingPoliciesTabActionType.CloseView:
      return {
        ...state,
        viewOpen: false,
        viewPolicy: null,
      };
    case BillingPoliciesTabActionType.OpenDelete:
      return {
        ...state,
        deleteOpen: true,
        deleteTarget: action.policy,
      };
    case BillingPoliciesTabActionType.CloseDelete:
      return {
        ...state,
        deleteOpen: false,
        deleteTarget: null,
      };
    case BillingPoliciesTabActionType.SetSeedResult:
      return {
        ...state,
        seedResult: action.result,
        seedSummaryOpen: true,
      };
    case BillingPoliciesTabActionType.CloseSeedSummary:
      return {
        ...state,
        seedSummaryOpen: false,
        seedResult: null,
      };
    default:
      return state;
  }
}
