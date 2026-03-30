# Requirements Document

## Introduction

This feature revamps the login page UI to match a new two-column split design. The left panel becomes a clean white form area containing the logo, welcome copy, and all auth form elements. The right panel becomes a solid brand-color background with a centered academic illustration. The revamp must preserve the existing multi-tenancy dynamic theming system — all colors must flow from the Redux store and CSS custom properties, never hardcoded. Responsive behavior is fully specified across mobile, tablet, and desktop: the illustration panel collapses on mobile, typography scales down, touch targets meet 44px minimums, form fields go full-width, and the panel remains scrollable when the keyboard is open.

## Glossary

- **AuthPageLayout**: The full-viewport layout component at `src/components/auth/AuthPageLayout.tsx` that wraps all auth pages (login, signup, reset password).
- **Form_Panel**: The left column (~45% width) containing the logo, headings, and auth form children.
- **Illustration_Panel**: The right column (~55% width) with a solid brand-primary background and centered illustration.
- **StudentIllustration**: The SVG illustration component at `src/components/auth/StudentIllustration.tsx`.
- **Theme_Store**: The Redux store slice at `src/app/state/theme-slice.ts` that holds `primaryColor`.
- **useThemeColors**: The hook at `src/app/theme/useThemeColors.ts` that returns color variants derived from the active `primaryColor`.
- **Brand_State**: The branding fields (`systemName`, `schoolName`, `tagline`, `logoUrl`) stored in the Redux slice at `src/app/state/theme-slice.ts` alongside `primaryColor`. These values are populated by the `onQueryStarted` handler of the `getBrandConfig` RTK Query endpoint when the `/tenant/brand-config` response includes them.
- **CSS_Custom_Properties**: CSS variables injected on `document.documentElement` by `ThemeVars.tsx` (e.g. `--color-primary`, `--color-primary-dark`).

---

## Requirements

### Requirement 1: Two-Column Split Layout

**User Story:** As a user, I want to see a clean two-column login page, so that the interface feels modern and professional.

#### Acceptance Criteria

1. THE `AuthPageLayout` SHALL render a two-column layout where the Form_Panel occupies approximately 45% of the viewport width and the Illustration_Panel occupies approximately 55% of the viewport width.
2. THE Form_Panel SHALL have a white (`#ffffff`) background, independent of the active theme color.
3. THE Illustration_Panel SHALL use the active `primaryColor` from the Theme_Store as its solid background color.
4. WHEN the viewport width is below 768px, THE `AuthPageLayout` SHALL hide the Illustration_Panel and display only the Form_Panel at full width.
5. THE `AuthPageLayout` SHALL occupy the full viewport height (`100vh`).

---

### Requirement 2: Form Panel Content

**User Story:** As a user, I want the form panel to display the logo, welcome message, and all auth form fields in a clean layout, so that I can sign in without visual clutter.

#### Acceptance Criteria

1. THE Form_Panel SHALL display the `systemName` value from Brand_State in the top-left corner as a logo/brand mark.
2. THE Form_Panel SHALL display a "Welcome back" heading using a bold, large font size (at minimum `1.75rem`).
3. THE Form_Panel SHALL display a "Please enter your details" subtitle below the heading.
4. THE Form_Panel SHALL render the `children` prop (the auth form content) below the subtitle.
5. THE Form_Panel SHALL display a "Don't have an account? Sign up" link centered at the bottom of the panel.
6. THE Form_Panel SHALL apply left and right padding of at least `2rem` to all content.

---

### Requirement 3: Illustration Panel Content

**User Story:** As a user, I want to see a professional illustration on the right side of the login page, so that the page feels engaging and on-brand.

#### Acceptance Criteria

1. THE Illustration_Panel SHALL center the StudentIllustration component both horizontally and vertically.
2. THE StudentIllustration SHALL use color variants from `useThemeColors()` for all fill and stroke colors, with no hardcoded color values.
3. WHEN the Illustration_Panel background is the active `primaryColor`, THE StudentIllustration SHALL render illustration elements in colors that maintain sufficient contrast against that background (using `primaryLight`, `primaryLighter`, or white-tinted variants from `useThemeColors()`).

---

### Requirement 4: Dynamic Theming Compliance

**User Story:** As a tenant administrator, I want the login page colors to reflect the tenant's brand color, so that the page is consistent with the institution's identity.

#### Acceptance Criteria

1. THE `AuthPageLayout` SHALL read `primaryColor` exclusively from the Theme_Store via `useAppSelector(state => state.theme.primaryColor)` or via `useThemeColors()` — no color values SHALL be hardcoded in the component.
2. THE `AuthPageLayout` SHALL NOT contain any `useEffect` hooks that perform data fetching or axios calls.
3. WHEN the `primaryColor` in the Theme_Store changes, THE `AuthPageLayout` SHALL re-render with the updated brand color applied to the Illustration_Panel background without a page reload.
4. WHERE CSS_Custom_Properties are used for styling (e.g. in CSS classes), THE `AuthPageLayout` SHALL reference `--color-primary` or other variables defined by `ThemeVars.tsx`, not hardcoded hex values.

