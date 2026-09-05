import type { MinimalBoundary } from "./tierIntervalDerivation";

export interface SimulatorEvaluationResult {
  matched: boolean;
  roundedCgpa: number;
  matchedBoundary: MinimalBoundary | null;
  effectiveBoundary: MinimalBoundary | null;
  isOverriddenByCarryover: boolean;
  carryoverOverrideReason: string | null;
  unmatchedReason: string | null;
}

export function evaluateSimulatedCgpa(
  cgpa: number,
  carryoverCount: number = 0,
  boundaries: MinimalBoundary[],
  policyMaxCgpa: number = 5.0,
): SimulatorEvaluationResult {
  if (isNaN(cgpa) || boundaries.length === 0) {
    return {
      matched: false,
      roundedCgpa: 0,
      matchedBoundary: null,
      effectiveBoundary: null,
      isOverriddenByCarryover: false,
      carryoverOverrideReason: null,
      unmatchedReason: boundaries.length === 0 ? "No boundaries configured" : "Invalid CGPA",
    };
  }

  // 2-decimal precision rounding to mirror backend
  const roundedCgpa = Math.round(cgpa * 100) / 100;

  if (roundedCgpa > policyMaxCgpa) {
    return {
      matched: false,
      roundedCgpa,
      matchedBoundary: null,
      effectiveBoundary: null,
      isOverriddenByCarryover: false,
      carryoverOverrideReason: null,
      unmatchedReason: `CGPA ${roundedCgpa.toFixed(2)} exceeds policy maximum scale (${policyMaxCgpa.toFixed(2)})`,
    };
  }

  const sorted = [...boundaries].sort((a, b) => b.minCgpa - a.minCgpa);
  const matchedIndex = sorted.findIndex((b) => roundedCgpa >= b.minCgpa);

  if (matchedIndex === -1) {
    return {
      matched: false,
      roundedCgpa,
      matchedBoundary: null,
      effectiveBoundary: null,
      isOverriddenByCarryover: false,
      carryoverOverrideReason: null,
      unmatchedReason: `CGPA ${roundedCgpa.toFixed(2)} falls below the lowest configured threshold (${sorted[sorted.length - 1].minCgpa.toFixed(2)})`,
    };
  }

  const matchedBoundary = sorted[matchedIndex];

  // Check carryover override
  if (
    matchedBoundary.maxCarryoverCount != null &&
    carryoverCount > matchedBoundary.maxCarryoverCount
  ) {
    // Falls to next lower tier if available
    const nextTier = matchedIndex + 1 < sorted.length ? sorted[matchedIndex + 1] : null;

    return {
      matched: true,
      roundedCgpa,
      matchedBoundary,
      effectiveBoundary: nextTier ?? matchedBoundary,
      isOverriddenByCarryover: true,
      carryoverOverrideReason: `Exceeded max carryover limit of ${matchedBoundary.maxCarryoverCount} (student has ${carryoverCount}). Disqualified from "${matchedBoundary.name}"${nextTier ? ` and dropped to "${nextTier.name}"` : ""}.`,
      unmatchedReason: null,
    };
  }

  return {
    matched: true,
    roundedCgpa,
    matchedBoundary,
    effectiveBoundary: matchedBoundary,
    isOverriddenByCarryover: false,
    carryoverOverrideReason: null,
    unmatchedReason: null,
  };
}
