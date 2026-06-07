import type {
  IndigeneStatus,
  PricingRule,
  PricingRuleItemRead,
  PricingRulePolicyVersionFilter,
  PricingRuleScope,
} from "../types/pricing-rule";

export const PricingRulesTabActionType = {
  SetPage: "SET_PAGE",
  SetEventCodeFilter: "SET_EVENT_CODE_FILTER",
  SetPolicyVersionFilter: "SET_POLICY_VERSION_FILTER",
  SetHistoricalPolicyId: "SET_HISTORICAL_POLICY_ID",
  SetIndigeneFilter: "SET_INDIGENE_FILTER",
  SetScopeFilter: "SET_SCOPE_FILTER",
  SetIsActiveFilter: "SET_IS_ACTIVE_FILTER",
  ClearFilters: "CLEAR_FILTERS",
  OpenForm: "OPEN_FORM",
  CloseForm: "CLOSE_FORM",
  OpenDelete: "OPEN_DELETE",
  CloseDelete: "CLOSE_DELETE",
  SetLockedRuleIds: "SET_LOCKED_RULE_IDS",
  MarkRuleLocked: "MARK_RULE_LOCKED",
  ToggleExpand: "TOGGLE_EXPAND",
  OpenAddLine: "OPEN_ADD_LINE",
  CloseAddLine: "CLOSE_ADD_LINE",
  OpenEditLine: "OPEN_EDIT_LINE",
  CloseEditLine: "CLOSE_EDIT_LINE",
  OpenDeleteLine: "OPEN_DELETE_LINE",
  CloseDeleteLine: "CLOSE_DELETE_LINE",
  Reset: "RESET",
} as const;

export type PricingRulesTabState = {
  page: number;
  eventCodeFilter: string | undefined;
  policyVersionFilter: PricingRulePolicyVersionFilter;
  historicalPolicyId: number | undefined;
  indigeneFilter: IndigeneStatus | undefined;
  scopeFilter: PricingRuleScope | undefined;
  isActiveFilter: boolean | undefined;
  formTarget: PricingRule | null;
  formOpen: boolean;
  deleteTarget: PricingRule | null;
  deleteOpen: boolean;
  lockedRuleIds: number[];
  expandedRuleIds: Set<number>;
  addLineTarget: PricingRule | null;
  addLineOpen: boolean;
  editLineTarget: PricingRule | null;
  editLineItem: PricingRuleItemRead | null;
  editLineOpen: boolean;
  deleteLineTarget: PricingRule | null;
  deleteLineItem: PricingRuleItemRead | null;
  deleteLineOpen: boolean;
};

export type PricingRulesTabAction =
  | { type: typeof PricingRulesTabActionType.SetPage; value: number }
  | {
      type: typeof PricingRulesTabActionType.SetEventCodeFilter;
      value: string | undefined;
    }
  | {
      type: typeof PricingRulesTabActionType.SetPolicyVersionFilter;
      value: PricingRulePolicyVersionFilter;
    }
  | {
      type: typeof PricingRulesTabActionType.SetHistoricalPolicyId;
      value: number | undefined;
    }
  | {
      type: typeof PricingRulesTabActionType.SetIndigeneFilter;
      value: IndigeneStatus | undefined;
    }
  | {
      type: typeof PricingRulesTabActionType.SetScopeFilter;
      value: PricingRuleScope | undefined;
    }
  | {
      type: typeof PricingRulesTabActionType.SetIsActiveFilter;
      value: boolean | undefined;
    }
  | { type: typeof PricingRulesTabActionType.ClearFilters }
  | {
      type: typeof PricingRulesTabActionType.OpenForm;
      target: PricingRule | null;
    }
  | { type: typeof PricingRulesTabActionType.CloseForm }
  | {
      type: typeof PricingRulesTabActionType.OpenDelete;
      target: PricingRule;
    }
  | { type: typeof PricingRulesTabActionType.CloseDelete }
  | {
      type: typeof PricingRulesTabActionType.SetLockedRuleIds;
      ids: number[];
    }
  | {
      type: typeof PricingRulesTabActionType.MarkRuleLocked;
      id: number;
    }
  | { type: typeof PricingRulesTabActionType.ToggleExpand; id: number }
  | {
      type: typeof PricingRulesTabActionType.OpenAddLine;
      target: PricingRule;
    }
  | { type: typeof PricingRulesTabActionType.CloseAddLine }
  | {
      type: typeof PricingRulesTabActionType.OpenEditLine;
      target: PricingRule;
      item: PricingRuleItemRead;
    }
  | { type: typeof PricingRulesTabActionType.CloseEditLine }
  | {
      type: typeof PricingRulesTabActionType.OpenDeleteLine;
      target: PricingRule;
      item: PricingRuleItemRead;
    }
  | { type: typeof PricingRulesTabActionType.CloseDeleteLine }
  | { type: typeof PricingRulesTabActionType.Reset };

