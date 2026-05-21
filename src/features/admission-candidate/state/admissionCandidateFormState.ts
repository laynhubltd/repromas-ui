export const AdmissionCandidateFormActionType = {
  SetFormError: "SET_FORM_ERROR",
  Reset: "RESET",
} as const;

export type AdmissionCandidateFormState = {
  formError: string | null;
};

export type AdmissionCandidateFormAction =
  | {
      type: typeof AdmissionCandidateFormActionType.SetFormError;
      message: string | null;
    }
  | { type: typeof AdmissionCandidateFormActionType.Reset };

export const initialAdmissionCandidateFormState: AdmissionCandidateFormState = {
  formError: null,
};

export function admissionCandidateFormReducer(
  state: AdmissionCandidateFormState,
  action: AdmissionCandidateFormAction,
): AdmissionCandidateFormState {
  switch (action.type) {
    case AdmissionCandidateFormActionType.SetFormError:
      return { ...state, formError: action.message };
    case AdmissionCandidateFormActionType.Reset:
      return initialAdmissionCandidateFormState;
  }
}
