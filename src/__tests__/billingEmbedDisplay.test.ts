import { describe, expect, it } from "vitest";
import {
  formatFeeChargeLabel,
  formatInvoiceLabel,
  formatInvoiceStatusLabel,
  formatPaymentContextLabel,
  resolveAllocationLineName,
  buildInvoiceLineNameMap,
} from "@/features/billing/utils/billingEmbedDisplay";

describe("billingEmbedDisplay", () => {
  it("formats fee charge from event name and status labels", () => {
    expect(
      formatFeeChargeLabel({
        eventCode: "REGISTRATION_FEE",
        eventName: "Registration fee",
        status: "FULFILLED",
      }),
    ).toBe("Registration fee (Paid in full)");
  });

  it("humanizes event code when name is missing", () => {
    expect(
      formatFeeChargeLabel({ eventCode: "REGISTRATION_FEE", status: "OPEN" }),
    ).toBe("Registration Fee (Open)");
  });

  it("formats invoice from invoice number", () => {
    expect(formatInvoiceLabel({ invoiceNumber: "INV-3-20260604-0001" })).toBe(
      "INV-3-20260604-0001",
    );
  });

  it("formats invoice status without raw enum", () => {
    expect(formatInvoiceStatusLabel("WAIVED_COMPLETELY")).toBe("Waived");
    expect(formatInvoiceStatusLabel("UNKNOWN_STATUS")).toBe("Unknown Status");
  });

  it("resolves allocation line names from invoice lines", () => {
    const map = buildInvoiceLineNameMap([
      { id: 1, lineName: "School Fees" },
      { id: 2, lineName: "Sport" },
    ]);
    expect(resolveAllocationLineName(map, 2)).toBe("Sport");
    expect(resolveAllocationLineName(map, 99)).toBe("—");
  });

  it("prefers event name in payment context", () => {
    expect(
      formatPaymentContextLabel({
        invoice: { eventName: "Registration fee", invoiceNumber: "INV-1" },
        feeCharge: { eventCode: "REGISTRATION_FEE" },
      }),
    ).toBe("Registration fee");
  });

  it("humanizes fee code when only code is embedded", () => {
    expect(
      formatPaymentContextLabel({
        feeCharge: { eventCode: "REGISTRATION_FEE" },
      }),
    ).toBe("Registration Fee");
  });
});
