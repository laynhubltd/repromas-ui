import { ADMISSION_REGISTRATION_FEE_EVENT_CODE } from "@/features/student-admission/constants/studentAdmissionOptions";
import { BILLING_PAYMENT_SESSION_KEYS } from "@/shared/constants/billingPaymentOptions";
import {
  clearCheckoutContext,
  readCheckoutContext,
  resolveFlowPayerType,
  saveCheckoutContext,
} from "@/features/student-payments/utils/paymentSession";
import { afterEach, describe, expect, it } from "vitest";

describe("paymentSession", () => {
  afterEach(() => {
    clearCheckoutContext();
  });

  it("round-trips eventCode, feeChargeId, and payerType in checkout context", () => {
    saveCheckoutContext({
      providerReference: "REP-3-FC46-deadbeef",
      provider: "FLUTTERWAVE",
      amount: "50000.00",
      currency: "NGN",
      eventCode: ADMISSION_REGISTRATION_FEE_EVENT_CODE,
      feeChargeId: 46,
      payerType: "admission_candidate",
    });

    expect(readCheckoutContext()).toEqual({
      providerReference: "REP-3-FC46-deadbeef",
      provider: "FLUTTERWAVE",
      amount: "50000.00",
      currency: "NGN",
      eventCode: ADMISSION_REGISTRATION_FEE_EVENT_CODE,
      feeChargeId: 46,
      payerType: "admission_candidate",
    });

    clearCheckoutContext();
    expect(
      sessionStorage.getItem(BILLING_PAYMENT_SESSION_KEYS.lastPaymentEventCode),
    ).toBeNull();
  });

  it("resolveFlowPayerType prefers checkout snapshot over live scope", () => {
    expect(
      resolveFlowPayerType(
        { providerReference: "REP-1", payerType: "admission_candidate" },
        "STUDENT",
      ),
    ).toBe("admission_candidate");

    expect(resolveFlowPayerType(null, "STUDENT")).toBe("student");
  });
});
