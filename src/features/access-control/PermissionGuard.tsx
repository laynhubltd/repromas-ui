import type { ReactNode } from 'react'
import { Permission } from './permissions'
import { useAccessControl } from './use-access-control'

type PermissionGuardProps = {
  permission: Permission | Permission[]
  requireAll?: boolean
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionGuard({
  permission,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasAnyPermission, hasAllPermissions } = useAccessControl()
  const perms = Array.isArray(permission) ? permission : [permission]
  const allowed = requireAll ? hasAllPermissions(perms) : hasAnyPermission(perms)
  return allowed ? <>{children}</> : <>{fallback}</>
}
