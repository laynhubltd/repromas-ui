export const JambRuleFormActionType = {
  SetFormError: "SET_FORM_ERROR",
  Reset: "RESET",
} as const;

export type JambRuleFormState = {
  formError: string | null;
};

export type JambRuleFormAction =
  | {
      type: typeof JambRuleFormActionType.SetFormError;
      message: string | null;
    }
  | { type: typeof JambRuleFormActionType.Reset };

export const initialJambRuleFormState: JambRuleFormState = {
  formError: null,
};

export function jambRuleFormReducer(
  state: JambRuleFormState,
  action: JambRuleFormAction,
): JambRuleFormState {
  switch (action.type) {
    case JambRuleFormActionType.SetFormError:
      return { ...state, formError: action.message };

    case JambRuleFormActionType.Reset:
      return initialJambRuleFormState;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
