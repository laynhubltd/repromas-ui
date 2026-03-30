# Implementation Plan: Login Revamp

## Overview

Incremental implementation of the two-column auth layout with dynamic branding. Each task builds on the previous, starting from the data layer (types → state → API) and ending with the UI components and tests. No step leaves the app in a broken state.

## Tasks

- [x] 1. Extend `BrandConfig` type in `src/features/theming/types.ts`
  - Add optional fields `systemName?`, `schoolName?`, `tagline?` to the existing `BrandConfig` type (alongside the already-present `logoUrl?` and `tenantName?`)
  - No other files change in this step — the type extension is purely additive
  - _Requirements: 6.1_

- [x] 2. Extend `ThemeState` and add `brandingLoaded` action in `src/app/state/theme-slice.ts`
  - [x] 2.1 Add `systemName`, `schoolName`, `tagline`, `logoUrl` fields (all `string | undefined`, defaulting to `undefined`) to the `ThemeState` interface and `initialState`
    - `themeLoaded` action signature MUST remain `PayloadAction<string>` — do not change it
    - _Requirements: 6.2_
  - [x] 2.2 Add `brandingLoaded` reducer that accepts `PayloadAction<Partial<BrandConfig>>` and sets any provided fields, leaving others unchanged
    - Export `brandingLoaded` from the slice alongside the existing exports
    - _Requirements: 6.2, 6.3_

- [x] 3. Update `onQueryStarted` in `src/features/theming/api/theming-api.ts`
  - Import `brandingLoaded` from `@/app/state/theme-slice`
  - After the existing `dispatch(themeLoaded(data.primaryColor))` call, dispatch `brandingLoaded({ systemName, schoolName, tagline, logoUrl })` from the response data
  - The `themeLoaded` dispatch path and the catch block MUST remain unchanged
  - _Requirements: 6.3_

- [x] 4. Update `StudentIllustration` colors in `src/components/auth/StudentIllustration.tsx`
  - Replace the current primary-hue color variables with white/semi-transparent constants so the illustration is visible on a solid `primaryColor` panel background
  - Color mapping (see design doc): `bookColor1` → `#ffffff`; `bookColor2` → `rgba(255,255,255,0.75)`; `bookColor3` → `rgba(255,255,255,0.55)`; `accentColor` → `rgba(255,255,255,0.35)`; shadow `floodColor` → `rgba(0,0,0,0.25)`; background gradient rect → remove; open book fill → `rgba(255,255,255,0.15)`; open book stroke → `rgba(255,255,255,0.6)`; decorative circles/shapes → `rgba(255,255,255,0.2–0.4)`
  - `useThemeColors()` may still be called if needed for `primaryLighter`; no hardcoded brand hex values
  - _Requirements: 3.2, 3.3_

- [x] 5. Redesign `AuthPageLayout` in `src/components/auth/AuthPageLayout.tsx`
  - [x] 5.1 Replace the glassmorphism layout with a two-column split: `div.auth-page` (flex row, `min-height: 100vh`, `overflow-x: hidden`) containing `div.auth-form-panel` (left, ~45%) and `div.auth-illustration-panel` (right, ~55%)
    - Read `primaryColor`, `systemName`, `logoUrl` from Redux store via `useAppSelector` — no imports from `src/config/branding.ts`
    - Remove `AuthIllustration` import and usage; remove `branding` import
    - No `useEffect` hooks in the component
    - _Requirements: 1.1, 1.5, 4.1, 4.2, 6.4, 6.5, 7.1, 7.4_
  - [x] 5.2 Implement `Form_Panel` internal structure: header (logo/`systemName` top-left), body ("Welcome back" h1 + "Please enter your details" subtitle + `children`), footer ("Don't have an account? Sign up" centered)
    - Form panel background: `#ffffff`; padding: `≥ 2rem`; `overflow-y: auto` (never `overflow: hidden`)
    - All interactive elements: `min-height: 44px`
    - Heading: `font-size: clamp(1.5rem, 5vw, 2rem)` (≥ 1.75rem desktop, ≥ 1.5rem mobile)
    - Render `systemName` only when defined; render `logoUrl` img only when defined
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 5.9, 5.13, 5.14, 6.5, 6.6_
  - [x] 5.3 Implement `Illustration_Panel`: `background` set inline to `primaryColor` from store; centers `<StudentIllustration />`; `flex: 1 1 55%`
    - _Requirements: 1.3, 3.1, 4.1, 4.3_
  - [x] 5.4 Add CSS media queries for responsive breakpoints (no JS resize listeners)
    - Mobile (`< 768px`): hide illustration panel (`display: none`), form panel `flex: 1 1 100%`, padding `1.5rem`, `min-height: 100vh`, justify-content center
    - Tablet (`768px–1024px`): both panels visible, form panel `flex: 0 0 50%`
    - Desktop (`> 1024px`): form panel `flex: 0 0 45%`, illustration panel `flex: 1 1 55%`
    - _Requirements: 1.4, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.15_
  - [x] 5.5 Ensure `AuthPageLayout` continues to accept `children` and `illustration` props with unchanged signatures
    - _Requirements: 7.2, 7.3_

