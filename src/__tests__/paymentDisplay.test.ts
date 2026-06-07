import { describe, expect, it } from "vitest";
import {
  firstTransactionFromList,
  formatTransactionStatus,
  isTransactionSettled,
  paymentListSubtitle,
  resolvePollStateFromTransaction,
} from "@/features/student-payments/utils/paymentDisplay";
import type { StudentPaymentTransaction } from "@/features/student-payments/types/student-payment";

const baseTx: StudentPaymentTransaction = {
  id: 1,
  provider: "FLUTTERWAVE",
  providerReference: "REP-1-FC6-abc",
  flutterwaveTransactionId: null,
  amount: "50000.00",
  currency: "NGN",
  status: "PENDING",
  paidAt: null,
  payerType: "student",
  payerId: 22,
  createdAt: "2026-06-04T14:55:00+00:00",
  updatedAt: "2026-06-04T14:55:00+00:00",
  payments: null,
};

describe("isTransactionSettled", () => {
  it("returns false for PENDING without payments", () => {
    expect(isTransactionSettled(baseTx)).toBe(false);
  });

  it("returns false for CONFIRMED without payment rows", () => {
    expect(
      isTransactionSettled({ ...baseTx, status: "CONFIRMED", payments: [] }),
    ).toBe(false);
  });

  it("returns true for CONFIRMED with at least one payment", () => {
    expect(
      isTransactionSettled({
        ...baseTx,
        status: "CONFIRMED",
        payments: [
          {
            id: 301,
            paymentTransactionId: 1,
            feeChargeId: 6,
            invoiceId: 1,
            amount: "50000.00",
            createdAt: "2026-06-04T15:00:01+00:00",
            updatedAt: "2026-06-04T15:00:01+00:00",
          },
        ],
      }),
    ).toBe(true);
  });
});

describe("resolvePollStateFromTransaction", () => {
  it("returns success when settled", () => {
    expect(
      resolvePollStateFromTransaction(
        {
          ...baseTx,
          status: "CONFIRMED",
          payments: [
            {
              id: 301,
              paymentTransactionId: 1,
              feeChargeId: 6,
              invoiceId: 1,
              amount: "50000.00",
              createdAt: "2026-06-04T15:00:01+00:00",
              updatedAt: "2026-06-04T15:00:01+00:00",
            },
          ],
        },
        5000,
        60000,
      ),
    ).toBe("success");
  });

  it("returns processing while PENDING under max time", () => {
    expect(resolvePollStateFromTransaction(baseTx, 5000, 60000)).toBe(
      "processing",
    );
  });

  it("returns timeout when PENDING exceeds max time", () => {
    expect(resolvePollStateFromTransaction(baseTx, 65000, 60000)).toBe(
      "timeout",
    );
  });
});

describe("formatTransactionStatus", () => {
  it("humanizes unknown transaction statuses", () => {
    expect(formatTransactionStatus("CUSTOM_STATE").label).toBe("Custom State");
  });
});

describe("paymentListSubtitle", () => {
  it("uses event name from invoice embed", () => {
    expect(
      paymentListSubtitle({
        id: 1,
        paymentTransactionId: 1,
        feeChargeId: 6,
        invoiceId: 1,
        amount: "100.00",
        createdAt: "",
        updatedAt: "",
        invoice: { invoiceNumber: "INV-1", eventName: "Registration fee" },
      }),
    ).toBe("Registration fee");
  });

  it("falls back to friendly text without ids", () => {
    expect(
      paymentListSubtitle({
        id: 99,
        paymentTransactionId: 1,
        feeChargeId: 6,
        invoiceId: null,
        amount: "100.00",
        createdAt: "",
        updatedAt: "",
      }),
    ).toBe("Payment received");
  });
});

describe("firstTransactionFromList", () => {
  it("prefers matching providerReference", () => {
    const member = [
      { ...baseTx, id: 1, providerReference: "REP-a" },
      { ...baseTx, id: 2, providerReference: "REP-b" },
    ];
    expect(firstTransactionFromList(member, "REP-b")?.id).toBe(2);
  });
});
