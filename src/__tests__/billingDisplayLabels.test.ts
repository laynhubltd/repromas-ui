import { describe, expect, it } from "vitest";
import {
  formatFeeChargeStatusLabel,
  formatPayerTypeLabel,
  humanizeEnumValue,
} from "@/shared/constants/billingDisplayLabels";

describe("billingDisplayLabels", () => {
  it("humanizes unknown enum tokens", () => {
    expect(humanizeEnumValue("REGISTRATION_FEE")).toBe("Registration Fee");
  });

  it("maps known fee charge statuses", () => {
    expect(formatFeeChargeStatusLabel("FULFILLED")).toBe("Paid in full");
    expect(formatFeeChargeStatusLabel("PARTIALLY_PAID")).toBe("Partially paid");
  });

  it("maps payer types", () => {
    expect(formatPayerTypeLabel("admission_candidate")).toBe(
      "Admission candidate",
    );
    expect(formatPayerTypeLabel("custom_payer")).toBe("Custom Payer");
  });
});
