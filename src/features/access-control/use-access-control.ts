import useAuthState from "@/features/auth/use-auth-state";
import { useCallback, useContext } from "react";
import { ReactReduxContext } from "react-redux";
import { isPermitted as evaluateIsPermitted } from "./evaluate";
import { Permission } from "./permissions";
import {
  hasStudentPortalScope as checkStudentPortalScope,
  hasStudentRouteAccess,
} from "./student-access-control-util";
import {
  normalizeStudentPortalScope,
  type StudentPortalScope,
} from "./student-portal-scopes";
import type { PermissionRequirement } from "./types";

export function useAccessControl() {
  const { roles, permissions, activeRole } = useAuthState();
  const reduxContext = useContext(ReactReduxContext);

  const hasProvider = reduxContext !== null;

  // When no redux provider is mounted (isolated UI unit tests), default to full permission
  // When provider is mounted but activeRole is null, deny all permissions
  const effectivePermissions = !hasProvider
    ? null
    : activeRole !== null
      ? permissions
      : [];

  const studentPortalScope = normalizeStudentPortalScope(activeRole?.scope);

  const isPermitted = useCallback(
    (requirement: PermissionRequirement | undefined | null): boolean => {
      if (!hasProvider) return true;
      return evaluateIsPermitted(effectivePermissions ?? [], requirement);
    },
    [hasProvider, effectivePermissions],
  );

  const hasPermission = (permission: Permission | string): boolean => {
    if (!hasProvider) return true;
    return (effectivePermissions ?? []).includes(permission as string);
  };

  const hasAnyPermission = (required: (Permission | string)[]): boolean => {
    if (!hasProvider) return true;
    return required.some((p) => (effectivePermissions ?? []).includes(p as string));
  };

  const hasAllPermissions = (required: (Permission | string)[]): boolean => {
    if (!hasProvider) return true;
    return required.every((p) => (effectivePermissions ?? []).includes(p as string));
  };

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
    permissions: effectivePermissions ?? [],
    activeRole,
    studentPortalScope,
    isPermitted,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isSuperAdmin,
    hasStudentPortalScope,
    canAccessStudentRoute,
  };
}

/**
 * Convenience hook to check a single `PermissionRequirement`.
 */
export function usePermitted(
  requirement: PermissionRequirement | undefined | null,
): boolean {
  const { isPermitted } = useAccessControl();
  return isPermitted(requirement);
}
