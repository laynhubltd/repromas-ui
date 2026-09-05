import type {
  DegreeClassificationBandDTO,
  DegreeClassificationPresetTemplate,
} from "../types/academic-standing-degree-classification";

export type DegreeTierSeverity = "success" | "warning" | "info" | "default" | "error";

export interface DerivedDegreeSegment {
  bandId?: number;
  name: string;
  code: string;
  minCgpa: number;
  maxCgpa: number | null;
  effectiveMaxCgpa: number;
  rankOrder: number;
  intervalText: string;
  percentageWidth: number;
  severity: DegreeTierSeverity;
}

export interface DegreeGap {
  startCgpa: number;
  endCgpa: number;
  percentageWidth: number;
  intervalText: string;
}

export interface DegreeOverlap {
  bandAName: string;
  bandBName: string;
  rangeAText: string;
  rangeBText: string;
}

export interface DegreeIntervalDerivationResult {
  segments: DerivedDegreeSegment[];
  gaps: DegreeGap[];
  overlaps: DegreeOverlap[];
  hasOverlaps: boolean;
  hasGaps: boolean;
  minConfiguredCgpa: number | null;
  maxConfiguredCgpa: number | null;
}

export const DEGREE_PRESET_TEMPLATES: DegreeClassificationPresetTemplate[] = [
  {
    key: "NUC_5_0",
    label: "NUC 5.0 Standard Honours (University)",
    scale: 5.0,
    description: "Standard Nigerian Universities Commission 5.00 CGPA grading scale honors bands.",
    bands: [
      { name: "First Class", code: "1ST", minCgpa: 4.5, maxCgpa: null, rankOrder: 1 },
      { name: "Second Class Upper", code: "2ND_UPP", minCgpa: 3.5, maxCgpa: 4.49, rankOrder: 2 },
      { name: "Second Class Lower", code: "2ND_LOW", minCgpa: 2.4, maxCgpa: 3.49, rankOrder: 3 },
      { name: "Third Class", code: "3RD", minCgpa: 1.5, maxCgpa: 2.39, rankOrder: 4 },
      { name: "Pass", code: "PASS", minCgpa: 1.0, maxCgpa: 1.49, rankOrder: 5 },
    ],
  },
  {
    key: "NBTE_4_0",
    label: "NBTE 4.0 Standard Credit Bands (Polytechnic)",
    scale: 4.0,
    description: "Standard National Board for Technical Education 4.00 CGPA diploma graduation bands.",
    bands: [
      { name: "Distinction", code: "DIST", minCgpa: 3.5, maxCgpa: null, rankOrder: 1 },
      { name: "Upper Credit", code: "UPP_CR", minCgpa: 3.0, maxCgpa: 3.49, rankOrder: 2 },
      { name: "Lower Credit", code: "LOW_CR", minCgpa: 2.5, maxCgpa: 2.99, rankOrder: 3 },
      { name: "Pass", code: "PASS", minCgpa: 2.0, maxCgpa: 2.49, rankOrder: 4 },
    ],
  },
];

