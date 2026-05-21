export const ProgramOlevelRuleFormActionType = {
  SetFormError: "SET_FORM_ERROR",
  Reset: "RESET",
} as const;

export type ProgramOlevelRuleFormState = {
  formError: string | null;
};

export type ProgramOlevelRuleFormAction =
  | {
      type: typeof ProgramOlevelRuleFormActionType.SetFormError;
      message: string | null;
    }
  | { type: typeof ProgramOlevelRuleFormActionType.Reset };

export const initialProgramOlevelRuleFormState: ProgramOlevelRuleFormState = {
  formError: null,
};

export function programOlevelRuleFormReducer(
  state: ProgramOlevelRuleFormState,
  action: ProgramOlevelRuleFormAction,
): ProgramOlevelRuleFormState {
  switch (action.type) {
    case ProgramOlevelRuleFormActionType.SetFormError:
      return { ...state, formError: action.message };

    case ProgramOlevelRuleFormActionType.Reset:
      return initialProgramOlevelRuleFormState;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
