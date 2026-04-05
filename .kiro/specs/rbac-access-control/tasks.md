# Tasks: RBAC Access Control Upgrade

## Task List

- [x] 1. Update auth types to match real API response shape
  - [x] 1.1 Add `ApiRole` type (`name`, `scope`, `scopeReferenceId`) to `src/features/auth/types.ts`
  - [x] 1.2 Update `LoginResponse` to include `roles: ApiRole[]` and `permissions: string[]`
  - [x] 1.3 Update `UserRole` type — remove `privileges?: string[]`, add optional `scope` and `scopeReferenceId`

- [x] 2. Update `AuthState` and `auth-slice` to store roles and permissions
  - [x] 2.1 Add `roles: ApiRole[]` and `permissions: string[]` to `AuthState` interface with empty array defaults
  - [x] 2.2 Update `userLoggedIn` extra reducer to extract `roles` and `permissions` from payload
  - [x] 2.3 Derive `currentRole` from `roles[0]` for backward compatibility
  - [x] 2.4 Ensure `authCleared` and `userLoggedOut` reset `roles` and `permissions` to `[]`
  - [x] 2.5 Update `setAuthState` reducer to include `roles` and `permissions`

- [x] 3. Expose `roles` and `permissions` from `useAuthState`
  - [x] 3.1 Add `roles` and `permissions` to the return value of `useAuthState`

- [x] 4. Create `Permission` constants in `src/features/access-control/permissions.ts`
  - [x] 4.1 Define `Permission` const object with all `resource:action` strings from the API
  - [x] 4.2 Export `Permission` type as union of all values

- [x] 5. Refactor `useAccessControl` hook
  - [x] 5.1 Replace `currentRole?.privileges` read with `permissions` from `useAuthState`
  - [x] 5.2 Implement `hasPermission(permission)` — exact match against `permissions` array
  - [x] 5.3 Implement `hasAnyPermission(permissions[])` — any match
  - [x] 5.4 Implement `hasAllPermissions(permissions[])` — all match
  - [x] 5.5 Implement `hasRole(roleName)` — checks `roles` array by name
  - [x] 5.6 Implement `isSuperAdmin()` — checks for `System Administrator` role with `GLOBAL` scope
  - [x] 5.7 Remove `hasPrivilege` and `company` from return value (breaking change — update all call sites)

- [x] 6. Update `route-privilege-matrix.ts` to use real `Permission` values
  - [x] 6.1 Replace `Privilege.DashboardRead` entry with empty array for `/dashboard`
  - [x] 6.2 Add `/staffs` → `[Permission.RolesList]`
  - [x] 6.3 Add `/academic-structure` → `[Permission.FacultiesList]`
  - [x] 6.4 Add `/settings` → `[Permission.SystemConfigsList]`

- [x] 7. Update `hasRouteReadAccess` in `access-control-util.ts`
  - [x] 7.1 Rename parameter `userPrivileges` to `userPermissions`
  - [x] 7.2 Remove `:re` suffix filter — check against full permission strings from matrix
  - [x] 7.3 Empty matrix entry (`[]`) must return `true` (open to authenticated users)

- [x] 8. Create `PermissionGuard` component
  - [x] 8.1 Create `src/features/access-control/PermissionGuard.tsx`
  - [x] 8.2 Accept `permission: Permission | Permission[]`, `requireAll?: boolean`, `fallback?: ReactNode`, `children: ReactNode`
  - [x] 8.3 Use `useAccessControl` internally — no direct Redux reads
  - [x] 8.4 Render children when allowed, fallback (or null) when not

- [x] 9. Update `ProtectedRoute` to use real permissions
  - [x] 9.1 Read `permissions` from `useAuthState` instead of `currentRole?.privileges`
  - [x] 9.2 Pass `userPermissions` (not `userPrivileges`) to `hasRouteReadAccess`

- [x] 10. Update navigation menu config
  - [x] 10.1 Rename `RouteMenuItem.privilege` field to `RouteMenuItem.permission`
  - [x] 10.2 Update `routesMenuList` items to use real `Permission` values
  - [x] 10.3 Update `bottomMenuList` items to use real `Permission` values
  - [x] 10.4 Update `useRestrictedRouteMenuItem` and `useRestrictedBottomMenuItem` to use `hasPermission` / `hasAnyPermission`

- [x] 11. Remove old `privileges-enum.ts` and migrate all consumers
  - [x] 11.1 Search for all imports of `Privilege` across the codebase
  - [x] 11.2 Replace each with the equivalent `Permission` value
  - [x] 11.3 Delete `src/features/access-control/privileges-enum.ts`

- [x] 12. Update `src/features/access-control/index.ts` exports
  - [x] 12.1 Export `Permission`, `useAccessControl`, `hasRouteReadAccess`, `PermissionGuard`
  - [x] 12.2 Remove `Privilege` export

- [x] 13. Write property-based tests for `useAccessControl` and `hasRouteReadAccess`
  - [x] 13.1 Install `fast-check` if not already present
  - [x] 13.2 Write PBT for P-1: `hasPermission` iff `permissions.includes(p)`
  - [x] 13.3 Write PBT for P-2: `hasAnyPermission` semantics
  - [x] 13.4 Write PBT for P-3: `hasAllPermissions` semantics
  - [x] 13.5 Write PBT for P-4: empty permissions → all checks return false
  - [x] 13.6 Write PBT for P-5 and P-6: route matrix no-entry and empty-entry → allow
  - [x] 13.7 Write component tests for P-7: `PermissionGuard` render behavior

- [x] 14. Write unit tests for `auth-slice` RBAC state changes
  - [x] 14.1 Test `userLoggedIn` stores `roles` and `permissions` correctly
  - [x] 14.2 Test `authCleared` resets `roles` and `permissions` to `[]`
  - [x] 14.3 Test `REHYDRATE` restores `roles` and `permissions`
