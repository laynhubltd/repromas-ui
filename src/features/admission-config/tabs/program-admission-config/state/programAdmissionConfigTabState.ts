import type {
  ProgramAdmissionConfig,
  QuotaFilterValue,
} from "../types/program-admission-config";

export const ProgramAdmissionConfigTabActionType = {
  SetProgramNameSearch: "SET_PROGRAM_NAME_SEARCH",
  SetDebouncedProgramNameSearch: "SET_DEBOUNCED_PROGRAM_NAME_SEARCH",
  SetDepartmentNameSearch: "SET_DEPARTMENT_NAME_SEARCH",
  SetDebouncedDepartmentNameSearch: "SET_DEBOUNCED_DEPARTMENT_NAME_SEARCH",
  SetProgramFilter: "SET_PROGRAM_FILTER",
  SetQuotaFilter: "SET_QUOTA_FILTER",
  SetPage: "SET_PAGE",
  OpenForm: "OPEN_FORM",
  CloseForm: "CLOSE_FORM",
  OpenDelete: "OPEN_DELETE",
  CloseDelete: "CLOSE_DELETE",
  OpenDrawer: "OPEN_DRAWER",
  CloseDrawer: "CLOSE_DRAWER",
  Reset: "RESET",
} as const;

export type ProgramAdmissionConfigTabState = {
  programNameSearch: string;
  debouncedProgramNameSearch: string;
  departmentNameSearch: string;
  debouncedDepartmentNameSearch: string;
  programFilter: number | undefined;
  quotaFilter: QuotaFilterValue | undefined;
  page: number;
  formTarget: ProgramAdmissionConfig | null;
  formOpen: boolean;
  deleteTarget: ProgramAdmissionConfig | null;
  deleteOpen: boolean;
  drawerTarget: ProgramAdmissionConfig | null;
  drawerOpen: boolean;
};

export type ProgramAdmissionConfigTabAction =
  | {
      type: typeof ProgramAdmissionConfigTabActionType.SetProgramNameSearch;
      value: string;
    }
  | {
      type: typeof ProgramAdmissionConfigTabActionType.SetDebouncedProgramNameSearch;
      value: string;
    }
  | {
      type: typeof ProgramAdmissionConfigTabActionType.SetDepartmentNameSearch;
      value: string;
    }
  | {
      type: typeof ProgramAdmissionConfigTabActionType.SetDebouncedDepartmentNameSearch;
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
  | { type: typeof ProgramAdmissionConfigTabActionType.SetPage; page: number }
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
  | {
      type: typeof ProgramAdmissionConfigTabActionType.OpenDrawer;
      target: ProgramAdmissionConfig;
    }
  | { type: typeof ProgramAdmissionConfigTabActionType.CloseDrawer }
  | { type: typeof ProgramAdmissionConfigTabActionType.Reset };

export const initialProgramAdmissionConfigTabState: ProgramAdmissionConfigTabState =
  {
    programNameSearch: "",
    debouncedProgramNameSearch: "",
    departmentNameSearch: "",
    debouncedDepartmentNameSearch: "",
    programFilter: undefined,
    quotaFilter: undefined,
    page: 1,
    formTarget: null,
    formOpen: false,
    deleteTarget: null,
    deleteOpen: false,
    drawerTarget: null,
    drawerOpen: false,
  };

export function programAdmissionConfigTabReducer(
  state: ProgramAdmissionConfigTabState,
  action: ProgramAdmissionConfigTabAction,
): ProgramAdmissionConfigTabState {
  switch (action.type) {
    case ProgramAdmissionConfigTabActionType.SetProgramNameSearch:
      return { ...state, programNameSearch: action.value };

    case ProgramAdmissionConfigTabActionType.SetDebouncedProgramNameSearch:
      return { ...state, debouncedProgramNameSearch: action.value, page: 1 };

    case ProgramAdmissionConfigTabActionType.SetDepartmentNameSearch:
      return { ...state, departmentNameSearch: action.value };

    case ProgramAdmissionConfigTabActionType.SetDebouncedDepartmentNameSearch:
      return { ...state, debouncedDepartmentNameSearch: action.value, page: 1 };

    case ProgramAdmissionConfigTabActionType.SetProgramFilter:
      return { ...state, programFilter: action.value, page: 1 };

    case ProgramAdmissionConfigTabActionType.SetQuotaFilter:
      return { ...state, quotaFilter: action.value, page: 1 };

    case ProgramAdmissionConfigTabActionType.SetPage:
      return { ...state, page: action.page };

    case ProgramAdmissionConfigTabActionType.OpenForm:
      return { ...state, formTarget: action.target, formOpen: true };

    case ProgramAdmissionConfigTabActionType.CloseForm:
      return { ...state, formOpen: false, formTarget: null };

    case ProgramAdmissionConfigTabActionType.OpenDelete:
      return { ...state, deleteTarget: action.target, deleteOpen: true };

    case ProgramAdmissionConfigTabActionType.CloseDelete:
      return { ...state, deleteTarget: null, deleteOpen: false };

    case ProgramAdmissionConfigTabActionType.OpenDrawer:
      return { ...state, drawerTarget: action.target, drawerOpen: true };

    case ProgramAdmissionConfigTabActionType.CloseDrawer:
      return { ...state, drawerTarget: null, drawerOpen: false };

    case ProgramAdmissionConfigTabActionType.Reset:
      return initialProgramAdmissionConfigTabState;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
