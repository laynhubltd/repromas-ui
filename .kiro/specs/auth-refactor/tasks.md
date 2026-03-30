# Implementation Plan: auth-refactor

## Overview

Refactor `src/features/auth/` into full compliance with the project architecture rules (agent.md).
Tasks are ordered so each step is independently deployable without breaking the running app.
Foundation types and events come first, then slice, then API, then middleware, then infrastructure
fixes, then components, then cleanup.

Tests (PBT exploration + preservation) are written before any implementation so failures confirm
bugs exist and passes confirm preservation. fast-check is used for property-based tests.

## Tasks

- [x] 1. Write bug-condition exploration tests (BEFORE any implementation)
  - Populate `src/__tests__/bug-condition-exploration.test.tsx` with fast-check property tests
    that FAIL on the current unfixed code, confirming each bug exists before any fix is applied
  - [x] 1.1 Write Property 1 — login hydrates slice and dispatches userLoggedIn
    - Use `fc.record({ token: fc.string(), user: fc.option(...), profiles: fc.array(...) })` to
      generate arbitrary `LoginResponse` values; assert `state.auth.token === response.token`
      and `isAuthenticated === true` after the reducer handles `userLoggedIn`
    - Tag: `// Feature: auth-refactor, Property 1: Login handler hydrates slice`
    - _Requirements: 3.3, 5.2_
  - [ ]* 1.2 Write Property 5 — bootstrapComplete transitions correctly
    - Generate arbitrary `LoginResponse`; dispatch `userLoggedIn` then `profileFetched`;
      assert `bootstrapComplete` is `false` after `userLoggedIn` and `true` after `profileFetched`
    - Tag: `// Feature: auth-refactor, Property 5: bootstrapComplete transitions`
    - _Requirements: 4.5_
  - [ ]* 1.3 Write Property 6 — profileFetched updates slice
    - Use `fc.record({ id: fc.string(), email: fc.emailAddress(), ... })` for arbitrary
      `UserProfile`; dispatch `profileFetched`; assert `state.auth.userProfile` equals input
      and `bootstrapComplete === true`
    - Tag: `// Feature: auth-refactor, Property 6: Profile fetch updates slice`
    - _Requirements: 4.2_
  - [ ]* 1.4 Write Property 12 — bootstrapComplete resets on REHYDRATE
    - Generate arbitrary persisted `AuthState` with `bootstrapComplete: true`; dispatch
      `REHYDRATE` action with that payload; assert `bootstrapComplete === false` in resulting state
    - Tag: `// Feature: auth-refactor, Property 12: bootstrapComplete resets on REHYDRATE`
    - _Requirements: 4.5, 12.1, 12.2_

