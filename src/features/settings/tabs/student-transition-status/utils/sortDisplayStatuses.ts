import type { StudentTransitionStatus } from "../types/student-transition-status";

/**
 * Pin default status first when server sort is name-based (isDefault is not a valid API sort field).
 */
export function sortDisplayStatuses(
  statuses: StudentTransitionStatus[],
  serverSort: string,
): StudentTransitionStatus[] {
  if (!serverSort.startsWith("name:")) {
    return statuses;
  }

  return [...statuses].sort((a, b) => {
    if (a.isDefault !== b.isDefault) {
      return a.isDefault ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}
