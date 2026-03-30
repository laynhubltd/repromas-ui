# Implementation Plan: Dynamic Theming

## Overview

Migrate the hardcoded static theme to a runtime-reactive theming system. The implementation follows the ordering: PBT exploration tests → preservation tests → types → slice → themeConfig migration → ThemeVars → API → store wiring → App.tsx update → cleanup. Each step is independently deployable without breaking the running app.

## Tasks

- [x] 1. Write PBT exploration tests (failing — confirm missing behavior)
  - [x] 1.1 Write theme-slice PBT exploration tests
    - Create `src/__tests__/theme-slice.test.ts`
    - These tests MUST FAIL before implementation — failure confirms the slice does not exist yet
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 1.2 Write property test for themeLoaded round-trip (P1)
    - `// Feature: dynamic-theming, Property 1: themeLoaded round-trip`
    - Use `fc.hexaString({ minLength: 6, maxLength: 6 }).map(h => '#' + h)` as generator
    - Assert `state.theme.primaryColor === color` after dispatching `themeLoaded(color)`
    - Run minimum 100 iterations
    - **Property 1: themeLoaded round-trip**
    - **Validates: Requirements 2.2, 3.4**

  - [ ]* 1.3 Write property test for themeReset restores DEFAULT_PRIMARY (P2)
    - `// Feature: dynamic-theming, Property 2: themeReset restores default`
    - Dispatch `themeLoaded(color)` then `themeReset`; assert `primaryColor === DEFAULT_PRIMARY`
    - Run minimum 100 iterations
    - **Property 2: themeReset restores default**
    - **Validates: Requirements 2.3**

  - [x] 1.4 Write themeConfig PBT exploration tests
    - Create `src/__tests__/themeConfig.test.ts`
    - These tests MUST FAIL before implementation — failure confirms `buildThemeConfig` does not exist yet
    - _Requirements: 3.1, 3.2, 5.3, 5.5_

  - [ ]* 1.5 Write property test for buildThemeConfig colorPrimary matches input (P3)
    - `// Feature: dynamic-theming, Property 3: buildThemeConfig colorPrimary matches input`
    - Assert `buildThemeConfig(color).token.colorPrimary === color`
    - Run minimum 100 iterations
    - **Property 3: buildThemeConfig colorPrimary matches input**
    - **Validates: Requirements 3.1, 3.4**

  - [ ]* 1.6 Write property test for buildThemeConfig derived tokens consistent (P4)
    - `// Feature: dynamic-theming, Property 4: buildThemeConfig derived tokens consistent`
    - Assert `Layout.headerBg === darkenHex(color, 0.32)`, `Layout.siderBg === darkenHex(color, 0.32)`, `Menu.itemSelectedColor === color`
    - Run minimum 100 iterations
    - **Property 4: buildThemeConfig derived tokens consistent**
    - **Validates: Requirements 3.2**

  - [ ]* 1.7 Write property test for non-color token preservation (P6)
    - `// Feature: dynamic-theming, Property 6: Non-color tokens preserved in migration`
    - Compare `borderRadius`, `fontFamily`, `fontSize`, `controlHeight`, and all component overrides against known constants from original `src/config/theme.ts`
    - Run minimum 100 iterations
    - **Property 6: Non-color tokens preserved in migration**
    - **Validates: Requirements 5.3, 5.5**

  - [x] 1.8 Write ThemeVars PBT exploration tests
    - Create `src/__tests__/ThemeVars.test.tsx`
    - These tests MUST FAIL before implementation — failure confirms ThemeVars does not read from the store yet
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

  - [ ]* 1.9 Write property test for ThemeVars CSS variable injection (P5)
    - `// Feature: dynamic-theming, Property 5: ThemeVars injects all CSS variables correctly`
    - Render `ThemeVars` with a Redux store holding an arbitrary `primaryColor`; assert all 5 CSS custom properties on `document.documentElement`
    - Run minimum 100 iterations
    - **Property 5: ThemeVars injects all CSS variables correctly**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.7**

  - [x] 1.10 Write theming-api unit exploration tests
    - Create `src/__tests__/theming-api.test.ts`
    - These tests MUST FAIL before implementation — failure confirms the endpoint does not exist yet
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 1.11 Write property test for API success dispatches themeLoaded (P7)
    - `// Feature: dynamic-theming, Property 7: Successful brand config fetch dispatches themeLoaded`
    - Use `fc.record({ primaryColor: hexGen })` as generator; mock RTK Query `queryFulfilled`; verify `themeLoaded` is dispatched with the correct color
    - Also test: failed request leaves store at `DEFAULT_PRIMARY`; missing `primaryColor` leaves store at `DEFAULT_PRIMARY`
    - Run minimum 100 iterations
    - **Property 7: Successful brand config fetch dispatches themeLoaded**
    - **Validates: Requirements 1.2, 1.3, 1.4**

- [x] 2. Write preservation tests (must pass before and after migration)
  - [x] 2.1 Write preservation tests for existing themeConfig shape
    - Add tests to `src/__tests__/themeConfig.test.ts` that assert the current `themeConfig` export from `src/config/theme.ts` has the expected non-color token values
    - These tests MUST PASS now and MUST continue to pass after migration
    - _Requirements: 5.3, 5.5_

- [x] 3. Define types
  - [x] 3.1 Create `src/features/theming/types.ts`
    - Export `BrandConfig` type: `{ primaryColor: string; logoUrl?: string; tenantName?: string }`
    - _Requirements: 6.4_

  - [x] 3.2 Add `Theme` tag to `src/shared/types/apiTagTypes.ts`
    - Add `Theme: "Theme"` to the `ApiTagTypes` const object
    - `baseApi` picks up the new tag automatically via `Object.values(ApiTagTypes)`
    - _Requirements: 6.5_

