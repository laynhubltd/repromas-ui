export const EvaluationStatusFormActionType = {
  SetFormError: "SET_FORM_ERROR",
  SetIsDefault: "SET_IS_DEFAULT",
  SetRequiresRetake: "SET_REQUIRES_RETAKE",
  SetEarnsCredit: "SET_EARNS_CREDIT",
  SetIsStandardGraded: "SET_IS_STANDARD_GRADED",
  SetIsStandardPass: "SET_IS_STANDARD_PASS",
  SetIsStandardFail: "SET_IS_STANDARD_FAIL",
  Reset: "RESET",
} as const;

export type EvaluationStatusFormState = {
  formError: string | null;
  isDefault: boolean;
  requiresRetake: boolean;
  earnsCredit: boolean;
  isStandardGraded: boolean;
  isStandardPass: boolean;
  isStandardFail: boolean;
};

export type EvaluationStatusFormAction =
  | {
      type: typeof EvaluationStatusFormActionType.SetFormError;
      message: string | null;
    }
  | { type: typeof EvaluationStatusFormActionType.SetIsDefault; value: boolean }
  | {
      type: typeof EvaluationStatusFormActionType.SetRequiresRetake;
      value: boolean;
    }
  | {
      type: typeof EvaluationStatusFormActionType.SetEarnsCredit;
      value: boolean;
    }
  | {
      type: typeof EvaluationStatusFormActionType.SetIsStandardGraded;
      value: boolean;
    }
  | {
      type: typeof EvaluationStatusFormActionType.SetIsStandardPass;
      value: boolean;
    }
  | {
      type: typeof EvaluationStatusFormActionType.SetIsStandardFail;
      value: boolean;
    }
  | { type: typeof EvaluationStatusFormActionType.Reset };

export const initialEvaluationStatusFormState: EvaluationStatusFormState = {
  formError: null,
  isDefault: false,
  requiresRetake: false,
  earnsCredit: false,
  isStandardGraded: true,
  isStandardPass: false,
  isStandardFail: false,
};

export function evaluationStatusFormReducer(
  state: EvaluationStatusFormState,
  action: EvaluationStatusFormAction,
): EvaluationStatusFormState {
  switch (action.type) {
    case EvaluationStatusFormActionType.SetFormError:
      return { ...state, formError: action.message };
    case EvaluationStatusFormActionType.SetIsDefault:
      return { ...state, isDefault: action.value };
    case EvaluationStatusFormActionType.SetRequiresRetake:
      return { ...state, requiresRetake: action.value };
    case EvaluationStatusFormActionType.SetEarnsCredit:
      return { ...state, earnsCredit: action.value };
    case EvaluationStatusFormActionType.SetIsStandardGraded:
      return {
        ...state,
        isStandardGraded: action.value,
        isStandardPass: action.value ? state.isStandardPass : false,
        isStandardFail: action.value ? state.isStandardFail : false,
      };
    case EvaluationStatusFormActionType.SetIsStandardPass:
      return {
        ...state,
        isStandardPass: action.value,
        isStandardFail: action.value ? false : state.isStandardFail,
      };
    case EvaluationStatusFormActionType.SetIsStandardFail:
      return {
        ...state,
        isStandardFail: action.value,
        isStandardPass: action.value ? false : state.isStandardPass,
      };
    case EvaluationStatusFormActionType.Reset:
      return initialEvaluationStatusFormState;
  }
}

