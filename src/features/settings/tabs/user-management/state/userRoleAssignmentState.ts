import type { UserRoleDetail } from "../types/user-management";

// ── Action type constants ─────────────────────────────────────────────────────

export const UserRoleAssignmentActionType = {
  SetSelectedRoleId: "SET_SELECTED_ROLE_ID",
  SetSelectedScopeRefId: "SET_SELECTED_SCOPE_REF_ID",
  AssignmentAdded: "ASSIGNMENT_ADDED",
  AssignmentRemoved: "ASSIGNMENT_REMOVED",
  Reset: "RESET",
} as const;

// ── State shape ───────────────────────────────────────────────────────────────

/**
 * Local form selection state for the Manage Roles modal.
 * The assignments list is server state (RTK Query cache) — not stored here.
 * Only the form input selections live in this reducer.
 */
export type UserRoleAssignmentState = {
  /** Role selected in the "Add role" form. */
  selectedRoleId: number | null;
  /** Scope reference selected when the chosen role is non-GLOBAL. */
  selectedScopeRefId: number | null;
};

// ── Action union ──────────────────────────────────────────────────────────────

export type UserRoleAssignmentAction =
  | { type: typeof UserRoleAssignmentActionType.SetSelectedRoleId; roleId: number | null }
  | { type: typeof UserRoleAssignmentActionType.SetSelectedScopeRefId; refId: number | null }
  | { type: typeof UserRoleAssignmentActionType.AssignmentAdded; assignment: UserRoleDetail }
  | { type: typeof UserRoleAssignmentActionType.AssignmentRemoved; roleId: number; scopeReferenceId: number | null }
  | { type: typeof UserRoleAssignmentActionType.Reset };

// ── Initial state ─────────────────────────────────────────────────────────────

export const initialUserRoleAssignmentState: UserRoleAssignmentState = {
  selectedRoleId: null,
  selectedScopeRefId: null,
};

// ── Pure reducer ──────────────────────────────────────────────────────────────

export function userRoleAssignmentReducer(
  state: UserRoleAssignmentState,
  action: UserRoleAssignmentAction,
): UserRoleAssignmentState {
  switch (action.type) {
    case UserRoleAssignmentActionType.SetSelectedRoleId:
      // Clear scope ref when role selection changes
      return {
        ...state,
        selectedRoleId: action.roleId,
        selectedScopeRefId: null,
      };

    case UserRoleAssignmentActionType.SetSelectedScopeRefId:
      return { ...state, selectedScopeRefId: action.refId };

    case UserRoleAssignmentActionType.AssignmentAdded:
      // Reset the form selection after a successful add
      return {
        ...state,
        selectedRoleId: null,
        selectedScopeRefId: null,
      };

    case UserRoleAssignmentActionType.AssignmentRemoved:
      return state;

    case UserRoleAssignmentActionType.Reset:
      return initialUserRoleAssignmentState;
  }
}
