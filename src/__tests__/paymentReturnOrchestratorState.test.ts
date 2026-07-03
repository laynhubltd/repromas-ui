import { describe, expect, it } from "vitest";
import {
  initialPaymentReturnOrchestratorState,
  paymentReturnOrchestratorReducer,
  PaymentReturnOrchestratorActionType,
} from "@/features/student-payments/state/paymentReturnOrchestratorState";

describe("paymentReturnOrchestratorReducer", () => {
  it("transitions through registration-fee handoff phases", () => {
    let state = initialPaymentReturnOrchestratorState;

    state = paymentReturnOrchestratorReducer(state, {
      type: PaymentReturnOrchestratorActionType.StartPaymentConfirm,
    });
    expect(state.phase).toBe("confirming_payment");

    state = paymentReturnOrchestratorReducer(state, {
      type: PaymentReturnOrchestratorActionType.StartMatriculating,
    });
    expect(state.phase).toBe("matriculating");

    state = paymentReturnOrchestratorReducer(state, {
      type: PaymentReturnOrchestratorActionType.StartHandoff,
    });
    expect(state.phase).toBe("handoff");

    state = paymentReturnOrchestratorReducer(state, {
      type: PaymentReturnOrchestratorActionType.Complete,
      paymentId: 42,
    });
    expect(state.phase).toBe("complete");
    expect(state.paymentId).toBe(42);
  });

  it("stops at payment_confirmed for non-registration fees", () => {
    let state = paymentReturnOrchestratorReducer(
      initialPaymentReturnOrchestratorState,
      {
        type: PaymentReturnOrchestratorActionType.StartPaymentConfirm,
      },
    );
    state = paymentReturnOrchestratorReducer(state, {
      type: PaymentReturnOrchestratorActionType.PaymentConfirmed,
      paymentId: 7,
    });

    expect(state.phase).toBe("payment_confirmed");
    expect(state.paymentId).toBe(7);
  });

  it("resets to idle", () => {
    const state = paymentReturnOrchestratorReducer(
      {
        phase: "complete",
        paymentId: 1,
        errorMessage: null,
      },
      { type: PaymentReturnOrchestratorActionType.Reset },
    );
    expect(state).toEqual(initialPaymentReturnOrchestratorState);
  });
});
