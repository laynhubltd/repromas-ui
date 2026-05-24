export const OlevelGradePointFormActionType = {
  SetFormError: "SET_FORM_ERROR",
  Reset: "RESET",
} as const;

export type OlevelGradePointFormState = {
  formError: string | null;
};

export type OlevelGradePointFormAction =
  | {
      type: typeof OlevelGradePointFormActionType.SetFormError;
      message: string | null;
    }
  | { type: typeof OlevelGradePointFormActionType.Reset };

export const initialOlevelGradePointFormState: OlevelGradePointFormState = {
  formError: null,
};

export function olevelGradePointFormReducer(
  state: OlevelGradePointFormState,
  action: OlevelGradePointFormAction,
): OlevelGradePointFormState {
  switch (action.type) {
    case OlevelGradePointFormActionType.SetFormError:
      return { ...state, formError: action.message };
    case OlevelGradePointFormActionType.Reset:
      return initialOlevelGradePointFormState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
