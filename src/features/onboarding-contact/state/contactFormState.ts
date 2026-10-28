import type { ContactRequestReceipt } from "../types";

export const ContactFormActionType = {
  SetSuccess: "SET_SUCCESS",
  Reset: "RESET",
} as const;

export type ContactFormState = {
  phase: "form" | "success";
  receipt: ContactRequestReceipt | null;
  submittedName: string;
};

export type ContactFormAction =
  | { type: typeof ContactFormActionType.SetSuccess; receipt: ContactRequestReceipt; name: string }
  | { type: typeof ContactFormActionType.Reset };

export const initialContactFormState: ContactFormState = {
  phase: "form",
  receipt: null,
  submittedName: "",
};

export function contactFormReducer(state: ContactFormState, action: ContactFormAction): ContactFormState {
  switch (action.type) {
    case ContactFormActionType.SetSuccess:
      return { ...state, phase: "success", receipt: action.receipt, submittedName: action.name };
    case ContactFormActionType.Reset:
      return initialContactFormState;
  }
}
