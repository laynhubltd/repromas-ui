# Requirements Document

## Introduction

This feature adds dynamic theming support to the SaaS application. On bootstrap, the app fetches the tenant's brand configuration from a backend API and applies the tenant's `primaryColor` to the Ant Design v5 `ConfigProvider` at runtime. Non-Ant Design elements receive the same brand color via CSS custom properties injected by `ThemeVars`. The existing hardcoded theme configuration in `src/config/theme.ts` is migrated and consolidated into `src/app/theme/themeConfig.ts`. All theming state is managed as global UI state in a Redux slice; the API integration follows the RTK Query / `baseApi` injection pattern mandated by the architecture.

---

## Glossary

- **Theme_Slice**: The Redux slice at `src/app/state/theme-slice.ts` that holds the resolved `primaryColor` string as global UI state.
- **Theming_API**: The RTK Query endpoint set injected into `baseApi` at `src/features/theming/api/theming-api.ts` that fetches the tenant brand config.
- **Brand_Config**: The API response object `{ primaryColor: string, logoUrl?: string, tenantName?: string }` returned by the tenant brand config endpoint.
- **ThemeVars**: The React component at `src/app/theme/ThemeVars.tsx` that reads `primaryColor` from the Theme_Slice and injects CSS custom properties into the document root.
- **Theme_Config**: The Ant Design `ThemeConfig` object exported from `src/app/theme/themeConfig.ts` that is passed to `ConfigProvider`.
- **ConfigProvider**: The Ant Design v5 `ConfigProvider` component in `src/App.tsx` that accepts a reactive `theme` prop.
- **Default_Primary**: The fallback primary color `#006747` used when no tenant brand config is available.
- **Color_Utilities**: The `hexToRgba`, `darkenHex`, and `lightenHex` helper functions migrated from `src/config/theme.ts` to `src/app/theme/themeConfig.ts`.

---

## Requirements

### Requirement 1: Fetch Tenant Brand Config on Bootstrap

**User Story:** As a tenant administrator, I want the application to load my brand colors automatically on startup, so that all users see the correct brand identity without manual configuration.

#### Acceptance Criteria

1. WHEN the application bootstraps, THE Theming_API SHALL send a GET request to the tenant brand config endpoint to retrieve the Brand_Config.
2. WHEN the Theming_API receives a successful response containing a `primaryColor` field, THE Theming_API SHALL dispatch the `themeLoaded` action with the resolved `primaryColor` value via `onQueryStarted`.
3. IF the Theming_API request fails for any reason, THEN THE Theme_Slice SHALL retain the Default_Primary color `#006747`.
4. IF the Brand_Config response does not contain a `primaryColor` field, THEN THE Theme_Slice SHALL retain the Default_Primary color `#006747`.
5. THE Theming_API SHALL be defined by injecting endpoints into `baseApi` using `baseApi.injectEndpoints` — not via a standalone `createApi` call.
6. THE Theming_API SHALL route all HTTP requests through `axiosBaseQuery` and `axiosInstance`.

---

### Requirement 2: Theme Slice — Global UI State

**User Story:** As a developer, I want a dedicated Redux slice for theme state, so that the active primary color is a single, predictable source of truth for all UI consumers.

#### Acceptance Criteria

1. THE Theme_Slice SHALL expose a `primaryColor` field initialized to the Default_Primary color `#006747`.
2. WHEN the `themeLoaded` action is dispatched with a `primaryColor` string, THE Theme_Slice SHALL update `primaryColor` to the provided value.
3. WHEN the `themeReset` action is dispatched, THE Theme_Slice SHALL reset `primaryColor` to the Default_Primary color `#006747`.
4. THE Theme_Slice SHALL store only the resolved `primaryColor` string — it SHALL NOT store raw Brand_Config server response objects or any other server state.
5. THE Theme_Slice SHALL be located at `src/app/state/theme-slice.ts` and registered in the Redux store's root reducer.

---

### Requirement 3: Dynamic Ant Design Theme at Runtime

**User Story:** As a tenant user, I want Ant Design components to reflect my tenant's brand color, so that the UI is visually consistent with the brand identity.

