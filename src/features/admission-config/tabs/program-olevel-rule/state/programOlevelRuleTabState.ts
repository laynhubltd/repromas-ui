import type { ProgramOlevelRequirement } from "../types/program-olevel-rule";

export const ProgramOlevelRuleTabActionType = {
  SetSearch: "SET_SEARCH",
  SetDebouncedSearch: "SET_DEBOUNCED_SEARCH",
  SetFacultyFilter: "SET_FACULTY_FILTER",
  SetDepartmentFilter: "SET_DEPARTMENT_FILTER",
  SetPage: "SET_PAGE",
  OpenForm: "OPEN_FORM",
  CloseForm: "CLOSE_FORM",
  OpenDelete: "OPEN_DELETE",
  CloseDelete: "CLOSE_DELETE",
  Reset: "RESET",
} as const;

export type ProgramOlevelRuleTabState = {
  search: string;
  debouncedSearch: string;
  facultyFilter: number | undefined;
  departmentFilter: number | undefined;
  page: number;
  formTarget: ProgramOlevelRequirement | null;
  formPresetProgramId: number | undefined;
  formOpen: boolean;
  deleteTarget: ProgramOlevelRequirement | null;
  deleteOpen: boolean;
};

export type ProgramOlevelRuleTabAction =
  | { type: typeof ProgramOlevelRuleTabActionType.SetSearch; value: string }
  | {
      type: typeof ProgramOlevelRuleTabActionType.SetDebouncedSearch;
      value: string;
    }
  | {
      type: typeof ProgramOlevelRuleTabActionType.SetFacultyFilter;
      value: number | undefined;
    }
  | {
      type: typeof ProgramOlevelRuleTabActionType.SetDepartmentFilter;
      value: number | undefined;
    }
  | { type: typeof ProgramOlevelRuleTabActionType.SetPage; value: number }
  | {
      type: typeof ProgramOlevelRuleTabActionType.OpenForm;
      target: ProgramOlevelRequirement | null;
      presetProgramId?: number;
    }
  | { type: typeof ProgramOlevelRuleTabActionType.CloseForm }
  | {
      type: typeof ProgramOlevelRuleTabActionType.OpenDelete;
      target: ProgramOlevelRequirement;
    }
  | { type: typeof ProgramOlevelRuleTabActionType.CloseDelete }
  | { type: typeof ProgramOlevelRuleTabActionType.Reset };

export const initialProgramOlevelRuleTabState: ProgramOlevelRuleTabState = {
  search: "",
  debouncedSearch: "",
  facultyFilter: undefined,
  departmentFilter: undefined,
  page: 1,
  formTarget: null,
  formPresetProgramId: undefined,
  formOpen: false,
  deleteTarget: null,
  deleteOpen: false,
};

export function programOlevelRuleTabReducer(
  state: ProgramOlevelRuleTabState,
  action: ProgramOlevelRuleTabAction,
): ProgramOlevelRuleTabState {
  switch (action.type) {
    case ProgramOlevelRuleTabActionType.SetSearch:
      return { ...state, search: action.value };

    case ProgramOlevelRuleTabActionType.SetDebouncedSearch:
      return { ...state, debouncedSearch: action.value, page: 1 };

    case ProgramOlevelRuleTabActionType.SetFacultyFilter:
      return {
        ...state,
        facultyFilter: action.value,
        departmentFilter: undefined,
        page: 1,
      };

    case ProgramOlevelRuleTabActionType.SetDepartmentFilter:
      return { ...state, departmentFilter: action.value, page: 1 };

    case ProgramOlevelRuleTabActionType.SetPage:
      return { ...state, page: action.value };

    case ProgramOlevelRuleTabActionType.OpenForm:
      return {
        ...state,
        formTarget: action.target,
        formPresetProgramId: action.presetProgramId,
        formOpen: true,
      };

    case ProgramOlevelRuleTabActionType.CloseForm:
      return {
        ...state,
        formOpen: false,
        formPresetProgramId: undefined,
      };

    case ProgramOlevelRuleTabActionType.OpenDelete:
      return { ...state, deleteTarget: action.target, deleteOpen: true };

    case ProgramOlevelRuleTabActionType.CloseDelete:
      return { ...state, deleteOpen: false, deleteTarget: null };

    case ProgramOlevelRuleTabActionType.Reset:
      return initialProgramOlevelRuleTabState;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