- [x] 2. Write preservation property tests (BEFORE any implementation)
  - Populate `src/__tests__/preservation.test.tsx` with fast-check property tests that MUST
    PASS on the current code, confirming baseline behaviors are preserved after the refactor
  - [x] 2.1 Write Property 2 — token injection from store
    - Use `fc.option(fc.string({ minLength: 1 }))` for arbitrary token values; for each value
      assert that `axiosBaseQuery` includes `Authorization: Bearer <token>` when token is
      non-null and omits the header when token is null
    - Tag: `// Feature: auth-refactor, Property 2: Token injection from store`
    - _Requirements: 6.2, 6.3_
  - [ ]* 2.2 Write Property 3 — X-TENANT header on every request
    - Use `fc.domain()` filtered to multi-part hostnames; assert `X-TENANT` header is present
      and equals the extracted subdomain on every request regardless of auth state
    - Tag: `// Feature: auth-refactor, Property 3: X-TENANT header on every request`
    - _Requirements: 6.4_
  - [ ]* 2.3 Write Property 4 — navigation routing by profile count
    - Use `fc.array(fc.record({ profileId: fc.string(), ... }), { minLength: 1 })` to generate
      login responses with 1 or N profiles; assert listener navigates to dashboard for exactly
      one profile and to role-selection for more than one
    - Tag: `// Feature: auth-refactor, Property 4: Navigation routing by profile count`
    - _Requirements: 4.3, 4.4_
  - [ ]* 2.4 Write Property 7 — auth guard redirects unauthenticated users
    - Use `fc.record({ isAuthenticated: fc.constant(false), token: fc.constant(null), ... })`
      for arbitrary unauthenticated `AuthState`; render `withAuthGuard`-wrapped component;
      assert `<Navigate to="/auth/login" />` is rendered
    - Tag: `// Feature: auth-refactor, Property 7: Auth guard redirects unauthenticated`
    - _Requirements: 7.4_
  - [ ]* 2.5 Write Property 9 — token refresh on 401 with expired token
    - Use `fc.string()` for arbitrary refresh tokens; mock a 401 response with an expired
      access token; assert `tokenRefreshed` is dispatched and original request is retried on
      refresh success; assert `authCleared` is dispatched and redirect fires on refresh failure
    - Tag: `// Feature: auth-refactor, Property 9: Token refresh on 401`
    - _Requirements: 11.1, 11.2, 11.3_
  - [ ]* 2.6 Write Property 10 — blacklisted paths are never retried
    - Use `fc.constantFrom("/auth/login", "/auth/refresh")` combined with `fc.string()` for
      path suffixes; assert no refresh attempt is made when the failing URL contains a
      blacklisted segment, even on 401
    - Tag: `// Feature: auth-refactor, Property 10: Blacklisted paths not retried`
    - _Requirements: 11.4_
  - [ ]* 2.7 Write Property 11 — error messages propagate to components
    - Use `fc.record({ message: fc.string({ minLength: 1 }), status: fc.integer() })` for
      arbitrary `ApiErrorResponse`; render `ForgotPassword` and `SignUp` with the mutation
      hook returning that error; assert the `message` field is visible in the rendered output
    - Tag: `// Feature: auth-refactor, Property 11: Error messages propagate`
    - _Requirements: 8.4, 9.4_
  - [ ]* 2.8 Write Property 8 — RBAC access control
    - Use `fc.string()` for route paths and `fc.array(fc.string())` for privilege sets; assert
      `ProtectedRoute` allows access if and only if `hasRouteReadAccess` returns `true` for
      that path and privilege set
    - Tag: `// Feature: auth-refactor, Property 8: RBAC access control`
    - _Requirements: 7.6_

- [x] 3. Create `src/features/auth/types.ts`
  - Define and export all auth domain types: `LoginRequest`, `LoginResponse`, `SignUpRequest`,
    `SignUpResponse`, `ForgotPasswordRequest`, `UserProfile`, `UserRole`, `SimpleUserProfile`,
    `TokenResponse`
  - Remove type definitions from `src/features/auth/auth-api.ts` (they will be imported from
    `types.ts` once the API file is moved in task 6)
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 4. Create `src/features/auth/events.ts`
  - Use `createAction` from `@reduxjs/toolkit` to define: `userLoggedIn` (payload: `LoginResponse`),
    `userLoggedOut`, `tokenRefreshed` (payload: `TokenResponse`), `profileFetched`
    (payload: `UserProfile`), `authCleared`
  - Import all payload types from `./types`
  - _Requirements: 3.1, 3.2_

- [x] 5. Update `src/features/auth/state/auth-slice.ts`
  - Add `bootstrapComplete: boolean` to `AuthState` interface (default `false` in `initialState`)
  - Import event action creators from `../events` and `REHYDRATE` from `redux-persist`
  - Add `extraReducers` block wiring: `userLoggedIn` → hydrate token/user/profiles,
    set `bootstrapComplete: false`; `profileFetched` → set `userProfile`, `bootstrapComplete: true`;
    `tokenRefreshed` → update token fields; `authCleared` → reset to `initialState`;
    `userLoggedOut` → reset to `initialState`; `REHYDRATE` → restore persisted auth state
    with `bootstrapComplete` forced to `false`
  - Keep all existing slice reducers (`setToken`, `clearAuth`, `setAuthState`, etc.) intact so
    existing callers are not broken
  - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 4.5, 12.2_

