export const OlevelSubjectFormActionType = {
  SetFormError: "SET_FORM_ERROR",
  Reset: "RESET",
} as const;

export type OlevelSubjectFormState = {
  formError: string | null;
};

export type OlevelSubjectFormAction =
  | {
      type: typeof OlevelSubjectFormActionType.SetFormError;
      message: string | null;
    }
  | { type: typeof OlevelSubjectFormActionType.Reset };

export const initialOlevelSubjectFormState: OlevelSubjectFormState = {
  formError: null,
};

export function olevelSubjectFormReducer(
  state: OlevelSubjectFormState,
  action: OlevelSubjectFormAction,
): OlevelSubjectFormState {
  switch (action.type) {
    case OlevelSubjectFormActionType.SetFormError:
      return { ...state, formError: action.message };
    case OlevelSubjectFormActionType.Reset:
      return initialOlevelSubjectFormState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
