// src/features/admission-config/tabs/admission-cycle/state/admissionCycleFormState.ts

export const AdmissionCycleFormActionType = {
  SetFormError: "SET_FORM_ERROR",
  Reset: "RESET",
} as const;

export type AdmissionCycleFormState = {
  formError: string | null;
};

export type AdmissionCycleFormAction =
  | { type: typeof AdmissionCycleFormActionType.SetFormError; message: string | null }
  | { type: typeof AdmissionCycleFormActionType.Reset };

export const initialAdmissionCycleFormState: AdmissionCycleFormState = {
  formError: null,
};

export function admissionCycleFormReducer(
  state: AdmissionCycleFormState,
  action: AdmissionCycleFormAction,
): AdmissionCycleFormState {
  switch (action.type) {
    case AdmissionCycleFormActionType.SetFormError:
      return { ...state, formError: action.message };
    case AdmissionCycleFormActionType.Reset:
      return initialAdmissionCycleFormState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}