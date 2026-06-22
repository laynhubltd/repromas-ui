import type { OfferDecision, SeatBucket } from "../types/admission-candidate";

export const AdmissionOfferFormActionType = {
  SetFinalDecision: "SET_FINAL_DECISION",
  SetOfferedProgramId: "SET_OFFERED_PROGRAM_ID",
  SetSeatBucket: "SET_SEAT_BUCKET",
  SetOverrideReason: "SET_OVERRIDE_REASON",
  Reset: "RESET",
} as const;

export type AdmissionOfferFormState = {
  finalDecision: OfferDecision | undefined;
  offeredProgramId: number | undefined;
  seatBucket: SeatBucket | undefined;
  overrideReason: string;
};

export type AdmissionOfferFormAction =
  | {
      type: typeof AdmissionOfferFormActionType.SetFinalDecision;
      value: OfferDecision | undefined;
    }
  | {
      type: typeof AdmissionOfferFormActionType.SetOfferedProgramId;
      value: number | undefined;
    }
  | {
      type: typeof AdmissionOfferFormActionType.SetSeatBucket;
      value: SeatBucket | undefined;
    }
  | {
      type: typeof AdmissionOfferFormActionType.SetOverrideReason;
      value: string;
    }
  | { type: typeof AdmissionOfferFormActionType.Reset };

export const initialAdmissionOfferFormState: AdmissionOfferFormState = {
  finalDecision: undefined,
  offeredProgramId: undefined,
  seatBucket: undefined,
  overrideReason: "",
};

export function admissionOfferFormReducer(
  state: AdmissionOfferFormState,
  action: AdmissionOfferFormAction,
): AdmissionOfferFormState {
  switch (action.type) {
    case AdmissionOfferFormActionType.SetFinalDecision:
      return {
        ...state,
        finalDecision: action.value,
        offeredProgramId:
          action.value === "OFFER_CHANGE_OF_COURSE"
            ? state.offeredProgramId
            : undefined,
        seatBucket:
          action.value === "OFFER_CHANGE_OF_COURSE"
            ? state.seatBucket
            : undefined,
      };
    case AdmissionOfferFormActionType.SetOfferedProgramId:
      return { ...state, offeredProgramId: action.value };
    case AdmissionOfferFormActionType.SetSeatBucket:
      return { ...state, seatBucket: action.value };
    case AdmissionOfferFormActionType.SetOverrideReason:
      return { ...state, overrideReason: action.value };
    case AdmissionOfferFormActionType.Reset:
      return initialAdmissionOfferFormState;
  }
}
