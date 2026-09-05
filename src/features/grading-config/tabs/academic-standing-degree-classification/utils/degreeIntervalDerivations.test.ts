import { describe, expect, it } from "vitest";
import type { DegreeClassificationBandDTO } from "../types/academic-standing-degree-classification";
import {
  DEGREE_PRESET_TEMPLATES,
  deriveDegreeIntervals,
} from "./degreeIntervalDerivations";

describe("degreeIntervalDerivations", () => {
  const mockBands: DegreeClassificationBandDTO[] = [
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

  it("handles empty bands by returning full gap segment", () => {
    const result = deriveDegreeIntervals([], 4.0);
    expect(result.segments).toHaveLength(0);
    expect(result.hasGaps).toBe(true);
    expect(result.hasOverlaps).toBe(false);
    expect(result.gaps[0].intervalText).toBe("0.00 – 4.00");
  });

  it("derives sorted segments and detects base gap when minimum is above 0.00", () => {
    const result = deriveDegreeIntervals(mockBands, 4.0);
    expect(result.segments).toHaveLength(4);
    expect(result.segments[0].name).toBe("Distinction");
    expect(result.segments[0].effectiveMaxCgpa).toBe(4.0);
    expect(result.segments[0].intervalText).toBe("≥ 3.50");
    expect(result.hasOverlaps).toBe(false);

    // Gap from 0.00 to 2.00
    expect(result.hasGaps).toBe(true);
    expect(result.gaps[0].startCgpa).toBe(0);
    expect(result.gaps[0].endCgpa).toBe(2.0);
  });

  it("detects range overlaps between sibling bands", () => {
    const overlappingBands: DegreeClassificationBandDTO[] = [
      {
        id: 1,
        academicStandingId: 10,
        name: "Distinction",
        code: "DIST",
        minCgpa: 3.5,
        maxCgpa: 4.0,
        rankOrder: 1,
      },
      {
        id: 2,
        academicStandingId: 10,
        name: "Upper Credit",
        code: "UPP_CR",
        minCgpa: 3.4,
        maxCgpa: 3.6,
        rankOrder: 2,
      },
    ];

    const result = deriveDegreeIntervals(overlappingBands, 4.0);
    expect(result.hasOverlaps).toBe(true);
    expect(result.overlaps).toHaveLength(1);
    expect(result.overlaps[0].bandAName).toBe("Distinction");
    expect(result.overlaps[0].bandBName).toBe("Upper Credit");
  });

  it("provides valid NUC and NBTE preset templates", () => {
    expect(DEGREE_PRESET_TEMPLATES).toHaveLength(2);
    const nuc = DEGREE_PRESET_TEMPLATES.find((t) => t.key === "NUC_5_0");
    expect(nuc).toBeDefined();
    expect(nuc?.bands).toHaveLength(5);
    expect(nuc?.bands[0].name).toBe("First Class");

    const nbte = DEGREE_PRESET_TEMPLATES.find((t) => t.key === "NBTE_4_0");
    expect(nbte).toBeDefined();
    expect(nbte?.bands).toHaveLength(4);
    expect(nbte?.bands[0].name).toBe("Distinction");
  });
});
