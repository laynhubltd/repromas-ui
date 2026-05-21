import type {
  ProgramAdmissionConfig,
  QuotaFilterValue,
} from "../types/program-admission-config";

export const ProgramAdmissionConfigTabActionType = {
  SetSearch: "SET_SEARCH",
  SetDebouncedSearch: "SET_DEBOUNCED_SEARCH",
  SetProgramFilter: "SET_PROGRAM_FILTER",
  SetQuotaFilter: "SET_QUOTA_FILTER",
  OpenForm: "OPEN_FORM",
  CloseForm: "CLOSE_FORM",
  OpenDelete: "OPEN_DELETE",
  CloseDelete: "CLOSE_DELETE",
  Reset: "RESET",
} as const;

export type ProgramAdmissionConfigTabState = {
  search: string;
  debouncedSearch: string;
  programFilter: number | undefined;
  quotaFilter: QuotaFilterValue | undefined;
  formTarget: ProgramAdmissionConfig | null;
  formOpen: boolean;
  deleteTarget: ProgramAdmissionConfig | null;
  deleteOpen: boolean;
};

export type ProgramAdmissionConfigTabAction =
  | {
      type: typeof ProgramAdmissionConfigTabActionType.SetSearch;
      value: string;
    }
  | {
      type: typeof ProgramAdmissionConfigTabActionType.SetDebouncedSearch;
      value: string;
    }
  | {
      type: typeof ProgramAdmissionConfigTabActionType.SetProgramFilter;
      value: number | undefined;
    }
  | {
      type: typeof ProgramAdmissionConfigTabActionType.SetQuotaFilter;
      value: QuotaFilterValue | undefined;
    }
  | {
      type: typeof ProgramAdmissionConfigTabActionType.OpenForm;
      target: ProgramAdmissionConfig | null;
    }
  | { type: typeof ProgramAdmissionConfigTabActionType.CloseForm }
  | {
      type: typeof ProgramAdmissionConfigTabActionType.OpenDelete;
      target: ProgramAdmissionConfig;
    }
  | { type: typeof ProgramAdmissionConfigTabActionType.CloseDelete }
  | { type: typeof ProgramAdmissionConfigTabActionType.Reset };

export const initialProgramAdmissionConfigTabState: ProgramAdmissionConfigTabState =
  {
    search: "",
    debouncedSearch: "",
    programFilter: undefined,
    quotaFilter: undefined,
    formTarget: null,
    formOpen: false,
    deleteTarget: null,
    deleteOpen: false,
  };

export function programAdmissionConfigTabReducer(
  state: ProgramAdmissionConfigTabState,
  action: ProgramAdmissionConfigTabAction,
): ProgramAdmissionConfigTabState {
  switch (action.type) {
    case ProgramAdmissionConfigTabActionType.SetSearch:
      return { ...state, search: action.value };

    case ProgramAdmissionConfigTabActionType.SetDebouncedSearch:
      return { ...state, debouncedSearch: action.value };

    case ProgramAdmissionConfigTabActionType.SetProgramFilter:
      return { ...state, programFilter: action.value };

    case ProgramAdmissionConfigTabActionType.SetQuotaFilter:
      return { ...state, quotaFilter: action.value };

    case ProgramAdmissionConfigTabActionType.OpenForm:
      return { ...state, formTarget: action.target, formOpen: true };

    case ProgramAdmissionConfigTabActionType.CloseForm:
      return { ...state, formOpen: false, formTarget: null };

    case ProgramAdmissionConfigTabActionType.OpenDelete:
      return { ...state, deleteTarget: action.target, deleteOpen: true };

    case ProgramAdmissionConfigTabActionType.CloseDelete:
      return { ...state, deleteTarget: null, deleteOpen: false };

    case ProgramAdmissionConfigTabActionType.Reset:
      return initialProgramAdmissionConfigTabState;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
