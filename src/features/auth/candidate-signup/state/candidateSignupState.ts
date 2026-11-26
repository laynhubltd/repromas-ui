import type {
  AdmissionEntryMode,
  CandidateLookupResponse,
} from "../types/candidate-signup";

export type CandidateSignupStep =
  | "bootstrap"
  | "select_entry_mode"
  | "jamb_lookup"
  | "jamb_details"
  | "open_form"
  | "blocked";

export type CandidateSignupBlockedReason =
  | "not_open"
  | "ambiguous"
  | "wrong_status";

export type CandidateSignupLaneContext = {
  entryMode: AdmissionEntryMode | null;
  batchNo: number;
  sessionId?: number;
};

export const CandidateSignupActionType = {
  BootstrapMultiLane: "BOOTSTRAP_MULTI_LANE",
  SelectEntryMode: "SELECT_ENTRY_MODE",
  SetOpenStateId: "SET_OPEN_STATE_ID",
  SetStep: "SET_STEP",
  SetLookupResult: "SET_LOOKUP_RESULT",
  SetJambRegNo: "SET_JAMB_REG_NO",
  SetLaneContext: "SET_LANE_CONTEXT",
  SetFormError: "SET_FORM_ERROR",
  Reset: "RESET",
} as const;

export type CandidateSignupState = {
  step: CandidateSignupStep;
  selectedEntryMode: AdmissionEntryMode | null;
  openStateId: number | undefined;
  jambRegNo: string;
  lookupResult: CandidateLookupResponse | null;
  laneContext: CandidateSignupLaneContext | null;
  formError: string | null;
};

export type CandidateSignupAction =
  | {
      type: typeof CandidateSignupActionType.BootstrapMultiLane;
      laneContext: CandidateSignupLaneContext;
      selectedEntryMode: AdmissionEntryMode | null;
      step: "select_entry_mode" | "jamb_lookup" | "open_form";
    }
  | {
      type: typeof CandidateSignupActionType.SelectEntryMode;
      entryMode: AdmissionEntryMode | null;
      step?: CandidateSignupStep;
    }
  | {
      type: typeof CandidateSignupActionType.SetOpenStateId;
      stateId: number | undefined;
    }
  | { type: typeof CandidateSignupActionType.SetStep; step: CandidateSignupStep }
  | {
      type: typeof CandidateSignupActionType.SetLookupResult;
      result: CandidateLookupResponse;
    }
  | { type: typeof CandidateSignupActionType.SetJambRegNo; value: string }
  | {
      type: typeof CandidateSignupActionType.SetLaneContext;
      laneContext: CandidateSignupLaneContext;
      step: "select_entry_mode" | "jamb_lookup" | "open_form";
    }
  | {
      type: typeof CandidateSignupActionType.SetFormError;
      message: string | null;
    }
  | { type: typeof CandidateSignupActionType.Reset };

export const initialCandidateSignupState: CandidateSignupState = {
  step: "bootstrap",
  selectedEntryMode: null,
  openStateId: undefined,
  jambRegNo: "",
  lookupResult: null,
  laneContext: null,
  formError: null,
};

export function candidateSignupReducer(
  state: CandidateSignupState,
  action: CandidateSignupAction,
): CandidateSignupState {
  switch (action.type) {
    case CandidateSignupActionType.BootstrapMultiLane:
      return {
        ...state,
        laneContext: action.laneContext,
        selectedEntryMode: action.selectedEntryMode,
        step: action.step,
        lookupResult: null,
        jambRegNo: "",
        openStateId: undefined,
        formError: null,
      };
    case CandidateSignupActionType.SelectEntryMode:
      return {
        ...state,
        selectedEntryMode: action.entryMode,
        ...(action.step ? { step: action.step } : {}),
        ...(state.laneContext
          ? {
              laneContext: {
                ...state.laneContext,
                entryMode: action.entryMode,
              },
            }
          : {}),
        formError: null,
      };
    case CandidateSignupActionType.SetOpenStateId:
      return { ...state, openStateId: action.stateId };
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
    case CandidateSignupActionType.SetLaneContext:
      return {
        ...state,
        laneContext: action.laneContext,
        step: action.step,
        formError: null,
      };
    case CandidateSignupActionType.SetFormError:
      return { ...state, formError: action.message };
    case CandidateSignupActionType.Reset:
      return initialCandidateSignupState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
