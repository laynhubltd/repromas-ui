import { describe, expect, it } from "vitest";
import { validateRequirementThreshold } from "./buildRequirementPayload";

describe("validateRequirementThreshold", () => {
  it("requires minimum points for POINTS", () => {
    expect(
      validateRequirementThreshold("POINTS", { minimumPoints: 16 }, 16),
    ).toEqual({ valid: true });
    expect(
      validateRequirementThreshold("POINTS", { minimumPoints: 0 }, 16),
    ).toEqual({
      valid: false,
      message: "Minimum points must be greater than 0.",
    });
  });

  it("requires class or rank for CLASSIFICATION", () => {
    expect(
      validateRequirementThreshold("CLASSIFICATION", {
        minimumClass: "UPPER_CREDIT",
      }),
    ).toEqual({ valid: true });
    expect(
      validateRequirementThreshold("CLASSIFICATION", {}),
    ).toEqual({
      valid: false,
      message: "Minimum class or class rank is required.",
    });
  });

  it("allows null thresholds for CGPA and PASS_FAIL", () => {
    expect(validateRequirementThreshold("CGPA", {})).toEqual({ valid: true });
    expect(validateRequirementThreshold("PASS_FAIL", {})).toEqual({ valid: true });
  });
});
