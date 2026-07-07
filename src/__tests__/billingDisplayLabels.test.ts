import { describe, expect, it } from "vitest";
import {
  formatEventCodeLabel,
  formatFeeChargeStatusLabel,
  formatPayerTypeLabel,
  humanizeEnumValue,
} from "@/shared/constants/billingDisplayLabels";
import { FEE_EVENT_CODE } from "@/shared/constants/feeEventOptions";

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

  it("uses curated labels for known fee event codes", () => {
    expect(formatEventCodeLabel(FEE_EVENT_CODE.ADMISSION_REGISTRATION)).toBe(
      "Admission registration fee",
    );
    expect(formatEventCodeLabel(FEE_EVENT_CODE.ADMISSION_APPLICATION)).toBe(
      "Application fee",
    );
  });

  it("prefers displayName over fee event code label", () => {
    expect(
      formatEventCodeLabel(FEE_EVENT_CODE.ADMISSION_APPLICATION, {
        displayName: "Custom application fee",
      }),
    ).toBe("Custom application fee");
  });

  it("humanizes unknown fee event codes", () => {
    expect(formatEventCodeLabel("CUSTOM_TUITION_FEE")).toBe("Custom Tuition Fee");
  });
});
