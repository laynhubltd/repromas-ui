import type { ReactNode } from "react";
import type { PermissionRequirement } from "./types";
import { useAccessControl } from "./use-access-control";

export type PermissionGuardProps = {
  /** Permission requirement (string, array of strings for anyOf, or object) */
  permission?: PermissionRequirement;
  /** If true when permission is an array, requires all permissions instead of anyOf */
  requireAll?: boolean;
  /** Rendered when permission is denied (ignored when passThrough is used) */
  fallback?: ReactNode;
  /** Children to render when allowed, or render function if passThrough is used */
  children?: ReactNode | ((allowed: boolean) => ReactNode);
  /**
   * If true, always renders children using a render-prop `(allowed: boolean) => ReactNode`.
   * Useful when an action should be rendered as disabled with a tooltip rather than hidden.
   */
  passThrough?: boolean;
};

export function PermissionGuard({
  permission,
  requireAll = false,
  fallback = null,
  children,
  passThrough = false,
}: PermissionGuardProps) {
  const { isPermitted, hasAllPermissions } = useAccessControl();

  const allowed = requireAll && Array.isArray(permission)
    ? hasAllPermissions(permission)
    : isPermitted(permission);

  if (passThrough && typeof children === "function") {
    return <>{children(allowed)}</>;
  }

  if (typeof children === "function") {
    return allowed ? <>{children(true)}</> : <>{fallback}</>;
  }

  return allowed ? <>{children}</> : <>{fallback}</>;
}
