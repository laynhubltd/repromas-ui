import {
  isMatchingTenantSlug,
  isTenantActive,
  useValidateTenantQuery,
  type TenantValidationResponse,
} from "@/app/routing/module-routes/onboarding";
import FullscreenLoader from "@/components/system/FullscreenLoader";
import InstitutionNotActive from "@/features/auth/components/InstitutionNotActive";
import InstitutionNotFound from "@/features/auth/components/InstitutionNotFound";
import { RolePicker } from "@/features/auth/components/RolePicker";
import TenantClaimMismatch from "@/features/auth/components/TenantClaimMismatch";
import Unauthorized from "@/features/auth/components/Unauthorized";
import UnknownDomain from "@/features/auth/components/UnknownDomain";
import type { ApiRole } from "@/features/auth/types";
import type useAuthState from "@/features/auth/use-auth-state";
import { hasTenantClaimMismatch } from "@/features/auth/utils/tenant-claim";
import React from "react";
import { Navigate, Route } from "react-router-dom";
import { appPaths } from "./app-path";
import type { ModuleRegistry } from "./module-registry";
import RouterShell from "./router-shell";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModuleRole = "admin" | "student";

export type ModuleMounterProps = {
  auth: ReturnType<typeof useAuthState>;
  host: { kind: "apex" | "tenant" | "unknown"; hostname: string; tenantSlug: string | null };
  tenantSlug: string;
  tenantBootstrap: ReturnType<typeof useValidateTenantQuery>;
  registry: ModuleRegistry;
};

// ─── Role resolution ──────────────────────────────────────────────────────────

/**
 * Explicit map — unknown scopes return null (→ Unauthorized), never silently get admin.
 */
const SCOPE_TO_ROLE: Record<string, ModuleRole> = {
  STUDENT: "student",
  GLOBAL: "admin",
  FACULTY: "admin",
  DEPARTMENT: "admin",
  PROGRAM: "admin",
  LECTURER: "admin",
};

export function resolveModuleRole(activeRole: ApiRole | null): ModuleRole | null {
  if (!activeRole) return null;
  return SCOPE_TO_ROLE[activeRole.scope.trim().toUpperCase()] ?? null;
}

// ─── Guard predicates (individually testable) ─────────────────────────────────

function isTenantBootstrapping(b: ReturnType<typeof useValidateTenantQuery>): boolean {
  return b.isLoading || b.isFetching;
}

function isTenantInvalid(
  slug: string,
  b: ReturnType<typeof useValidateTenantQuery>,
): boolean {
  return b.isError || !b.data || !isMatchingTenantSlug(slug, b.data.slug);
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

/** Single source of truth for the root layout wrapper. */
function withRootShell(children: React.ReactNode) {
  return (
    <Route path="/" element={<RouterShell />}>
      {children}
    </Route>
  );
}

/**
 * Renders element at every URL — index covers "/", path="*" covers everything else.
 * element must NOT render <Outlet> (it is always a leaf).
 */
function fullScreenRoute(element: React.ReactElement) {
  return withRootShell(
    <>
      <Route index element={element} />
      <Route path="*" element={element} />
    </>,
  );
}

// ─── Module mounter ───────────────────────────────────────────────────────────

/**
 * Pure dispatch function — decides which module to mount based on host/auth/tenant state.
 * Guard order is a contract:
 *   1. host kind        — no tenant data needed
 *   2. tenant loading   — data not yet available
 *   3. tenant validity  — data exists but may be invalid
 *   4. tenant active    — data valid, check status
 *   5. auth token       — tenant confirmed, check user
 *   6. claim mismatch   — token exists, check tenant binding
 *   7. role picker      — bound, check if role selected
 *   8. role resolution  — role selected, resolve module
 *   9. module routes    — everything confirmed
 */
export function moduleMounter({
  auth,
  host,
  tenantSlug,
  tenantBootstrap,
  registry,
}: ModuleMounterProps) {
  // 1. Apex — public marketing site, no tenant context needed
  if (host.kind === "apex") {
    return withRootShell(registry.apex.getRouteEntries());
  }

  // 2. Unknown domain
  if (host.kind === "unknown") {
    return fullScreenRoute(<UnknownDomain hostname={host.hostname} />);
  }

  // 3. Tenant bootstrap in progress
  if (isTenantBootstrapping(tenantBootstrap)) {
    return fullScreenRoute(<FullscreenLoader label="Resolving tenant..." />);
  }

  // 4. Tenant not found or slug mismatch
  if (isTenantInvalid(tenantSlug, tenantBootstrap)) {
    return fullScreenRoute(<InstitutionNotFound tenantSlug={tenantSlug} />);
  }

  // tenantBootstrap.data is guaranteed non-null from here
  const tenant = tenantBootstrap.data as TenantValidationResponse;

  // 5. Tenant inactive
  if (!isTenantActive(tenant.status)) {
    return fullScreenRoute(<InstitutionNotActive tenantSlug={tenantSlug} />);
  }

  // 6. Unauthenticated — show auth routes
  if (!auth.token) {
    return withRootShell(registry.authentication.getRouteEntries());
  }

  // 7. Tenant claim mismatch
  if (hasTenantClaimMismatch(auth, tenant)) {
    return fullScreenRoute(<TenantClaimMismatch />);
  }

  // 8. Role picker open
  if (auth.roleSwitcherOpen) {
    return fullScreenRoute(<RolePicker />);
  }

  // 9. No resolvable role
  const moduleRole = resolveModuleRole(auth.activeRole);
  if (!moduleRole) {
    return fullScreenRoute(<Unauthorized />);
  }

  // 10. Authenticated module routes
  const defaultPath = moduleRole === "student" ? "/student" : appPaths.dashboard;
  const moduleRoutes =
    moduleRole === "admin"
      ? registry.admin.getRouteEntries()
      : registry.student.getRouteEntries();

  return withRootShell(
    <>
      <Route index element={<Navigate to={defaultPath} replace />} />
      <Route path={appPaths.login} element={<Navigate to={defaultPath} replace />} />
      <Route path={appPaths.signUp} element={<Navigate to={defaultPath} replace />} />
      <Route path={appPaths.forgotPassword} element={<Navigate to={defaultPath} replace />} />
      <Route path={appPaths.unauthorized} element={<Unauthorized />} />
      {moduleRoutes}
      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </>,
  );
}
