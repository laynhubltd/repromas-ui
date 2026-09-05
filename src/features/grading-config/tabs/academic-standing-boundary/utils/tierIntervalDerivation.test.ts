import { describe, expect, it } from "vitest";
import { deriveTierIntervals, type MinimalBoundary } from "./tierIntervalDerivation";

describe("deriveTierIntervals", () => {
  const boundaries: MinimalBoundary[] = [
    {
      id: 1,
      name: "Good Standing",
      minCgpa: 2.0,
      studentTransitionStatusId: 1,
    },
    {
      id: 2,
      name: "Probation",
      minCgpa: 1.0,
      studentTransitionStatusId: 2,
    },
    {
      id: 3,
      name: "Withdrawal",
      minCgpa: 0.0,
      studentTransitionStatusId: 3,
    },
  ];

  it("correctly derives contiguous descending half-open intervals with a base tier at 0.00", () => {
    const result = deriveTierIntervals(boundaries, 5.0);

    expect(result.hasUnanchoredBase).toBe(false);
    expect(result.unanchoredSegment).toBeNull();
    expect(result.segments).toHaveLength(3);

    // Highest tier: 2.00 <= CGPA <= 5.00
    expect(result.segments[0].name).toBe("Good Standing");
    expect(result.segments[0].intervalText).toBe("2.00 ≤ CGPA ≤ 5.00");
    expect(result.segments[0].severity).toBe("success");
    expect(result.segments[0].percentageWidth).toBeCloseTo(60.0); // (5 - 2)/5 * 100

    // Middle tier: 1.00 <= CGPA < 2.00
    expect(result.segments[1].name).toBe("Probation");
    expect(result.segments[1].intervalText).toBe("1.00 ≤ CGPA < 2.00");
    expect(result.segments[1].percentageWidth).toBeCloseTo(20.0); // (2 - 1)/5 * 100

    // Lowest tier: 0.00 <= CGPA < 1.00
    expect(result.segments[2].name).toBe("Withdrawal");
    expect(result.segments[2].intervalText).toBe("0.00 ≤ CGPA < 1.00");
    expect(result.segments[2].isBaseTier).toBe(true);
    expect(result.segments[2].percentageWidth).toBeCloseTo(20.0); // (1 - 0)/5 * 100
  });

  it("detects unanchored base when lowest minCgpa is greater than 0.00", () => {
    const unanchoredBoundaries: MinimalBoundary[] = [
      {
        id: 1,
        name: "Good Standing",
        minCgpa: 2.0,
        studentTransitionStatusId: 1,
      },
      {
        id: 2,
        name: "Probation",
        minCgpa: 1.0,
        studentTransitionStatusId: 2,
      },
    ];

    const result = deriveTierIntervals(unanchoredBoundaries, 5.0);

    expect(result.hasUnanchoredBase).toBe(true);
    expect(result.unanchoredSegment).not.toBeNull();
    expect(result.unanchoredSegment?.intervalText).toBe("0.00 ≤ CGPA < 1.00");
    expect(result.unanchoredSegment?.percentageWidth).toBeCloseTo(20.0);
  });

  it("flags duplicate minCgpas", () => {
    const duplicates: MinimalBoundary[] = [
      { id: 1, name: "Tier A", minCgpa: 2.0, studentTransitionStatusId: 1 },
      { id: 2, name: "Tier B", minCgpa: 2.0, studentTransitionStatusId: 2 },
    ];

    const result = deriveTierIntervals(duplicates, 5.0);
    expect(result.hasDuplicateMins).toBe(true);
  });
});
