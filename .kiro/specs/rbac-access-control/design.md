# Design: RBAC Access Control Upgrade

## Overview

This document describes the technical design for upgrading `src/features/access-control` to use real server-issued RBAC permissions. The backend login response provides a flat `permissions: string[]` array in `resource:action` format and a `roles: ApiRole[]` array. The frontend must store these in auth state and expose typed helpers for permission checks.

---

## Data Flow

```
Login API Response
  { token, roles, permissions, refresh_token }
        │
        ▼
  userLoggedIn(payload) event dispatched
        │
        ▼
  auth-slice extracts:
    state.roles       = payload.roles
    state.permissions = payload.permissions
        │
        ▼
  useAuthState() → { roles, permissions }
        │
        ▼
  useAccessControl() → { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, isSuperAdmin }
        │
     ┌──┴──────────────────────────┐
     ▼                             ▼
ProtectedRoute              PermissionGuard / Menu
(route-level gate)          (UI-level gate)
```

---

## File Structure

```
src/features/access-control/
  index.ts                    ← public API exports
  types.ts                    ← ApiRole, Permission type
  permissions.ts              ← Permission const object (resource:action strings)
  use-access-control.ts       ← upgraded hook
  access-control-util.ts      ← hasRouteReadAccess (updated)
  route-privilege-matrix.ts   ← real permission mappings
  PermissionGuard.tsx         ← new declarative guard component
```

Auth changes:
```
src/features/auth/
  types.ts                    ← LoginResponse + ApiRole updated
  state/auth-slice.ts         ← roles + permissions added to AuthState
  use-auth-state.ts           ← exposes roles + permissions
```

---

## Type Definitions

### `src/features/auth/types.ts` — updated

```ts
export type ApiRole = {
  name: string
  scope: string           // "GLOBAL" | "TENANT" | other
  scopeReferenceId: string | null
}

export type LoginResponse = {
  token: string
  refresh_token: string
  roles: ApiRole[]
  permissions: string[]
  user?: UserProfile
  profiles?: SimpleUserProfile[]
}

// UserRole kept for backward compat but privileges removed
export type UserRole = { name: string; scope?: string; scopeReferenceId?: string | null }
```

### `src/features/access-control/permissions.ts`