- [x] 4. Implement theme Redux slice
  - [x] 4.1 Create `src/app/state/theme-slice.ts`
    - Define `ThemeState` interface with `primaryColor: string` initialized to `DEFAULT_PRIMARY = "#006747"`
    - Implement `themeLoaded(primaryColor: string)` action that updates `primaryColor`
    - Implement `themeReset()` action that resets `primaryColor` to `DEFAULT_PRIMARY`
    - Export `themeReducer` as default reducer
    - Export `DEFAULT_PRIMARY` constant
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 5. Checkpoint — slice tests should now pass
  - Ensure all tests in `src/__tests__/theme-slice.test.ts` pass (P1, P2 properties and unit tests for initial state).
  - Ask the user if questions arise.

- [x] 6. Migrate and replace themeConfig
  - [x] 6.1 Replace `src/app/theme/themeConfig.ts` with full implementation
    - Export `DEFAULT_PRIMARY`, `hexToRgba`, `darkenHex`, `lightenHex` (migrated from `src/config/theme.ts`)
    - Export `buildColors(primaryColor: string)` that computes all color variants
    - Export `buildThemeConfig(primaryColor: string): ThemeConfig` that returns the full Ant Design theme config with all non-color tokens identical to the original `src/config/theme.ts`
    - Color-derived tokens (`Layout.headerBg`, `Layout.siderBg`, `Menu.itemSelectedColor`) MUST be computed from the `primaryColor` parameter — not from any hardcoded constant
    - _Requirements: 3.1, 3.2, 5.1, 5.3, 5.4_

- [x] 7. Checkpoint — themeConfig tests should now pass
  - Ensure all tests in `src/__tests__/themeConfig.test.ts` pass (P3, P4, P6 properties and preservation tests).
  - Ask the user if questions arise.

- [x] 8. Update ThemeVars to read from Redux store
  - [x] 8.1 Rewrite `src/app/theme/ThemeVars.tsx`
    - Use `useAppSelector` to read `primaryColor` from `state.theme.primaryColor`
    - Use a `useEffect` (DOM side effect, not data fetching) to inject all 5 CSS custom properties on `document.documentElement`:
      - `--color-primary` = `primaryColor`
      - `--color-primary-dark` = `darkenHex(primaryColor, 0.18)`
      - `--color-primary-darker` = `darkenHex(primaryColor, 0.32)`
      - `--color-primary-light` = `lightenHex(primaryColor, 0.28)`
      - `--color-primary-lighter` = `lightenHex(primaryColor, 0.5)`
    - Return `null` from render
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 9. Checkpoint — ThemeVars tests should now pass
  - Ensure all tests in `src/__tests__/ThemeVars.test.tsx` pass (P5 property).
  - Ask the user if questions arise.

- [x] 10. Implement theming API endpoint
  - [x] 10.1 Create `src/features/theming/api/theming-api.ts`
    - Inject `getBrandConfig` query endpoint into `baseApi` using `baseApi.injectEndpoints`
    - Endpoint: `GET /tenant/brand-config`, returns `BrandConfig`, provides `ApiTagTypes.Theme` tag
    - In `onQueryStarted`: `await queryFulfilled`; if `data.primaryColor` is truthy, dispatch `themeLoaded(data.primaryColor)`; catch block is silent (slice retains `DEFAULT_PRIMARY`)
    - Export `useGetBrandConfigQuery` hook
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 6.1, 6.2, 6.3_

- [x] 11. Checkpoint — theming-api tests should now pass
  - Ensure all tests in `src/__tests__/theming-api.test.ts` pass (P7 property and unit tests).
  - Ask the user if questions arise.

- [x] 12. Wire theme slice into Redux store
  - [x] 12.1 Update `src/app/store.ts`
    - Import `themeReducer` from `src/app/state/theme-slice.ts`
    - Add `theme: themeReducer` to `combineReducers`
    - _Requirements: 2.5_

- [x] 13. Update App.tsx with ThemedApp inner component
  - [x] 13.1 Rewrite `src/App.tsx`
    - Create `ThemedApp` inner component (rendered inside `Provider`) that:
      - Reads `primaryColor` from `state.theme.primaryColor` via `useAppSelector`
      - Calls `useGetBrandConfigQuery()` to trigger the bootstrap fetch (RTK Query handles caching/dedup)
      - Passes `buildThemeConfig(primaryColor)` as the reactive `theme` prop to `ConfigProvider`
      - Renders `<ThemeVars />` and `<AppRouter />` inside `ConfigProvider`
    - `App` component wraps `ThemedApp` inside `Provider` and `PersistGate`
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 14. Delete legacy theme file and update all imports
  - [x] 14.1 Update all import references from `src/config/theme.ts` to `src/app/theme/themeConfig.ts`
    - Search the codebase for any remaining imports of `src/config/theme.ts` or `@/config/theme` and update them
    - _Requirements: 5.2_

  - [x] 14.2 Delete `src/config/theme.ts`
    - Only after all imports have been updated in 14.1
    - _Requirements: 5.2_

- [x] 15. Final checkpoint — ensure all tests pass
  - Ensure all tests across `theme-slice.test.ts`, `themeConfig.test.ts`, `ThemeVars.test.tsx`, and `theming-api.test.ts` pass.
  - Ensure existing tests in `bug-condition-exploration.test.tsx` and `preservation.test.tsx` continue to pass.
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- PBT exploration tests (task 1) are written first and expected to fail — they confirm missing behavior before implementation begins
- Preservation tests (task 2) must pass before and after migration to guarantee no regression
- `src/config/theme.ts` is deleted LAST (task 14.2), only after all imports are updated
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations each
- Each property test includes a comment tag: `// Feature: dynamic-theming, Property N: <property_text>`
