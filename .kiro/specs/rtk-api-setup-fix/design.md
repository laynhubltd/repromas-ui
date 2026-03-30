# RTK API Setup Fix — Bugfix Design

## Overview

Five structural bugs prevent the RTK Query / Redux / Axios pipeline from working correctly.
The fixes are targeted and minimal: no new architecture is introduced, only the existing
architecture is wired up correctly.

1. `authApi` is a standalone `createApi` instance whose reducer and middleware are absent from the Redux store.
2. `axiosBaseQuery` calls `axios.create()` on every request instead of reusing the shared `axiosInstance`.
3. `Settings` and `AcademicStructure` components use hardcoded mock data + `useState` instead of RTK Query hooks.
4. Three settings files import types from non-existent local `./types` / `../types` paths.
5. `ApiTagTypes` is missing domain tags required by feature APIs.

---

## Glossary

- **Bug_Condition (C)**: The condition that identifies a defective code path — one of the five structural bugs described above.
- **Property (P)**: The desired runtime behavior once the bug is fixed.
- **Preservation**: Existing behaviors (auth flow, token refresh, tenant header, `baseApi` cache sharing) that must remain unchanged.
- **authApi**: The standalone `createApi` instance in `src/features/auth/auth-api.ts` that owns login/refresh/logout endpoints.
- **axiosBaseQuery**: The RTK Query base-query factory in `src/app/api/axiosBaseQuery.ts` that bridges RTK Query to Axios.
- **axiosInstance**: The shared, pre-configured Axios instance in `src/app/api/axiosInstance.ts` with base URL, Content-Type header, and auth interceptor.
- **baseApi**: The single `createApi` instance in `src/app/api/baseApi.ts`; all feature APIs use `injectEndpoints` against it.
- **ApiTagTypes**: The centralized tag enum in `src/shared/types/apiTagTypes.ts`.
- **settings-types.ts**: The canonical type definitions at `src/shared/types/settings-types.ts` (`AcademicSession`, `Semester`, `SemesterType`, `Level`, `SessionWithSemesters`).

---

## Bug Details

### Bug 1 — `authApi` not registered in Redux store

The `authApi` instance declares `reducerPath: "authApi"` and exposes three mutations, but
`src/app/store.ts` only registers `baseApi.reducer` and `baseApi.middleware`. The `authApi`
reducer and middleware are never added.

**Formal Specification:**
```
FUNCTION isBugCondition_1(store)
  INPUT: store — the configured Redux store
  OUTPUT: boolean

  RETURN NOT (store.reducers CONTAINS "authApi")
         OR NOT (store.middleware CONTAINS authApi.middleware)
END FUNCTION
```

**Examples:**
- Calling `useLoginMutation()` — RTK Query cannot find its slice in the store; cache and loading state are lost.
- Calling `useLogoutMutation()` — the mutation fires but the result is never tracked.

---

### Bug 2 — `axiosBaseQuery` creates a new Axios instance per request

Inside the returned `BaseQueryFn`, the current code does:
```ts
const axiosInstance = axios.create({ baseURL: baseUrl });
```
This creates a fresh, interceptor-free Axios instance on every call, bypassing the shared
`axiosInstance` interceptors (auth token injection, `Content-Type` header).

**Formal Specification:**
```
FUNCTION isBugCondition_2(request)
  INPUT: request — any RTK Query endpoint invocation
  OUTPUT: boolean

  RETURN axiosBaseQuery CREATES new axios instance per request
         AND shared axiosInstance interceptors NOT applied
END FUNCTION
```

**Examples:**
- `GET /api/staff` — `Authorization` header is absent because the per-request instance has no interceptor.
- `POST /api/auth/login` — `Content-Type: application/json` may be missing.

---

### Bug 3 — Settings and AcademicStructure use mock data instead of RTK Query

`Settings.tsx` initialises sessions, semesters, semester types, and levels from hardcoded
arrays via `useState`. `AcademicStructure.tsx` calls `getMockStats()` and `mockHierarchy`
from `utils/mock-data.ts`. Neither component fetches from the backend.

