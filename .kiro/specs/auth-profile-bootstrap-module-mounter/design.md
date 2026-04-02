# Design Document — auth-profile-bootstrap-module-mounter

## Overview

This design restores the reverted auth bootstrap work using event-driven orchestration while preserving existing auth API contracts and RTK Query infrastructure.

Primary objective:

- Ensure module mounting on tenant hosts happens only after auth context is fully resolved from profile API + token/login fallbacks.

## Design Goals

1. Keep side effects out of UI components.
2. Use past-tense events for state transitions.
3. Resolve auth context deterministically.
4. Prevent incorrect module mounts during bootstrap race conditions.
5. Maintain deny-by-default behavior for unknown roles.

## Current Gaps Addressed

1. Login event currently redirects before profile bootstrap guarantees complete auth context.
2. Module mounter can run with partial role data, causing unauthorized/misrouted outcomes.
3. Token claims are not used as structured fallback for role/user context.

## Proposed Architecture

### 1) Event additions

Add new event in `src/features/auth/events.ts`:

- `authContextResolved` (payload includes fully resolved auth context)

Event naming remains compliant with `agent.md` event format rule.

### 2) Auth state contract

Update `src/features/auth/state/auth-slice.ts` to consume `authContextResolved` and set:

- `userProfile`
- `profiles`
- `currentRole`
- `currentProfileId`
- `bootstrapComplete = true`

`userLoggedIn` keeps token/bootstrap initialization but does not represent final resolved context.

### 3) Bootstrap orchestration in listener middleware

In `src/features/auth/state/auth-listener.ts`:

- On `userLoggedIn`:
  1. validate token (existence + expiry)
  2. call `authApi.endpoints.getProfile`
  3. resolve merged auth context using precedence rules
  4. dispatch `authContextResolved`
  5. persist flush and redirect to root route (`/`) to allow host router module selection

- On `REHYDRATE`:
  1. clear auth when token invalid
  2. if token valid but context incomplete (`!bootstrapComplete` or missing role/profile), rerun bootstrap resolver

### 4) Token claims utility

Create token utility in `src/features/auth/utils/auth-token-claims.ts`:

Capabilities:

- decode token safely (no runtime throw)
- extract role names from multiple claim keys
- extract primary role fallback
- extract user fallback fields where present
- optionally extract lightweight profile list claims

This utility does not replace server profile response; it fills fallback gaps.

### 5) Auth context resolution algorithm

Deterministic precedence:

1. `profile API` response
2. `login response` payload
3. `token claims`

Resolution outputs:

- `userProfile`
- `profiles`
- `currentProfileId`
- `currentRole`

Rules:

- Keep existing selected `currentProfileId` if still valid in resolved profiles.
- Otherwise choose first available profile.
- `currentRole` resolves from user profile role, then selected profile role, then token role fallback.
- If no role resolves, keep `currentRole = null` and rely on deny-by-default router behavior.

### 6) Module mounter integration

In `src/app/routing/host-router.tsx`:

- if tenant + token + `!bootstrapComplete`: render loading shell (`Loading profile...`)
- module role resolution order:
  1. `auth.currentRole?.name`
  2. `auth.userProfile?.role?.name`
  3. token role fallback
- map to module role (`admin` or `student`) via existing resolver
- unresolved roles route to unauthorized

This prevents mounting wrong module during startup races.

## Data Flow

1. Login mutation succeeds -> `userLoggedIn` event.
2. Listener bootstraps profile + token fallback context.
3. Listener dispatches `authContextResolved`.
4. Auth slice marks bootstrap complete.
5. Host router reads resolved role and mounts `admin` or `student` module.

## Failure and Safety Behavior

1. Invalid/expired token -> dispatch `authCleared` and prevent protected mount.
2. Profile fetch failure -> fallback to login/token claims while preserving deny-by-default.
3. Unknown role -> unauthorized route.
4. Tenant mismatch checks remain unchanged and continue to gate module mount.

## Affected Files

- `src/features/auth/events.ts`
- `src/features/auth/types.ts`
- `src/features/auth/state/auth-slice.ts`
- `src/features/auth/state/auth-listener.ts`
- `src/features/auth/utils/auth-token-claims.ts` (new)
- `src/app/routing/host-router.tsx`

## Out of Scope

1. Changing backend auth contracts.
2. Refactoring RTK Query base API wiring.
3. Introducing multi-profile selection UI.
4. Large router architecture rewrites beyond module mounter gating.
