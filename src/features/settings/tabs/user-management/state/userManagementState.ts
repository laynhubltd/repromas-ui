// ── Action type constants ─────────────────────────────────────────────────────

export const UserManagementActionType = {
  SetPage: "SET_PAGE",
  SetSearch: "SET_SEARCH",
  SetDebouncedSearch: "SET_DEBOUNCED_SEARCH",
  Reset: "RESET",
} as const;

// ── State shape ───────────────────────────────────────────────────────────────

/**
 * Filter + pagination state for the user management tab.
 * `search` drives the controlled input display value.
 * `debouncedSearch` is the value actually sent to the API — updated 400ms after
 * the user stops typing so we don't fire a request on every keystroke.
 */
export type UserManagementState = {
  page: number;
  search: string;
  debouncedSearch: string;
};

// ── Action union ──────────────────────────────────────────────────────────────

export type UserManagementAction =
  | { type: typeof UserManagementActionType.SetPage; page: number }
  | { type: typeof UserManagementActionType.SetSearch; search: string }
  | { type: typeof UserManagementActionType.SetDebouncedSearch; search: string }
  | { type: typeof UserManagementActionType.Reset };

// ── Initial state ─────────────────────────────────────────────────────────────

export const initialUserManagementState: UserManagementState = {
  page: 1,
  search: "",
  debouncedSearch: "",
};

// ── Pure reducer ──────────────────────────────────────────────────────────────

export function userManagementReducer(
  state: UserManagementState,
  action: UserManagementAction,
): UserManagementState {
  switch (action.type) {
    case UserManagementActionType.SetPage:
      return { ...state, page: action.page };

    case UserManagementActionType.SetSearch:
      // Update display value immediately; reset page — debounced value updated separately
      return { ...state, search: action.search, page: 1 };

    case UserManagementActionType.SetDebouncedSearch:
      return { ...state, debouncedSearch: action.search };

    case UserManagementActionType.Reset:
      return initialUserManagementState;
  }
}
