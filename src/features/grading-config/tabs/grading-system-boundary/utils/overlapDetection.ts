import type { GradingSystemBoundary } from "../types/grading-system-boundary";

/**
 * Returns true iff the two inclusive ranges [a[0], a[1]] and [b[0], b[1]] overlap.
 * Overlap condition: a[0] <= b[1] && b[0] <= a[1]
 */
export function detectOverlap(
  a: [number, number],
  b: [number, number],
): boolean {
  return a[0] <= b[1] && b[0] <= a[1];
}

/**
 * Given an array of boundaries, returns the gaps between adjacent boundaries
 * sorted by minScore ascending.
 * A gap exists between boundary i and i+1 when:
 *   boundaries[i].maxScore + 0.01 < boundaries[i+1].minScore
 */
export function detectGaps(
  boundaries: GradingSystemBoundary[],
): Array<{ from: number; to: number }> {
  if (boundaries.length < 2) return [];

  const sorted = [...boundaries].sort((a, b) => a.minScore - b.minScore);
  const gaps: Array<{ from: number; to: number }> = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].maxScore + 0.01 < sorted[i + 1].minScore) {
      gaps.push({ from: sorted[i].maxScore, to: sorted[i + 1].minScore });
    }
  }

  return gaps;
}

/**
 * Builds an ordered list of segments across the 0–100 range, each marked as
 * covered (within at least one boundary) or uncovered (gap).
 */
export function buildCoverageSegments(
  boundaries: GradingSystemBoundary[],
): Array<{ start: number; end: number; covered: boolean }> {
  const segments: Array<{ start: number; end: number; covered: boolean }> = [];

  if (boundaries.length === 0) {
    return [{ start: 0, end: 100, covered: false }];
  }

  const sorted = [...boundaries].sort((a, b) => a.minScore - b.minScore);
  let cursor = 0;

  for (const boundary of sorted) {
    const { minScore, maxScore } = boundary;

    // Gap before this boundary
    if (cursor < minScore) {
      segments.push({ start: cursor, end: minScore, covered: false });
    }

    // Covered segment (handle overlap with previous boundary)
    const segStart = Math.max(cursor, minScore);
    if (segStart < maxScore) {
      segments.push({ start: segStart, end: maxScore, covered: true });
    }

    if (maxScore > cursor) {
      cursor = maxScore;
    }
  }

  // Gap after last boundary
  if (cursor < 100) {
    segments.push({ start: cursor, end: 100, covered: false });
  }

  return segments;
}
