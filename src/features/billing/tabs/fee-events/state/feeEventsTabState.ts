import type {
  BillableEvent,
  FeeEventPolicyStatusFilter,
} from "../types/billable-event";
import type { BillableEventPolicySeedResult } from "@/features/billing/tabs/fee-policies/types/billable-event-policy";

export const FeeEventsTabActionType = {
  SetSearch: "SET_SEARCH",
  SetDebouncedSearch: "SET_DEBOUNCED_SEARCH",
  SetPage: "SET_PAGE",
  SetIsActiveFilter: "SET_IS_ACTIVE_FILTER",
  SetPolicyStatusFilter: "SET_POLICY_STATUS_FILTER",
  ClearFilters: "CLEAR_FILTERS",
  OpenMetadata: "OPEN_METADATA",
  CloseMetadata: "CLOSE_METADATA",
  OpenCreateWizard: "OPEN_CREATE_WIZARD",
  CloseCreateWizard: "CLOSE_CREATE_WIZARD",
  OpenDelete: "OPEN_DELETE",
  CloseDelete: "CLOSE_DELETE",
  SetSeedResult: "SET_SEED_RESULT",
  CloseSeedSummary: "CLOSE_SEED_SUMMARY",
  Reset: "RESET",
} as const;

export type FeeEventsTabState = {
  search: string;
  debouncedSearch: string;
  page: number;
  isActiveFilter: boolean | undefined;
  policyStatusFilter: FeeEventPolicyStatusFilter;
  metadataTarget: BillableEvent | null;
  metadataOpen: boolean;
  createWizardOpen: boolean;
  deleteTarget: BillableEvent | null;
  deleteOpen: boolean;
  seedResult: BillableEventPolicySeedResult | null;
  seedSummaryOpen: boolean;
};

export type FeeEventsTabAction =
  | { type: typeof FeeEventsTabActionType.SetSearch; value: string }
  | {
      type: typeof FeeEventsTabActionType.SetDebouncedSearch;
      value: string;
    }
  | { type: typeof FeeEventsTabActionType.SetPage; value: number }
  | {
      type: typeof FeeEventsTabActionType.SetIsActiveFilter;
      value: boolean | undefined;
    }
  | {
      type: typeof FeeEventsTabActionType.SetPolicyStatusFilter;
      value: FeeEventPolicyStatusFilter;
    }
  | { type: typeof FeeEventsTabActionType.ClearFilters }
  | {
      type: typeof FeeEventsTabActionType.OpenMetadata;
      target: BillableEvent;
    }
  | { type: typeof FeeEventsTabActionType.CloseMetadata }
  | { type: typeof FeeEventsTabActionType.OpenCreateWizard }
  | { type: typeof FeeEventsTabActionType.CloseCreateWizard }
  | {
      type: typeof FeeEventsTabActionType.OpenDelete;
      target: BillableEvent;
    }
  | { type: typeof FeeEventsTabActionType.CloseDelete }
  | {
      type: typeof FeeEventsTabActionType.SetSeedResult;
      result: BillableEventPolicySeedResult;
    }
  | { type: typeof FeeEventsTabActionType.CloseSeedSummary }
  | { type: typeof FeeEventsTabActionType.Reset };

export const initialFeeEventsTabState: FeeEventsTabState = {
  search: "",
  debouncedSearch: "",
  page: 1,
  isActiveFilter: undefined,
  policyStatusFilter: "all",
  metadataTarget: null,
  metadataOpen: false,
  createWizardOpen: false,
  deleteTarget: null,
  deleteOpen: false,
  seedResult: null,
  seedSummaryOpen: false,
};

export function feeEventsTabReducer(
  state: FeeEventsTabState,
  action: FeeEventsTabAction,
): FeeEventsTabState {
  switch (action.type) {
    case FeeEventsTabActionType.SetSearch:
      return { ...state, search: action.value };
    case FeeEventsTabActionType.SetDebouncedSearch:
      return { ...state, debouncedSearch: action.value, page: 1 };
    case FeeEventsTabActionType.SetPage:
      return { ...state, page: action.value };
    case FeeEventsTabActionType.SetIsActiveFilter:
      return { ...state, isActiveFilter: action.value, page: 1 };
    case FeeEventsTabActionType.SetPolicyStatusFilter:
      return { ...state, policyStatusFilter: action.value, page: 1 };
    case FeeEventsTabActionType.ClearFilters:
      return {
        ...state,
        isActiveFilter: undefined,
        policyStatusFilter: "all",
        page: 1,
      };
    case FeeEventsTabActionType.OpenMetadata:
      return {
        ...state,
        metadataOpen: true,
        metadataTarget: action.target,
      };
    case FeeEventsTabActionType.CloseMetadata:
      return {
        ...state,
        metadataOpen: false,
        metadataTarget: null,
      };
    case FeeEventsTabActionType.OpenCreateWizard:
      return { ...state, createWizardOpen: true };
    case FeeEventsTabActionType.CloseCreateWizard:
      return { ...state, createWizardOpen: false };
    case FeeEventsTabActionType.OpenDelete:
      return {
        ...state,
        deleteOpen: true,
        deleteTarget: action.target,
      };
    case FeeEventsTabActionType.CloseDelete:
      return {
        ...state,
        deleteOpen: false,
        deleteTarget: null,
      };
    case FeeEventsTabActionType.SetSeedResult:
      return {
        ...state,
        seedResult: action.result,
        seedSummaryOpen: true,
      };
    case FeeEventsTabActionType.CloseSeedSummary:
      return {
        ...state,
        seedSummaryOpen: false,
        seedResult: null,
      };
    case FeeEventsTabActionType.Reset:
      return initialFeeEventsTabState;
    default:
      return state;
  }
}
