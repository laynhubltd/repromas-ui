export type HandoffUiPhase =
  | "idle"
  | "confirming_payment"
  | "payment_confirmed"
  | "matriculating"
  | "handoff"
  | "complete"
  | "payment_pending"
  | "failed"
  | "error";

export type PaymentReturnOrchestratorState = {
  phase: HandoffUiPhase;
  paymentId: number | null;
  errorMessage: string | null;
};

export const initialPaymentReturnOrchestratorState: PaymentReturnOrchestratorState =
  {
    phase: "idle",
    paymentId: null,
    errorMessage: null,
  };

export const PaymentReturnOrchestratorActionType = {
  Reset: "RESET",
  StartPaymentConfirm: "START_PAYMENT_CONFIRM",
  PaymentConfirmed: "PAYMENT_CONFIRMED",
  StartMatriculating: "START_MATRICULATING",
  StartHandoff: "START_HANDOFF",
  Complete: "COMPLETE",
  PaymentPending: "PAYMENT_PENDING",
  Failed: "FAILED",
  Error: "ERROR",
} as const;

export type PaymentReturnOrchestratorAction =
  | { type: typeof PaymentReturnOrchestratorActionType.Reset }
  | { type: typeof PaymentReturnOrchestratorActionType.StartPaymentConfirm }
  | {
      type: typeof PaymentReturnOrchestratorActionType.PaymentConfirmed;
      paymentId?: number | null;
    }
  | { type: typeof PaymentReturnOrchestratorActionType.StartMatriculating }
  | { type: typeof PaymentReturnOrchestratorActionType.StartHandoff }
  | {
      type: typeof PaymentReturnOrchestratorActionType.Complete;
      paymentId?: number | null;
    }
  | { type: typeof PaymentReturnOrchestratorActionType.PaymentPending }
  | { type: typeof PaymentReturnOrchestratorActionType.Failed }
  | {
      type: typeof PaymentReturnOrchestratorActionType.Error;
      message?: string | null;
    };

export function paymentReturnOrchestratorReducer(
  state: PaymentReturnOrchestratorState,
  action: PaymentReturnOrchestratorAction,
): PaymentReturnOrchestratorState {
  switch (action.type) {
    case PaymentReturnOrchestratorActionType.Reset:
      return initialPaymentReturnOrchestratorState;
    case PaymentReturnOrchestratorActionType.StartPaymentConfirm:
      return {
        ...state,
        phase: "confirming_payment",
        errorMessage: null,
      };
    case PaymentReturnOrchestratorActionType.PaymentConfirmed:
      return {
        ...state,
        phase: "payment_confirmed",
        paymentId: action.paymentId ?? state.paymentId,
        errorMessage: null,
      };
    case PaymentReturnOrchestratorActionType.StartMatriculating:
      return {
        ...state,
        phase: "matriculating",
        errorMessage: null,
      };
    case PaymentReturnOrchestratorActionType.StartHandoff:
      return {
        ...state,
        phase: "handoff",
        errorMessage: null,
      };
    case PaymentReturnOrchestratorActionType.Complete:
      return {
        ...state,
        phase: "complete",
        paymentId: action.paymentId ?? state.paymentId,
        errorMessage: null,
      };
    case PaymentReturnOrchestratorActionType.PaymentPending:
      return {
        ...state,
        phase: "payment_pending",
        errorMessage: null,
      };
    case PaymentReturnOrchestratorActionType.Failed:
      return {
        ...state,
        phase: "failed",
        errorMessage: null,
      };
    case PaymentReturnOrchestratorActionType.Error:
      return {
        ...state,
        phase: "error",
        errorMessage: action.message ?? null,
      };
    default:
      return state;
  }
}
