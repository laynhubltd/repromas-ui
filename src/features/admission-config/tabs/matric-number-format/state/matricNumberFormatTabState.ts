import type {
  MatricFormatStatus,
  MatricNumberFormat,
} from "../types/matric-number-format";

export const MatricNumberFormatTabActionType = {
  SetSearch: "SET_SEARCH",
  SetDebouncedSearch: "SET_DEBOUNCED_SEARCH",
  SetStatusFilter: "SET_STATUS_FILTER",
  SetPage: "SET_PAGE",
  OpenBuilder: "OPEN_BUILDER",
  CloseBuilder: "CLOSE_BUILDER",
  OpenCreate: "OPEN_CREATE",
  CloseCreate: "CLOSE_CREATE",
  OpenDuplicate: "OPEN_DUPLICATE",
  CloseDuplicate: "CLOSE_DUPLICATE",
  OpenActivate: "OPEN_ACTIVATE",
  CloseActivate: "CLOSE_ACTIVATE",
  Reset: "RESET",
} as const;

export type MatricNumberFormatTabState = {
  search: string;
  debouncedSearch: string;
  statusFilter: MatricFormatStatus | undefined;
  page: number;
  builderFormatId: number | null;
  builderReadOnly: boolean;
  builderOpen: boolean;
  createOpen: boolean;
  duplicateTarget: MatricNumberFormat | null;
  activateTarget: MatricNumberFormat | null;
};

export type MatricNumberFormatTabAction =
  | { type: typeof MatricNumberFormatTabActionType.SetSearch; value: string }
  | { type: typeof MatricNumberFormatTabActionType.SetDebouncedSearch; value: string }
  | {
      type: typeof MatricNumberFormatTabActionType.SetStatusFilter;
      value: MatricFormatStatus | undefined;
    }
  | { type: typeof MatricNumberFormatTabActionType.SetPage; value: number }
  | {
      type: typeof MatricNumberFormatTabActionType.OpenBuilder;
      formatId: number;
      readOnly: boolean;
    }
  | { type: typeof MatricNumberFormatTabActionType.CloseBuilder }
  | { type: typeof MatricNumberFormatTabActionType.OpenCreate }
  | { type: typeof MatricNumberFormatTabActionType.CloseCreate }
  | {
      type: typeof MatricNumberFormatTabActionType.OpenDuplicate;
      target: MatricNumberFormat;
    }
  | { type: typeof MatricNumberFormatTabActionType.CloseDuplicate }
  | {
      type: typeof MatricNumberFormatTabActionType.OpenActivate;
      target: MatricNumberFormat;
    }
  | { type: typeof MatricNumberFormatTabActionType.CloseActivate }
  | { type: typeof MatricNumberFormatTabActionType.Reset };

export const initialMatricNumberFormatTabState: MatricNumberFormatTabState = {
  search: "",
  debouncedSearch: "",
  statusFilter: undefined,
  page: 1,
  builderFormatId: null,
  builderReadOnly: false,
  builderOpen: false,
  createOpen: false,
  duplicateTarget: null,
  activateTarget: null,
};

export function matricNumberFormatTabReducer(
  state: MatricNumberFormatTabState,
  action: MatricNumberFormatTabAction,
): MatricNumberFormatTabState {
  switch (action.type) {
    case MatricNumberFormatTabActionType.SetSearch:
      return { ...state, search: action.value };
    case MatricNumberFormatTabActionType.SetDebouncedSearch:
      return { ...state, debouncedSearch: action.value, page: 1 };
    case MatricNumberFormatTabActionType.SetStatusFilter:
      return { ...state, statusFilter: action.value, page: 1 };
    case MatricNumberFormatTabActionType.SetPage:
      return { ...state, page: action.value };
    case MatricNumberFormatTabActionType.OpenBuilder:
      return {
        ...state,
        builderFormatId: action.formatId,
        builderReadOnly: action.readOnly,
        builderOpen: true,
      };
    case MatricNumberFormatTabActionType.CloseBuilder:
      return {
        ...state,
        builderOpen: false,
        builderFormatId: null,
        builderReadOnly: false,
      };
    case MatricNumberFormatTabActionType.OpenCreate:
      return { ...state, createOpen: true };
    case MatricNumberFormatTabActionType.CloseCreate:
      return { ...state, createOpen: false };
    case MatricNumberFormatTabActionType.OpenDuplicate:
      return { ...state, duplicateTarget: action.target };
    case MatricNumberFormatTabActionType.CloseDuplicate:
      return { ...state, duplicateTarget: null };
    case MatricNumberFormatTabActionType.OpenActivate:
      return { ...state, activateTarget: action.target };
    case MatricNumberFormatTabActionType.CloseActivate:
      return { ...state, activateTarget: null };
    case MatricNumberFormatTabActionType.Reset:
      return initialMatricNumberFormatTabState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
