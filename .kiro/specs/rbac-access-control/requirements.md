# Requirements: RBAC Access Control Upgrade

## Overview

Upgrade and refactor `src/features/access-control` to implement proper Role-Based Access Control (RBAC) aligned with the real backend API. The current implementation uses a fake abbreviated privilege enum (`dashboard:re`, `admission:crt`) that does not match the actual API permission strings. The backend returns permissions in `resource:action` format (e.g. `faculties:list`, `roles:manage`) and roles with a `scope` field.

---

## User Stories

### US-1: Permission-Aware Auth State

**As a** frontend application,  
**I want** the auth state to store the real `roles` array and `permissions` array from the login response,  
**So that** access control decisions are based on actual server-issued permissions.

**Acceptance Criteria:**
- AC-1.1: `LoginResponse` type includes `roles: ApiRole[]` and `permissions: string[]` matching the API response shape.
- AC-1.2: `ApiRole` type has `name: string`, `scope: "GLOBAL" | "TENANT" | string`, and `scopeReferenceId: string | null`.
- AC-1.3: `AuthState` stores `roles: ApiRole[]` and `permissions: string[]` (separate from the legacy `currentRole`).
- AC-1.4: The `userLoggedIn` event handler in `auth-slice` extracts and persists `roles` and `permissions` from the login payload.
- AC-1.5: On `authCleared` / `userLoggedOut`, `roles` and `permissions` are reset to empty arrays.
- AC-1.6: On `REHYDRATE`, `roles` and `permissions` are restored from persisted state.

---

### US-2: Real Permission Enum / Constants

**As a** developer,  
**I want** a typed `Permission` constant object that mirrors the real API permission strings,  
**So that** I can reference permissions with autocomplete and avoid magic strings.

**Acceptance Criteria:**
- AC-2.1: A `Permission` const object is defined in `src/features/access-control/permissions.ts` covering all known resource:action combinations from the API.
- AC-2.2: Resources covered include: `faculties`, `departments`, `programs`, `courses`, `course-configurations`, `curriculum-versions`, `academic-sessions`, `semesters`, `semester-types`, `levels`, `students`, `student-enrollment-transitions`, `student-course-registrations`, `student-score-sheets`, `student-transition-statuses`, `roles`, `permissions`, `user-roles`, `system-configs`, `brand-configs`, `grading-schema-configs`, `grading`.
- AC-2.3: Actions covered per resource: `list`, `read`, `create`, `update`, `delete`, `manage`.
- AC-2.4: `Permission` type is exported as a union of all values.
- AC-2.5: The old `Privilege` enum is removed and all references are migrated to `Permission`.

---

### US-3: Upgraded `useAccessControl` Hook

**As a** React component,  
**I want** a `useAccessControl` hook that reads real permissions from auth state,  
**So that** I can gate UI elements based on what the current user is actually allowed to do.

**Acceptance Criteria:**
- AC-3.1: `useAccessControl` reads `permissions` from `state.auth.permissions` (not `currentRole?.privileges`).
- AC-3.2: `hasPermission(permission: Permission | string): boolean` returns `true` if the user has the given permission.
- AC-3.3: `hasAnyPermission(permissions: Permission[]): boolean` returns `true` if the user has at least one of the given permissions.
- AC-3.4: `hasAllPermissions(permissions: Permission[]): boolean` returns `true` if the user has every given permission.
- AC-3.5: `hasRole(roleName: string): boolean` returns `true` if any of the user's roles matches the given name.
- AC-3.6: `isSuperAdmin(): boolean` returns `true` when the user has a role named `"System Administrator"` with `scope: "GLOBAL"`.
- AC-3.7: When `permissions` is empty (unauthenticated or not yet loaded), all permission checks return `false` — no silent allow-all fallback.
- AC-3.8: The hook exposes `roles: ApiRole[]`, `permissions: string[]`, and all helper functions.
- AC-3.9: The legacy `hasPrivilege` function is removed; consumers are migrated to `hasPermission` / `hasAnyPermission`.

---

### US-4: Updated Route-Privilege Matrix

**As a** protected route,  
**I want** the route-privilege matrix to use real API permission strings,  
**So that** route access is enforced against actual server-issued permissions.

**Acceptance Criteria:**
- AC-4.1: `route-privilege-matrix.ts` maps each app route to an array of real `Permission` values required for read access.
- AC-4.2: `/dashboard` requires no specific permission (accessible to any authenticated user).
- AC-4.3: `/staffs` requires `roles:list` (staff management relates to user-roles).
- AC-4.4: `/academic-structure` requires `faculties:list`.
- AC-4.5: `/settings` requires `system-configs:list`.
- AC-4.6: Routes with no matrix entry remain open to any authenticated user.
- AC-4.7: `hasRouteReadAccess` is updated to read from `state.auth.permissions` and uses the `:read` or `:list` action suffix for route-level checks.

---

### US-5: `PermissionGuard` Component

