/**
 * Tab state management for Admission Cycle feature
 * Requirements: 15.1–15.5
 */

import type { AdmissionCycle, AdmissionCycleStatus } from "../types/admission-cycle";

export const AdmissionCycleTabActionType = {
  SetStatusFilter: "SET_STATUS_FILTER",
  SetSessionFilter: "SET_SESSION_FILTER",
  SetSearch: "SET_SEARCH",
  SetDebouncedSearch: "SET_DEBOUNCED_SEARCH",
  SetPage: "SET_PAGE",
  OpenForm: "OPEN_FORM",
  CloseForm: "CLOSE_FORM",
  OpenDelete: "OPEN_DELETE",
  CloseDelete: "CLOSE_DELETE",
  OpenTransition: "OPEN_TRANSITION",
  CloseTransition: "CLOSE_TRANSITION",
  Reset: "RESET",
} as const;

export type AdmissionCycleTabState = {
  statusFilter: AdmissionCycleStatus | undefined;
  sessionFilter: number | undefined;
  search: string;
  debouncedSearch: string;
  page: number;
  formTarget: AdmissionCycle | null; // null = create mode
  formOpen: boolean;
  deleteTarget: AdmissionCycle | null;
  transitionTarget: AdmissionCycle | null;
  transitionOpen: boolean;
};

export type AdmissionCycleTabAction =
  | { type: typeof AdmissionCycleTabActionType.SetStatusFilter; value: AdmissionCycleStatus | undefined }
  | { type: typeof AdmissionCycleTabActionType.SetSessionFilter; value: number | undefined }
  | { type: typeof AdmissionCycleTabActionType.SetSearch; value: string }
  | { type: typeof AdmissionCycleTabActionType.SetDebouncedSearch; value: string }
  | { type: typeof AdmissionCycleTabActionType.SetPage; value: number }
  | { type: typeof AdmissionCycleTabActionType.OpenForm; target: AdmissionCycle | null }
  | { type: typeof AdmissionCycleTabActionType.CloseForm }
  | { type: typeof AdmissionCycleTabActionType.OpenDelete; target: AdmissionCycle }
  | { type: typeof AdmissionCycleTabActionType.CloseDelete }
  | { type: typeof AdmissionCycleTabActionType.OpenTransition; target: AdmissionCycle }
  | { type: typeof AdmissionCycleTabActionType.CloseTransition }
  | { type: typeof AdmissionCycleTabActionType.Reset };

export const initialAdmissionCycleTabState: AdmissionCycleTabState = {
  statusFilter: undefined,
  sessionFilter: undefined,
  search: "",
  debouncedSearch: "",
  page: 1,
  formTarget: null,
  formOpen: false,
  deleteTarget: null,
  transitionTarget: null,
  transitionOpen: false,
};

export function admissionCycleTabReducer(
  state: AdmissionCycleTabState,
  action: AdmissionCycleTabAction,
): AdmissionCycleTabState {
  switch (action.type) {
    case AdmissionCycleTabActionType.SetStatusFilter:
      return { ...state, statusFilter: action.value, page: 1 };
    case AdmissionCycleTabActionType.SetSessionFilter:
      return { ...state, sessionFilter: action.value, page: 1 };
    case AdmissionCycleTabActionType.SetSearch:
      return { ...state, search: action.value };
    case AdmissionCycleTabActionType.SetDebouncedSearch:
      return { ...state, debouncedSearch: action.value, page: 1 };
    case AdmissionCycleTabActionType.SetPage:
      return { ...state, page: action.value };
    case AdmissionCycleTabActionType.OpenForm:
      return { ...state, formTarget: action.target, formOpen: true };
    case AdmissionCycleTabActionType.CloseForm:
      return { ...state, formOpen: false };
    case AdmissionCycleTabActionType.OpenDelete:
      return { ...state, deleteTarget: action.target };
    case AdmissionCycleTabActionType.CloseDelete:
      return { ...state, deleteTarget: null };
    case AdmissionCycleTabActionType.OpenTransition:
      return { ...state, transitionTarget: action.target, transitionOpen: true };
    case AdmissionCycleTabActionType.CloseTransition:
      return { ...state, transitionOpen: false };
    case AdmissionCycleTabActionType.Reset:
      return initialAdmissionCycleTabState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}