- [x] 6. Move and refactor auth-api to `src/features/auth/api/auth-api.ts`
  - Create `src/features/auth/api/` directory and new `auth-api.ts` file
  - Keep `createApi` with `reducerPath: "authApi"` and `axiosBaseQuery` as `baseQuery`
  - Import all types from `../types` (not defined inline)
  - Add `forgotPassword` mutation: POST `/auth/forgot-password` with `ForgotPasswordRequest`
    payload, returning `{ message?: string }`
  - Add `signUp` mutation: POST `/auth/register` with `SignUpRequest` payload, returning
    `SignUpResponse`
  - Add `onQueryStarted` to `login` endpoint: on success dispatch `userLoggedIn` with the
    full `LoginResponse` payload
  - Add `onQueryStarted` to `logout` endpoint: on success dispatch `userLoggedOut` and
    `authCleared`, then call `persistor.purge()`
  - Add `onQueryStarted` to `signUp` endpoint: on success navigate to login route
  - Keep `refresh` and `logout` endpoints; export all hooks including
    `useForgotPasswordMutation` and `useSignUpMutation`
  - Do NOT delete the old `src/features/auth/auth-api.ts` yet (deleted in task 16)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.3, 3.4, 3.6, 8.1, 9.1_

- [x] 7. Create `src/features/auth/state/auth-listener.ts`
  - Use `createListenerMiddleware` from `@reduxjs/toolkit`
  - Register listener on `userLoggedIn`: dispatch a `getProfile` RTK Query call (or thunk);
    on success dispatch `profileFetched`; if single profile set `currentRole` +
    `currentProfileId` and navigate to dashboard; if multiple profiles navigate to
    role-selection; on failure dispatch `authCleared`
  - Register listener on `REHYDRATE` (from `redux-persist`): read `state.auth.token`; if
    token is present and not expired re-fetch profile (dispatch `profileFetched` on success,
    `authCleared` on failure); if token is absent or expired dispatch `authCleared`
  - Export `authListenerMiddleware`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 12.3, 12.4, 12.5_

- [x] 8. Update `src/app/store.ts`
  - Import `authListenerMiddleware` from `@/features/auth/state/auth-listener`
  - Update `authApi` import path to `@/features/auth/api/auth-api`
  - Add `authListenerMiddleware.middleware` to the middleware chain (after `baseApi.middleware`
    and `authApi.middleware`)
  - Keep all existing reducers and persist config unchanged
  - _Requirements: 1.2, 4.1_

- [x] 9. Fix `src/app/api/axiosInstance.ts`
  - Remove the `localStorage.getItem("token")` request interceptor block entirely
  - Keep the `axios.create` call with `baseURL` and `Content-Type` header
  - Token injection is now handled exclusively by `axiosBaseQuery` reading from Redux state
  - _Requirements: 6.1_

- [x] 10. Refactor `src/features/auth/use-auth.ts` → `src/features/auth/use-auth-state.ts`
  - Create new file `use-auth-state.ts` exporting `useAuthState` as default
  - `useAuthState` reads only from `useAppSelector(state => state.auth)` — no dispatch,
    no mutation hooks, no navigation
  - Expose: `token`, `refreshToken`, `isAuthenticated`, `userProfile`, `profiles`,
    `currentRole`, `currentProfileId`, `bootstrapComplete`
  - Do NOT delete `use-auth.ts` yet (deleted in task 16); update `protected-route.tsx` to
    import from `use-auth-state` if it currently imports from `use-auth`
  - _Requirements: 5.4_

