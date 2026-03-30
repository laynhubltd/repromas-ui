# Design Document — module-split-admin-student-onboarding

## Overview

This design introduces module-level boundaries without breaking existing architecture rules in `agent.md`.

Key decisions:

- Keep one host React app and one shared Redux store.
- Move from one central route file to module route factories.
- Preserve shared API infrastructure (`baseApi`, `axiosBaseQuery`, `axiosInstance`).
- Use Vite `manualChunks` + route lazy-loading for faster initial load.

## Module Boundaries

### 1) Onboarding Module

Owns:

- auth screens (`Login`, `SignUp`, `ForgotPassword`)
- role-selection flow
- unauthorized/public route screens

Does not own:

- admin dashboard/content routes
- student portal content

### 2) Admin Module

Owns:

- dashboard shell and nav
- dashboard, settings, academic-structure, staff
- admin-only access-control mapping

### 3) Student Module

Owns:

- student shell, student nav
- student workflows (progressive rollout)

## Routing Design

### Host Router

Replace `AppRouter` internals with module composition:

- `src/app/routing/module-registry.ts`: enables modules from env + runtime conditions.
- `src/app/routing/host-router.tsx`: builds final route list from registered modules.

### Module Route Factories

Each module exports a factory that returns `RouteObject[]` and receives shared context.

Suggested interfaces:

```ts
export type ModuleRouteFactory = (ctx: ModuleContext) => RouteObject[];

export type ModuleContext = {
  isAuthenticated: boolean;
  hasRouteAccess: (path: string) => boolean;
  guards: {
    withAuthGuard: <T extends object>(Component: ComponentType<T>) => ComponentType<T>;
  };
};
```

### Route Resolution Rules

- Onboarding routes are always mounted unless explicitly disabled.
- Admin routes mounted when `ENABLE_ADMIN_MODULE` is true.
- Student routes mounted when `ENABLE_STUDENT_MODULE` is true.
- Default redirect chooses first enabled module home:
  - onboarding if unauthenticated
  - admin if authenticated and admin enabled
  - student if authenticated and only student enabled

## Shared Infrastructure

### Store

Keep centralized store, but split registration concerns:

- static reducers: `auth`, `theme`, shared infra reducers
- module reducers: exported reducer maps from each module

Suggested helper:

```ts
createAppStore({ enabledModules }): Store
```

### APIs

- Keep `baseApi` in `src/app/api/baseApi.ts`.
- Keep module endpoints in module folders using `baseApi.injectEndpoints`.
- Keep `authApi` standalone if security isolation is needed (current behavior).

### Shared Components/Hooks

Promote only domain-agnostic artifacts to `src/shared`:

- UI primitives
- form helpers
- generic hooks (`useDebounce`, `usePagination`)

If a component mentions a domain entity (`Faculty`, `Session`, `StudentRecord`), keep it module-local.

## Vite Chunking Design

Update `vite.config.ts` with manual chunk partitioning.

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules')) {
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor-react';
          if (id.includes('antd') || id.includes('@ant-design')) return 'vendor-antd';
          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) return 'vendor-redux';
          return 'vendor-misc';
        }

        if (id.includes('/src/modules/onboarding/')) return 'module-onboarding';
        if (id.includes('/src/modules/admin/')) return 'module-admin';
        if (id.includes('/src/modules/student/')) return 'module-student';
      },
    },
  },
}
```

Notes:

- Keep chunks coarse at module boundary first; optimize further only with analyzer data.
- Keep route-level `lazy(() => import(...))` for major pages.

## Migration Mapping

### Phase-1 file moves (logical ownership)

- `src/features/auth/*` -> `src/modules/onboarding/features/auth/*`
- `src/features/dashboard/*` -> `src/modules/admin/features/dashboard/*`
- `src/features/academic-structure/*` -> `src/modules/admin/features/academic-structure/*`
- `src/features/settings/*` -> `src/modules/admin/features/settings/*`
- `src/features/staff/*` -> `src/modules/admin/features/staff/*`

Keep compatibility barrel exports during migration to avoid broken imports.

## Risks and Mitigations

1. Risk: Circular imports during move.
Mitigation: create temporary compatibility exports and migrate imports in batches.

2. Risk: Route regressions.
Mitigation: add route snapshot tests and smoke tests per module.

3. Risk: bundle split not effective.
Mitigation: use `vite build --analyze` equivalent tooling and enforce budgets.

4. Risk: shared layer becoming a dump.
Mitigation: require promotion checklist before moving module code into `shared`.