```ts
export const Permission = {
  // Faculties
  FacultiesList:   'faculties:list',
  FacultiesRead:   'faculties:read',
  FacultiesCreate: 'faculties:create',
  FacultiesUpdate: 'faculties:update',
  FacultiesDelete: 'faculties:delete',
  FacultiesManage: 'faculties:manage',
  // Departments
  DepartmentsList:   'departments:list',
  DepartmentsRead:   'departments:read',
  DepartmentsCreate: 'departments:create',
  DepartmentsUpdate: 'departments:update',
  DepartmentsDelete: 'departments:delete',
  DepartmentsManage: 'departments:manage',
  // Programs
  ProgramsList:   'programs:list',
  ProgramsRead:   'programs:read',
  ProgramsCreate: 'programs:create',
  ProgramsUpdate: 'programs:update',
  ProgramsDelete: 'programs:delete',
  ProgramsManage: 'programs:manage',
  // Courses
  CoursesList:   'courses:list',
  CoursesRead:   'courses:read',
  CoursesCreate: 'courses:create',
  CoursesUpdate: 'courses:update',
  CoursesDelete: 'courses:delete',
  CoursesManage: 'courses:manage',
  // Course Configurations
  CourseConfigsList:   'course-configurations:list',
  CourseConfigsRead:   'course-configurations:read',
  CourseConfigsCreate: 'course-configurations:create',
  CourseConfigsUpdate: 'course-configurations:update',
  CourseConfigsDelete: 'course-configurations:delete',
  CourseConfigsManage: 'course-configurations:manage',
  // Curriculum Versions
  CurriculumVersionsList:   'curriculum-versions:list',
  CurriculumVersionsRead:   'curriculum-versions:read',
  CurriculumVersionsCreate: 'curriculum-versions:create',
  CurriculumVersionsUpdate: 'curriculum-versions:update',
  CurriculumVersionsDelete: 'curriculum-versions:delete',
  CurriculumVersionsManage: 'curriculum-versions:manage',
  // Academic Sessions
  AcademicSessionsList:   'academic-sessions:list',
  AcademicSessionsRead:   'academic-sessions:read',
  AcademicSessionsCreate: 'academic-sessions:create',
  AcademicSessionsUpdate: 'academic-sessions:update',
  AcademicSessionsDelete: 'academic-sessions:delete',
  AcademicSessionsManage: 'academic-sessions:manage',
  // Semesters
  SemestersList:   'semesters:list',
  SemestersRead:   'semesters:read',
  SemestersCreate: 'semesters:create',
  SemestersUpdate: 'semesters:update',
  SemestersDelete: 'semesters:delete',
  SemestersManage: 'semesters:manage',
  // Semester Types
  SemesterTypesList:   'semester-types:list',
  SemesterTypesRead:   'semester-types:read',
  SemesterTypesCreate: 'semester-types:create',
  SemesterTypesUpdate: 'semester-types:update',
  SemesterTypesDelete: 'semester-types:delete',
  SemesterTypesManage: 'semester-types:manage',
  // Levels
  LevelsList:   'levels:list',
  LevelsRead:   'levels:read',
  LevelsCreate: 'levels:create',
  LevelsUpdate: 'levels:update',
  LevelsDelete: 'levels:delete',
  LevelsManage: 'levels:manage',
  // Students
  StudentsList:   'students:list',
  StudentsRead:   'students:read',
  StudentsCreate: 'students:create',
  StudentsUpdate: 'students:update',
  StudentsDelete: 'students:delete',
  StudentsManage: 'students:manage',
  // Student Enrollment Transitions
  StudentEnrollmentTransitionsList:   'student-enrollment-transitions:list',
  StudentEnrollmentTransitionsRead:   'student-enrollment-transitions:read',
  StudentEnrollmentTransitionsCreate: 'student-enrollment-transitions:create',
  StudentEnrollmentTransitionsUpdate: 'student-enrollment-transitions:update',
  StudentEnrollmentTransitionsDelete: 'student-enrollment-transitions:delete',
  StudentEnrollmentTransitionsManage: 'student-enrollment-transitions:manage',
  // Student Course Registrations
  StudentCourseRegistrationsList:   'student-course-registrations:list',
  StudentCourseRegistrationsRead:   'student-course-registrations:read',
  StudentCourseRegistrationsCreate: 'student-course-registrations:create',
  StudentCourseRegistrationsUpdate: 'student-course-registrations:update',
  StudentCourseRegistrationsDelete: 'student-course-registrations:delete',
  StudentCourseRegistrationsManage: 'student-course-registrations:manage',
  // Student Score Sheets
  StudentScoreSheetsList:   'student-score-sheets:list',
  StudentScoreSheetsRead:   'student-score-sheets:read',
  StudentScoreSheetsCreate: 'student-score-sheets:create',
  StudentScoreSheetsUpdate: 'student-score-sheets:update',
  StudentScoreSheetsDelete: 'student-score-sheets:delete',
  StudentScoreSheetsManage: 'student-score-sheets:manage',
  // Student Transition Statuses
  StudentTransitionStatusesList:   'student-transition-statuses:list',
  StudentTransitionStatusesRead:   'student-transition-statuses:read',
  StudentTransitionStatusesCreate: 'student-transition-statuses:create',
  StudentTransitionStatusesUpdate: 'student-transition-statuses:update',
  StudentTransitionStatusesDelete: 'student-transition-statuses:delete',
  StudentTransitionStatusesManage: 'student-transition-statuses:manage',
  // Roles
  RolesList:   'roles:list',
  RolesRead:   'roles:read',
  RolesCreate: 'roles:create',
  RolesUpdate: 'roles:update',
  RolesDelete: 'roles:delete',
  RolesManage: 'roles:manage',
  // Permissions
  PermissionsList:   'permissions:list',
  PermissionsRead:   'permissions:read',
  PermissionsCreate: 'permissions:create',
  PermissionsUpdate: 'permissions:update',
  PermissionsDelete: 'permissions:delete',
  PermissionsManage: 'permissions:manage',
  // User Roles
  UserRolesList:   'user-roles:list',
  UserRolesRead:   'user-roles:read',
  UserRolesCreate: 'user-roles:create',
  UserRolesUpdate: 'user-roles:update',
  UserRolesDelete: 'user-roles:delete',
  UserRolesManage: 'user-roles:manage',
  // System Configs
  SystemConfigsList:   'system-configs:list',
  SystemConfigsRead:   'system-configs:read',
  SystemConfigsCreate: 'system-configs:create',
  SystemConfigsUpdate: 'system-configs:update',
  SystemConfigsDelete: 'system-configs:delete',
  SystemConfigsManage: 'system-configs:manage',
  // Brand Configs
  BrandConfigsList:   'brand-configs:list',
  BrandConfigsRead:   'brand-configs:read',
  BrandConfigsCreate: 'brand-configs:create',
  BrandConfigsUpdate: 'brand-configs:update',
  BrandConfigsDelete: 'brand-configs:delete',
  BrandConfigsManage: 'brand-configs:manage',
  // Grading Schema Configs
  GradingSchemaConfigsList:   'grading-schema-configs:list',
  GradingSchemaConfigsRead:   'grading-schema-configs:read',
  GradingSchemaConfigsCreate: 'grading-schema-configs:create',
  GradingSchemaConfigsUpdate: 'grading-schema-configs:update',
  GradingSchemaConfigsDelete: 'grading-schema-configs:delete',
  GradingSchemaConfigsManage: 'grading-schema-configs:manage',
  // Grading
  GradingList:   'grading:list',
  GradingRead:   'grading:read',
  GradingCreate: 'grading:create',
  GradingUpdate: 'grading:update',
  GradingDelete: 'grading:delete',
  GradingManage: 'grading:manage',
} as const

export type Permission = (typeof Permission)[keyof typeof Permission]
```

