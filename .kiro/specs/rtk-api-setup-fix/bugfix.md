# Bugfix Requirements Document

## Introduction

This document covers all bugs found across the RTK Query, Redux Toolkit, Axios, and app API setup in the feature codebase. The issues span five distinct problem areas:

1. `authApi` is a standalone `createApi` instance that is never registered in the Redux store — its reducer and middleware are absent, causing cache, loading state, and subscription management to silently fail.
2. `axiosBaseQuery` creates a brand-new `axios.create()` instance on every single request instead of reusing the shared `axiosInstance`, bypassing all interceptors configured there (token injection, headers).
3. `Settings` and `AcademicStructure` feature components use hardcoded mock data and local `useState` instead of RTK Query hooks, violating the server-state rule and leaving the UI permanently disconnected from the backend.
4. Multiple files import types from non-existent local `./types` paths (`src/features/settings/utils/mock-session-config.ts` → `./types`, `src/features/settings/components/Settings.tsx` → `./types`, `src/features/settings/components/session-config/SessionConfigTab.tsx` → `../types`) when the canonical definitions live in `src/shared/types/settings-types.ts`.
5. `ApiTagTypes` in `src/shared/types/apiTagTypes.ts` only declares `Auth` and `User` tags, missing all domain tags needed by feature APIs (e.g. `Session`, `Semester`, `Level`, `AcademicStructure`), so cache invalidation cannot be wired up correctly.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN `authApi` endpoints (`useLoginMutation`, `useRefreshMutation`, `useLogoutMutation`) are called THEN the system fails to persist cache or loading state because `authApi.reducer` and `authApi.middleware` are not registered in the Redux store

1.2 WHEN any RTK Query endpoint using `axiosBaseQuery` makes a request THEN the system creates a new bare `axios` instance per call, ignoring the shared `axiosInstance` interceptors that attach the `Authorization` header and `Content-Type`

1.3 WHEN the `Settings` page renders THEN the system displays hardcoded mock sessions, semesters, semester types, and levels from local `useState` instead of fetching from the backend via RTK Query

1.4 WHEN the `AcademicStructure` page renders THEN the system displays hardcoded mock faculty/department/program hierarchy and stats from `mock-data.ts` instead of fetching from the backend via RTK Query

1.5 WHEN `mock-session-config.ts`, `Settings.tsx`, or `SessionConfigTab.tsx` are compiled THEN the system throws a module-not-found error because they import types from `./types` or `../types` paths that do not exist

1.6 WHEN a feature API needs to declare tag types for cache invalidation (e.g. `Session`, `Semester`, `Level`) THEN the system cannot reference them because `ApiTagTypes` only contains `Auth` and `User`

### Expected Behavior (Correct)

2.1 WHEN `authApi` endpoints are called THEN the system SHALL manage cache, loading, and error state correctly because `authApi.reducer` is mounted at `authApi.reducerPath` in the store and `authApi.middleware` is appended to the middleware chain

2.2 WHEN any RTK Query endpoint using `axiosBaseQuery` makes a request THEN the system SHALL route the request through the shared `axiosInstance` so that all configured interceptors (auth token, headers) are applied consistently

2.3 WHEN the `Settings` page renders THEN the system SHALL fetch sessions, semesters, semester types, and levels via RTK Query hooks and display live server data, with loading and error states handled by RTK Query cache

2.4 WHEN the `AcademicStructure` page renders THEN the system SHALL fetch faculty, department, and program data via RTK Query hooks and display live server data, with loading and error states handled by RTK Query cache

2.5 WHEN `mock-session-config.ts`, `Settings.tsx`, or `SessionConfigTab.tsx` are compiled THEN the system SHALL resolve all type imports correctly from `src/shared/types/settings-types.ts` using the `@/shared/types/settings-types` alias

2.6 WHEN a feature API declares tag types for cache invalidation THEN the system SHALL find all required domain tags (`Session`, `Semester`, `SemesterType`, `Level`, `AcademicStructure`) in `ApiTagTypes` and `baseApi.tagTypes`

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user logs in with valid credentials THEN the system SHALL CONTINUE TO store the access token and refresh token in the Redux `auth` slice and navigate to the dashboard

3.2 WHEN the access token is expired and a refresh token is available THEN the system SHALL CONTINUE TO attempt a token refresh via `axiosBaseQuery`'s built-in retry logic and re-dispatch the original request

3.3 WHEN `clearAuth` is dispatched THEN the system SHALL CONTINUE TO wipe all auth state and redirect to the login page

3.4 WHEN `withAuthGuard` wraps a route component THEN the system SHALL CONTINUE TO check token validity and redirect unauthenticated users to the login page

3.5 WHEN `baseApi` is used by any feature via `injectEndpoints` THEN the system SHALL CONTINUE TO share the single `reducerPath: "api"` cache and tag invalidation registry

3.6 WHEN the `X-TENANT` header logic runs in `axiosBaseQuery` THEN the system SHALL CONTINUE TO derive the tenant from the hostname and attach it to every outgoing request
