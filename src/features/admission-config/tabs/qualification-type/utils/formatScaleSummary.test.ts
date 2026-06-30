import { describe, expect, it } from "vitest";
import { formatScaleSummary } from "./formatScaleSummary";
import type { PriorQualificationType } from "../types/prior-qualification-type";

describe("formatScaleSummary", () => {
  const base = {
    id: 1,
    code: "X",
    name: "X",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
  };

  it("summarizes POINTS", () => {
    const row: PriorQualificationType = {
      ...base,
      assessmentFormat: "POINTS",
      scaleDefinition: { maxPoints: 16 },
    };
    expect(formatScaleSummary(row)).toBe("max 16 pts");
  });

  it("summarizes CLASSIFICATION classes", () => {
    const row: PriorQualificationType = {
      ...base,
      assessmentFormat: "CLASSIFICATION",
      scaleDefinition: {
        classes: ["DISTINCTION", "UPPER_CREDIT", "LOWER_CREDIT", "PASS", "FAIL"],
      },
    };
    expect(formatScaleSummary(row)).toBe("5 classes");
  });

  it("summarizes CGPA", () => {
    const row: PriorQualificationType = {
      ...base,
      assessmentFormat: "CGPA",
      scaleDefinition: { min: 0, max: 5 },
    };
    expect(formatScaleSummary(row)).toBe("0–5 CGPA");
  });

  it("summarizes PASS_FAIL", () => {
    const row: PriorQualificationType = {
      ...base,
      assessmentFormat: "PASS_FAIL",
      scaleDefinition: { values: ["PASS", "FAIL"] },
    };
    expect(formatScaleSummary(row)).toBe("PASS / FAIL");
  });
});