---

## Auth State Changes

### `AuthState` additions

```ts
export interface AuthState {
  // ... existing fields ...
  roles: ApiRole[]          // NEW — from login response
  permissions: string[]     // NEW — from login response
}
```

### `auth-slice` `userLoggedIn` handler

```ts
.addCase(userLoggedIn, (state, action) => {
  state.token = action.payload.token
  state.refreshToken = action.payload.refresh_token ?? null
  state.roles = action.payload.roles ?? []
  state.permissions = action.payload.permissions ?? []
  state.userProfile = action.payload.user ?? null
  state.profiles = action.payload.profiles ?? []
  state.isAuthenticated = true
  state.bootstrapComplete = false
  // derive currentRole from first role for backward compat
  const first = action.payload.roles?.[0]
  state.currentRole = first ? { name: first.name } : null
})
```

---

## `useAccessControl` Hook

```ts
export function useAccessControl() {
  const { roles, permissions } = useAuthState()

  const hasPermission = (permission: Permission | string): boolean =>
    permissions.includes(permission as string)

  const hasAnyPermission = (required: (Permission | string)[]): boolean =>
    required.some(p => permissions.includes(p as string))

  const hasAllPermissions = (required: (Permission | string)[]): boolean =>
    required.every(p => permissions.includes(p as string))

  const hasRole = (roleName: string): boolean =>
    roles.some(r => r.name === roleName)

  const isSuperAdmin = (): boolean =>
    roles.some(r => r.name === 'System Administrator' && r.scope === 'GLOBAL')

  return { roles, permissions, hasPermission, hasAnyPermission, hasAllPermissions, hasRole, isSuperAdmin }
}
```

---

## `hasRouteReadAccess` — Updated Signature

```ts
export function hasRouteReadAccess({
  userPermissions,
  routePath,
}: {
  userPermissions: string[]
  routePath: string
}): boolean
```

The function checks if the route has a matrix entry and whether the user holds any of the required permissions. Routes with no entry or empty required array return `true`.

---

## Route-Privilege Matrix

```ts
export const routePrivilegeMatrix: Record<string, Permission[]> = {
  [appPaths.dashboard]:          [],                              // open to all authenticated
  [appPaths.staffs]:             [Permission.RolesList],
  [appPaths.academicStructure]:  [Permission.FacultiesList],
  [appPaths.settings]:           [Permission.SystemConfigsList],
}
```

---

## `PermissionGuard` Component

```tsx
type PermissionGuardProps = {
  permission: Permission | Permission[]
  requireAll?: boolean
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionGuard({ permission, requireAll = false, fallback = null, children }: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAccessControl()
  const perms = Array.isArray(permission) ? permission : [permission]
  const allowed = requireAll ? hasAllPermissions(perms) : hasAnyPermission(perms)
  return allowed ? <>{children}</> : <>{fallback}</>
}
```

---

## `ProtectedRoute` — Updated

```tsx
export default function ProtectedRoute() {
  const location = useLocation()
  const { token, permissions } = useAuthState()

  if (!token) return <Navigate to={appPaths.login} replace />

  const isAuthorized = hasRouteReadAccess({
    userPermissions: permissions,
    routePath: location.pathname,
  })

  if (!isAuthorized) return <Navigate to={appPaths.unauthorized} replace />

  return <Outlet />
}
```

---

## Navigation Menu — Updated

`RouteMenuItem.privilege` → `RouteMenuItem.permission: Permission | Permission[]`

```ts
export const routesMenuList: RouteMenuItem[] = [
  { key: appPaths.dashboard,         icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: appPaths.staffs,            icon: <UserOutlined />,      label: 'Staffs',            permission: Permission.RolesList },
  { key: appPaths.academicStructure, icon: <ApartmentOutlined />, label: 'Faculty & Programs', permission: Permission.FacultiesList },
]

export const bottomMenuList: RouteMenuItem[] = [
  { key: appPaths.settings, icon: <SettingOutlined />, label: 'Settings', permission: Permission.SystemConfigsList },
]
```

---

## `index.ts` Public API

```ts
export { Permission } from './permissions'
export type { Permission } from './permissions'
export { useAccessControl } from './use-access-control'
export { hasRouteReadAccess } from './access-control-util'
export { PermissionGuard } from './PermissionGuard'
```

---

## Testing Strategy

| Layer | Test type | Tool |
|---|---|---|
| `useAccessControl` hook | unit + PBT | Vitest + fast-check |
| `hasRouteReadAccess` util | unit + PBT | Vitest + fast-check |
| `PermissionGuard` component | component test | Vitest + RTL |
| `auth-slice` reducers | unit | Vitest |

### Property-Based Test Targets

- P-1 through P-7 from requirements (see requirements.md)
- Use `fc.string()` and `fc.array(fc.string())` to generate arbitrary permission sets
- Wrap hook tests with `renderHook` + a mock Redux store seeded with generated permissions
