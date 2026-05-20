export const AssessmentActionType = {
  SetProgramId: "SET_PROGRAM_ID",
  SetLevelId: "SET_LEVEL_ID",
  SetConfigId: "SET_CONFIG_ID",
  SetProgramSearch: "SET_PROGRAM_SEARCH",
  SetProgramSearchDebounced: "SET_PROGRAM_SEARCH_DEBOUNCED",
  SetCourseSearch: "SET_COURSE_SEARCH",
  SetCourseSearchDebounced: "SET_COURSE_SEARCH_DEBOUNCED",
  Reset: "RESET",
} as const;

export type AssessmentState = {
  selectedProgramId: number | null;
  selectedLevelId: number | null;
  selectedConfigId: number | null;
  programSearch: string;
  debouncedProgramSearch: string;
  courseSearch: string;
  debouncedCourseSearch: string;
};

export type AssessmentAction =
  | { type: typeof AssessmentActionType.SetProgramId; id: number | null }
  | { type: typeof AssessmentActionType.SetLevelId; id: number | null }
  | { type: typeof AssessmentActionType.SetConfigId; id: number | null }
  | { type: typeof AssessmentActionType.SetProgramSearch; value: string }
  | {
      type: typeof AssessmentActionType.SetProgramSearchDebounced;
      value: string;
    }
  | { type: typeof AssessmentActionType.SetCourseSearch; value: string }
  | {
      type: typeof AssessmentActionType.SetCourseSearchDebounced;
      value: string;
    }
  | { type: typeof AssessmentActionType.Reset };

export const initialAssessmentState: AssessmentState = {
  selectedProgramId: null,
  selectedLevelId: null,
  selectedConfigId: null,
  programSearch: "",
  debouncedProgramSearch: "",
  courseSearch: "",
  debouncedCourseSearch: "",
};

export function assessmentReducer(
  state: AssessmentState,
  action: AssessmentAction,
): AssessmentState {
  switch (action.type) {
    case AssessmentActionType.SetProgramId:
      return {
        ...state,
        selectedProgramId: action.id,
        selectedConfigId: null,
      };
    case AssessmentActionType.SetLevelId:
      return {
        ...state,
        selectedLevelId: action.id,
        selectedConfigId: null,
      };
    case AssessmentActionType.SetConfigId:
      return {
        ...state,
        selectedConfigId: action.id,
      };
    case AssessmentActionType.SetProgramSearch:
      return {
        ...state,
        programSearch: action.value,
      };
    case AssessmentActionType.SetProgramSearchDebounced:
      return {
        ...state,
        debouncedProgramSearch: action.value,
      };
    case AssessmentActionType.SetCourseSearch:
      return {
        ...state,
        courseSearch: action.value,
      };
    case AssessmentActionType.SetCourseSearchDebounced:
      return {
        ...state,
        debouncedCourseSearch: action.value,
      };
    case AssessmentActionType.Reset:
      return initialAssessmentState;
    default:
      return state;
  }
}
