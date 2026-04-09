import { getAdminRouteEntries } from "@/app/routing/module-routes/admin";
import {
  getOnboardingRouteEntries,
  isMatchingTenantSlug,
  isTenantActive,
  useValidateTenantQuery,
  type TenantValidationResponse,
} from "@/app/routing/module-routes/onboarding";
import { getStudentRouteEntries } from "@/app/routing/module-routes/student";
import FullscreenLoader from "@/components/system/FullscreenLoader";
import { RolePicker } from "@/features/auth/components/RolePicker";
import type { ApiRole } from "@/features/auth/types";
import useAuthState from "@/features/auth/use-auth-state";
import { lazy, useMemo } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { appPaths } from "./app-path";
import { resolveHost } from "./host-resolver";
import RouterShell from "./router-shell";

const Login = lazy(() => import("@/features/auth/components/Login"));
const SignUp = lazy(() => import("@/features/auth/components/SignUp"));
const ForgotPassword = lazy(() => import("@/features/auth/components/ForgotPassword"));
type ModuleRole = "admin" | "student";

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
  const shouldBootstrapTenant = host.kind === "tenant" && tenantSlug.length > 0;

  const tenantBootstrap = useValidateTenantQuery(
    { slug: tenantSlug },
    { skip: !shouldBootstrapTenant },
  );

  // Single Router at the top — never remounted regardless of auth state changes.
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RouterShell />}>
          <Route path="*" element={
            <HostRouteContent
              auth={auth}
              host={host}
              tenantSlug={tenantSlug}
              tenantBootstrap={tenantBootstrap}
            />
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export type HostRouteContentProps = {
  auth: ReturnType<typeof useAuthState>;
  host: ReturnType<typeof resolveHost>;
  tenantSlug: string;
  tenantBootstrap: ReturnType<typeof useValidateTenantQuery>;
};

export function HostRouteContent({ auth, host, tenantSlug, tenantBootstrap }: HostRouteContentProps) {
  if (host.kind === "apex") {
    return (
      <Routes>
        {getOnboardingRouteEntries()}
        {/* <Route path="/auth/*" element={<Navigate to="/tenant-signup" replace />} /> */}
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      </Routes>
    );
  }

  if (host.kind === "unknown") {
    return <UnknownDomain hostname={host.hostname} />;
  }

  if (tenantBootstrap.isLoading || tenantBootstrap.isFetching) {
    return <FullscreenLoader label="Resolving tenant..." />;
  }

  if (tenantBootstrap.isError || !tenantBootstrap.data) {
    return <InstitutionNotFound tenantSlug={tenantSlug} />;
  }

  if (!isMatchingTenantSlug(tenantSlug, tenantBootstrap.data.slug)) {
    return <InstitutionNotFound tenantSlug={tenantSlug} />;
  }

  if (!isTenantActive(tenantBootstrap.data.status)) {
    return <InstitutionNotActive tenantSlug={tenantSlug} />;
  }

  // if (!auth.token) {
  //   return (
  //     <Routes>
  //       <Route index element={<Navigate to={appPaths.login} replace />} />
  //       <Route path={appPaths.login} element={<Login />} />
  //       <Route path={appPaths.signUp} element={<SignUp />} />
  //       <Route path={appPaths.forgotPassword} element={<ForgotPassword />} />
  //       <Route path={appPaths.unauthorized} element={<Unauthorized />} />
  //       <Route path="*" element={<Navigate to={appPaths.login} replace />} />
  //     </Routes>
  //   );
  // }

  if (hasTenantClaimMismatch(auth, tenantBootstrap.data)) {
    return <TenantClaimMismatch />;
  }

  if (auth.roleSwitcherOpen) {
    return <RolePicker />;
  }

  const moduleRole = resolveModuleRole(auth.activeRole);
  if (!moduleRole) {
    return <Unauthorized />;
  }

  const defaultPath = moduleRole === "student" ? "/student" : appPaths.dashboard;

  return (
    <Routes>
      <Route index element={<Navigate to={defaultPath} replace />} />
      <Route path={appPaths.login} element={<Navigate to={defaultPath} replace />} />
      <Route path={appPaths.signUp} element={<Navigate to={defaultPath} replace />} />
      <Route path={appPaths.forgotPassword} element={<Navigate to={defaultPath} replace />} />
      <Route path={appPaths.unauthorized} element={<Unauthorized />} />
      {moduleRole === "admin" ? getAdminRouteEntries() : getStudentRouteEntries()}
      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  );
}

function InstitutionNotFound({ tenantSlug }: { tenantSlug: string }) {
  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <h2>Institution Not Found</h2>
      <p>
        Could not find an institution for slug <strong>{tenantSlug}</strong>.
      </p>
    </div>
  );
}

function InstitutionNotActive({ tenantSlug }: { tenantSlug: string }) {
  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <h2>Institution Not Active</h2>
      <p>
        Institution <strong>{tenantSlug}</strong> is not currently active.
      </p>
    </div>
  );
}

function UnknownDomain({ hostname }: { hostname: string }) {
  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <h2>Unsupported Domain</h2>
      <p>
        Host <strong>{hostname}</strong> is not mapped to this environment.
      </p>
    </div>
  );
}

function Unauthorized() {
  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <h2>Unauthorized</h2>
      <p>You do not have access to this resource.</p>
    </div>
  );
}

function TenantClaimMismatch() {
  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <h2>Tenant Access Denied</h2>
      <p>Your authenticated profile does not match this tenant domain.</p>
    </div>
  );
}

export function resolveModuleRole(activeRole: ApiRole | null): ModuleRole | null {
  if (!activeRole) return null;
  return activeRole.scope.trim().toUpperCase() === "STUDENT" ? "student" : "admin";
}

function hasTenantClaimMismatch(
  auth: ReturnType<typeof useAuthState>,
  tenant: TenantValidationResponse,
): boolean {
  const tenantId = tenant.id != null ? String(tenant.id) : null;
  if (!tenantId) return false;

  const currentProfileCompanyId =
    auth.profiles.find((profile) => profile.profileId === auth.currentProfileId)?.company?.id ??
    null;

  const userCompanyId = auth.userProfile?.company?.id ?? null;
  const companyId = currentProfileCompanyId ?? userCompanyId;

  if (!companyId) return false;

  return String(companyId).trim() !== tenantId.trim();
}
