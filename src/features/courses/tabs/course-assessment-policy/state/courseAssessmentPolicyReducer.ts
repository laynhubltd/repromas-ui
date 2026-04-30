import type {
    CourseAssessmentComponent,
    CourseAssessmentPolicy,
    CourseAssessmentPolicyTabState,
    ScopeFilter,
} from "../types/course-assessment-policy";

// ─── Re-exports ───────────────────────────────────────────────────────────────

export type { CourseAssessmentPolicyTabState, ScopeFilter };

// ─── Action Types ─────────────────────────────────────────────────────────────

export type CourseAssessmentPolicyAction =
  | { type: "SET_SCOPE_FILTER"; payload: ScopeFilter }
  | { type: "SET_COURSE_CODE_SEARCH"; payload: string }
  | { type: "SET_PAGE"; payload: { page: number; itemsPerPage: number } }
  | { type: "TOGGLE_EXPAND"; payload: number }
  | { type: "OPEN_CREATE_POLICY" }
  | { type: "OPEN_EDIT_POLICY"; payload: CourseAssessmentPolicy }
  | { type: "CLOSE_POLICY_FORM" }
  | {
      type: "OPEN_DELETE_POLICY";
      payload: { policy: CourseAssessmentPolicy; componentCount: number };
    }
  | { type: "CLOSE_DELETE_POLICY" }
  | {
      type: "OPEN_ADD_COMPONENT";
      payload: { policyId: number; totalWeight: number; usedWeight: number };
    }
  | {
      type: "OPEN_EDIT_COMPONENT";
      payload: {
        component: CourseAssessmentComponent;
        totalWeight: number;
        usedWeight: number;
      };
    }
  | { type: "CLOSE_COMPONENT_FORM" }
  | {
      type: "OPEN_DELETE_COMPONENT";
      payload: { component: CourseAssessmentComponent; isLast: boolean };
    }
  | { type: "CLOSE_DELETE_COMPONENT" };

// ─── Initial State ────────────────────────────────────────────────────────────

export const initialState: CourseAssessmentPolicyTabState = {
  scopeFilter: "ALL",
  courseCodeSearch: "",
  expandedPolicyIds: new Set(),
  // Pagination
  page: 1,
  itemsPerPage: 10,
  // Policy modals
  policyFormTarget: null,
  policyFormOpen: false,
  deletePolicyTarget: null,
  deletePolicyComponentCount: 0,
  deletePolicyOpen: false,
  // Component modals
  componentFormPolicyId: null,
  componentFormTarget: null,
  componentFormOpen: false,
  componentFormTotalWeight: 0,
  componentFormUsedWeight: 0,
  deleteComponentTarget: null,
  deleteComponentIsLast: false,
  deleteComponentOpen: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function courseAssessmentPolicyReducer(
  state: CourseAssessmentPolicyTabState,
  action: CourseAssessmentPolicyAction,
): CourseAssessmentPolicyTabState {
  switch (action.type) {
    case "SET_SCOPE_FILTER":
      return { ...state, scopeFilter: action.payload, page: 1 };

    case "SET_COURSE_CODE_SEARCH":
      return { ...state, courseCodeSearch: action.payload, page: 1 };

    case "SET_PAGE":
      return {
        ...state,
        page: action.payload.page,
        itemsPerPage: action.payload.itemsPerPage,
      };

    case "TOGGLE_EXPAND": {
      const next = new Set(state.expandedPolicyIds);
      if (next.has(action.payload)) {
        next.delete(action.payload);
      } else {
        next.add(action.payload);
      }
      return { ...state, expandedPolicyIds: next };
    }

    case "OPEN_CREATE_POLICY":
      return {
        ...state,
        policyFormTarget: null,
        policyFormOpen: true,
      };

    case "OPEN_EDIT_POLICY":
      return {
        ...state,
        policyFormTarget: action.payload,
        policyFormOpen: true,
      };

    case "CLOSE_POLICY_FORM":
      return {
        ...state,
        policyFormTarget: null,
        policyFormOpen: false,
      };

    case "OPEN_DELETE_POLICY":
      return {
        ...state,
        deletePolicyTarget: action.payload.policy,
        deletePolicyComponentCount: action.payload.componentCount,
        deletePolicyOpen: true,
      };

    case "CLOSE_DELETE_POLICY":
      return {
        ...state,
        deletePolicyTarget: null,
        deletePolicyComponentCount: 0,
        deletePolicyOpen: false,
      };

    case "OPEN_ADD_COMPONENT":
      return {
        ...state,
        componentFormPolicyId: action.payload.policyId,
        componentFormTarget: null,
        componentFormOpen: true,
        componentFormTotalWeight: action.payload.totalWeight,
        componentFormUsedWeight: action.payload.usedWeight,
      };

    case "OPEN_EDIT_COMPONENT":
      return {
        ...state,
        componentFormPolicyId: action.payload.component.policyId,
        componentFormTarget: action.payload.component,
        componentFormOpen: true,
        componentFormTotalWeight: action.payload.totalWeight,
        componentFormUsedWeight: action.payload.usedWeight,
      };

    case "CLOSE_COMPONENT_FORM":
      return {
        ...state,
        componentFormPolicyId: null,
        componentFormTarget: null,
        componentFormOpen: false,
        componentFormTotalWeight: 0,
        componentFormUsedWeight: 0,
      };

    case "OPEN_DELETE_COMPONENT":
      return {
        ...state,
        deleteComponentTarget: action.payload.component,
        deleteComponentIsLast: action.payload.isLast,
        deleteComponentOpen: true,
      };

    case "CLOSE_DELETE_COMPONENT":
      return {
        ...state,
        deleteComponentTarget: null,
        deleteComponentIsLast: false,
        deleteComponentOpen: false,
      };

    default:
      return state;
  }
}

export default courseAssessmentPolicyReducer;
