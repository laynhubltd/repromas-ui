export type BrowserLocationParts = {
  protocol: string;
  hostname: string;
  port: string;
};

export const TENANT_SLUG_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

/**
 * Builds a tenant's sign-in URL from the current origin, with the slug as subdomain.
 * localhost → slug.localhost:port; any other host keeps its last two labels as the base domain.
 */
export function buildTenantLoginUrl(slug: string, location: BrowserLocationParts): string {
  const { protocol, hostname, port } = location;
  const portSuffix = port ? `:${port}` : "";

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${slug}.${hostname}${portSuffix}/auth/login`;
  }

  const parts = hostname.split(".");
  const baseDomain = parts.length > 2 ? parts.slice(-2).join(".") : hostname;
  return `${protocol}//${slug}.${baseDomain}${portSuffix}/auth/login`;
}
