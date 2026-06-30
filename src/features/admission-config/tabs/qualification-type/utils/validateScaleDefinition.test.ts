import { describe, expect, it } from "vitest";
import { validateScaleDefinition } from "./validateScaleDefinition";

describe("validateScaleDefinition", () => {
  it("rejects empty scale", () => {
    expect(validateScaleDefinition("POINTS", {})).toEqual({
      valid: false,
      message: "Scale definition is required.",
    });
  });

  it("validates POINTS", () => {
    expect(validateScaleDefinition("POINTS", { maxPoints: 16 })).toEqual({
      valid: true,
      scaleDefinition: { maxPoints: 16 },
    });
    expect(validateScaleDefinition("POINTS", { maxPoints: 0 })).toEqual({
      valid: false,
      message: "Max points must be greater than 0.",
    });
  });

  it("validates CLASSIFICATION with unique ordered entries", () => {
    expect(
      validateScaleDefinition("CLASSIFICATION", {
        classes: ["DISTINCTION", "PASS"],
      }),
    ).toEqual({
      valid: true,
      scaleDefinition: { classes: ["DISTINCTION", "PASS"] },
    });

    expect(
      validateScaleDefinition("CLASSIFICATION", { classes: ["PASS"] }),
    ).toEqual({
      valid: false,
      message: "At least two classes entries are required.",
    });

    expect(
      validateScaleDefinition("CLASSIFICATION", {
        grades: ["A", "A", "B"],
      }),
    ).toEqual({
      valid: false,
      message: 'Duplicate grade "A" is not allowed.',
    });
  });

  it("validates CGPA", () => {
    expect(validateScaleDefinition("CGPA", { min: 0, max: 5 })).toEqual({
      valid: true,
      scaleDefinition: { min: 0, max: 5 },
    });
    expect(validateScaleDefinition("CGPA", { min: 0, max: 0 })).toEqual({
      valid: false,
      message: "Maximum CGPA must be greater than minimum.",
    });
  });

  it("rejects empty PASS_FAIL scale", () => {
    expect(validateScaleDefinition("PASS_FAIL", {})).toEqual({
      valid: false,
      message: "Scale definition is required.",
    });
  });

  it("accepts PASS_FAIL scale", () => {
    expect(
      validateScaleDefinition("PASS_FAIL", { values: ["PASS", "FAIL"] }),
    ).toEqual({
      valid: true,
      scaleDefinition: { values: ["PASS", "FAIL"] },
    });
  });
});
