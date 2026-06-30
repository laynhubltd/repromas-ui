export const QualificationTypeFormActionType = {
  SetFormError: "SET_FORM_ERROR",
  Reset: "RESET",
} as const;

export type QualificationTypeFormState = {
  formError: string | null;
};

export type QualificationTypeFormAction =
  | { type: typeof QualificationTypeFormActionType.SetFormError; message: string | null }
  | { type: typeof QualificationTypeFormActionType.Reset };

export const initialQualificationTypeFormState: QualificationTypeFormState = {
  formError: null,
};

export function qualificationTypeFormReducer(
  state: QualificationTypeFormState,
  action: QualificationTypeFormAction,
): QualificationTypeFormState {
  switch (action.type) {
    case QualificationTypeFormActionType.SetFormError:
      return { ...state, formError: action.message };
    case QualificationTypeFormActionType.Reset:
      return initialQualificationTypeFormState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
