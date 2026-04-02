# Requirements Document

## Introduction

This document defines the requirements for restoring and correctly implementing the reverted auth bootstrap scope:

- Fetch authenticated user profile immediately after login.
- Keep the flow event-driven using past-tense domain events.
- Validate and derive user role/user data from token claims as fallback.
- Fully implement module mounter role resolution so tenant routing mounts the correct module.

Scope includes only orchestration and state-resolution behavior around auth bootstrap and module mounting. It does not include redesign of existing auth APIs or unrelated feature modules.

## Requirement 1: Post-login profile bootstrap

**User Story:** As an authenticated user, I need my server profile loaded immediately after login so routing and authorization are based on complete data.

### Acceptance Criteria

1. After a successful login event, the app SHALL trigger profile bootstrap before final module routing.
2. Bootstrap SHALL call the existing profile endpoint (`/auth/profile`) via existing RTK Query auth API.
3. If profile fetch succeeds, auth state SHALL store hydrated user profile and mark bootstrap complete.
4. If profile fetch fails, flow SHALL continue with safe fallback sources (login payload and token claims) without crashing.
5. If token is missing/expired/invalid, auth state SHALL be cleared and protected routes SHALL not mount.

## Requirement 2: Event format compliance

**User Story:** As a developer, I need auth orchestration to follow the architecture rule that actions represent events that already happened.

### Acceptance Criteria

1. New orchestration actions SHALL be named in past-tense event format (e.g., `authContextResolved`).
2. Side effects (profile fetch, redirects, rehydration bootstrap) SHALL run in listener middleware or RTK Query lifecycle hooks, not UI components.
3. UI components SHALL only dispatch intent mutations/events and render state.
4. Auth bootstrap completion SHALL be represented as state derived from emitted events.

## Requirement 3: Token-based role and user fallback

**User Story:** As a tenant user, I need my role and identity to resolve reliably even when profile payload is partial.

### Acceptance Criteria

1. Token decoding SHALL safely parse JWT claims without app crashes on malformed tokens.
2. Role resolution SHALL support common claim locations (`role`, `roles`, `authorities`, `scope/scp`) and normalize output.
3. User fallback data MAY be derived from token claims when profile endpoint is unavailable.
4. Profile list/role context MAY be derived from token claims when available.
5. Claim-derived values SHALL never bypass token expiry validation.

## Requirement 4: Auth context resolution contract

**User Story:** As a developer, I need a single resolved auth context for downstream routing decisions.

### Acceptance Criteria

1. Auth state SHALL expose resolved values for:
   - `userProfile`
   - `profiles`
   - `currentRole`
   - `currentProfileId`
   - `bootstrapComplete`
2. Resolution precedence SHALL be deterministic:
   - server profile response
   - login response payload
   - token claims
3. On rehydrate with a valid token, bootstrap SHALL re-run when auth context is incomplete.
4. `bootstrapComplete` SHALL stay `false` until auth context resolution is finished.

## Requirement 5: Module mounter role implementation

**User Story:** As an authenticated tenant user, I need the app to mount the correct module (admin/student) only after role resolution is complete.

### Acceptance Criteria

1. Tenant host routing SHALL block module mount until auth bootstrap is complete when a token exists.
2. Module role resolution SHALL use resolved auth role first, then profile role, then token role fallback.
3. Role mapping SHALL be explicit and deny-by-default for unknown roles.
4. Unauthorized or unresolved role outcomes SHALL render unauthorized flow, not incorrect module routes.
5. Tenant claim mismatch checks SHALL continue to run before module mount.

## Requirement 6: Non-functional guardrails

**User Story:** As a team, we need this change to remain low-risk and architecture-aligned.

### Acceptance Criteria

1. Existing auth endpoint contracts SHALL not be broken.
2. Existing RTK Query base wiring SHALL remain intact.
3. Build (`npm run build`) SHALL pass after implementation.
4. Code SHALL remain feature-isolated and follow current architecture constraints from `agent.md`.
