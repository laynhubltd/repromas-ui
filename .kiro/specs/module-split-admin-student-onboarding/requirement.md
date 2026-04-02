# Requirements Document

## Introduction

This document defines the modular architecture for `repromas-ui` as a multi-tenant system with:

- `Onboarding` module (apex domain experience and tenant signup)
- `Admin` module (tenant-internal admin operations)
- `Student` module (tenant-internal student operations)
- **Shared Auth** used by all modules

Core domain-routing rule:

- On `repromas.com` (apex): mount Onboarding directly.
- On `<tenant-slug>.repromas.com`: resolve tenant, authenticate user, and mount module by user role (`Admin` or `Student`).

Scope lock:

- Keep current RTK Query setup exactly as implemented.
- Keep current auth flow exactly as implemented.
- Implement only module mounting/orchestration changes.

## Glossary

- **Apex Domain**: `repromas.com`.
- **Tenant Domain**: `<tenant-slug>.repromas.com` (e.g., `fpb.repromas.com`).
- **Tenant Slug**: subdomain identifier mapped to a tenant/school.
- **Shared Auth**: central auth/session/claims services consumed by all modules.
- **Host Router**: top-level router deciding which module routes are mounted.

## Requirements

### Requirement 1: Shared Auth for all modules

**User Story:** As a developer, I want auth to be centralized so all modules rely on one consistent identity/session model.

#### Acceptance Criteria

1. Existing auth implementation SHALL be reused as-is (no refactor of auth APIs, reducers, listeners, or guards).
2. Existing RTK Query configuration (`baseApi`, `authApi`, axios base query flow) SHALL remain unchanged.
3. Module mounter SHALL consume existing auth state/guards/selectors only.
4. Any auth improvement ideas SHALL be explicitly out-of-scope for this phase.

---

### Requirement 2: Domain-based entry routing

**User Story:** As a user, I need correct app behavior based on the accessed domain.

#### Acceptance Criteria

1. When host is apex (`repromas.com`), the app SHALL mount Onboarding routes only.
2. When host contains tenant subdomain (`<slug>.repromas.com`), the app SHALL execute tenant bootstrap flow before mounting protected module routes.
3. When tenant slug is unknown/disabled, the app SHALL show a tenant-not-found flow (deny-by-default).
4. Hostname parsing SHALL treat only configured base domains as valid tenant domains.

---

### Requirement 3: Onboarding module scope

**User Story:** As a school representative, I need a landing/onboarding flow to understand the platform and create a tenant.

#### Acceptance Criteria

1. Onboarding SHALL include a landing page that explains the system value proposition.
2. Onboarding SHALL include tenant signup for school creation.
3. Tenant signup success SHALL provision tenant metadata including slug/domain mapping.
4. Onboarding SHALL support navigation to tenant login domain after provisioning (e.g., `fpb.repromas.com`).

---

### Requirement 4: Role-based module mounting on tenant domains

**User Story:** As an authenticated tenant user, I should only load the module for my role.

#### Acceptance Criteria

1. On tenant domains, unauthenticated users SHALL be redirected to auth entry for that tenant context.
2. After authentication, role resolution SHALL mount `Admin` module for admin roles and `Student` module for student roles.
3. Unauthorized role/module combinations SHALL return unauthorized/forbidden route.
4. Module mounting decision SHALL not rely on client-only assumptions; server-validated profile/claims must be used.

---

### Requirement 5: Shared services/components/hooks boundaries

**User Story:** As a developer, I need reusable shared pieces without module coupling.

#### Acceptance Criteria

1. Shared services SHALL remain under `src/app` and `src/shared`.
2. Module-to-module imports SHALL be disallowed.
3. Domain-agnostic components/hooks/utilities MAY be promoted to shared layer.
4. Domain-specific code SHALL remain module-local.

---

### Requirement 6: Performance and chunking

**User Story:** As a user, I want smaller initial loads by loading only relevant module bundles.

#### Acceptance Criteria

1. Build config SHALL use manual chunking for module bundles and key vendors.
2. Apex visits SHALL not load admin/student module chunks by default.
3. Tenant authenticated visits SHALL load only the selected role module chunk (+ shared/vendor chunks).
4. Chunk-size budgets and warnings SHALL be enforced in CI.

---

### Requirement 7: Migration safety

**User Story:** As a team, we need phased migration with minimal disruption.

#### Acceptance Criteria

1. Migration SHALL be deployable in phases with a functioning app at each phase.
2. Existing auth/session behavior SHALL remain operational during migration.
3. Existing route paths SHALL be preserved unless explicitly migrated.
4. Feature flags SHALL allow rollback to previous router composition.