- [x] 11. Update `src/features/auth/with-auth-guard.tsx`
  - Replace `useAuth()` call with `useAppSelector(state => state.auth)` to read `token`
    and `isAuthenticated`
  - Replace the `tryRefreshToken` callback with a direct call to
    `authApi.useRefreshMutation()` from `@/features/auth/api/auth-api`
  - Keep the existing guard logic: check token presence, attempt refresh if expired,
    redirect to login on failure, render wrapped component on success
  - Do NOT import `useAuth` or `useAuthSlice`
  - _Requirements: 7.1, 7.3, 7.4, 7.5_

- [x] 12. Update `src/features/auth/components/Login.tsx`
  - Remove `useAuth()` import and usage
  - Import `useLoginMutation` directly from `@/features/auth/api/auth-api`
  - Call `useLoginMutation`; pass credentials on submit via `login(values).unwrap()`
  - Remove all `useState` for loading — use `isLoading` from the mutation hook
  - Display errors using `isError` and `error` from the hook (no `try/catch` in component)
  - Remove all navigation logic — navigation is handled by `auth-listener`
  - _Requirements: 5.1, 5.2_

- [x] 13. Update `src/features/auth/components/SignUp.tsx`
  - Import `useSignUpMutation` from `@/features/auth/api/auth-api`
  - Replace the `useState(false)` loading + `setTimeout` stub with `useSignUpMutation`
  - Use `isLoading` from the hook for the button loading state
  - Display errors using `isError` and `error` from the hook
  - Remove `window.location.href` navigation — handled by `onQueryStarted` in the API
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 14. Update `src/features/auth/components/ForgotPassword.tsx`
  - Import `useForgotPasswordMutation` from `@/features/auth/api/auth-api`
  - Replace the `useState(false)` loading + `setTimeout` stub with `useForgotPasswordMutation`
  - Use `isLoading` from the hook for the button loading state
  - Use `isSuccess` from the hook to show the success confirmation view (remove `useState` for
    `success`)
  - Display errors using `isError` and `error` from the hook
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 15. Clean up `src/features/auth/index.ts`
  - Export: `authReducer` and `AuthState` from `./state/auth-slice`; all slice action
    creators from `./state/auth-slice`; all events from `./events`; all types from `./types`;
    `withAuthGuard` from `./with-auth-guard`
  - Remove exports of `Login`, `SignUp`, `ForgotPassword` (consumed via lazy router imports)
  - Remove any RTK Query hook re-exports (hooks imported directly from
    `@/features/auth/api/auth-api`)
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 16. Delete old files
  - Delete `src/features/auth/auth-api.ts` (replaced by `src/features/auth/api/auth-api.ts`)
  - Delete `src/features/auth/use-auth.ts` (replaced by `use-auth-state.ts`)
  - Delete `src/features/auth/use-auth-slice.ts` (dispatch wrappers moved to `onQueryStarted`
    and listener)
  - Update any remaining imports across the codebase that still reference the deleted files
    (e.g. `protected-route.tsx` if it imports `useAuth`)
  - Do NOT touch `mock-auth.ts` — out of scope
  - _Requirements: 5.4_

- [x] 17. Final checkpoint — run all tests and type-check
  - Ensure all tests pass, ask the user if questions arise.
  - Run `npx vitest --run` and confirm zero failures
  - Run `npx tsc --noEmit` and confirm zero type errors
  - Verify `protected-route.tsx` and `with-auth-guard.tsx` are both present and unmodified
    (except the `useAuth` → `useAppSelector` change in the guard)
  - _Requirements: all_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Tasks 1 and 2 must run before any implementation — failing tests confirm bugs exist
- Tasks 3–5 are pure additions (no deletions) so the app stays runnable throughout
- Task 16 (deletions) is last to avoid breaking imports during intermediate steps
- `mock-auth.ts` is never touched — it is explicitly out of scope
- `protected-route.tsx` is preserved as-is (only its `useAuth` import may be updated to
  `useAuthState` in task 10 if needed)
- `authApi` stays as a standalone `createApi` — never migrated to `injectEndpoints`
- fast-check minimum 100 iterations per property test
