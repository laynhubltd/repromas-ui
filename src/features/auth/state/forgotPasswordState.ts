export const ForgotPasswordActionType = {
  SetSuccess: "SET_SUCCESS",
  SetSubmitCooldown: "SET_SUBMIT_COOLDOWN",
  Reset: "RESET",
} as const;

export type ForgotPasswordState = {
  phase: "form" | "success";
  submittedEmail: string;
  submitCooldown: boolean;
};

export type ForgotPasswordAction =
  | {
      type: typeof ForgotPasswordActionType.SetSuccess;
      email: string;
    }
  | {
      type: typeof ForgotPasswordActionType.SetSubmitCooldown;
      value: boolean;
    }
  | { type: typeof ForgotPasswordActionType.Reset };

export const initialForgotPasswordState: ForgotPasswordState = {
  phase: "form",
  submittedEmail: "",
  submitCooldown: false,
};

export function forgotPasswordReducer(
  state: ForgotPasswordState,
  action: ForgotPasswordAction,
): ForgotPasswordState {
  switch (action.type) {
    case ForgotPasswordActionType.SetSuccess:
      return {
        ...state,
        phase: "success",
        submittedEmail: action.email,
        submitCooldown: true,
      };
    case ForgotPasswordActionType.SetSubmitCooldown:
      return { ...state, submitCooldown: action.value };
    case ForgotPasswordActionType.Reset:
      return initialForgotPasswordState;
  }
}
