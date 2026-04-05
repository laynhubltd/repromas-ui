export function isTenantActive(status: string | undefined): boolean {
  return status?.trim().toUpperCase() === "ACTIVE";
}

export function isMatchingTenantSlug(
  expectedSlug: string,
  actualSlug: string | undefined,
): boolean {
  if (!actualSlug) return false;
  return actualSlug.trim().toLowerCase() === expectedSlug.trim().toLowerCase();
}

export function readApiErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;

  const maybeError = error as {
    data?: { detail?: string; message?: string };
    message?: string;
  };

  return (
    maybeError.data?.detail ?? maybeError.data?.message ?? maybeError.message ?? null
  );
}

export function buildTenantLoginUrl(tenantSlug: string): string {
  const { protocol, hostname, port } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    const portSegment = port ? `:${port}` : "";
    return `${protocol}//${tenantSlug}.localhost${portSegment}/auth/login`;
  }

  const apexDomain = (
    import.meta.env.VITE_APEX_DOMAIN?.trim().toLowerCase() || "repromas.com"
  ).replace(/^\.+|\.+$/g, "");

  return `${protocol}//${tenantSlug}.${apexDomain}/auth/login`;
}
