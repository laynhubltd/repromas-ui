import useAuthState from "@/features/auth/use-auth-state";
import {
  hasStudentPortalScope as checkStudentPortalScope,
  hasStudentRouteAccess,
} from "./student-access-control-util";
import { Permission } from "./permissions";
import {
  normalizeStudentPortalScope,
  type StudentPortalScope,
} from "./student-portal-scopes";

export function useAccessControl() {
  const { roles, permissions, activeRole } = useAuthState();

  // When no role is active, all permission checks return false
  const effectivePermissions = activeRole !== null ? permissions : [];

  const studentPortalScope = normalizeStudentPortalScope(activeRole?.scope);

  const hasPermission = (permission: Permission | string): boolean =>
    effectivePermissions.includes(permission as string);

  const hasAnyPermission = (required: (Permission | string)[]): boolean =>
    required.some((p) => effectivePermissions.includes(p as string));

  const hasAllPermissions = (required: (Permission | string)[]): boolean =>
    required.every((p) => effectivePermissions.includes(p as string));

  const hasRole = (roleName: string): boolean =>
    roles.some((r) => r.name === roleName);

  const isSuperAdmin = (): boolean =>
    roles.some((r) => r.name === "System Administrator" && r.scope === "GLOBAL");

  const hasStudentPortalScope = (allowedScopes: StudentPortalScope[]): boolean =>
    checkStudentPortalScope(activeRole, allowedScopes);

  const canAccessStudentRoute = (routePath: string): boolean =>
    hasStudentRouteAccess({ activeRole, routePath });

  return {
    roles,
    permissions: effectivePermissions,
    activeRole,
    studentPortalScope,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isSuperAdmin,
    hasStudentPortalScope,
    canAccessStudentRoute,
  };
}
