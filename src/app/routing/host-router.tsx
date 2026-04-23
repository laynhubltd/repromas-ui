import { getAdminRouteEntries } from "@/app/routing/module-routes/admin";
import { getAuthenticationRoutes } from "@/app/routing/module-routes/authentication";
import {
    getOnboardingRouteEntries,
    useValidateTenantQuery,
} from "@/app/routing/module-routes/onboarding";
import { getStudentRouteEntries } from "@/app/routing/module-routes/student";
import useAuthState from "@/features/auth/use-auth-state";
import { useMemo } from "react";
import { BrowserRouter as Router, Routes } from "react-router-dom";
import { resolveHost } from "./host-resolver";
import { moduleMounter } from "./module-mounter";
import type { ModuleRegistry } from "./module-registry";

/**
 * Composes the module registry — the only place that knows about concrete modules.
 * To add a new module: add it here and extend ModuleRegistry. Never touch moduleMounter.
 */
function buildRegistry(): ModuleRegistry {
  return {
    apex: { getRouteEntries: getOnboardingRouteEntries },
    authentication: { getRouteEntries: getAuthenticationRoutes },
    admin: { getRouteEntries: getAdminRouteEntries },
    student: { getRouteEntries: getStudentRouteEntries },
  };
}

const registry = buildRegistry();

export function HostRouter() {
  const auth = useAuthState();

  const host = useMemo(
    () =>
      resolveHost(window.location.hostname, {
        apexDomain: import.meta.env.VITE_APEX_DOMAIN,
      }),
    [],
  );

  const tenantSlug = host.tenantSlug ?? "";

  const tenantBootstrap = useValidateTenantQuery(
    { slug: tenantSlug },
    { skip: host.kind !== "tenant" || tenantSlug.length === 0 },
  );

  /**
   * Memoize the route tree so React Router receives a stable JSX reference.
   *
   * Problem: moduleMounter returns new <Route> JSX on every render. When auth
   * state changes (e.g. during token refresh), the route tree is rebuilt,
   * React Router treats it as new routes, remounts them, and any <Navigate>
   * elements inside fire again — causing the navigation flood.
   *
   * Fix: only rebuild the route tree when the values that actually gate routing
   * decisions change. Token refresh (which updates auth.token but doesn't
   * change the routing outcome) is intentionally excluded.
   */
  const routes = useMemo(
    () => moduleMounter({ auth, host, tenantSlug, tenantBootstrap, registry }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      host.kind,
      tenantSlug,
      tenantBootstrap.isLoading,
      tenantBootstrap.isFetching,
      tenantBootstrap.isError,
      // Use a stable identity for tenant data — only rebuild when slug or status changes
      tenantBootstrap.data?.slug,
      tenantBootstrap.data?.status,
      // Gate: authenticated vs not
      !!auth.token,
      // Gate: role picker open
      auth.roleSwitcherOpen,
      // Gate: which module to mount (admin vs student)
      auth.activeRole?.scope,
    ],
  );

  return (
    <Router>
      <Routes>{routes}</Routes>
    </Router>
  );
}

// Re-export for consumers that reference these from host-router
export { resolveModuleRole } from "./module-mounter";
export type { ModuleMounterProps } from "./module-mounter";

// HostRouteContent — a component wrapper around moduleMounter for testing
import type { ModuleMounterProps } from "./module-mounter";

export type HostRouteContentProps = Omit<ModuleMounterProps, "registry"> & {
  registry?: ModuleRegistry;
};

export function HostRouteContent({
  registry,
  ...props
}: HostRouteContentProps) {
  const resolvedRegistry = registry ?? buildRegistry();
  return <>{moduleMounter({ ...props, registry: resolvedRegistry })}</>;
}