**Formal Specification:**
```
FUNCTION isBugCondition_3(component)
  INPUT: component — Settings or AcademicStructure React component
  OUTPUT: boolean

  RETURN component USES useState WITH hardcoded mock arrays
         OR component CALLS getMockStats() / mockHierarchy
         AND NOT component CALLS any RTK Query hook
END FUNCTION
```

**Examples:**
- Settings page always shows the same two mock sessions regardless of backend data.
- AcademicStructure always shows 3 faculties / 9 departments from `mock-data.ts`.

---

### Bug 4 — Broken type imports in settings files

Three files import from paths that do not exist:

| File | Broken import |
|------|--------------|
| `src/features/settings/utils/mock-session-config.ts` | `./types` |
| `src/features/settings/components/Settings.tsx` | `./types` |
| `src/features/settings/components/session-config/SessionConfigTab.tsx` | `../types` |

The canonical types live in `src/shared/types/settings-types.ts`.

**Formal Specification:**
```
FUNCTION isBugCondition_4(file)
  INPUT: file — one of the three settings source files
  OUTPUT: boolean

  RETURN file IMPORTS FROM "./types" OR "../types"
         AND resolved path DOES NOT EXIST on disk
END FUNCTION
```

**Examples:**
- `tsc` / Vite build fails with `Cannot find module './types'` in `mock-session-config.ts`.
- `SessionConfigTab.tsx` fails to compile because `../types` resolves to the empty `settings/types/` folder.

---

### Bug 5 — `ApiTagTypes` missing domain tags

`src/shared/types/apiTagTypes.ts` only declares `Auth` and `User`. Feature APIs that need
`Session`, `Semester`, `SemesterType`, `Level`, or `AcademicStructure` tags cannot reference
them, so cache invalidation cannot be wired up.

**Formal Specification:**
```
FUNCTION isBugCondition_5(tagName)
  INPUT: tagName — a domain tag required by a feature API
  OUTPUT: boolean

  RETURN tagName IN ["Session", "Semester", "SemesterType", "Level", "AcademicStructure"]
         AND tagName NOT IN ApiTagTypes
END FUNCTION
```

**Examples:**
- A settings API endpoint tries to `providesTags: [ApiTagTypes.Session]` — TypeScript error, tag does not exist.
- Cache invalidation for academic structure mutations cannot be declared.

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Login with valid credentials stores `accessToken` + `refreshToken` in the `auth` Redux slice and navigates to the dashboard.
- Expired-token retry logic in `axiosBaseQuery` (the `401` + `isTokenExpired` branch) continues to refresh and re-dispatch the original request.
- `clearAuth` dispatch wipes auth state and redirects to the login page.
- `withAuthGuard` continues to check token validity and redirect unauthenticated users.
- `baseApi` (reducerPath `"api"`) remains the single shared cache; all feature APIs continue to use `injectEndpoints`.
- The `X-TENANT` header derivation in `axiosBaseQuery` continues to attach the tenant to every outgoing request.
- The `prepareHeaders` function in `axiosBaseQuery` continues to inject `Authorization` for non-blacklisted paths.

**Scope:**
All code paths that do NOT involve the five bug conditions above must be completely unaffected.
This includes: all existing `baseApi`-injected endpoints, the auth slice reducers, routing guards,
and any component that already uses RTK Query hooks correctly.

---

## Hypothesized Root Cause

1. **Bug 1 — Incomplete store wiring**: `authApi` was added as a standalone `createApi` instance (possibly before the decision to use `injectEndpoints` everywhere) but the store registration step was never completed.

2. **Bug 2 — Scoping mistake in `axiosBaseQuery`**: The `axiosInstance` import from `./axiosInstance` was either removed or never added; instead `axios.create()` was called inline inside the query function, which runs on every request.

3. **Bug 3 — UI-first scaffolding left in place**: Components were built with mock data for rapid UI development and the RTK Query wiring step was deferred but never completed.

