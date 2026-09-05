import { describe, expect, it } from "vitest";
import type { DegreeClassificationBandDTO } from "../types/academic-standing-degree-classification";
import {
  evaluateDegreeClassification,
  roundCgpa,
} from "./degreeSimulatorEvaluator";

describe("degreeSimulatorEvaluator", () => {
  const mockCustomBands: DegreeClassificationBandDTO[] = [
    {
      id: 1,
      academicStandingId: 10,
      name: "Distinction",
      code: "DIST",
      minCgpa: 3.5,
      maxCgpa: null,
      rankOrder: 1,
    },
    {
      id: 2,
      academicStandingId: 10,
      name: "Upper Credit",
      code: "UPP_CR",
      minCgpa: 3.0,
      maxCgpa: 3.49,
      rankOrder: 2,
    },
    {
      id: 3,
      academicStandingId: 10,
      name: "Lower Credit",
      code: "LOW_CR",
      minCgpa: 2.5,
      maxCgpa: 2.99,
      rankOrder: 3,
    },
    {
      id: 4,
      academicStandingId: 10,
      name: "Pass",
      code: "PASS",
      minCgpa: 2.0,
      maxCgpa: 2.49,
      rankOrder: 4,
    },
  ];

  it("rounds CGPA to 2 decimal places properly", () => {
    expect(roundCgpa(2.495)).toBe(2.5);
    expect(roundCgpa(2.494)).toBe(2.49);
    expect(roundCgpa(3.999)).toBe(4.0);
  });

  it("evaluates matching custom bands with 2-decimal rounding", () => {
    // 2.495 rounds to 2.50 -> Lower Credit
    const res1 = evaluateDegreeClassification(
      2.495,
      mockCustomBands,
      4.0,
      "Tech Policy",
    );
    expect(res1.roundedCgpa).toBe(2.5);
    expect(res1.classificationName).toBe("Lower Credit");
    expect(res1.isFallback).toBe(false);
    expect(res1.isUnclassified).toBe(false);
    expect(res1.footnote).toContain("Tech Policy");

    // 3.75 -> Distinction (open ceiling)
    const res2 = evaluateDegreeClassification(
      3.75,
      mockCustomBands,
      4.0,
      "Tech Policy",
    );
    expect(res2.classificationName).toBe("Distinction");
  });

  it("assigns Unclassified when custom bands exist but student CGPA is outside all bands (Strict No-Mixed-Source)", () => {
    // 1.85 is below lowest band (2.00)
    const res = evaluateDegreeClassification(
      1.85,
      mockCustomBands,
      4.0,
      "Tech Policy",
    );
    expect(res.classificationName).toBe("Unclassified");
    expect(res.classificationCode).toBe("UNCLASS");
    expect(res.isUnclassified).toBe(true);
    expect(res.isFallback).toBe(false);
    expect(res.rankOrder).toBeNull();
  });

  it("falls back to NBTE 4.0 benchmark tables when zero custom bands exist on 4.0 scale", () => {
    const res = evaluateDegreeClassification(3.6, [], 4.0);
    expect(res.classificationName).toBe("Distinction");
    expect(res.isFallback).toBe(true);
    expect(res.footnote).toContain("default NBTE 4.0 / NUC 5.0");

    const res2 = evaluateDegreeClassification(2.2, [], 4.0);
    expect(res2.classificationName).toBe("Pass");
    expect(res2.isFallback).toBe(true);
  });

  it("falls back to NUC 5.0 benchmark tables when zero custom bands exist on 5.0 scale", () => {
    const res = evaluateDegreeClassification(4.7, [], 5.0);
    expect(res.classificationName).toBe("First Class");
    expect(res.isFallback).toBe(true);

    const res2 = evaluateDegreeClassification(3.6, [], 5.0);
    expect(res2.classificationName).toBe("Second Class Upper");
    expect(res2.isFallback).toBe(true);
  });
});