**As a** UI developer,  
**I want** a `PermissionGuard` component,  
**So that** I can declaratively hide/show UI sections based on permissions without writing conditional logic in every component.

**Acceptance Criteria:**
- AC-5.1: `PermissionGuard` accepts `permission: Permission | Permission[]`, `requireAll?: boolean`, and `fallback?: ReactNode` props.
- AC-5.2: When `requireAll` is `false` (default), renders children if user has **any** of the given permissions.
- AC-5.3: When `requireAll` is `true`, renders children only if user has **all** of the given permissions.
- AC-5.4: When the check fails, renders `fallback` if provided, otherwise renders `null`.
- AC-5.5: `PermissionGuard` is exported from `src/features/access-control/index.ts`.

---

### US-6: Updated `ProtectedRoute`

**As a** router,  
**I want** `ProtectedRoute` to use the upgraded `hasRouteReadAccess` with real permissions,  
**So that** route-level authorization reflects actual server-issued permissions.

**Acceptance Criteria:**
- AC-6.1: `ProtectedRoute` reads `permissions` from auth state (via `useAuthState` or `useAccessControl`).
- AC-6.2: `hasRouteReadAccess` receives `userPermissions: string[]` (renamed from `userPrivileges`).
- AC-6.3: Unauthorized routes redirect to `/unauthorized`.
- AC-6.4: Unauthenticated users redirect to `/auth/login`.

---

### US-7: Updated Navigation Menu Filtering

**As a** sidebar menu,  
**I want** menu items to be filtered using real `Permission` values,  
**So that** navigation reflects what the user is actually allowed to access.

**Acceptance Criteria:**
- AC-7.1: `RouteMenuItem.privilege` field is renamed to `RouteMenuItem.permission` and typed as `Permission | Permission[]`.
- AC-7.2: Each menu item in `routesMenuList` and `bottomMenuList` is mapped to its real permission (e.g. `staffs` → `Permission.RolesList`, `academicStructure` → `Permission.FacultiesList`).
- AC-7.3: `useRestrictedRouteMenuItem` and `useRestrictedBottomMenuItem` use `hasPermission` / `hasAnyPermission` from `useAccessControl`.
- AC-7.4: Dashboard menu item has no permission requirement (always visible to authenticated users).

---

### US-8: Backward-Compatible `index.ts` Exports

**As a** codebase consumer,  
**I want** `src/features/access-control/index.ts` to export all public API,  
**So that** imports don't break across the app.

**Acceptance Criteria:**
- AC-8.1: `index.ts` exports `Permission`, `useAccessControl`, `hasRouteReadAccess`, `PermissionGuard`.
- AC-8.2: The old `Privilege` export is removed after all consumers are migrated.
- AC-8.3: All existing import sites that used `Privilege` are updated to use `Permission`.

---

## Correctness Properties

These are the formal properties the implementation must satisfy, validated via property-based tests.

### P-1: Permission Check Consistency
For any non-empty `permissions` array and any `permission` string:
- `hasPermission(p)` returns `true` **if and only if** `permissions.includes(p)`.

### P-2: hasAnyPermission Semantics
For any `permissions` array and any `required` array:
- `hasAnyPermission(required)` returns `true` **if and only if** `required.some(p => permissions.includes(p))`.

### P-3: hasAllPermissions Semantics
For any `permissions` array and any `required` array:
- `hasAllPermissions(required)` returns `true` **if and only if** `required.every(p => permissions.includes(p))`.

### P-4: Empty Permissions → No Access
When `permissions` is `[]`:
- `hasPermission(any)` returns `false`.
- `hasAnyPermission(any)` returns `false`.
- `hasAllPermissions(any)` returns `false`.

### P-5: Route Matrix — No Entry → Allow
For any route path not present in `routePrivilegeMatrix`:
- `hasRouteReadAccess({ userPermissions: [], routePath })` returns `true`.

### P-6: Route Matrix — Entry With No Permissions → Allow
For any route path whose matrix entry is an empty array:
- `hasRouteReadAccess({ userPermissions: [], routePath })` returns `true`.

### P-7: PermissionGuard Render Consistency
- When `requireAll=false`: renders children **iff** `hasAnyPermission(permission)` is `true`.
- When `requireAll=true`: renders children **iff** `hasAllPermissions(permission)` is `true`.
- When check fails and `fallback` is provided: renders `fallback`.
- When check fails and no `fallback`: renders `null`.

---

## Non-Functional Requirements

- NFR-1: No axios calls or `useEffect` API calls inside access-control components or hooks.
- NFR-2: All permission strings must be typed — no untyped `string` parameters where `Permission` is expected.
- NFR-3: The `access-control` feature must not directly import from other features (except `auth` via `useAuthState`).
- NFR-4: All new types must be co-located: feature types in `features/access-control/types.ts`, shared types in `shared/types/`.
- NFR-5: Tests use Vitest + React Testing Library. Property-based tests use `fast-check`.
