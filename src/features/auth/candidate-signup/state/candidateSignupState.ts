import type { CandidateLookupResponse } from "../types/candidate-signup";

export type CandidateSignupStep =
  | "bootstrap"
  | "jamb_lookup"
  | "jamb_details"
  | "open_form"
  | "blocked";

export type CandidateSignupBlockedReason = "not_open" | "ambiguous" | "wrong_status";

export const CandidateSignupActionType = {
  SetStep: "SET_STEP",
  SetLookupResult: "SET_LOOKUP_RESULT",
  SetJambRegNo: "SET_JAMB_REG_NO",
  SetBlockedReason: "SET_BLOCKED_REASON",
  SetFormError: "SET_FORM_ERROR",
  Reset: "RESET",
} as const;

export type CandidateSignupState = {
  step: CandidateSignupStep;
  jambRegNo: string;
  lookupResult: CandidateLookupResponse | null;
  blockedReason: CandidateSignupBlockedReason | null;
  formError: string | null;
};

export type CandidateSignupAction =
  | { type: typeof CandidateSignupActionType.SetStep; step: CandidateSignupStep }
  | {
      type: typeof CandidateSignupActionType.SetLookupResult;
      result: CandidateLookupResponse;
    }
  | { type: typeof CandidateSignupActionType.SetJambRegNo; value: string }
  | {
      type: typeof CandidateSignupActionType.SetBlockedReason;
      reason: CandidateSignupBlockedReason;
    }
  | { type: typeof CandidateSignupActionType.SetFormError; message: string | null }
  | { type: typeof CandidateSignupActionType.Reset };

export const initialCandidateSignupState: CandidateSignupState = {
  step: "bootstrap",
  jambRegNo: "",
  lookupResult: null,
  blockedReason: null,
  formError: null,
};

export function candidateSignupReducer(
  state: CandidateSignupState,
  action: CandidateSignupAction,
): CandidateSignupState {
  switch (action.type) {
    case CandidateSignupActionType.SetStep:
      return { ...state, step: action.step, formError: null };
    case CandidateSignupActionType.SetLookupResult:
      return {
        ...state,
        lookupResult: action.result,
        step: "jamb_details",
        formError: null,
      };
    case CandidateSignupActionType.SetJambRegNo:
      return { ...state, jambRegNo: action.value };
    case CandidateSignupActionType.SetBlockedReason:
      return {
        ...state,
        blockedReason: action.reason,
        step: "blocked",
        formError: null,
      };
    case CandidateSignupActionType.SetFormError:
      return { ...state, formError: action.message };
    case CandidateSignupActionType.Reset:
      return initialCandidateSignupState;
    default:
      return state;
  }
}
