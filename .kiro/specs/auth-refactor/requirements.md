# Requirements Document

## Introduction

The auth-refactor feature brings the existing `auth` feature into full compliance with the project's
architecture rules (defined in `agent.md`). Auth is the gateway to the entire application: login,
token lifecycle, profile resolution, and route guarding must all be correct, event-driven, and
wired exclusively through RTK Query → axiosBaseQuery → axiosInstance → backend.

The refactor keeps `authApi` as a standalone `createApi` instance (auth is a distinct security
domain with its own cache, reducerPath, and middleware — isolation is intentional). It moves all
types to `types.ts`, introduces `events.ts` with event-driven action names, relocates all side
effects out of components into `onQueryStarted` / middleware, fixes the `axiosInstance` token
source, wires `ForgotPassword` and `SignUp` to real RTK Query endpoints, cleans up `index.ts`,
and preserves all route-protection files (`withAuthGuard`, `ProtectedRoute`). Mock auth is
out of scope.

## Glossary

- **Auth_Feature**: The `src/features/auth/` module — owns all authentication and session state.
- **Auth_API**: The standalone `createApi` instance at `src/features/auth/api/auth-api.ts` — owns login, refresh, logout, forgotPassword, signUp endpoints.
- **Auth_Slice**: The Redux slice at `src/features/auth/state/auth-slice.ts` — owns client-side auth state (token, user, role, profiles).
- **Auth_Events**: The file `src/features/auth/events.ts` — exports event-driven Redux action creators.
- **Auth_Types**: The file `src/features/auth/types.ts` — exports all auth domain types.
- **Auth_Guard**: The HOC `withAuthGuard` at `src/features/auth/with-auth-guard.tsx` — wraps protected layout routes.
- **Protected_Route**: The component `ProtectedRoute` at `src/app/routing/protected-route.tsx` — handles per-route RBAC.
- **axiosInstance**: The Axios instance at `src/app/api/axiosInstance.ts` — the single HTTP client.
- **axiosBaseQuery**: The RTK Query base query at `src/app/api/axiosBaseQuery.ts` — bridges RTK Query to axiosInstance.
- **baseApi**: The single shared `createApi` instance at `src/app/api/baseApi.ts` — all feature APIs (non-auth) inject into this.
- **Token**: The JWT access token stored in Auth_Slice Redux state (not localStorage).
- **RefreshToken**: The opaque refresh token stored in Auth_Slice Redux state.
- **Store**: The Redux store at `src/app/store.ts`.

## Requirements

### Requirement 1: Keep authApi as a Standalone createApi (Auth Domain Isolation)

**User Story:** As a developer, I want `authApi` to remain a standalone `createApi` instance so
that the auth security domain has its own isolated cache, reducerPath, and middleware, separate
from the shared `baseApi` used by feature APIs.

#### Acceptance Criteria

1. THE Auth_API SHALL remain defined with `createApi` at `src/features/auth/api/auth-api.ts` with `reducerPath: "authApi"`.
2. THE Store SHALL continue to register `authApi.reducer` and `authApi.middleware` alongside `baseApi`.
3. THE Auth_API SHALL expose `login`, `refresh`, `logout`, `forgotPassword`, and `signUp` endpoints.
4. THE Auth_API SHALL use `axiosBaseQuery` as its `baseQuery` so all requests flow through the shared Axios layer.
5. WHEN the Auth_API is imported by any module, it SHALL be importable from `@/features/auth/api/auth-api` without circular dependencies.

---

### Requirement 2: Centralise Auth Types in types.ts

**User Story:** As a developer, I want all auth domain types in a dedicated `types.ts` file so
that types are not scattered inside API files and can be imported without pulling in RTK Query logic.

#### Acceptance Criteria

1. THE Auth_Types file SHALL be located at `src/features/auth/types.ts`.
2. THE Auth_Types SHALL define: `LoginRequest`, `LoginResponse`, `SignUpRequest`, `SignUpResponse`, `ForgotPasswordRequest`, `UserProfile`, `UserRole`, `SimpleUserProfile`, and `TokenResponse`.
3. THE Auth_API, Auth_Slice, and all auth components SHALL import auth domain types exclusively from `@/features/auth/types`.
4. IF a type is shared across multiple features, THEN it SHALL live in `src/shared/types/` and be re-exported from Auth_Types.

---

### Requirement 3: Introduce Event-Driven Actions via events.ts

**User Story:** As a developer, I want auth state changes expressed as past-tense events so that
other features can react to auth lifecycle changes through Redux middleware without coupling to
auth internals.

#### Acceptance Criteria

