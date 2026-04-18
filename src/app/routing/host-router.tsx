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

  return (
    <Router>
      <Routes>
        {moduleMounter({ auth, host, tenantSlug, tenantBootstrap, registry })}
      </Routes>
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
