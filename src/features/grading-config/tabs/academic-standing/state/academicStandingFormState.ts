import type { AcademicStandingScope, EvaluationPeriod } from "../types/academic-standing";

export const AcademicStandingFormActionType = {
  SetScope: "SET_SCOPE",
  SetReferenceId: "SET_REFERENCE_ID",
  SetEvaluationPeriod: "SET_EVALUATION_PERIOD",
  SetResetOnRecovery: "SET_RESET_ON_RECOVERY",
  SetFormError: "SET_FORM_ERROR",
  Reset: "RESET",
} as const;

export type AcademicStandingFormState = {
  scope: AcademicStandingScope;
  referenceId: number | null;
  evaluationPeriod: EvaluationPeriod;
  resetOnRecovery: boolean;
  formError: string | null;
};

export type AcademicStandingFormAction =
  | {
      type: typeof AcademicStandingFormActionType.SetScope;
      scope: AcademicStandingScope;
    }
  | {
      type: typeof AcademicStandingFormActionType.SetReferenceId;
      referenceId: number | null;
    }
  | {
      type: typeof AcademicStandingFormActionType.SetEvaluationPeriod;
      period: EvaluationPeriod;
    }
  | {
      type: typeof AcademicStandingFormActionType.SetResetOnRecovery;
      value: boolean;
    }
  | {
      type: typeof AcademicStandingFormActionType.SetFormError;
      message: string | null;
    }
  | { type: typeof AcademicStandingFormActionType.Reset };

export const initialAcademicStandingFormState: AcademicStandingFormState = {
  scope: "GLOBAL",
  referenceId: null,
  evaluationPeriod: "EACH_SEMESTER",
  resetOnRecovery: true,
  formError: null,
};

export function academicStandingFormReducer(
  state: AcademicStandingFormState,
  action: AcademicStandingFormAction,
): AcademicStandingFormState {
  switch (action.type) {
    case AcademicStandingFormActionType.SetScope:
      return { ...state, scope: action.scope, referenceId: null };
    case AcademicStandingFormActionType.SetReferenceId:
      return { ...state, referenceId: action.referenceId };
    case AcademicStandingFormActionType.SetEvaluationPeriod:
      return { ...state, evaluationPeriod: action.period };
    case AcademicStandingFormActionType.SetResetOnRecovery:
      return { ...state, resetOnRecovery: action.value };
    case AcademicStandingFormActionType.SetFormError:
      return { ...state, formError: action.message };
    case AcademicStandingFormActionType.Reset:
      return initialAcademicStandingFormState;
  }
}
