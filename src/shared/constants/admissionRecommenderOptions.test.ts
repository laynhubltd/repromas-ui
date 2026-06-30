import { describe, expect, it } from "vitest";
import {
  getRecommenderReasonLabel,
  RECOMMENDER_REASON_LABELS,
} from "./admissionRecommenderOptions";

describe("admissionRecommenderOptions", () => {
  it("maps known reason codes to plain-language labels", () => {
    expect(getRecommenderReasonLabel("ADMIT_MERIT")).toBe(
      RECOMMENDER_REASON_LABELS.ADMIT_MERIT,
    );
    expect(getRecommenderReasonLabel("NO_PROGRAM_CONFIG")).toBe(
      "No admission config for this program",
    );
    expect(getRecommenderReasonLabel("MISSING_OLEVEL_ENGLISH_CREDIT")).toBe(
      "Missing O-Level English credit",
    );
  });

  it("returns em dash for empty values", () => {
    expect(getRecommenderReasonLabel(null)).toBe("—");
    expect(getRecommenderReasonLabel(undefined)).toBe("—");
    expect(getRecommenderReasonLabel("")).toBe("—");
  });

  it("humanizes unknown codes as fallback", () => {
    expect(getRecommenderReasonLabel("CUSTOM_REASON_CODE")).toBe(
      "Custom Reason Code",
    );
  });
});
