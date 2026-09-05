import type { ActionTimingMode } from "../types/academic-standing-escalation";

export const AcademicStandingEscalationFormActionType = {
  SetActionTimingMode: "SET_ACTION_TIMING_MODE",
  SetSemesterTypeId: "SET_SEMESTER_TYPE_ID",
  SetIsTerminal: "SET_IS_TERMINAL",
  SetFormError: "SET_FORM_ERROR",
  Reset: "RESET",
} as const;

export type AcademicStandingEscalationFormState = {
  actionTimingMode: ActionTimingMode;
  semesterTypeId: number | null;
  isTerminal: boolean;
  formError: string | null;
};

export type AcademicStandingEscalationFormAction =
  | {
      type: typeof AcademicStandingEscalationFormActionType.SetActionTimingMode;
      mode: ActionTimingMode;
    }
  | {
      type: typeof AcademicStandingEscalationFormActionType.SetSemesterTypeId;
      semesterTypeId: number | null;
    }
  | {
      type: typeof AcademicStandingEscalationFormActionType.SetIsTerminal;
      value: boolean;
    }
  | {
      type: typeof AcademicStandingEscalationFormActionType.SetFormError;
      message: string | null;
    }
  | { type: typeof AcademicStandingEscalationFormActionType.Reset };

export const initialAcademicStandingEscalationFormState: AcademicStandingEscalationFormState =
  {
    actionTimingMode: "ANY_SEMESTER",
    semesterTypeId: null,
    isTerminal: false,
    formError: null,
  };

export function academicStandingEscalationFormReducer(
  state: AcademicStandingEscalationFormState,
  action: AcademicStandingEscalationFormAction,
): AcademicStandingEscalationFormState {
  switch (action.type) {
    case AcademicStandingEscalationFormActionType.SetActionTimingMode:
      return {
        ...state,
        actionTimingMode: action.mode,
        semesterTypeId: action.mode === "SPECIFIC_SEMESTER" ? state.semesterTypeId : null,
      };
    case AcademicStandingEscalationFormActionType.SetSemesterTypeId:
      return { ...state, semesterTypeId: action.semesterTypeId };
    case AcademicStandingEscalationFormActionType.SetIsTerminal:
      return { ...state, isTerminal: action.value };
    case AcademicStandingEscalationFormActionType.SetFormError:
      return { ...state, formError: action.message };
    case AcademicStandingEscalationFormActionType.Reset:
      return initialAcademicStandingEscalationFormState;
  }
}