4. **Bug 4 — Stale local type re-exports**: Types were originally defined locally (`features/settings/types.ts` or similar), then moved to `src/shared/types/settings-types.ts`, but the import paths in the three affected files were never updated.

5. **Bug 5 — Incremental enum growth not followed**: `ApiTagTypes` was seeded with only `Auth` and `User` at project start; as new feature domains were added, the enum was not extended.

---

## Correctness Properties

Property 1: Bug Condition — Store Registration

_For any_ Redux store initialisation where `authApi` endpoints are invoked, the fixed store
SHALL include `authApi.reducer` mounted at `authApi.reducerPath` and `authApi.middleware`
appended to the middleware chain, so that cache, loading, and error state are managed correctly.

**Validates: Requirements 2.1**

Property 2: Bug Condition — Shared Axios Instance

_For any_ RTK Query endpoint request routed through `axiosBaseQuery`, the fixed implementation
SHALL use the shared `axiosInstance` (not a new `axios.create()`) so that all configured
interceptors (auth token, `Content-Type`) are applied to every outgoing request.

**Validates: Requirements 2.2**

Property 3: Bug Condition — Settings Live Data

_For any_ render of the `Settings` page, the fixed component SHALL derive sessions, semesters,
semester types, and levels from RTK Query hooks (not `useState` with hardcoded arrays), displaying
live server data with RTK Query-managed loading and error states.

**Validates: Requirements 2.3**

Property 4: Bug Condition — AcademicStructure Live Data

_For any_ render of the `AcademicStructure` page, the fixed component SHALL derive faculty,
department, and program data from RTK Query hooks (not `getMockStats()` / `mockHierarchy`),
displaying live server data with RTK Query-managed loading and error states.

**Validates: Requirements 2.4**

Property 5: Bug Condition — Type Import Resolution

_For any_ TypeScript compilation of `mock-session-config.ts`, `Settings.tsx`, or
`SessionConfigTab.tsx`, the fixed imports SHALL resolve to `@/shared/types/settings-types`
and compile without module-not-found errors.

**Validates: Requirements 2.5**

Property 6: Bug Condition — Complete ApiTagTypes

_For any_ feature API that declares `providesTags` or `invalidatesTags` using
`Session`, `Semester`, `SemesterType`, `Level`, or `AcademicStructure`, the fixed
`ApiTagTypes` enum SHALL contain those tags so that TypeScript resolves them and
`baseApi.tagTypes` registers them.

**Validates: Requirements 2.6**

Property 7: Preservation — Auth Flow and Existing Behaviors

_For any_ input that does NOT involve the five bug conditions (e.g. login flow, token refresh,
`clearAuth`, `withAuthGuard`, existing `baseApi` endpoints, `X-TENANT` header), the fixed code
SHALL produce exactly the same behavior as the original code, preserving all existing functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

---

## Fix Implementation

### Bug 1 — Register `authApi` in the Redux store

**File**: `src/app/store.ts`

**Changes**:
1. Import `authApi` from `@/features/auth/auth-api`.
2. Add `[authApi.reducerPath]: authApi.reducer` to `combineReducers`.
3. Append `authApi.middleware` to the middleware chain after `baseApi.middleware`.

```ts
// combineReducers
{
  [baseApi.reducerPath]: baseApi.reducer,
  [authApi.reducerPath]: authApi.reducer,   // ADD
  auth: authReducer,
}

// middleware
.concat(baseApi.middleware, authApi.middleware)  // ADD authApi.middleware
```

---

### Bug 2 — Reuse `axiosInstance` in `axiosBaseQuery`

**File**: `src/app/api/axiosBaseQuery.ts`

**Changes**:
1. Import `axiosInstance` from `./axiosInstance`.
2. Remove the `const axiosInstance = axios.create({ baseURL: baseUrl })` line inside the query function.
3. Use the imported `axiosInstance` for all requests (initial request, token-refresh retry, and the retry after refresh).
4. Keep the `baseUrl` option parameter for backward compatibility but stop using it to create a new instance.

