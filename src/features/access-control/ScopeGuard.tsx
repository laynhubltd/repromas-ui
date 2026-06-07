import type { ReactNode } from "react";
import type { StudentPortalScope } from "./student-portal-scopes";
import { useAccessControl } from "./use-access-control";

type ScopeGuardProps = {
  scope: StudentPortalScope | StudentPortalScope[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
};

export function ScopeGuard({
  scope,
  requireAll = false,
  fallback = null,
  children,
}: ScopeGuardProps) {
  const { hasStudentPortalScope } = useAccessControl();
  const scopes = Array.isArray(scope) ? scope : [scope];
  const allowed = requireAll
    ? scopes.every((s) => hasStudentPortalScope([s]))
    : hasStudentPortalScope(scopes);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
