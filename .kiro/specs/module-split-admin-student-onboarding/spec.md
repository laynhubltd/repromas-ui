# Spec — Modular Split (Admin, Student, Onboarding)

## Current State (from codebase)

- Router is centralized in `src/app/routing/AppRouter.tsx`.
- Most current product routes are admin-oriented (`/dashboard`, `/academic-structure`, `/settings`).
- Auth routes are already separated by URL namespace (`/auth/*`) but still wired in one router tree.
- Shared services already exist (`src/app/api/*`, Redux store, `src/shared/*`).
- Vite build has no module-level `manualChunks` strategy yet.

## Target State

Convert to a modular monolith with three independently mountable modules:

1. **Onboarding Module**
   - Scope: login, sign-up, forgot-password, role-selection, unauthorized/public pages.
   - Base routes: `/auth/*`, `/role-selection`, `/unauthorized`.

2. **Admin Module**
   - Scope: dashboard, settings, academic structure, staff/admin operations.
   - Base routes: `/dashboard`, `/settings`, `/academic-structure`, `/staffs`.

3. **Student Module**
   - Scope: student portal journeys (new or migrated student features).
   - Base routes (proposed): `/student/*`.

## Mounting Contract

Each module exports:

- `get<ModuleName>Routes(context): RouteObject[]`
- optional module metadata (`moduleId`, default route, feature flag key)

The host app composes modules at runtime:

- Enable/disable modules via config (`VITE_ENABLE_ADMIN`, `VITE_ENABLE_STUDENT`, `VITE_ENABLE_ONBOARDING`)
- Build final route array from enabled modules
- Provide shared context (auth status, access-control helpers, common layouts)

## Proposed Folder Structure

```text
src/
  app/
    routing/
      host-router.tsx
      module-registry.ts
    store/
      create-store.ts
  modules/
    onboarding/
      routes/
        onboarding-routes.tsx
      features/
    admin/
      routes/
        admin-routes.tsx
      features/
    student/
      routes/
        student-routes.tsx
      features/
  shared/
    components/
    hooks/
    utils/
    services/
```

## Router Composition Example

```ts
const enabledModules = getEnabledModulesFromEnv();

const routeTree = [
  ...getOnboardingRoutes(ctx, enabledModules.onboarding),
  ...getAdminRoutes(ctx, enabledModules.admin),
  ...getStudentRoutes(ctx, enabledModules.student),
  ...getFallbackRoutes(enabledModules),
];
```

## Performance Strategy (Vite)

Apply module-aware manual chunking:

- `module-onboarding`
- `module-admin`
- `module-student`
- `vendor-react`
- `vendor-antd`
- `vendor-redux`

Rules:

- Keep top-level module screens lazy-loaded.
- Keep heavy admin dependencies out of onboarding chunk.
- Preload only the next-likely module after login/role resolution.

## Non-Goals

- No immediate micro-frontend runtime split.
- No backend API contract changes.
- No redesign of shared auth/session semantics.

## Success Criteria

- Module routes can be enabled/disabled independently.
- Onboarding-first load excludes admin/student code from initial bundle.
- Shared API/store/common components continue working across modules.
- Existing URLs remain operational during migration.
