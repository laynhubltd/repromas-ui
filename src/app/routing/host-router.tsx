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
import { moduleMounter, resolveModuleRole } from "./module-mounter";
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

  // Derive the routing key — a string that changes only when the routing
  // outcome actually changes. React Router remounts the route tree when
  // the key changes, which is intentional (e.g. login → authenticated).
  // It does NOT change on token refresh, profile fetches, or background
  // refetches — only on genuine routing-gate changes.
  //
  // Segments:
  //   host.kind — apex / tenant / unknown (which module family)
  //   tenantSlug — which institution
  //   tenant load state  — loading / error / ready
  //   tenant status — ACTIVE / PENDING / etc.
  //   authed / anon — the main auth gate (boolean, not the token string)
  //   picking / settled  — role picker open or not
  //   moduleRole — "admin" / "student" / "none" (resolved from activeRole)
  //                        Using the resolved role (not raw scope) avoids unnecessary
  //                        remounts when switching between two admin-scoped roles.
  const moduleRole = resolveModuleRole(auth.activeRole) ?? "none";
  const routingKey = [
    host.kind,
    tenantSlug,
    tenantBootstrap.isLoading
      ? "loading"
      : tenantBootstrap.isError
        ? "error"
        : "ready",
    tenantBootstrap.data?.status ?? "unknown",
    auth.token ? "authed" : "anon",
    auth.roleSwitcherOpen ? "picking" : "settled",
    moduleRole,
  ].join("|");

  const routes = useMemo(
    () => moduleMounter({ auth, host, tenantSlug, tenantBootstrap, registry }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [routingKey],
  );

  return (
    <Router>
      <Routes key={routingKey}>{routes}</Routes>
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