1. THE Auth_Events file SHALL be located at `src/features/auth/events.ts`.
2. THE Auth_Events SHALL export action creators: `userLoggedIn`, `userLoggedOut`, `tokenRefreshed`, `profileFetched`, and `authCleared`.
3. WHEN a login mutation succeeds, THE Auth_API `onQueryStarted` handler SHALL dispatch `userLoggedIn` with the resolved token, user, and profiles payload.
4. WHEN a logout mutation succeeds, THE Auth_API `onQueryStarted` handler SHALL dispatch `userLoggedOut`.
5. WHEN a token refresh succeeds, THE axiosBaseQuery SHALL dispatch `tokenRefreshed` with the new access token.
6. WHEN a profile fetch succeeds, THE Auth_API `onQueryStarted` handler SHALL dispatch `profileFetched` with the user profile payload.
7. WHEN auth is cleared (logout or refresh failure), THE relevant handler SHALL dispatch `authCleared`.

---

### Requirement 4: Post-Login Bootstrap — Fetch Profile and Set Global State

**User Story:** As a developer, I want the system to automatically fetch the user profile and
hydrate global app state immediately after a successful login so that all features have access
to user context without each feature needing to trigger its own bootstrap calls.

#### Acceptance Criteria

1. WHEN `userLoggedIn` is dispatched, a Redux middleware listener SHALL trigger a `getProfile` RTK Query call (or dispatch a thunk) to fetch the full user profile from the backend.
2. WHEN the profile fetch succeeds, THE Auth_Slice SHALL be updated with the full `UserProfile` and THE `profileFetched` event SHALL be dispatched.
3. WHEN the login response contains exactly one profile, THE post-login handler SHALL set `currentRole` and `currentProfileId` in Auth_Slice and navigate to the dashboard.
4. WHEN the login response contains more than one profile, THE post-login handler SHALL navigate to the role-selection route so the user can choose a profile.
5. THE Auth_Slice SHALL expose a `bootstrapComplete` boolean flag that is set to `true` once profile fetch and role resolution are done, so that the UI can gate rendering on readiness.
6. OTHER features SHALL be able to react to `userLoggedIn` and `profileFetched` events via Redux middleware listeners to perform their own initialisation (e.g. load tenant config, load permissions).

---

### Requirement 5: Move Side Effects Out of Components

**User Story:** As a developer, I want all auth side effects (navigation, state hydration, profile
fetching) handled in `onQueryStarted` or Redux middleware so that components remain pure
presentational units.

#### Acceptance Criteria

1. THE Login component SHALL call `useLoginMutation`, pass credentials on submit, and display loading/error states — it SHALL NOT contain navigation logic or Redux dispatch calls.
2. THE Auth_API `login` endpoint `onQueryStarted` handler SHALL hydrate Auth_Slice (token, refreshToken, user, profiles) upon a successful login response.
3. THE Auth_API `logout` endpoint `onQueryStarted` handler SHALL dispatch `authCleared` and trigger Redux Persist purge upon success.
4. THE `use-auth.ts` hook SHALL be refactored into a thin read-only selector hook (`useAuthState`) that exposes Auth_Slice state — it SHALL NOT own mutation logic or navigation.
5. Navigation after login/logout SHALL be handled by a Redux middleware listener reacting to `userLoggedIn` / `userLoggedOut` / `authCleared` events.

---

### Requirement 6: Fix axiosInstance Token Source

**User Story:** As a developer, I want `axiosInstance` to stop reading from `localStorage` so
that the Redux store is the single source of truth for the auth token.

#### Acceptance Criteria

1. THE axiosInstance request interceptor SHALL NOT read from `localStorage`.
2. THE axiosBaseQuery SHALL inject `Authorization: Bearer <token>` by reading `state.auth.token` from the Redux store before each request.
3. WHILE `state.auth.token` is null, THE axiosBaseQuery SHALL send requests without an `Authorization` header.
4. THE axiosBaseQuery SHALL continue to inject the `X-TENANT` header derived from the hostname on every request.

---

### Requirement 7: Preserve and Tighten Route Protection Files

**User Story:** As a developer, I want all route-protection files preserved and tightened so that
the auth gateway is robust and no guard logic is accidentally removed.

#### Acceptance Criteria

1. THE `withAuthGuard` HOC SHALL be preserved at `src/features/auth/with-auth-guard.tsx`.
2. THE `ProtectedRoute` component SHALL be preserved at `src/app/routing/protected-route.tsx`.
3. THE Auth_Guard SHALL read `token` and `isAuthenticated` from Auth_Slice via `useAppSelector` — it SHALL NOT call `useAuth()` or any RTK Query mutation hook directly.
4. WHEN `isAuthenticated` is false or `token` is absent, THE Auth_Guard SHALL redirect to the login route.
5. WHEN `token` is present but expired, THE Auth_Guard SHALL attempt a token refresh via the `refresh` mutation and SHALL redirect to login if the refresh fails.
6. THE `ProtectedRoute` component SHALL continue to handle per-route RBAC using `hasRouteReadAccess` and the user's privileges from Auth_Slice.

