import useAuthState from "@/features/auth/use-auth-state";
import { Permission } from "./permissions";

export function useAccessControl() {
  const { roles, permissions } = useAuthState();

  const hasPermission = (permission: Permission | string): boolean =>
    permissions.includes(permission as string);

  const hasAnyPermission = (required: (Permission | string)[]): boolean =>
    required.some((p) => permissions.includes(p as string));

  const hasAllPermissions = (required: (Permission | string)[]): boolean =>
    required.every((p) => permissions.includes(p as string));

  const hasRole = (roleName: string): boolean =>
    roles.some((r) => r.name === roleName);

  const isSuperAdmin = (): boolean =>
    roles.some((r) => r.name === "System Administrator" && r.scope === "GLOBAL");

  return { roles, permissions, hasPermission, hasAnyPermission, hasAllPermissions, hasRole, isSuperAdmin };
}
