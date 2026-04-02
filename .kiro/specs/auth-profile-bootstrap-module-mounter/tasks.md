# Implementation Plan — auth-profile-bootstrap-module-mounter

## Task List

- [ ] 1. Add auth context event and payload type
  - Add `AuthContextResolvedPayload` to `src/features/auth/types.ts`.
  - Add `authContextResolved` event to `src/features/auth/events.ts`.
  - Ensure event naming follows past-tense format from architecture rules.

- [ ] 2. Add token claims extraction utility
  - Create `src/features/auth/utils/auth-token-claims.ts`.
  - Implement safe token decode helper.
  - Implement role extraction (`role`, `roles`, `authorities`, `scope/scp`).
  - Implement optional user/profile fallback extractors.

- [ ] 3. Update auth slice for resolved context
  - Handle `authContextResolved` in `src/features/auth/state/auth-slice.ts`.
  - Set `userProfile`, `profiles`, `currentRole`, `currentProfileId`, and `bootstrapComplete`.
  - Keep `userLoggedIn` as initial state bootstrap event (token + provisional values).

- [ ] 4. Implement bootstrap resolver in auth listener
  - In `src/features/auth/state/auth-listener.ts`, add a reusable resolver function.
  - Validate token before bootstrap and clear auth on invalid/expired token.
  - Fetch profile via `authApi.endpoints.getProfile`.
  - Merge data using precedence: profile API -> login payload -> token claims.
  - Dispatch `authContextResolved` when context resolution is complete.

- [ ] 5. Wire login and rehydrate flows to bootstrap
  - On `userLoggedIn`, run resolver before redirect.
  - Redirect to `/` after successful resolution so host router mounts by role.
  - On `REHYDRATE`, rerun resolver when token is valid but auth context is incomplete.

- [ ] 6. Update module mounter role gating
  - In `src/app/routing/host-router.tsx`, block tenant module mount while `!bootstrapComplete` when token exists.
  - Resolve module role from:
    - `currentRole`
    - `userProfile.role`
    - token role fallback
  - Keep unauthorized fallback for unresolved roles.

- [ ] 7. Verify tenant safety checks remain intact
  - Confirm tenant-claim mismatch guard still executes before module mount.
  - Confirm deny-by-default behavior for unknown or missing roles.

- [ ] 8. Validation and regression checks
  - Run `npm run build`.
  - Run targeted auth/router tests if available.
  - Confirm no changes to base RTK Query wiring beyond required auth orchestration files.

## Review Checklist

- [ ] Event names are past-tense and domain-event style.
- [ ] Side effects are in middleware/hooks, not components.
- [ ] Token fallback never bypasses token expiry checks.
- [ ] Module mounter does not mount admin/student before bootstrap completion.
- [ ] Unknown roles consistently route to unauthorized.
