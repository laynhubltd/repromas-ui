import { describe, expect, it } from "vitest";
import { resolvePollStateFromTransaction } from "@/features/student-payments/utils/paymentDisplay";
import type { StudentPaymentTransaction } from "@/features/student-payments/types/student-payment";

describe("payment return polling state machine", () => {
  const pending: StudentPaymentTransaction = {
    id: 900,
    provider: "FLUTTERWAVE",
    providerReference: "REP-3-FC6-deadbeef",
    flutterwaveTransactionId: null,
    amount: "112000.00",
    currency: "NGN",
    status: "PENDING",
    paidAt: null,
    payerType: "student",
    payerId: 22,
    createdAt: "2026-06-04T14:55:00+00:00",
    updatedAt: "2026-06-04T14:55:00+00:00",
    payments: null,
  };

  it("transitions PENDING to success when CONFIRMED with payments", () => {
    expect(resolvePollStateFromTransaction(pending, 3000, 60000)).toBe(
      "processing",
    );

    const confirmed: StudentPaymentTransaction = {
      ...pending,
      status: "CONFIRMED",
      paidAt: "2026-06-04T15:00:00+00:00",
      payments: [
        {
          id: 301,
          paymentTransactionId: 900,
          feeChargeId: 6,
          invoiceId: 1,
          amount: "112000.00",
          createdAt: "2026-06-04T15:00:01+00:00",
          updatedAt: "2026-06-04T15:00:01+00:00",
        },
      ],
    };

    expect(resolvePollStateFromTransaction(confirmed, 8000, 60000)).toBe(
      "success",
    );
  });
});
