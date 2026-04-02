import useAuthState from "@/features/auth/use-auth-state";
import FullscreenLoader from "@/components/system/FullscreenLoader";
import {
  isMatchingTenantSlug,
  isTenantActive,
  type TenantValidationResponse,
  useValidateTenantQuery,
} from "@/modules/onboarding/features/tenant-discovery";
import { getAdminRouteEntries } from "@/modules/admin";
import { getOnboardingRouteEntries } from "@/modules/onboarding/routes/onboarding-routes";
import { getStudentRouteEntries } from "@/modules/student";
import { lazy, useMemo, type ReactElement } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
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

  if (host.kind === "apex") {
    return <ApexHostRoutes />;
  }

  if (host.kind === "unknown") {
    return <SinglePageRouter element={<UnknownDomain hostname={host.hostname} />} />;
  }

  if (tenantBootstrap.isLoading || tenantBootstrap.isFetching) {
    return <SinglePageRouter element={<FullscreenLoader label="Resolving tenant..." />} />;
  }

  if (tenantBootstrap.isError || !tenantBootstrap.data) {
    return <SinglePageRouter element={<InstitutionNotFound tenantSlug={tenantSlug} />} />;
  }

  if (!isMatchingTenantSlug(tenantSlug, tenantBootstrap.data.slug)) {
    return <SinglePageRouter element={<InstitutionNotFound tenantSlug={tenantSlug} />} />;
  }

  if (!isTenantActive(tenantBootstrap.data.status)) {
    return <SinglePageRouter element={<InstitutionNotActive tenantSlug={tenantSlug} />} />;
  }

  if (!auth.token) {
    return <TenantAuthRoutes />;
  }

  if (hasTenantClaimMismatch(auth, tenantBootstrap.data)) {
    return <SinglePageRouter element={<TenantClaimMismatch />} />;
  }

  const moduleRole = resolveModuleRole(auth.currentRole?.name ?? auth.userProfile?.role?.name);
  if (!moduleRole) {
    return <SinglePageRouter element={<Unauthorized />} />;
  }

  return <TenantHostRoutes moduleRole={moduleRole} />;
}

function ApexHostRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RouterShell />}>
          {getOnboardingRouteEntries()}
          <Route
            path="/auth/*"
            element={<Navigate to="/tenant-signup" replace />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function TenantAuthRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RouterShell />}>
          <Route index element={<Navigate to={appPaths.login} replace />} />
          <Route path={appPaths.login} element={<Login />} />
          <Route path={appPaths.signUp} element={<SignUp />} />
          <Route path={appPaths.forgotPassword} element={<ForgotPassword />} />
          <Route path={appPaths.unauthorized} element={<Unauthorized />} />
        </Route>
        <Route path="*" element={<Navigate to={appPaths.login} replace />} />
      </Routes>
    </Router>
  );
}

function TenantHostRoutes({ moduleRole }: { moduleRole: ModuleRole }) {
  const defaultPath = moduleRole === "student" ? "/student" : appPaths.dashboard;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RouterShell />}>
          <Route index element={<Navigate to={defaultPath} replace />} />
          <Route path={appPaths.login} element={<Navigate to={defaultPath} replace />} />
          <Route path={appPaths.signUp} element={<Navigate to={defaultPath} replace />} />
          <Route path={appPaths.forgotPassword} element={<Navigate to={defaultPath} replace />} />
          <Route path={appPaths.unauthorized} element={<Unauthorized />} />
          {moduleRole === "admin" ? getAdminRouteEntries() : getStudentRouteEntries()}
        </Route>

        <Route path="*" element={<Navigate to={defaultPath} replace />} />
      </Routes>
    </Router>
  );
}

function SinglePageRouter({ element }: { element: ReactElement }) {
  return (
    <Router>
      <Routes>
        <Route path="*" element={element} />
      </Routes>
    </Router>
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

function resolveModuleRole(roleName: string | undefined): ModuleRole | null {
  if (!roleName) return null;

  const normalized = roleName.trim().toLowerCase();

  if (normalized.includes("student")) {
    return "student";
  }

  if (
    normalized.includes("admin") ||
    normalized.includes("staff") ||
    normalized.includes("manager") ||
    normalized.includes("registrar")
  ) {
    return "admin";
  }

  return null;
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
