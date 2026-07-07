import type {
  MatricFormatSlot,
  MatricFormatStatus,
  MatricNumberFormat,
} from "../types/matric-number-format";

export const MatricNumberFormatTabActionType = {
  SetSearch: "SET_SEARCH",
  SetDebouncedSearch: "SET_DEBOUNCED_SEARCH",
  SetStatusFilter: "SET_STATUS_FILTER",
  SetEntryModeFilter: "SET_ENTRY_MODE_FILTER",
  SetPage: "SET_PAGE",
  OpenBuilder: "OPEN_BUILDER",
  CloseBuilder: "CLOSE_BUILDER",
  OpenCreate: "OPEN_CREATE",
  OpenCreateForSlot: "OPEN_CREATE_FOR_SLOT",
  CloseCreate: "CLOSE_CREATE",
  OpenDuplicate: "OPEN_DUPLICATE",
  CloseDuplicate: "CLOSE_DUPLICATE",
  OpenActivate: "OPEN_ACTIVATE",
  CloseActivate: "CLOSE_ACTIVATE",
  OpenDeactivate: "OPEN_DEACTIVATE",
  CloseDeactivate: "CLOSE_DEACTIVATE",
  OpenReactivate: "OPEN_REACTIVATE",
  CloseReactivate: "CLOSE_REACTIVATE",
  Reset: "RESET",
} as const;

export type MatricNumberFormatTabFilterSlot = MatricFormatSlot | "ANY";

export type MatricNumberFormatTabState = {
  search: string;
  debouncedSearch: string;
  statusFilter: MatricFormatStatus | undefined;
  entryModeFilter: MatricNumberFormatTabFilterSlot;
  page: number;
  builderFormatId: number | null;
  builderReadOnly: boolean;
  builderOpen: boolean;
  createOpen: boolean;
  createEntryMode: MatricFormatSlot | undefined;
  duplicateTarget: MatricNumberFormat | null;
  activateTarget: MatricNumberFormat | null;
  deactivateTarget: MatricNumberFormat | null;
  reactivateTarget: MatricNumberFormat | null;
};

export type MatricNumberFormatTabAction =
  | { type: typeof MatricNumberFormatTabActionType.SetSearch; value: string }
  | { type: typeof MatricNumberFormatTabActionType.SetDebouncedSearch; value: string }
  | {
      type: typeof MatricNumberFormatTabActionType.SetStatusFilter;
      value: MatricFormatStatus | undefined;
    }
  | {
      type: typeof MatricNumberFormatTabActionType.SetEntryModeFilter;
      value: MatricNumberFormatTabFilterSlot;
    }
  | { type: typeof MatricNumberFormatTabActionType.SetPage; value: number }
  | {
      type: typeof MatricNumberFormatTabActionType.OpenBuilder;
      formatId: number;
      readOnly: boolean;
    }
  | { type: typeof MatricNumberFormatTabActionType.CloseBuilder }
  | { type: typeof MatricNumberFormatTabActionType.OpenCreate }
  | {
      type: typeof MatricNumberFormatTabActionType.OpenCreateForSlot;
      entryMode: MatricFormatSlot;
    }
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
  | {
      type: typeof MatricNumberFormatTabActionType.OpenDeactivate;
      target: MatricNumberFormat;
    }
  | { type: typeof MatricNumberFormatTabActionType.CloseDeactivate }
  | {
      type: typeof MatricNumberFormatTabActionType.OpenReactivate;
      target: MatricNumberFormat;
    }
  | { type: typeof MatricNumberFormatTabActionType.CloseReactivate }
  | { type: typeof MatricNumberFormatTabActionType.Reset };

export const initialMatricNumberFormatTabState: MatricNumberFormatTabState = {
  search: "",
  debouncedSearch: "",
  statusFilter: undefined,
  entryModeFilter: "ANY",
  page: 1,
  builderFormatId: null,
  builderReadOnly: false,
  builderOpen: false,
  createOpen: false,
  createEntryMode: undefined,
  duplicateTarget: null,
  activateTarget: null,
  deactivateTarget: null,
  reactivateTarget: null,
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
    case MatricNumberFormatTabActionType.SetEntryModeFilter:
      return { ...state, entryModeFilter: action.value, page: 1 };
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
      return { ...state, createOpen: true, createEntryMode: undefined };
    case MatricNumberFormatTabActionType.OpenCreateForSlot:
      return { ...state, createOpen: true, createEntryMode: action.entryMode };
    case MatricNumberFormatTabActionType.CloseCreate:
      return { ...state, createOpen: false, createEntryMode: undefined };
    case MatricNumberFormatTabActionType.OpenDuplicate:
      return { ...state, duplicateTarget: action.target };
    case MatricNumberFormatTabActionType.CloseDuplicate:
      return { ...state, duplicateTarget: null };
    case MatricNumberFormatTabActionType.OpenActivate:
      return { ...state, activateTarget: action.target };
    case MatricNumberFormatTabActionType.CloseActivate:
      return { ...state, activateTarget: null };
    case MatricNumberFormatTabActionType.OpenDeactivate:
      return { ...state, deactivateTarget: action.target };
    case MatricNumberFormatTabActionType.CloseDeactivate:
      return { ...state, deactivateTarget: null };
    case MatricNumberFormatTabActionType.OpenReactivate:
      return { ...state, reactivateTarget: action.target };
    case MatricNumberFormatTabActionType.CloseReactivate:
      return { ...state, reactivateTarget: null };
    case MatricNumberFormatTabActionType.Reset:
      return initialMatricNumberFormatTabState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
