export const GeographyRuleFormActionType = {
  SetFormError: "SET_FORM_ERROR",
  Reset: "RESET",
} as const;

export type GeographyRuleFormState = {
  formError: string | null;
};

export type GeographyRuleFormAction =
  | {
      type: typeof GeographyRuleFormActionType.SetFormError;
      message: string | null;
    }
  | { type: typeof GeographyRuleFormActionType.Reset };

export const initialGeographyRuleFormState: GeographyRuleFormState = {
  formError: null,
};

export function geographyRuleFormReducer(
  state: GeographyRuleFormState,
  action: GeographyRuleFormAction,
): GeographyRuleFormState {
  switch (action.type) {
    case GeographyRuleFormActionType.SetFormError:
      return { ...state, formError: action.message };
    case GeographyRuleFormActionType.Reset:
      return initialGeographyRuleFormState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
