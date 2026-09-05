import type { DegreeClassificationBandDTO } from "../types/academic-standing-degree-classification";

export interface DegreeSimulationResult {
  rawCgpa: number;
  roundedCgpa: number;
  classificationName: string;
  classificationCode: string;
  rankOrder: number | null;
  isFallback: boolean;
  isUnclassified: boolean;
  footnote: string;
  matchedBand?: DegreeClassificationBandDTO;
}

export function roundCgpa(cgpa: number): number {
  return Math.round((cgpa + Number.EPSILON) * 100) / 100;
}

export function evaluateDegreeClassification(
  cgpa: number,
  bands: DegreeClassificationBandDTO[],
  policyMaxCgpa: number = 5.0,
  policyName: string = "Policy",
): DegreeSimulationResult {
  const rounded = roundCgpa(cgpa);

  // If policy has custom configured bands -> STRICT NO-MIXED-SOURCE
  if (bands && bands.length > 0) {
    // Sort bands by rankOrder asc
    const sorted = [...bands].sort((a, b) => a.rankOrder - b.rankOrder);

    for (const band of sorted) {
      const min = Number(band.minCgpa ?? 0);
      const max =
        band.maxCgpa !== null && band.maxCgpa !== undefined
          ? Number(band.maxCgpa)
          : Number(policyMaxCgpa);

      if (rounded >= min && rounded <= max) {
        return {
          rawCgpa: cgpa,
          roundedCgpa: rounded,
          classificationName: band.name,
          classificationCode: band.code,
          rankOrder: band.rankOrder,
          isFallback: false,
          isUnclassified: false,
          footnote: `Degree classification generated per '${policyName}' configured degree classification bands.`,
          matchedBand: band,
        };
      }
    }

    // No configured band matched this student's CGPA
    return {
      rawCgpa: cgpa,
      roundedCgpa: rounded,
      classificationName: "Unclassified",
      classificationCode: "UNCLASS",
      rankOrder: null,
      isFallback: false,
      isUnclassified: true,
      footnote: `Degree classification generated per '${policyName}' configured degree classification bands.`,
    };
  }

  // Fallback Benchmark Tables when zero custom bands exist
  if (policyMaxCgpa <= 4.0) {
    // NBTE 4.0 Scale Fallback
    if (rounded >= 3.5) {
      return {
        rawCgpa: cgpa,
        roundedCgpa: rounded,
        classificationName: "Distinction",
        classificationCode: "DIST",
        rankOrder: 1,
        isFallback: true,
        isUnclassified: false,
        footnote: "Degree classification generated per default NBTE 4.0 / NUC 5.0 national benchmark bands.",
      };
    }
    if (rounded >= 3.0) {
      return {
        rawCgpa: cgpa,
        roundedCgpa: rounded,
        classificationName: "Upper Credit",
        classificationCode: "UPP_CR",
        rankOrder: 2,
        isFallback: true,
        isUnclassified: false,
        footnote: "Degree classification generated per default NBTE 4.0 / NUC 5.0 national benchmark bands.",
      };
    }
    if (rounded >= 2.5) {
      return {
        rawCgpa: cgpa,
        roundedCgpa: rounded,
        classificationName: "Lower Credit",
        classificationCode: "LOW_CR",
        rankOrder: 3,
        isFallback: true,
        isUnclassified: false,
        footnote: "Degree classification generated per default NBTE 4.0 / NUC 5.0 national benchmark bands.",
      };
    }
    return {
      rawCgpa: cgpa,
      roundedCgpa: rounded,
      classificationName: "Pass",
      classificationCode: "PASS",
      rankOrder: 4,
      isFallback: true,
      isUnclassified: false,
      footnote: "Degree classification generated per default NBTE 4.0 / NUC 5.0 national benchmark bands.",
    };
  }

  // NUC 5.0 Scale Fallback
  if (rounded >= 4.5) {
    return {
      rawCgpa: cgpa,
      roundedCgpa: rounded,
      classificationName: "First Class",
      classificationCode: "1ST",
      rankOrder: 1,
      isFallback: true,
      isUnclassified: false,
      footnote: "Degree classification generated per default NBTE 4.0 / NUC 5.0 national benchmark bands.",
    };
  }
  if (rounded >= 3.5) {
    return {
      rawCgpa: cgpa,
      roundedCgpa: rounded,
      classificationName: "Second Class Upper",
      classificationCode: "2ND_UPP",
      rankOrder: 2,
      isFallback: true,
      isUnclassified: false,
      footnote: "Degree classification generated per default NBTE 4.0 / NUC 5.0 national benchmark bands.",
    };
  }
  if (rounded >= 2.4) {
    return {
      rawCgpa: cgpa,
      roundedCgpa: rounded,
      classificationName: "Second Class Lower",
      classificationCode: "2ND_LOW",
      rankOrder: 3,
      isFallback: true,
      isUnclassified: false,
      footnote: "Degree classification generated per default NBTE 4.0 / NUC 5.0 national benchmark bands.",
    };
  }
  if (rounded >= 1.5) {
    return {
      rawCgpa: cgpa,
      roundedCgpa: rounded,
      classificationName: "Third Class",
      classificationCode: "3RD",
      rankOrder: 4,
      isFallback: true,
      isUnclassified: false,
      footnote: "Degree classification generated per default NBTE 4.0 / NUC 5.0 national benchmark bands.",
    };
  }
  return {
    rawCgpa: cgpa,
    roundedCgpa: rounded,
    classificationName: "Pass",
    classificationCode: "PASS",
    rankOrder: 5,
    isFallback: true,
    isUnclassified: false,
    footnote: "Degree classification generated per default NBTE 4.0 / NUC 5.0 national benchmark bands.",
  };
}
