# Requirements Document

## Introduction

This document defines how to evolve the current `repromas-ui` frontend into three independently mountable modules:

- `Onboarding` (public and pre-role flows)
- `Admin` (operations and configuration flows)
- `Student` (student-facing flows)

The solution must remain compliant with `agent.md` rules:

- feature-based architecture
- RTK Query + axiosBaseQuery + axiosInstance for server state
- Redux slices for client/UI state
- shared domain-agnostic utilities in `shared/`

The split is a **modular monolith inside one Vite app** (not micro-frontend first). Each module owns its own router config and can be mounted independently, while sharing services/components/hooks through explicit shared contracts.

## Glossary

- **Module**: a top-level bounded context under `src/modules/<name>`.
- **Module Router**: module-specific route tree exported by a module.
- **Module Mounting**: host composition that includes/excludes modules based on runtime config.
- **Shared Core**: cross-module infra (`src/app`, `src/shared`) like store, API base, design system, hooks.
- **Host Router**: root router that composes enabled module routers.

## Requirements

### Requirement 1: Establish three top-level modules

**User Story:** As a developer, I need three bounded contexts (`onboarding`, `admin`, `student`) so ownership and deployability are clearer.

#### Acceptance Criteria

1. The codebase SHALL define module roots at `src/modules/onboarding`, `src/modules/admin`, and `src/modules/student`.
2. Each module SHALL own its own feature folders, route config, and module-level layouts.
3. Cross-module imports SHALL be disallowed except through `src/shared` or `src/app` contracts.
4. Existing features SHALL be mapped as follows for initial migration:
   - `auth` -> `onboarding`
   - `dashboard`, `academic-structure`, `settings`, `staff` -> `admin`
   - `student` -> `student` (new module with starter shell if feature gaps exist)

---

### Requirement 2: Independent module router configs and mounting

**User Story:** As a platform engineer, I want each module to expose its own route tree and be mounted independently.

#### Acceptance Criteria

1. Each module SHALL export a route factory (e.g., `getOnboardingRoutes`, `getAdminRoutes`, `getStudentRoutes`).
2. The host app SHALL compose routes from enabled modules only.
3. The host app SHALL support runtime flags for module enablement (e.g., env flags).
4. Each module SHALL keep auth/role guards local to its route tree.
5. Route fallbacks SHALL not redirect into a disabled module.

---

### Requirement 3: Shared services, components, and hooks

**User Story:** As a developer, I need reusable infrastructure without coupling modules directly.

#### Acceptance Criteria

1. Shared API infra SHALL stay centralized in `src/app/api` (`baseApi`, `axiosBaseQuery`, `axiosInstance`).
2. Shared UI primitives and hooks SHALL live in `src/shared` (or existing equivalent shared components path).
3. Module-specific hooks/components SHALL remain inside their module unless explicitly promoted.
4. Shared contracts SHALL be domain-agnostic and versioned via stable exports.

---

### Requirement 4: Redux and RTK Query modular registration

**User Story:** As a developer, I want module slices/endpoints to register predictably without duplicated store setup.

#### Acceptance Criteria

1. Store creation SHALL support module reducer registration for UI/client state.
2. RTK Query endpoint injection SHALL remain module-local while sharing common `baseApi` where applicable.
3. `authApi` isolation SHALL be preserved if kept standalone.
4. Adding/removing a module SHALL not require rewriting existing module internals.

---

### Requirement 5: Performance improvement with Vite chunking

**User Story:** As a user, I want faster initial load by downloading only what the active module needs.

#### Acceptance Criteria

1. Build config SHALL define `manualChunks` to split by module and vendor domains.
2. Route components SHALL remain lazy-loaded at module boundaries.
3. Onboarding-first visits SHALL avoid downloading heavy admin/student chunks.
4. The project SHALL establish bundle-size budgets and CI checks for regression control.

---

### Requirement 6: Migration safety and backward compatibility

**User Story:** As a team, we need incremental migration without breaking current behavior.

#### Acceptance Criteria

1. Migration SHALL be executable in phases with a functional app after each phase.
2. Current route URLs SHALL remain valid unless explicitly changed.
3. Existing auth flow and persisted state SHALL continue working during transition.
4. A rollback path SHALL exist (feature-flag based module composition fallback).
