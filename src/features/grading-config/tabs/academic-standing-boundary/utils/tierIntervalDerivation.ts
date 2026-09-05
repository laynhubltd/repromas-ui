export interface MinimalBoundary {
  id: number;
  name: string;
  minCgpa: number;
  studentTransitionStatusId: number;
  hasEscalationLadder?: boolean;
  maxCarryoverCount?: number | null;
  studentTransitionStatus?: {
    id: number;
    name: string;
    code?: string;
  } | null;
  escalationSteps?: Array<{
    id: number;
    stepNumber: number;
    label: string;
    isTerminal?: boolean;
  }> | null;
}

export type TierSeverity = "success" | "warning" | "error" | "default";

export interface DerivedTierSegment {
  boundaryId: number;
  name: string;
  minCgpa: number;
  maxCgpa: number;
  intervalText: string;
  percentageWidth: number;
  severity: TierSeverity;
  isBaseTier: boolean;
  boundary: MinimalBoundary;
}

export interface TierIntervalDerivationResult {
  segments: DerivedTierSegment[];
  hasUnanchoredBase: boolean;
  unanchoredSegment: {
    minCgpa: number;
    maxCgpa: number;
    intervalText: string;
    percentageWidth: number;
  } | null;
  hasDuplicateMins: boolean;
}

export function deriveTierIntervals(
  boundaries: MinimalBoundary[],
  policyMaxCgpa: number = 5.0,
): TierIntervalDerivationResult {
  if (!boundaries || boundaries.length === 0 || policyMaxCgpa <= 0) {
    return {
      segments: [],
      hasUnanchoredBase: true,
      unanchoredSegment: {
        minCgpa: 0,
        maxCgpa: policyMaxCgpa,
        intervalText: `0.00 ≤ CGPA ≤ ${policyMaxCgpa.toFixed(2)}`,
        percentageWidth: 100,
      },
      hasDuplicateMins: false,
    };
  }

  // Check duplicate minCgpas
  const minSet = new Set<number>();
  let hasDuplicateMins = false;
  for (const b of boundaries) {
    if (minSet.has(b.minCgpa)) {
      hasDuplicateMins = true;
    }
    minSet.add(b.minCgpa);
  }

  // Sort descending by minCgpa
  const sorted = [...boundaries].sort((a, b) => b.minCgpa - a.minCgpa);

  const segments: DerivedTierSegment[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const isHighest = i === 0;
    const isBase = current.minCgpa === 0;

    // Upper bound is policyMaxCgpa for highest tier, else previous tier's minCgpa
    const upperBound = isHighest ? policyMaxCgpa : sorted[i - 1].minCgpa;
    const span = Math.max(0, upperBound - current.minCgpa);
    const percentageWidth = policyMaxCgpa > 0 ? (span / policyMaxCgpa) * 100 : 0;

    // Severity mapping: highest -> success, middle -> warning, lowest/probation/withdrawal -> error
    let severity: TierSeverity = "default";
    if (isHighest) {
      severity = "success";
    } else if (i === sorted.length - 1 && isBase) {
      severity = "error";
    } else if (sorted.length > 2 && i === 1) {
      severity = "warning";
    } else {
      severity = "error";
    }

    const intervalText = isHighest
      ? `${current.minCgpa.toFixed(2)} ≤ CGPA ≤ ${upperBound.toFixed(2)}`
      : `${current.minCgpa.toFixed(2)} ≤ CGPA < ${upperBound.toFixed(2)}`;

    segments.push({
      boundaryId: current.id,
      name: current.name,
      minCgpa: current.minCgpa,
      maxCgpa: upperBound,
      intervalText,
      percentageWidth,
      severity,
      isBaseTier: isBase,
      boundary: current,
    });
  }

  const lowestMin = sorted[sorted.length - 1].minCgpa;
  const hasUnanchoredBase = lowestMin > 0;
  const unanchoredSegment = hasUnanchoredBase
    ? {
        minCgpa: 0,
        maxCgpa: lowestMin,
        intervalText: `0.00 ≤ CGPA < ${lowestMin.toFixed(2)}`,
        percentageWidth: (lowestMin / policyMaxCgpa) * 100,
      }
    : null;

  return {
    segments,
    hasUnanchoredBase,
    unanchoredSegment,
    hasDuplicateMins,
  };
}
