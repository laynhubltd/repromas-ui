import { describe, expect, it } from "vitest";
import { mapMeHandoffToLoginResponse } from "@/features/auth/utils/mapMeHandoffResponse";
import {
  isAdmissionRegistrationFeePayment,
  resolveBackoffMs,
  resolvePaymentEventCode,
} from "@/features/student-payments/utils/handoffOrchestration";
import type { StudentPaymentTransaction } from "@/features/student-payments/types/student-payment";
import { ADMISSION_REGISTRATION_FEE_EVENT_CODE } from "@/features/student-admission/constants/studentAdmissionOptions";

describe("handoffOrchestration", () => {
  it("resolveBackoffMs uses capped interval index", () => {
    expect(resolveBackoffMs(0)).toBe(2000);
    expect(resolveBackoffMs(1)).toBe(4000);
    expect(resolveBackoffMs(2)).toBe(8000);
    expect(resolveBackoffMs(99)).toBe(8000);
  });

  it("isAdmissionRegistrationFeePayment matches registration fee only", () => {
    expect(
      isAdmissionRegistrationFeePayment(ADMISSION_REGISTRATION_FEE_EVENT_CODE),
    ).toBe(true);
    expect(isAdmissionRegistrationFeePayment("ADMISSION_APPLICATION_FEE")).toBe(
      false,
    );
    expect(isAdmissionRegistrationFeePayment(null)).toBe(false);
  });

  it("resolvePaymentEventCode prefers fee charge embed", () => {
    const transaction: StudentPaymentTransaction = {
      id: 1,
      provider: "FLUTTERWAVE",
      providerReference: "REP-1",
      flutterwaveTransactionId: null,
      amount: "1000",
      currency: "NGN",
      status: "CONFIRMED",
      paidAt: null,
      payerType: "admission_candidate",
      payerId: 1,
      createdAt: "",
      updatedAt: "",
      payments: [
        {
          id: 10,
          paymentTransactionId: 1,
          feeChargeId: 5,
          invoiceId: 2,
          amount: "1000",
          createdAt: "",
          updatedAt: "",
          feeCharge: { eventCode: ADMISSION_REGISTRATION_FEE_EVENT_CODE },
        },
      ],
    };

    expect(resolvePaymentEventCode(transaction, null)).toBe(
      ADMISSION_REGISTRATION_FEE_EVENT_CODE,
    );
  });

  it("resolvePaymentEventCode falls back to checkout session eventCode", () => {
    expect(
      resolvePaymentEventCode(null, {
        providerReference: "REP-1",
        eventCode: ADMISSION_REGISTRATION_FEE_EVENT_CODE,
      }),
    ).toBe(ADMISSION_REGISTRATION_FEE_EVENT_CODE);
  });
});

describe("mapMeHandoffToLoginResponse", () => {
  it("maps handoff payload to LoginResponse", () => {
    const login = mapMeHandoffToLoginResponse({
      token: "access",
      refresh_token: "refresh",
      profile: {
        id: 12,
        user_id: 77,
        tenant_id: 3,
        email: "jane@school.edu",
        first_name: "Jane",
        last_name: "Doe",
      },
      roles: [
        {
          name: "Student",
          scope: "STUDENT",
          scope_reference_id: 29,
          entity: { id: 29, matricNumber: "2026/001" },
        },
      ],
      permissions: ["student.view"],
    });

    expect(login.token).toBe("access");
    expect(login.refresh_token).toBe("refresh");
    expect(login.profile.email).toBe("jane@school.edu");
    expect(login.roles[0]?.scope).toBe("STUDENT");
    expect(login.permissions).toEqual(["student.view"]);
  });
});
