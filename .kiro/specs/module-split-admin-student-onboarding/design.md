# Design Document — shared-auth-domain-role-mounting

## Overview

This design implements module mounting based on hostname + authenticated role, while reusing the existing auth and RTK Query implementation exactly as-is.

## Architecture

### Shared Core

- `src/app/api/*`: axios + RTK Query base infra
- `src/app/store.ts`: central store
- `src/shared/*`: shared components/hooks/utils
- `src/features/auth/*`: existing auth flow and guards (reused without refactor)

### Modules

- `src/modules/onboarding/*`
- `src/modules/admin/*`
- `src/modules/student/*`

## Host Resolution Flow

1. Parse `window.location.hostname`.
2. Determine host type:
   - apex: `repromas.com`
   - tenant: `<slug>.repromas.com`
3. For tenant host, resolve tenant metadata by slug (status, id, branding).
4. If tenant invalid: show tenant-not-found page.

## Auth + Role Resolution Flow (tenant host)

1. Check existing session using current auth state (`state.auth`).
2. If not authenticated: show/login route in tenant context.
3. If authenticated: reuse current profile/role resolution flow.
4. Verify tenant claim/profile tenant matches hostname slug mapping.
5. Mount module based on role:
   - admin role(s): mount Admin router
   - student role(s): mount Student router
6. If role missing or mismatched: mount Unauthorized page.

Security note:

- Follow deny-by-default.
- Validate permissions on every request and route guard decision.

## Router Design

Use React Router route objects and lazy route modules.

- `src/app/routing/host-router.tsx`: orchestrates domain and role resolution.
- `src/modules/onboarding/routes.tsx`
- `src/modules/admin/routes.tsx`
- `src/modules/student/routes.tsx`

The host router does not hardcode feature pages; it mounts module route arrays.

Implementation boundary:

- Host router/module mounter can read existing auth state and use existing guards.
- Host router/module mounter must not alter auth API endpoints, auth reducers, auth listener behavior, or RTK Query wiring.

## Tenant Signup and Custom Domain Path

In Onboarding (apex):

1. School submits tenant signup form.
2. Backend provisions tenant and slug/domain mapping.
3. Frontend shows success state with tenant URL (example: `fpb.repromas.com`).
4. User proceeds to tenant domain for authentication and role-based app entry.

## Vite Performance Strategy

Apply module-aware chunking:

- `module-onboarding`
- `module-admin`
- `module-student`
- `vendor-react`
- `vendor-redux`
- `vendor-ui` (antd/icons)

Implementation notes:

- Keep module route entry points lazy-loaded.
- Keep apex onboarding path free of admin/student imports.
- Use chunk warnings/budgets to control regressions.

## Recommended runtime contracts

```ts
type TenantContext = {
  hostType: 'apex' | 'tenant';
  slug?: string;
  tenantId?: string;
  tenantStatus?: 'active' | 'suspended' | 'unknown';
};

type AuthContext = {
  authenticated: boolean;
  userId?: string;
  role?: 'admin' | 'student';
  tenantId?: string;
};
```

## External Best-Practice References

- React Router route objects: https://reactrouter.com/start/data/route-object
- React Router `createBrowserRouter`: https://reactrouter.com/api/data-routers/createBrowserRouter/
- Vite build options (`rolldownOptions`): https://vite.dev/config/build-options.html
- Rollup/Rolldown `manualChunks`: https://rollupjs.org/configuration-options/#output-manualchunks
- OWASP authorization guidance: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- Domain management for multi-tenant platforms: https://vercel.com/docs/multi-tenant/domain-management
- Wildcard/custom hostname behavior: https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/getting-started/
