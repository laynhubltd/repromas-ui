# Repromas UI

React + TypeScript + Vite app aligned with LAYNHUB design and architecture standards.

## Architecture

- **Design system** – `src/config/theme.ts` (Ant Design token + palette); global styles in `src/index.css`.
- **Routing** – Central paths in `src/routing/app-path.ts`; `AppRouter` with lazy routes; `ProtectedRoute` (auth + optional privilege); `DashboardShell` wraps layout + role-based menu from `route-menu-config`.
- **Auth** – RTK Query `authApi` + `auth-slice` (persisted); `useAuth` / `withAuthGuard`; token refresh in `lib/base-query.ts`. Set `VITE_USE_MOCK_AUTH=true` in `.env` to use mock login and access the dashboard without the real API.
- **Access control** – `privileges-enum`, `route-privilege-matrix`, `useAccessControl`, `useRestrictedRouteMenuItem` for menu/route visibility.
- **Layout** – `MainLayout` (sider, header, content, mobile drawer) in `components/layout/`.
- **Reusable pieces** – Utils in `utils/` (storage, token, object-utils, types); feature-level APIs and hooks in `features/`; shared layout in `components/`.
- **UI kit adoption** – `src/components/ui-kit/README.md` (component APIs, variant matrixes, migration guide, and rollout checklists).

Add new features under `src/features/<feature>/` and new routes in `app-path.ts`, `route-menu-config.tsx`, and `app-router.tsx`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```