- [x] 6. Write `src/__tests__/AuthPageLayout.test.tsx`
  - [x] 6.1 Unit tests: renders "Welcome back" heading; renders "Please enter your details" subtitle; renders "Don't have an account? Sign up" link; renders `children` in form panel; form panel has `overflow-y: auto`; illustration panel hidden at `< 768px`; both panels visible at `≥ 768px`; component does not import from `src/config/branding.ts`
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 5.1, 5.2, 5.13, 5.14_
  - [ ]* 6.2 Write property test P1: form panel background always `#ffffff` regardless of `primaryColor`
    - `// Feature: login-revamp, Property 1: Form panel background is always white`
    - Generator: `fc.stringMatching(/^[0-9a-f]{6}$/).map(h => '#' + h)` — set as `primaryColor` in store, render, assert form panel bg = `#ffffff`
    - Minimum 100 runs
    - **Property 1: Form panel background is always white**
    - **Validates: Requirements 1.2**
  - [ ]* 6.3 Write property test P2: illustration panel background matches store `primaryColor` (round-trip)
    - `// Feature: login-revamp, Property 2: Illustration panel background matches store primaryColor`
    - Same hex generator — set store, render, assert panel background equals the color
    - Minimum 100 runs
    - **Property 2: Illustration panel background matches store primaryColor**
    - **Validates: Requirements 1.3, 4.3**
  - [ ]* 6.4 Write property test P3: `systemName` from store appears in Form_Panel output
    - `// Feature: login-revamp, Property 3: systemName from store appears in Form_Panel`
    - Generator: `fc.string({ minLength: 1 })` — set as `systemName` in store, render, assert text present
    - Minimum 100 runs
    - **Property 3: systemName from store appears in Form_Panel**
    - **Validates: Requirements 2.1, 6.4**
  - [ ]* 6.5 Write property test P4: `children` prop is rendered in Form_Panel
    - `// Feature: login-revamp, Property 4: children prop is rendered in Form_Panel`
    - Generator: `fc.string({ minLength: 1 })` — wrap in `<span data-testid="child">`, pass as children, assert present
    - Minimum 100 runs
    - **Property 4: children prop is rendered in Form_Panel**
    - **Validates: Requirements 2.4, 7.2**
  - [ ]* 6.6 Write property test P5: `brandingLoaded` sets all provided branding fields in store
    - `// Feature: login-revamp, Property 5: brandingLoaded dispatches all present branding fields`
    - Generator: `fc.record({ systemName: fc.option(fc.string()), schoolName: fc.option(fc.string()), tagline: fc.option(fc.string()), logoUrl: fc.option(fc.string()) })` — dispatch `brandingLoaded`, assert store reflects all provided values
    - Minimum 100 runs
    - **Property 5: brandingLoaded dispatches all present branding fields**
    - **Validates: Requirements 6.3**
  - [ ]* 6.7 Write property test P6: graceful render with all branding fields `undefined`
    - `// Feature: login-revamp, Property 6: Graceful render with missing branding fields`
    - Generator: `fc.record({ primaryColor: hexColorArb })` with all branding fields absent — render, assert no throw and valid output
    - Minimum 100 runs
    - **Property 6: Graceful render with missing branding fields**
    - **Validates: Requirements 6.6**

- [ ] 7. Extend `src/__tests__/theme-slice.test.ts` with `brandingLoaded` action tests
  - [ ] 7.1 Unit test: initial `ThemeState` has `systemName`, `schoolName`, `tagline`, `logoUrl` all `undefined`
    - _Requirements: 6.2_
  - [ ]* 7.2 Property test: `brandingLoaded` sets provided fields and leaves others unchanged
    - Generator: `fc.record({ systemName: fc.option(fc.string()), ... })` — dispatch `brandingLoaded`, assert each provided field is set and unprovided fields remain at their prior value
    - `// Feature: login-revamp, Property 5: brandingLoaded sets all provided branding fields`
    - Minimum 100 runs
    - _Requirements: 6.2, 6.3_

- [ ] 8. Extend `src/__tests__/theming-api.test.ts` with branding dispatch tests
  - [ ] 8.1 Unit test: `onQueryStarted` dispatches `brandingLoaded` with `systemName`, `schoolName`, `tagline`, `logoUrl` from a successful API response
    - _Requirements: 6.3_
  - [ ] 8.2 Unit test: `onQueryStarted` does NOT dispatch `brandingLoaded` when the API call fails (catch path)
    - _Requirements: 6.3_

- [ ] 9. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The `themeLoaded` action signature (`PayloadAction<string>`) must not change at any point
- `AuthPageLayout` must never import from `src/config/branding.ts`
- No `useEffect` for data fetching in any component
- CSS media queries only for responsive breakpoints — no JS resize listeners
- Touch targets ≥ 44px; form panel `overflow-y: auto` always
- Property tests use fast-check with minimum 100 runs each
