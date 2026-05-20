export const EvaluationStatusFormActionType = {
  SetFormError: "SET_FORM_ERROR",
  SetIsDefault: "SET_IS_DEFAULT",
  SetRequiresRetake: "SET_REQUIRES_RETAKE",
  SetEarnsCredit: "SET_EARNS_CREDIT",
  Reset: "RESET",
} as const;

export type EvaluationStatusFormState = {
  formError: string | null;
  isDefault: boolean;
  requiresRetake: boolean;
  earnsCredit: boolean;
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
  | { type: typeof EvaluationStatusFormActionType.Reset };

export const initialEvaluationStatusFormState: EvaluationStatusFormState = {
  formError: null,
  isDefault: false,
  requiresRetake: false,
  earnsCredit: false,
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
    case EvaluationStatusFormActionType.Reset:
      return initialEvaluationStatusFormState;
  }
}
