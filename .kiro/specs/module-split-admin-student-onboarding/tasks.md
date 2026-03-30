# Implementation Plan: module-split-admin-student-onboarding

## Overview

Implement the module split incrementally so the app stays runnable at every checkpoint. Start with routing composition and compatibility layers, then move features, then optimize chunking.

## Tasks

- [ ] 1. Create module scaffolding
  - Create directories:
    - `src/modules/onboarding/{routes,features}`
    - `src/modules/admin/{routes,features}`
    - `src/modules/student/{routes,features}`
  - Add module entry barrels (`index.ts`) for each module.

- [ ] 2. Introduce host module registry
  - Add `src/app/routing/module-registry.ts` with module enable flags from env.
  - Define module metadata and route factory contracts.

- [ ] 3. Refactor AppRouter into host composition
  - Add `src/app/routing/host-router.tsx` that composes enabled module routes.
  - Keep `RouterShell` and fallback behavior consistent.
  - Wire `App.tsx` to the new host router.

- [ ] 4. Build onboarding route module
  - Create `onboarding-routes.tsx` and move auth route declarations from `AppRouter`.
  - Include `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/unauthorized`, `/role-selection`.
  - Keep lazy loading and existing auth components.

- [ ] 5. Build admin route module
  - Create `admin-routes.tsx` and move admin route declarations.
  - Reuse `DashboardShell` and auth guard.
  - Include dashboard, settings, academic-structure, staffs routes.

- [ ] 6. Build student route module
  - Create `student-routes.tsx` with student shell + placeholder pages (initially minimal).
  - Protect with role/privilege checks where needed.

- [ ] 7. Move feature ownership to module folders
  - Move existing features into target module folders in batches.
  - Keep temporary compatibility exports under `src/features/*` until import migration is complete.

- [ ] 8. Normalize shared layer contracts
  - Audit components/hooks/utils used by 2+ modules.
  - Move only domain-agnostic items to `src/shared`.
  - Remove direct admin->onboarding or student->admin imports.

- [ ] 9. Modular reducer and API registration
  - Add module reducer maps and merge in store factory.
  - Keep `baseApi` shared and module endpoints local.
  - Preserve `authApi` standalone setup if retained.

- [ ] 10. Apply Vite module chunk strategy
  - Add `build.rollupOptions.output.manualChunks` in `vite.config.ts`.
  - Define chunks for `module-onboarding`, `module-admin`, `module-student`, and vendors.

- [ ] 11. Add performance guardrails
  - Capture baseline bundle output.
  - Add size budget checks for initial and async chunks.
  - Verify onboarding-first route loads only onboarding + required vendors.

- [ ] 12. Regression and route tests
  - Add routing tests per module (enabled/disabled scenarios).
  - Add smoke tests for auth redirect behavior and fallback routing.
  - Run `npx tsc --noEmit` and `npx vitest --run`.

- [ ] 13. Cleanup and remove compatibility layer
  - Remove temporary legacy route code and proxy exports.
  - Update docs (`README`, architecture docs) to module model.

## Rollout Strategy

1. Ship host router + onboarding/admin modules first (student disabled by default).
2. Enable student module in staging with placeholder routes.
3. Migrate student feature set and enable in production.
4. Turn on strict module boundary lint rules after migration completes.
