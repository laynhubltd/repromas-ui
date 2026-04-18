const ALLOWED_SORT_FIELDS = new Set(["name", "stateCategory", "createdAt", "updatedAt"]);

/**
 * Returns true only for the four sortable columns.
 * Boolean fields (isTerminal, canRegisterCourses, canAccessPortal) and any
 * other string return false.
 */
export function isSortFieldAllowed(field: string): boolean {
  return ALLOWED_SORT_FIELDS.has(field);
}
