/**
 * Student portal role scopes (activeRole.scope values).
 * Keep in sync with module-mounter SCOPE_TO_ROLE and API role.scope.
 */
export const StudentPortalScope = {
  Student: "STUDENT",
  Candidate: "CANDIDATE",
} as const;

export type StudentPortalScope =
  (typeof StudentPortalScope)[keyof typeof StudentPortalScope];

export const STUDENT_PORTAL_SCOPES: StudentPortalScope[] = [
  StudentPortalScope.Student,
  StudentPortalScope.Candidate,
];

export function normalizeStudentPortalScope(
  scope: string | undefined | null,
): StudentPortalScope | null {
  const normalized = scope?.trim().toUpperCase();
  if (normalized === StudentPortalScope.Student) {
    return StudentPortalScope.Student;
  }
  if (normalized === StudentPortalScope.Candidate) {
    return StudentPortalScope.Candidate;
  }
  return null;
}
