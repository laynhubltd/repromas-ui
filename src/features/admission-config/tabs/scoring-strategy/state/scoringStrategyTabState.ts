/**
 * Tab-level state management for Scoring Strategy tab
 * Requirements: 15.1–15.5
 *
 * Manages:
 * - Filter state (scopeFilter, search, debouncedSearch)
 * - Pagination (page)
 * - Form modal state (formTarget, formOpen)
 * - Delete modal state (deleteTarget)
 */

import type {
  AdmissionScoringStrategy,
  LaneProfile,
  ScopeValue,
} from "../types/scoring-strategy";

/**
 * Action type constants
 * Must be const object with as const (NOT enum)
 */
export const ScoringStrategyTabActionType = {
  SetScopeFilter: "SET_SCOPE_FILTER",
  SetLaneFilter: "SET_LANE_FILTER",
  SetSearch: "SET_SEARCH",
  SetDebouncedSearch: "SET_DEBOUNCED_SEARCH",
  SetPage: "SET_PAGE",
  OpenForm: "OPEN_FORM",
  CloseForm: "CLOSE_FORM",
  OpenDelete: "OPEN_DELETE",
  CloseDelete: "CLOSE_DELETE",
  OpenView: "OPEN_VIEW",
  CloseView: "CLOSE_VIEW",
  Reset: "RESET",
} as const;

/**
 * Tab state shape
 * Includes filter state, pagination, and modal targets
 */
export type ScoringStrategyTabState = {
  scopeFilter: ScopeValue | undefined;
  laneFilter: LaneProfile | undefined;
  search: string;
  debouncedSearch: string;
  page: number;
  formTarget: AdmissionScoringStrategy | null;
  formOpen: boolean;
  deleteTarget: AdmissionScoringStrategy | null;
  viewTarget: AdmissionScoringStrategy | null;
};

/**
 * Discriminated union of all possible actions
 */
export type ScoringStrategyTabAction =
  | {
      type: typeof ScoringStrategyTabActionType.SetScopeFilter;
      value: ScopeValue | undefined;
    }
  | {
      type: typeof ScoringStrategyTabActionType.SetLaneFilter;
      value: LaneProfile | undefined;
    }
  | {
      type: typeof ScoringStrategyTabActionType.SetSearch;
      value: string;
    }
  | {
      type: typeof ScoringStrategyTabActionType.SetDebouncedSearch;
      value: string;
    }
  | {
      type: typeof ScoringStrategyTabActionType.SetPage;
      value: number;
    }
  | {
      type: typeof ScoringStrategyTabActionType.OpenForm;
      target: AdmissionScoringStrategy | null;
    }
  | {
      type: typeof ScoringStrategyTabActionType.CloseForm;
    }
  | {
      type: typeof ScoringStrategyTabActionType.OpenDelete;
      target: AdmissionScoringStrategy;
    }
  | {
      type: typeof ScoringStrategyTabActionType.CloseDelete;
    }
  | {
      type: typeof ScoringStrategyTabActionType.OpenView;
      target: AdmissionScoringStrategy;
    }
  | {
      type: typeof ScoringStrategyTabActionType.CloseView;
    }
  | {
      type: typeof ScoringStrategyTabActionType.Reset;
    };

/**
 * Initial state
 * Used as default and for Reset action
 */
export const initialScoringStrategyTabState: ScoringStrategyTabState = {
  scopeFilter: undefined,
  laneFilter: undefined,
  search: "",
  debouncedSearch: "",
  page: 1,
  formTarget: null,
  formOpen: false,
  deleteTarget: null,
  viewTarget: null,
};

/**
 * Pure reducer for tab state
 * Handles all action types, returns initialState for Reset
 * No side effects, no API calls
 */
export function scoringStrategyTabReducer(
  state: ScoringStrategyTabState,
  action: ScoringStrategyTabAction,
): ScoringStrategyTabState {
  switch (action.type) {
    case ScoringStrategyTabActionType.SetScopeFilter:
      return { ...state, scopeFilter: action.value, page: 1 };

    case ScoringStrategyTabActionType.SetLaneFilter:
      return { ...state, laneFilter: action.value, page: 1 };

    case ScoringStrategyTabActionType.SetSearch:
      return { ...state, search: action.value };

    case ScoringStrategyTabActionType.SetDebouncedSearch:
      return { ...state, debouncedSearch: action.value, page: 1 };

    case ScoringStrategyTabActionType.SetPage:
      return { ...state, page: action.value };

    case ScoringStrategyTabActionType.OpenForm:
      return { ...state, formTarget: action.target, formOpen: true };

    case ScoringStrategyTabActionType.CloseForm:
      return { ...state, formOpen: false };

    case ScoringStrategyTabActionType.OpenDelete:
      return { ...state, deleteTarget: action.target };

    case ScoringStrategyTabActionType.CloseDelete:
      return { ...state, deleteTarget: null };

    case ScoringStrategyTabActionType.OpenView:
      return { ...state, viewTarget: action.target };

    case ScoringStrategyTabActionType.CloseView:
      return { ...state, viewTarget: null };

    case ScoringStrategyTabActionType.Reset:
      return initialScoringStrategyTabState;

    default:
      const _exhaustive: never = action;
      return _exhaustive;
  }
}
