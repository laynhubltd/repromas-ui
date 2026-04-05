# Implementation Plan: shared-auth-domain-role-mounting

## Overview

Implement in phases focused only on module mounting/orchestration. Existing auth and RTK Query remain unchanged.

## Tasks

- [ ] 1. Build hostname/tenant resolver
  - Add hostname parser utility (apex vs tenant subdomain).
  - Add tenant bootstrap query by slug.
  - Add tenant-not-found/suspended handling.

- [ ] 2. Implement host router orchestration
  - Create `src/app/routing/host-router.tsx`.
  - Route by host type:
    - apex -> onboarding module routes
    - tenant -> auth+role flow

- [x] 3. Extract Onboarding module
  - Move landing + tenant signup pages into `src/modules/onboarding`.
  - Ensure onboarding is mountable standalone on apex domain.

- [x] 4. Extract Admin module routes
  - Move admin route declarations to `src/modules/admin/routes.tsx`.
  - Keep existing admin pages and guards operational.

- [x] 5. Extract Student module routes
  - Create `src/modules/student/routes.tsx`.
  - Add minimal student shell and role-guarded pages.

- [x] 6. Implement tenant-domain auth flow (reuse existing auth)
  - On tenant domain, force auth before mounting Admin/Student modules.
  - Reuse current profile/role/auth flow as-is.
  - Validate tenant claim against resolved hostname tenant in mounter logic.

- [x] 7. Implement role-based module mount
  - Map role -> module (`admin` => Admin, `student` => Student).
  - Add explicit unauthorized route for unknown/mismatched roles.

- [ ] 8. Apply Vite chunking strategy
  - Add manual chunk strategy for module and vendor chunks.
  - Verify apex loads onboarding chunk without admin/student chunks.

- [ ] 9. Add test coverage
  - Unit tests for hostname parsing and module selection.
  - Route tests for apex/tenant and auth/role permutations.
  - Security tests for deny-by-default behavior.

- [ ] 10. Add rollout flags and rollback path
  - Feature flags for new host router and module mounting.
  - Safe fallback to legacy router while validating in staging.

- [ ] 11. Performance and regression validation
  - Run build analysis and establish chunk-size budgets.
  - Run `npx tsc --noEmit` and `npx vitest --run`.

- [ ] 12. Scope guardrail validation
  - Confirm no auth files were modified for behavior changes.
  - Confirm no RTK Query base wiring changes were introduced.

## Rollout Order

1. Host resolver + host router.
2. Apex onboarding switch.
3. Tenant auth-gated role-based module mount (using existing auth flow).
4. Full module extraction and compatibility cleanup.
5. Enforce import boundaries via lint rules.
