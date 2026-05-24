import type { ApiRole } from "@/features/auth/types";
import { matchPath } from "react-router-dom";
import {
  normalizeStudentPortalScope,
  type StudentPortalScope,
} from "./student-portal-scopes";
import { studentRoutePrivilegeMatrix } from "./student-route-privilege-matrix";

export function hasStudentRouteAccess({
  activeRole,
  routePath,
}: {
  activeRole: ApiRole | null;
  routePath: string;
}): boolean {
  if (!activeRole) return false;

  const scope = normalizeStudentPortalScope(activeRole.scope);
  if (!scope) return false;

  const matchedKey = Object.keys(studentRoutePrivilegeMatrix).find((key) =>
    matchPath({ path: key, end: false }, routePath),
  );

  if (!matchedKey) return false;

  const allowed = studentRoutePrivilegeMatrix[matchedKey] ?? [];
  return allowed.includes(scope);
}

export function hasStudentPortalScope(
  activeRole: ApiRole | null,
  allowedScopes: StudentPortalScope[],
): boolean {
  if (!activeRole || allowedScopes.length === 0) return false;
  const scope = normalizeStudentPortalScope(activeRole.scope);
  if (!scope) return false;
  return allowedScopes.includes(scope);
}
