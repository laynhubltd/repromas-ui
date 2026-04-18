import { resolveHost } from "@/app/routing/host-resolver";

/**
 * Endpoints allowed to execute from the apex host (e.g. repromas.com).
 * Tenant-scoped endpoints should stay off this list.
 */
export const APEX_ENDPOINT_WHITELIST = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/tenants/validate",
  "/tenant-signup",
] as const;

export function isEndpointAllowedOnCurrentHost(
  path: string,
  apexWhitelist: readonly string[] = APEX_ENDPOINT_WHITELIST,
): boolean {
  const host = resolveHost(window.location.hostname, {
    apexDomain: import.meta.env.VITE_APEX_DOMAIN,
  });

  if (host.kind !== "apex") {
    return true;
  }

  const normalizedPath = normalizePath(path);

  return apexWhitelist.some(
    (allowed) =>
      normalizedPath === allowed || normalizedPath.startsWith(`${allowed}/`),
  );
}

function normalizePath(path: string): string {
  if (!path) return "/";

  const trimmed = path.trim();
  const clean = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return clean.replace(/^\/api(?=\/|$)/, "") || "/";
}