Note: The token-refresh call uses a raw `axios.post` (not `axiosInstance`) intentionally — that call targets the refresh endpoint directly and must not go through the auth interceptor. That behavior is preserved.

---

### Bug 3 — Wire Settings to RTK Query

**Files**:
- `src/features/settings/api/settingsApi.ts` (new file — `injectEndpoints` into `baseApi`)
- `src/features/settings/components/Settings.tsx` (replace mock state with RTK Query hooks)

**Changes**:
1. Create `src/features/settings/api/settingsApi.ts` with endpoints:
   - `getSessions` → `GET /api/academic/sessions`
   - `getSemesterTypes` → `GET /api/academic/semester-types`
   - `getLevels` → `GET /api/academic/levels`
   - `createSession` mutation → `POST /api/academic/sessions`
   - `createSemester` mutation → `POST /api/academic/semesters`
   - Tag types: `Session`, `Semester`, `SemesterType`, `Level`
2. In `Settings.tsx`, replace `useState(mockSessions)` etc. with the generated hooks.
3. Remove imports of `mockSessions`, `mockSemesters`, `mockSemesterTypes` from `mock-session-config`.
4. Pass `isLoading` flags from RTK Query to `SessionConfigTab` props (`sessionsLoading`, `semesterTypesLoading`).

---

### Bug 4 — Fix broken type imports

**Files**:
- `src/features/settings/utils/mock-session-config.ts`
- `src/features/settings/components/Settings.tsx`
- `src/features/settings/components/session-config/SessionConfigTab.tsx`

**Change**: Replace every import from `./types` or `../types` with `@/shared/types/settings-types`.

```ts
// Before
import type { AcademicSession, Semester, SemesterType, SessionWithSemesters } from "./types";
// After
import type { AcademicSession, Semester, SemesterType, SessionWithSemesters } from "@/shared/types/settings-types";
```

---

### Bug 5 — Extend `ApiTagTypes`

**File**: `src/shared/types/apiTagTypes.ts`

**Change**: Add the five missing domain tags.

```ts
export const ApiTagTypes = {
  Auth: "Auth",
  User: "User",
  Session: "Session",
  Semester: "Semester",
  SemesterType: "SemesterType",
  Level: "Level",
  AcademicStructure: "AcademicStructure",
} as const;
```

---

### Bug 3b — Wire AcademicStructure to RTK Query

**Files**:
- `src/features/academic-structure/api/academicStructureApi.ts` (new file)
- `src/features/academic-structure/components/AcademicStructure.tsx`

**Changes**:
1. Create `academicStructureApi.ts` with endpoints:
   - `getFaculties` → `GET /api/academic/faculties` (with nested departments and programs)
   - `createFaculty` mutation → `POST /api/academic/faculties`
   - Tag type: `AcademicStructure`
2. In `AcademicStructure.tsx`, replace `getMockStats()` and `mockHierarchy` with RTK Query hook data.
3. Derive stats (totalFaculties, totalDepartments, activePrograms) from the fetched data.

---

## Testing Strategy

### Validation Approach

Two-phase approach: first run exploratory tests on unfixed code to confirm the root cause,
then run fix-checking and preservation tests on the fixed code.

---

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate each bug on the unfixed code.

**Test Plan**: Write unit/integration tests that exercise each bug condition and assert the
correct behavior. Run on unfixed code to observe failures and confirm root cause.

**Test Cases**:

1. **Store registration test** (Bug 1): Dispatch `useLoginMutation` and assert that
   `store.getState().authApi` is defined and contains the expected cache entry.
   Will fail on unfixed code — `authApi` key is absent from state.

2. **Axios instance test** (Bug 2): Spy on `axiosInstance` and assert it is called when
   `axiosBaseQuery` executes a request. Will fail on unfixed code — a new instance is created instead.

