# Spec — Shared Auth + Domain/Role Module Mounting

## Current State

- Router is centralized in `src/app/routing/AppRouter.tsx`.
- Auth pages and admin pages live in one route tree.
- No explicit apex-vs-tenant domain entry strategy is documented.
- Vite chunking strategy is not yet module/domain aware.

## Target State

### 1) Shared Auth (global)

Auth remains the existing platform infrastructure and is reused by all modules:

- session/token handling
- current user profile
- tenant context
- role claims and authorization helpers

Auth is not owned by `Onboarding`, `Admin`, or `Student`, and is not refactored in this phase.

### 2) Domain-driven mounting

Runtime host classification:

- `repromas.com` -> mount **Onboarding** module directly (public marketing + tenant signup)
- `<tenant-slug>.repromas.com` -> run tenant bootstrap + auth, then mount by role

### 3) Tenant-domain role mounting

On valid tenant domains:

1. Resolve tenant by slug.
2. If unauthenticated: route to tenant-context auth flow.
3. If authenticated: resolve role from server-validated profile/claims.
4. Mount module:
   - admin role -> Admin module
   - student role -> Student module

## Module Scopes

- **Onboarding**: landing page, product explanation, tenant signup/provisioning, public pages.
- **Admin**: dashboard, settings, academic structure, staff/admin capabilities.
- **Student**: student-facing journeys and portal pages.
- **Shared Auth**: all authentication/authorization and session orchestration.

## Routing Contract

Host router composes module routes with context:

```ts
type HostContext = {
  hostType: 'apex' | 'tenant';
  tenantSlug?: string;
  tenantId?: string;
  authenticated: boolean;
  role?: 'admin' | 'student';
};
```

Route composition rules:

- apex host => onboarding routes only
- tenant host + not authenticated => auth routes only
- tenant host + authenticated admin => admin routes
- tenant host + authenticated student => student routes
- fallback => not-found or unauthorized

## Best-Practice Alignment (online references)

- Use route object composition/lazy route loading with React Router data routers.
- Use explicit manual chunk partitioning via Vite/Rollup (`build.rolldownOptions.output.manualChunks` on latest Vite).
- Enforce deny-by-default and per-request authorization checks.
- Treat tenant context as security boundary and validate role/tenant server-side.

## Scope Constraints

- Do not modify existing RTK Query/auth architecture or behavior.
- Do not move auth files during this phase.
- Only introduce module mounter/router composition logic and module mount decisions.

## References

- React Router `createBrowserRouter`: https://reactrouter.com/api/data-routers/createBrowserRouter/
- React Router Route Objects: https://reactrouter.com/start/data/route-object
- Vite build options (`build.rolldownOptions`, `build.rollupOptions` alias/deprecation): https://vite.dev/config/build-options.html
- Rollup/Rolldown `output.manualChunks`: https://rollupjs.org/configuration-options/#output-manualchunks
- OWASP Authorization Cheat Sheet (deny-by-default, validate on every request): https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- Vercel multi-tenant domain management (wildcard subdomains/custom domains): https://vercel.com/docs/multi-tenant/domain-management

## Success Criteria

- Apex always serves onboarding experience.
- Tenant subdomain requires auth and mounts role-appropriate module only.
- Existing auth is reused by all modules without duplication or refactor.
- Initial payload is reduced through module-aware chunking.
