import { describe, expect, it } from "vitest";
import { evaluateSimulatedCgpa } from "./cgpaSimulatorEvaluator";
import type { MinimalBoundary } from "./tierIntervalDerivation";

describe("evaluateSimulatedCgpa", () => {
  const boundaries: MinimalBoundary[] = [
    {
      id: 1,
      name: "Good Standing",
      minCgpa: 2.0,
      studentTransitionStatusId: 1,
      maxCarryoverCount: 3,
    },
    {
      id: 2,
      name: "Probation",
      minCgpa: 1.0,
      studentTransitionStatusId: 2,
      maxCarryoverCount: 5,
    },
    {
      id: 3,
      name: "Withdrawal",
      minCgpa: 0.0,
      studentTransitionStatusId: 3,
    },
  ];

  it("rounds input CGPA to 2 decimal places (2.00 vs 1.999 boundary behavior)", () => {
    // 1.999 rounds to 2.00 -> Good Standing
    const res1 = evaluateSimulatedCgpa(1.999, 0, boundaries, 5.0);
    expect(res1.matched).toBe(true);
    expect(res1.roundedCgpa).toBe(2.0);
    expect(res1.effectiveBoundary?.name).toBe("Good Standing");

    // 1.994 rounds to 1.99 -> Probation
    const res2 = evaluateSimulatedCgpa(1.994, 0, boundaries, 5.0);
    expect(res2.matched).toBe(true);
    expect(res2.roundedCgpa).toBe(1.99);
    expect(res2.effectiveBoundary?.name).toBe("Probation");

    // exactly 2.00 -> Good Standing
    const res3 = evaluateSimulatedCgpa(2.0, 0, boundaries, 5.0);
    expect(res3.matched).toBe(true);
    expect(res3.effectiveBoundary?.name).toBe("Good Standing");
  });

  it("applies carryover override and drops student to lower tier when carryovers exceeded", () => {
    // CGPA is 3.50 (Good Standing), but carryoverCount is 4 (exceeds maxCarryoverCount of 3)
    const res = evaluateSimulatedCgpa(3.5, 4, boundaries, 5.0);
    expect(res.matched).toBe(true);
    expect(res.isOverriddenByCarryover).toBe(true);
    expect(res.matchedBoundary?.name).toBe("Good Standing");
    expect(res.effectiveBoundary?.name).toBe("Probation");
    expect(res.carryoverOverrideReason).toContain("Exceeded max carryover limit");
  });

  it("handles CGPA exceeding max policy scale", () => {
    const res = evaluateSimulatedCgpa(5.5, 0, boundaries, 5.0);
    expect(res.matched).toBe(false);
    expect(res.unmatchedReason).toContain("exceeds policy maximum scale");
  });

  it("handles CGPA below lowest tier when base tier is unanchored", () => {
    const unanchored = boundaries.filter((b) => b.minCgpa > 0);
    const res = evaluateSimulatedCgpa(0.5, 0, unanchored, 5.0);
    expect(res.matched).toBe(false);
    expect(res.unmatchedReason).toContain("falls below the lowest configured threshold");
  });
});