export function deriveDegreeIntervals(
  bands: DegreeClassificationBandDTO[],
  policyMaxCgpa: number = 5.0,
): DegreeIntervalDerivationResult {
  const sanitized = (bands ?? [])
    .filter((b) => b && typeof b === "object")
    .map((b) => {
      const minCgpa = Number(b.minCgpa ?? 0);
      const maxCgpa =
        b.maxCgpa !== undefined && b.maxCgpa !== null ? Number(b.maxCgpa) : null;
      const rankOrder = Number(b.rankOrder ?? 1);
      return {
        ...b,
        minCgpa: isNaN(minCgpa) ? 0 : minCgpa,
        maxCgpa: maxCgpa !== null && !isNaN(maxCgpa) ? maxCgpa : null,
        rankOrder: isNaN(rankOrder) ? 1 : rankOrder,
      };
    });

  if (sanitized.length === 0 || policyMaxCgpa <= 0) {
    return {
      segments: [],
      gaps: [
        {
          startCgpa: 0,
          endCgpa: policyMaxCgpa,
          percentageWidth: 100,
          intervalText: `0.00 – ${policyMaxCgpa.toFixed(2)}`,
        },
      ],
      overlaps: [],
      hasOverlaps: false,
      hasGaps: true,
      minConfiguredCgpa: null,
      maxConfiguredCgpa: null,
    };
  }

  // Sort bands primarily by rankOrder asc, then minCgpa desc
  const sorted = [...sanitized].sort((a, b) => {
    if (a.rankOrder !== b.rankOrder) {
      return a.rankOrder - b.rankOrder;
    }
    return b.minCgpa - a.minCgpa;
  });

  const overlaps: DegreeOverlap[] = [];
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];
      const aMax = a.maxCgpa ?? policyMaxCgpa;
      const bMax = b.maxCgpa ?? policyMaxCgpa;

      if (a.minCgpa <= bMax && aMax >= b.minCgpa) {
        overlaps.push({
          bandAName: a.name,
          bandBName: b.name,
          rangeAText: `[${a.minCgpa.toFixed(2)} - ${a.maxCgpa !== null ? a.maxCgpa.toFixed(2) : policyMaxCgpa.toFixed(2)}]`,
          rangeBText: `[${b.minCgpa.toFixed(2)} - ${b.maxCgpa !== null ? b.maxCgpa.toFixed(2) : policyMaxCgpa.toFixed(2)}]`,
        });
      }
    }
  }

  const segments: DerivedDegreeSegment[] = sorted.map((band, idx) => {
    const effectiveMax =
      band.maxCgpa !== null ? Math.min(band.maxCgpa, policyMaxCgpa) : policyMaxCgpa;
    const span = Math.max(0, effectiveMax - band.minCgpa);
    const percentageWidth = policyMaxCgpa > 0 ? (span / policyMaxCgpa) * 100 : 0;

    let severity: DegreeTierSeverity = "default";
    if (idx === 0) {
      severity = "success"; // Top honor
    } else if (idx === 1) {
      severity = "info"; // Upper tier
    } else if (idx === 2) {
      severity = "warning"; // Lower tier
    } else {
      severity = "default";
    }

    const intervalText =
      band.maxCgpa === null
        ? `≥ ${band.minCgpa.toFixed(2)}`
        : `${band.minCgpa.toFixed(2)} – ${band.maxCgpa.toFixed(2)}`;

    return {
      bandId: band.id,
      name: band.name,
      code: band.code,
      minCgpa: band.minCgpa,
      maxCgpa: band.maxCgpa,
      effectiveMaxCgpa: effectiveMax,
      rankOrder: band.rankOrder,
      intervalText,
      percentageWidth,
      severity,
    };
  });

  // Calculate gaps
  const sortedByMinAsc = [...sorted].sort((a, b) => a.minCgpa - b.minCgpa);
  const gaps: DegreeGap[] = [];

  let currentCovered = 0;
  for (const band of sortedByMinAsc) {
    if (band.minCgpa > currentCovered + 0.009) {
      const gapStart = currentCovered;
      const gapEnd = band.minCgpa;
      const gapSpan = gapEnd - gapStart;
      gaps.push({
        startCgpa: gapStart,
        endCgpa: gapEnd,
        percentageWidth: (gapSpan / policyMaxCgpa) * 100,
        intervalText: `${gapStart.toFixed(2)} – ${gapEnd.toFixed(2)}`,
      });
    }
    const effMax = band.maxCgpa !== null ? Math.min(band.maxCgpa, policyMaxCgpa) : policyMaxCgpa;
    currentCovered = Math.max(currentCovered, effMax);
  }

  if (currentCovered < policyMaxCgpa - 0.009) {
    const gapSpan = policyMaxCgpa - currentCovered;
    gaps.push({
      startCgpa: currentCovered,
      endCgpa: policyMaxCgpa,
      percentageWidth: (gapSpan / policyMaxCgpa) * 100,
      intervalText: `${currentCovered.toFixed(2)} – ${policyMaxCgpa.toFixed(2)}`,
    });
  }

  const minConfiguredCgpa = sortedByMinAsc.length > 0 ? sortedByMinAsc[0].minCgpa : null;
  const maxConfiguredCgpa =
    sortedByMinAsc.length > 0
      ? sortedByMinAsc[sortedByMinAsc.length - 1].maxCgpa ?? policyMaxCgpa
      : null;

  return {
    segments,
    gaps,
    overlaps,
    hasOverlaps: overlaps.length > 0,
    hasGaps: gaps.length > 0,
    minConfiguredCgpa,
    maxConfiguredCgpa,
  };
}
