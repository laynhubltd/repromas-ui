export const ProgramAdmissionConfigFormActionType = {
  SetFormError: "SET_FORM_ERROR",
  Reset: "RESET",
} as const;

export type ProgramAdmissionConfigFormState = {
  formError: string | null;
};

export type ProgramAdmissionConfigFormAction =
  | {
      type: typeof ProgramAdmissionConfigFormActionType.SetFormError;
      message: string | null;
    }
  | { type: typeof ProgramAdmissionConfigFormActionType.Reset };

export const initialProgramAdmissionConfigFormState: ProgramAdmissionConfigFormState =
  {
    formError: null,
  };

export function programAdmissionConfigFormReducer(
  state: ProgramAdmissionConfigFormState,
  action: ProgramAdmissionConfigFormAction,
): ProgramAdmissionConfigFormState {
  switch (action.type) {
    case ProgramAdmissionConfigFormActionType.SetFormError:
      return { ...state, formError: action.message };

    case ProgramAdmissionConfigFormActionType.Reset:
      return initialProgramAdmissionConfigFormState;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
