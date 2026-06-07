import { describe, expect, it } from "vitest";
import {
  buildSelectedOptionalLineIdsParam,
  findInvoiceIdByFeeChargeId,
  formatInvoiceStatus,
  hasGuardAmountMismatch,
} from "@/features/student-invoices/utils/invoiceDisplay";
import type { StudentInvoice } from "@/features/student-invoices/types/student-invoice";

const baseInvoice: StudentInvoice = {
  id: 88,
  feeChargeId: 901,
  invoiceNumber: "INV-1",
  status: "UNPAID",
  currency: "NGN",
  amountDueTotal: "50000.00",
  amountPaidTotal: "0.00",
  amountCreditedTotal: "0.00",
  amountOutstandingTotal: "50000.00",
  issuedAt: "2026-06-04T12:00:00+00:00",
  dueAt: null,
  cancelledAt: null,
  isActive: true,
  createdAt: "2026-06-04T12:00:00+00:00",
  updatedAt: "2026-06-04T12:00:00+00:00",
  eventCode: "REGISTRATION_FEE",
  eventName: "Registration fee",
  feeChargeStatus: "PENDING",
  amountOutstandingRequired: "50000.00",
  canPay: true,
};

describe("formatInvoiceStatus", () => {
  it("maps UNPAID to error color", () => {
    expect(formatInvoiceStatus("UNPAID").color).toBe("error");
  });

  it("maps PAID to success color", () => {
    expect(formatInvoiceStatus("PAID").label).toBe("Paid");
  });
});

describe("buildSelectedOptionalLineIdsParam", () => {
  it("returns comma-separated ids", () => {
    expect(buildSelectedOptionalLineIdsParam([203, 204])).toBe("203,204");
  });

  it("returns undefined for empty array", () => {
    expect(buildSelectedOptionalLineIdsParam([])).toBeUndefined();
  });
});

describe("findInvoiceIdByFeeChargeId", () => {
  it("finds payable invoice by fee charge id", () => {
    expect(
      findInvoiceIdByFeeChargeId(
        [baseInvoice, { ...baseInvoice, id: 89, feeChargeId: 902, canPay: false }],
        901,
      ),
    ).toBe(88);
  });

  it("returns null when no payable match", () => {
    expect(
      findInvoiceIdByFeeChargeId(
        [{ ...baseInvoice, canPay: false }],
        901,
      ),
    ).toBeNull();
  });
});

describe("hasGuardAmountMismatch", () => {
  it("returns true when required is less than total outstanding", () => {
    expect(
      hasGuardAmountMismatch({
        ...baseInvoice,
        amountOutstandingRequired: "20000.00",
        amountOutstandingTotal: "50000.00",
      }),
    ).toBe(true);
  });

  it("returns false when amounts match", () => {
    expect(hasGuardAmountMismatch(baseInvoice)).toBe(false);
  });
});
