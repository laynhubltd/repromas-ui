// src/features/admission-config/tabs/admission-cycle/state/admissionCycleFormState.ts

export const AdmissionCycleFormActionType = {
  Reset: "RESET",
} as const;

export type AdmissionCycleFormState = Record<string, never>;

export type AdmissionCycleFormAction = {
  type: typeof AdmissionCycleFormActionType.Reset;
};

export const initialAdmissionCycleFormState: AdmissionCycleFormState = {};

export function admissionCycleFormReducer(
  _state: AdmissionCycleFormState,
  action: AdmissionCycleFormAction,
): AdmissionCycleFormState {
  switch (action.type) {
    case AdmissionCycleFormActionType.Reset:
      return initialAdmissionCycleFormState;
    default:
      return _state;
  }
}