export const initialPricingRulesTabState: PricingRulesTabState = {
  page: 1,
  eventCodeFilter: undefined,
  policyVersionFilter: "active",
  historicalPolicyId: undefined,
  indigeneFilter: undefined,
  scopeFilter: undefined,
  isActiveFilter: undefined,
  formTarget: null,
  formOpen: false,
  deleteTarget: null,
  deleteOpen: false,
  lockedRuleIds: [],
  expandedRuleIds: new Set(),
  addLineTarget: null,
  addLineOpen: false,
  editLineTarget: null,
  editLineItem: null,
  editLineOpen: false,
  deleteLineTarget: null,
  deleteLineItem: null,
  deleteLineOpen: false,
};

export function pricingRulesTabReducer(
  state: PricingRulesTabState,
  action: PricingRulesTabAction,
): PricingRulesTabState {
  switch (action.type) {
    case PricingRulesTabActionType.SetPage:
      return { ...state, page: action.value };

    case PricingRulesTabActionType.SetEventCodeFilter:
      return {
        ...state,
        eventCodeFilter: action.value,
        historicalPolicyId: undefined,
        page: 1,
      };

    case PricingRulesTabActionType.SetPolicyVersionFilter:
      return {
        ...state,
        policyVersionFilter: action.value,
        historicalPolicyId:
          action.value === "historical" ? state.historicalPolicyId : undefined,
        page: 1,
      };

    case PricingRulesTabActionType.SetHistoricalPolicyId:
      return { ...state, historicalPolicyId: action.value, page: 1 };

    case PricingRulesTabActionType.SetIndigeneFilter:
      return { ...state, indigeneFilter: action.value, page: 1 };

    case PricingRulesTabActionType.SetScopeFilter:
      return { ...state, scopeFilter: action.value, page: 1 };

    case PricingRulesTabActionType.SetIsActiveFilter:
      return { ...state, isActiveFilter: action.value, page: 1 };

    case PricingRulesTabActionType.ClearFilters:
      return {
        ...state,
        eventCodeFilter: undefined,
        policyVersionFilter: "active",
        historicalPolicyId: undefined,
        indigeneFilter: undefined,
        scopeFilter: undefined,
        isActiveFilter: undefined,
        page: 1,
      };

    case PricingRulesTabActionType.OpenForm:
      return { ...state, formTarget: action.target, formOpen: true };

    case PricingRulesTabActionType.CloseForm:
      return { ...state, formOpen: false };

    case PricingRulesTabActionType.OpenDelete:
      return { ...state, deleteTarget: action.target, deleteOpen: true };

    case PricingRulesTabActionType.CloseDelete:
      return { ...state, deleteOpen: false, deleteTarget: null };

    case PricingRulesTabActionType.SetLockedRuleIds:
      return { ...state, lockedRuleIds: action.ids };

    case PricingRulesTabActionType.MarkRuleLocked:
      return state.lockedRuleIds.includes(action.id)
        ? state
        : { ...state, lockedRuleIds: [...state.lockedRuleIds, action.id] };

    case PricingRulesTabActionType.ToggleExpand: {
      const next = new Set(state.expandedRuleIds);
      if (next.has(action.id)) {
        next.delete(action.id);
      } else {
        next.add(action.id);
      }
      return { ...state, expandedRuleIds: next };
    }

    case PricingRulesTabActionType.OpenAddLine:
      return {
        ...state,
        addLineTarget: action.target,
        addLineOpen: true,
      };

    case PricingRulesTabActionType.CloseAddLine:
      return { ...state, addLineOpen: false, addLineTarget: null };

    case PricingRulesTabActionType.OpenEditLine:
      return {
        ...state,
        editLineTarget: action.target,
        editLineItem: action.item,
        editLineOpen: true,
      };

    case PricingRulesTabActionType.CloseEditLine:
      return {
        ...state,
        editLineOpen: false,
        editLineTarget: null,
        editLineItem: null,
      };

    case PricingRulesTabActionType.OpenDeleteLine:
      return {
        ...state,
        deleteLineTarget: action.target,
        deleteLineItem: action.item,
        deleteLineOpen: true,
      };

    case PricingRulesTabActionType.CloseDeleteLine:
      return {
        ...state,
        deleteLineOpen: false,
        deleteLineTarget: null,
        deleteLineItem: null,
      };

    case PricingRulesTabActionType.Reset:
      return initialPricingRulesTabState;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