---

### Requirement 8: Wire ForgotPassword to RTK Query

**User Story:** As a developer, I want `ForgotPassword` wired to a real RTK Query mutation so
that the TODO stub is replaced with a compliant API call.

#### Acceptance Criteria

1. THE Auth_API SHALL expose a `forgotPassword` mutation that posts `{ email: string }` to `/auth/forgot-password`.
2. THE ForgotPassword component SHALL call `useForgotPasswordMutation` and SHALL NOT manage loading state with `useState`.
3. WHEN the mutation is loading, THE component SHALL reflect `isLoading` from the hook.
4. WHEN the mutation returns an error, THE component SHALL display the error message from the API response.
5. WHEN the mutation succeeds, THE component SHALL display the success confirmation view.

---

### Requirement 9: Wire SignUp to RTK Query

**User Story:** As a developer, I want `SignUp` wired to a real RTK Query mutation so that the
TODO stub is replaced with a compliant API call.

#### Acceptance Criteria

1. THE Auth_API SHALL expose a `signUp` mutation that posts `{ email: string; password: string }` to `/auth/register`.
2. THE SignUp component SHALL call `useSignUpMutation` and SHALL NOT manage loading state with `useState`.
3. WHEN the mutation is loading, THE component SHALL reflect `isLoading` from the hook.
4. WHEN the mutation returns an error, THE component SHALL display the error message from the API response.
5. WHEN the mutation succeeds, THE Auth_API `onQueryStarted` handler SHALL navigate to the login route.

---

### Requirement 10: Clean Up index.ts Public API

**User Story:** As a developer, I want `src/features/auth/index.ts` to export only the public
surface of the auth feature.

#### Acceptance Criteria

1. THE `index.ts` SHALL export: Auth_Slice reducer, Auth_Slice selectors, Auth_Events action creators, Auth_Types, and the Auth_Guard HOC.
2. THE `index.ts` SHALL NOT re-export Login, SignUp, or ForgotPassword as named exports — these are consumed via lazy router imports.
3. THE `index.ts` SHALL NOT export RTK Query hooks — consumers import hooks directly from `@/features/auth/api/auth-api`.

---

### Requirement 11: Token Refresh and Session Continuity

**User Story:** As a developer, I want token refresh handled consistently in `axiosBaseQuery` so
that expired tokens are transparently renewed without the user being logged out unnecessarily.

#### Acceptance Criteria

1. WHEN a request returns HTTP 401 and `state.auth.token` is expired, THE axiosBaseQuery SHALL attempt a token refresh using `state.auth.refreshToken`.
2. WHEN the refresh succeeds, THE axiosBaseQuery SHALL dispatch `tokenRefreshed`, update Auth_Slice with the new token, and retry the original request.
3. WHEN the refresh fails or `state.auth.refreshToken` is absent, THE axiosBaseQuery SHALL dispatch `authCleared` and redirect to the login route.
4. THE refresh request SHALL NOT be retried if the failing URL contains `/auth/login` or `/auth/refresh`.
5. THE Auth_API `refresh` endpoint SHALL be available for explicit refresh calls from the Auth_Guard.

---

### Requirement 12: Page Refresh — Rehydration and Session Continuity

**User Story:** As a user, I want my session to be automatically restored on page refresh so that
I don't have to log in again, and the app correctly re-validates my session before rendering
protected content.

#### Acceptance Criteria

1. WHEN the page is refreshed, `redux-persist` SHALL rehydrate the `auth` slice from `localStorage`, restoring `token`, `refreshToken`, `userProfile`, `profiles`, `currentRole`, and `currentProfileId`.
2. WHEN the `REHYDRATE` action fires, THE Auth_Slice SHALL reset `bootstrapComplete` to `false` regardless of its persisted value, so the app shell waits for a fresh profile fetch.
3. WHEN `REHYDRATE` fires and `state.auth.token` is present and not expired, THE auth-listener SHALL re-fetch the user profile to confirm the session is still valid server-side.
4. WHEN the profile re-fetch succeeds after rehydration, THE Auth_Slice SHALL set `bootstrapComplete` to `true` and the app shell SHALL render.
5. WHEN `REHYDRATE` fires and `state.auth.token` is absent or expired, THE auth-listener SHALL dispatch `authCleared` and the Auth_Guard SHALL redirect to the login route.
6. THE `axiosBaseQuery` SHALL read `state.auth.token` from the rehydrated Redux store on the first request after page load — it SHALL NOT read from `localStorage` directly.
