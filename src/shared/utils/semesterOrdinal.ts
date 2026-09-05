const ORDINAL_NAMES = [
  "First Semester",
  "Second Semester",
  "Third Semester",
  "Fourth Semester",
  "Fifth Semester",
  "Sixth Semester",
  "Seventh Semester",
  "Eighth Semester",
  "Ninth Semester",
  "Tenth Semester",
  "Eleventh Semester",
  "Twelfth Semester",
];

/**
 * Calculates and returns the ordinal semester name (e.g., "Third Semester" for Year 2 / First Semester).
 *
 * @param sortOrder 1-based semester index within session (1 for First Semester, 2 for Second Semester)
 * @param rankOrder 1-based level rank order (1 for ND I / 100L, 2 for ND II / 200L)
 * @param semestersPerLevel Number of semesters per level (defaults to 2)
 */
export function getOrdinalSemesterName(
  sortOrder: number,
  rankOrder?: number | null,
  semestersPerLevel: number = 2,
): string {
  if (!rankOrder || rankOrder < 1) {
    return ORDINAL_NAMES[sortOrder - 1] ?? `Semester ${sortOrder}`;
  }
  const position = (rankOrder - 1) * semestersPerLevel + sortOrder;
  return ORDINAL_NAMES[position - 1] ?? `Semester ${position}`;
}
