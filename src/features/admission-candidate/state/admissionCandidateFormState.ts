import type {
  CandidateIntakeMode,
  CreateAdmissionCandidateResponse,
} from "../types/admission-candidate";

export const AdmissionCandidateFormActionType = {
  SetIntakeMode: "SET_INTAKE_MODE",
  SetSelectedStateId: "SET_SELECTED_STATE_ID",
  SetStep: "SET_STEP",
  SetCreateResult: "SET_CREATE_RESULT",
  Reset: "RESET",
} as const;

export type AdmissionCandidateFormStep = "form" | "result";

export type AdmissionCandidateFormState = {
  step: AdmissionCandidateFormStep;
  intakeMode: CandidateIntakeMode;
  selectedStateId: number | null;
  createResult: CreateAdmissionCandidateResponse | null;
};

export type AdmissionCandidateFormAction =
  | {
      type: typeof AdmissionCandidateFormActionType.SetIntakeMode;
      mode: CandidateIntakeMode;
    }
  | {
      type: typeof AdmissionCandidateFormActionType.SetSelectedStateId;
      stateId: number | null;
    }
  | {
      type: typeof AdmissionCandidateFormActionType.SetStep;
      step: AdmissionCandidateFormStep;
    }
  | {
      type: typeof AdmissionCandidateFormActionType.SetCreateResult;
      result: CreateAdmissionCandidateResponse | null;
    }
  | { type: typeof AdmissionCandidateFormActionType.Reset };

export const initialAdmissionCandidateFormState: AdmissionCandidateFormState = {
  step: "form",
  intakeMode: "manual",
  selectedStateId: null,
  createResult: null,
};

export function admissionCandidateFormReducer(
  state: AdmissionCandidateFormState,
  action: AdmissionCandidateFormAction,
): AdmissionCandidateFormState {
  switch (action.type) {
    case AdmissionCandidateFormActionType.SetIntakeMode:
      return { ...state, intakeMode: action.mode };
    case AdmissionCandidateFormActionType.SetSelectedStateId:
      return { ...state, selectedStateId: action.stateId };
    case AdmissionCandidateFormActionType.SetStep:
      return { ...state, step: action.step };
    case AdmissionCandidateFormActionType.SetCreateResult:
      return { ...state, createResult: action.result };
    case AdmissionCandidateFormActionType.Reset:
      return initialAdmissionCandidateFormState;
  }
}
