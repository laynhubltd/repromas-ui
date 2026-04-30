import type { CourseAssessmentComponent } from "../types/course-assessment-policy";

// ─── Weight Bar State ─────────────────────────────────────────────────────────

export type WeightBarState = "complete" | "partial" | "overflow";

// ─── Pure Computation Functions ───────────────────────────────────────────────

/**
 * Returns the arithmetic sum of all `weightPercentage` values in the array.
 * Returns 0 for an empty array.
 */
export function computeWeightSum(
  components: CourseAssessmentComponent[],
): number {
  return components.reduce((sum, c) => sum + c.weightPercentage, 0);
}

/**
 * Returns the visual state of the weight bar based on the sum vs. total.
 * - "complete"  when sum === total
 * - "overflow"  when sum > total
 * - "partial"   otherwise (sum < total)
 */
export function computeWeightState(sum: number, total: number): WeightBarState {
  if (sum === total) return "complete";
  if (sum > total) return "overflow";
  return "partial";
}