3. **Settings mock data test** (Bug 3): Render `<Settings />` and assert that an RTK Query
   hook (`useGetSessionsQuery`) is invoked. Will fail on unfixed code — only `useState` is used.

4. **AcademicStructure mock data test** (Bug 3b): Render `<AcademicStructure />` and assert
   that `getMockStats` is NOT called. Will fail on unfixed code.

5. **Type import compilation test** (Bug 4): Run `tsc --noEmit` and assert zero errors in
   `mock-session-config.ts`, `Settings.tsx`, `SessionConfigTab.tsx`. Will fail on unfixed code.

6. **ApiTagTypes completeness test** (Bug 5): Assert that `ApiTagTypes.Session`,
   `ApiTagTypes.Semester`, `ApiTagTypes.SemesterType`, `ApiTagTypes.Level`,
   `ApiTagTypes.AcademicStructure` are all defined strings. Will fail on unfixed code.

**Expected Counterexamples**:
- `store.getState().authApi` is `undefined` (Bug 1)
- `axiosInstance` spy is never called (Bug 2)
- `Cannot find module './types'` TypeScript error (Bug 4)
- `ApiTagTypes.Session` is `undefined` (Bug 5)

---

### Fix Checking

**Goal**: Verify that for all inputs where each bug condition holds, the fixed code produces the expected behavior.

**Pseudocode:**
```
FOR ALL bug IN [Bug1, Bug2, Bug3, Bug3b, Bug4, Bug5] DO
  result := fixedCode(bugConditionInput(bug))
  ASSERT expectedBehavior(bug, result)
END FOR
```

**Test Cases**:
1. After fix: `store.getState().authApi` is defined; `useLoginMutation` loading/data states are tracked.
2. After fix: `axiosInstance` spy is called for every `axiosBaseQuery` request.
3. After fix: `Settings` renders with RTK Query hook data; mock arrays are not referenced.
4. After fix: `AcademicStructure` renders with hook data; `getMockStats` is not called.
5. After fix: `tsc --noEmit` reports zero errors in the three settings files.
6. After fix: All five new `ApiTagTypes` values are defined and present in `baseApi.tagTypes`.

---

### Preservation Checking

**Goal**: Verify that for all inputs where the bug conditions do NOT hold, the fixed code produces the same result as the original.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalCode(input) = fixedCode(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because
it generates many inputs automatically and catches edge cases that manual tests miss.

**Test Cases**:
1. **Auth flow preservation**: Login → token stored in `auth` slice → dashboard navigation.
2. **Token refresh preservation**: 401 response with expired token → refresh → retry → success.
3. **clearAuth preservation**: `clearAuth` dispatch → auth state wiped → redirect to login.
4. **withAuthGuard preservation**: Unauthenticated route access → redirect to login.
5. **baseApi cache sharing preservation**: Feature endpoints injected via `injectEndpoints` continue to share the `"api"` cache.
6. **X-TENANT header preservation**: Tenant derived from hostname and attached to every request.

---

### Unit Tests

- Test that `store.getState()` contains both `api` and `authApi` keys after store initialisation.
- Test that `axiosBaseQuery` calls `axiosInstance` (not `axios.create`) for GET, POST, PUT, DELETE.
- Test that `ApiTagTypes` contains all seven expected values.
- Test that type imports in the three settings files resolve without errors (`tsc --noEmit`).

### Property-Based Tests

- Generate random valid/invalid auth states and verify `withAuthGuard` redirect behavior is unchanged.
- Generate random request configs and verify `axiosBaseQuery` always routes through `axiosInstance`.
- Generate random `ApiTagTypes` lookups and verify no undefined values are returned.

### Integration Tests

- Full login flow: form submit → `useLoginMutation` → token in store → dashboard.
- Settings page: mount with MSW mock server → RTK Query fetches sessions/semesters/levels → data displayed.
- AcademicStructure page: mount with MSW mock server → RTK Query fetches faculties → hierarchy displayed.
- Cache invalidation: create session mutation → `Session` tag invalidated → sessions list refetched.
