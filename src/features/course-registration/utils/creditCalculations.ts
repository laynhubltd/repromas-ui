import type { CourseItem, CreditLimits } from "../types/course-registration";

/**
 * Calculates the total credit units for a set of selected course IDs
 * against the available course items.
 */
export function calculateTotalCredits(
  selectedCourseIds: number[],
  availableCourses: CourseItem[],
): number {
  const idSet = new Set(selectedCourseIds);
  return availableCourses
    .filter((course) => idSet.has(course.configId))
    .reduce((sum, course) => sum + course.creditUnits, 0);
}

/**
 * Checks whether the selected credit total satisfies the credit limits.
 *
 * @param totalCredits - Total selected credit units
 * @param limits - Credit limits from the API response
 * @returns true if the selection is within the allowed range
 */
export function isWithinCreditLimits(
  totalCredits: number,
  limits: CreditLimits,
): boolean {
  if (totalCredits < limits.min) return false;
  if (limits.max !== -1 && totalCredits > limits.max) return false;
  return true;
}

/**
 * Checks whether all mandatory courses from the outstanding pool are included
 * in the current selection.
 *
 * @param selectedCourseIds - Currently selected configIds
 * @param mandatoryCourses - All mandatory courses from the outstanding pool
 * @returns true if all mandatory courses are selected
 */
export function allMandatoryCoursesSelected(
  selectedCourseIds: number[],
  mandatoryCourses: CourseItem[],
): boolean {
  const selectedSet = new Set(selectedCourseIds);
  return mandatoryCourses.every((course) => selectedSet.has(course.configId));
}

/**
 * Returns the configIds of mandatory courses that are missing from the selection.
 */
export function getMissingMandatoryCourseIds(
  selectedCourseIds: number[],
  mandatoryCourses: CourseItem[],
): number[] {
  const selectedSet = new Set(selectedCourseIds);
  return mandatoryCourses
    .filter((course) => !selectedSet.has(course.configId))
    .map((course) => course.configId);
}

/**
 * Collects all mandatory courses from the outstanding pool buckets
 * (carryovers, arrears, currentCore).
 */
export function getMandatoryCoursesFromPool(
  carryovers: CourseItem[],
  arrears: CourseItem[],
  currentCore: CourseItem[],
): CourseItem[] {
  return [...carryovers, ...arrears, ...currentCore].filter(
    (course) => course.isMandatory,
  );
}

/**
 * Formats the credit limit display string.
 * When max === -1, shows "No upper limit".
 */
export function formatCreditLimitDisplay(limits: CreditLimits): string {
  if (limits.max === -1) {
    return `Min: ${limits.min} — No upper limit`;
  }
  return `${limits.min} – ${limits.max} credit units`;
}