#### Acceptance Criteria

1. WHEN the Theme_Slice `primaryColor` changes, THE ConfigProvider SHALL receive an updated `theme` prop with `token.colorPrimary` equal to the current `primaryColor`.
2. THE Theme_Config SHALL be constructed as a function of `primaryColor` so that all color-derived tokens (e.g., `headerBg`, `siderBg`, `siderHover`) update consistently when `primaryColor` changes.
3. THE ConfigProvider SHALL accept the reactive `theme` prop derived from the Theme_Slice state — no page reload SHALL be required for the color change to take effect.
4. FOR ALL valid hex `primaryColor` values, the `token.colorPrimary` passed to ConfigProvider SHALL equal that `primaryColor` value after the `themeLoaded` action is dispatched.

---

### Requirement 4: CSS Custom Properties via ThemeVars

**User Story:** As a developer, I want CSS custom properties derived from the active primary color, so that non-Ant Design elements can also reflect the tenant's brand color.

#### Acceptance Criteria

1. WHEN the Theme_Slice `primaryColor` changes, THE ThemeVars SHALL inject the CSS custom property `--color-primary` on the document root element with the value equal to `primaryColor`.
2. THE ThemeVars SHALL inject `--color-primary-dark` derived from `darkenHex(primaryColor, 0.18)`.
3. THE ThemeVars SHALL inject `--color-primary-darker` derived from `darkenHex(primaryColor, 0.32)`.
4. THE ThemeVars SHALL inject `--color-primary-light` derived from `lightenHex(primaryColor, 0.28)`.
5. THE ThemeVars SHALL inject `--color-primary-lighter` derived from `lightenHex(primaryColor, 0.5)`.
6. THE ThemeVars SHALL read `primaryColor` exclusively from the Theme_Slice via a Redux selector — it SHALL NOT make direct API calls or use `useEffect` for data fetching.
7. FOR ALL valid hex `primaryColor` values, the `--color-primary` CSS custom property injected by ThemeVars SHALL equal that `primaryColor` value.

---

### Requirement 5: Theme Configuration Migration

**User Story:** As a developer, I want the theme configuration consolidated in `src/app/theme/themeConfig.ts`, so that there is a single authoritative location for all Ant Design theme tokens and color utilities.

#### Acceptance Criteria

1. THE Theme_Config SHALL be migrated from `src/config/theme.ts` to `src/app/theme/themeConfig.ts`, including all Color_Utilities (`hexToRgba`, `darkenHex`, `lightenHex`) and all non-color token and component override definitions.
2. WHEN the migration is complete, THE system SHALL delete `src/config/theme.ts` and update all import references to point to `src/app/theme/themeConfig.ts`.
3. THE non-color tokens (e.g., `borderRadius`, `fontFamily`, `fontSize`, `controlHeight`, component overrides) in the migrated Theme_Config SHALL be identical to those in the original `src/config/theme.ts`.
4. THE Theme_Config export SHALL accept a `primaryColor` parameter so that color-derived tokens are computed dynamically rather than from a hardcoded constant.
5. FOR ALL `primaryColor` values, the non-color token values produced by the migrated Theme_Config SHALL equal the non-color token values of the original `src/config/theme.ts` (migration preservation property).

---

### Requirement 6: Architecture Compliance

**User Story:** As a developer, I want the dynamic theming feature to follow the project's architectural rules, so that the codebase remains consistent, maintainable, and scalable.

#### Acceptance Criteria

1. THE Theming_API SHALL be located at `src/features/theming/api/theming-api.ts` following the feature-based architecture.
2. THE system SHALL NOT place any `axios` calls, `fetch` calls, or `useEffect`-based API calls inside React components.
3. THE side effect of dispatching `themeLoaded` after a successful brand config fetch SHALL be handled inside the `onQueryStarted` callback of the Theming_API endpoint — not inside a React component.
4. THE types for Brand_Config and related theming domain objects SHALL be defined at `src/features/theming/types.ts`.
5. WHERE the `ApiTagTypes` enum requires a new tag for theming cache invalidation, THE system SHALL add the tag to `src/shared/types/apiTagTypes.ts`.