---

### Requirement 5: Responsive Behavior

**User Story:** As a mobile user, I want the login page to be fully usable on any screen size, so that I can sign in comfortably on a phone, tablet, or desktop without layout issues.

#### Acceptance Criteria

**Layout breakpoints**
1. WHILE the viewport width is 768px or above (tablet/desktop), THE `AuthPageLayout` SHALL display the Form_Panel and Illustration_Panel side by side in a single row.
2. WHEN the viewport width is below 768px (mobile), THE Illustration_Panel SHALL be hidden (`display: none` or not rendered) and the Form_Panel SHALL expand to 100% of the viewport width.
3. THE `AuthPageLayout` SHALL use CSS media queries or the `useIsMobile` hook to detect breakpoints — no JavaScript window resize listeners SHALL be used for layout switching.

**Mobile Form_Panel layout**
4. WHEN on mobile, THE Form_Panel SHALL use a vertically centered, single-column layout that fills the full viewport height (`100vh`) with the form content centered in the middle of the screen.
5. WHEN on mobile, THE Form_Panel SHALL apply horizontal padding of at least `1.5rem` on each side so form content does not touch the screen edges.
6. WHEN on mobile, THE logo/system name in the top-left SHALL remain visible and SHALL be positioned at the top of the Form_Panel with at least `1.25rem` top padding.

**Typography scaling**
7. WHEN on mobile, THE "Welcome back" heading font size SHALL scale down to at least `1.5rem` (from the desktop minimum of `1.75rem`) to prevent overflow on narrow screens.
8. WHEN on mobile, THE subtitle and body text SHALL use a font size of at least `0.875rem` to remain legible.

**Touch targets and form fields**
9. ALL interactive elements (inputs, buttons, checkboxes, links) SHALL have a minimum touch target height of `44px` on mobile to comply with touch usability guidelines.
10. THE "Sign in" primary button and any secondary buttons SHALL be full-width on mobile (100% of the Form_Panel content width).
11. ALL form input fields SHALL be full-width on mobile.
12. THE "Remember for 30 days" checkbox row and "Forgot password" link SHALL remain on the same row on mobile, with the link right-aligned, unless the row is too narrow (below 320px) in which case they MAY stack vertically.

**Scroll behavior**
13. WHEN the on-screen keyboard is open on mobile and the form content exceeds the visible viewport, THE Form_Panel SHALL be scrollable so all form fields and the sign-in button remain accessible.
14. THE `AuthPageLayout` SHALL NOT use `overflow: hidden` on the Form_Panel in a way that prevents scrolling on mobile.

**Tablet (768px–1024px)**
15. WHEN the viewport width is between 768px and 1024px, THE `AuthPageLayout` SHALL display both panels, with the Form_Panel taking at least 50% of the width to ensure the form is not too narrow.

---

### Requirement 6: Branding Integration

**User Story:** As a tenant, I want the login page to display the correct system name, school identity, tagline, and logo sourced from the brand-config API, so that users see accurate institution branding without any static configuration files.

#### Acceptance Criteria

1. THE `BrandConfig` type in `src/features/theming/types.ts` SHALL include optional fields `systemName`, `schoolName`, `tagline`, and `logoUrl` (all `string | undefined`).
2. THE Theme_Store slice SHALL extend its state to hold `systemName`, `schoolName`, `tagline`, and `logoUrl` alongside `primaryColor`, with each field defaulting to `undefined`.
3. WHEN the `getBrandConfig` endpoint response includes `systemName`, `schoolName`, `tagline`, or `logoUrl`, THE `onQueryStarted` handler SHALL dispatch those values into the Theme_Store.
4. THE `AuthPageLayout` SHALL read `systemName`, `schoolName`, `tagline`, and `logoUrl` exclusively from the Theme_Store via `useAppSelector` — no value SHALL be sourced from `src/config/branding.ts` or any other static file.
5. THE Form_Panel SHALL NOT hardcode any institution name, system name, school name, tagline, or logo URL as a string literal in the component.
6. WHEN the brand-config API response does not include a branding field, THE Form_Panel SHALL render a sensible fallback (empty string or omit the element) without throwing an error.

---

### Requirement 7: Layout Migration (Current → New)

**User Story:** As a developer, I want the existing `AuthPageLayout` to be updated in place, so that all auth pages (login, signup, reset) automatically adopt the new design.

#### Acceptance Criteria

1. THE `AuthPageLayout` component at `src/components/auth/AuthPageLayout.tsx` SHALL be updated to implement the new two-column layout, replacing the current glassmorphism branding panel on the left and form card on the right.
2. THE `AuthPageLayout` SHALL continue to accept and render the `children` prop, so that existing login, signup, and reset password pages require no changes to their own component files.
3. THE `AuthPageLayout` SHALL continue to accept the `illustration` prop (`"login" | "signup" | "reset"`) for future extensibility, even if the current implementation renders the same StudentIllustration for all variants.
4. THE `AuthIllustration` background component SHALL be removed from the new layout, as the Illustration_Panel's solid background replaces it.
