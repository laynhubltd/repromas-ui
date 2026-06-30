import type { ProgramPriorQualificationRequirement } from "../types/program-prior-qualification-requirement";

export const ProgramPriorQualRequirementTabActionType = {
  SetSearch: "SET_SEARCH",
  SetDebouncedSearch: "SET_DEBOUNCED_SEARCH",
  SetFacultyFilter: "SET_FACULTY_FILTER",
  SetDepartmentFilter: "SET_DEPARTMENT_FILTER",
  SetProgramFilter: "SET_PROGRAM_FILTER",
  SetMandatoryFilter: "SET_MANDATORY_FILTER",
  SetPage: "SET_PAGE",
  OpenForm: "OPEN_FORM",
  CloseForm: "CLOSE_FORM",
  OpenDelete: "OPEN_DELETE",
  CloseDelete: "CLOSE_DELETE",
  OpenView: "OPEN_VIEW",
  CloseView: "CLOSE_VIEW",
  Reset: "RESET",
} as const;

export type ProgramPriorQualRequirementTabState = {
  search: string;
  debouncedSearch: string;
  facultyFilter: number | undefined;
  departmentFilter: number | undefined;
  programFilter: number | undefined;
  mandatoryFilter: boolean | undefined;
  page: number;
  formTarget: ProgramPriorQualificationRequirement | null;
  formPresetProgramId: number | undefined;
  formOpen: boolean;
  deleteTarget: ProgramPriorQualificationRequirement | null;
  deleteOpen: boolean;
  viewTarget: ProgramPriorQualificationRequirement | null;
};

export type ProgramPriorQualRequirementTabAction =
  | { type: typeof ProgramPriorQualRequirementTabActionType.SetSearch; value: string }
  | {
      type: typeof ProgramPriorQualRequirementTabActionType.SetDebouncedSearch;
      value: string;
    }
  | {
      type: typeof ProgramPriorQualRequirementTabActionType.SetFacultyFilter;
      value: number | undefined;
    }
  | {
      type: typeof ProgramPriorQualRequirementTabActionType.SetDepartmentFilter;
      value: number | undefined;
    }
  | {
      type: typeof ProgramPriorQualRequirementTabActionType.SetProgramFilter;
      value: number | undefined;
    }
  | {
      type: typeof ProgramPriorQualRequirementTabActionType.SetMandatoryFilter;
      value: boolean | undefined;
    }
  | { type: typeof ProgramPriorQualRequirementTabActionType.SetPage; value: number }
  | {
      type: typeof ProgramPriorQualRequirementTabActionType.OpenForm;
      target: ProgramPriorQualificationRequirement | null;
      presetProgramId?: number;
    }
  | { type: typeof ProgramPriorQualRequirementTabActionType.CloseForm }
  | {
      type: typeof ProgramPriorQualRequirementTabActionType.OpenDelete;
      target: ProgramPriorQualificationRequirement;
    }
  | { type: typeof ProgramPriorQualRequirementTabActionType.CloseDelete }
  | {
      type: typeof ProgramPriorQualRequirementTabActionType.OpenView;
      target: ProgramPriorQualificationRequirement;
    }
  | { type: typeof ProgramPriorQualRequirementTabActionType.CloseView }
  | { type: typeof ProgramPriorQualRequirementTabActionType.Reset };

export const initialProgramPriorQualRequirementTabState: ProgramPriorQualRequirementTabState =
  {
    search: "",
    debouncedSearch: "",
    facultyFilter: undefined,
    departmentFilter: undefined,
    programFilter: undefined,
    mandatoryFilter: undefined,
    page: 1,
    formTarget: null,
    formPresetProgramId: undefined,
    formOpen: false,
    deleteTarget: null,
    deleteOpen: false,
    viewTarget: null,
  };

export function programPriorQualRequirementTabReducer(
  state: ProgramPriorQualRequirementTabState,
  action: ProgramPriorQualRequirementTabAction,
): ProgramPriorQualRequirementTabState {
  switch (action.type) {
    case ProgramPriorQualRequirementTabActionType.SetSearch:
      return { ...state, search: action.value };
    case ProgramPriorQualRequirementTabActionType.SetDebouncedSearch:
      return { ...state, debouncedSearch: action.value, page: 1 };
    case ProgramPriorQualRequirementTabActionType.SetFacultyFilter:
      return {
        ...state,
        facultyFilter: action.value,
        departmentFilter: undefined,
        programFilter: undefined,
        page: 1,
      };
    case ProgramPriorQualRequirementTabActionType.SetDepartmentFilter:
      return { ...state, departmentFilter: action.value, programFilter: undefined, page: 1 };
    case ProgramPriorQualRequirementTabActionType.SetProgramFilter:
      return { ...state, programFilter: action.value, page: 1 };
    case ProgramPriorQualRequirementTabActionType.SetMandatoryFilter:
      return { ...state, mandatoryFilter: action.value, page: 1 };
    case ProgramPriorQualRequirementTabActionType.SetPage:
      return { ...state, page: action.value };
    case ProgramPriorQualRequirementTabActionType.OpenForm:
      return {
        ...state,
        formTarget: action.target,
        formPresetProgramId: action.presetProgramId,
        formOpen: true,
      };
    case ProgramPriorQualRequirementTabActionType.CloseForm:
      return { ...state, formOpen: false, formPresetProgramId: undefined };
    case ProgramPriorQualRequirementTabActionType.OpenDelete:
      return { ...state, deleteTarget: action.target, deleteOpen: true };
    case ProgramPriorQualRequirementTabActionType.CloseDelete:
      return { ...state, deleteOpen: false, deleteTarget: null };
    case ProgramPriorQualRequirementTabActionType.OpenView:
      return { ...state, viewTarget: action.target };
    case ProgramPriorQualRequirementTabActionType.CloseView:
      return { ...state, viewTarget: null };
    case ProgramPriorQualRequirementTabActionType.Reset:
      return initialProgramPriorQualRequirementTabState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
