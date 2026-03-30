export function getTenantFromHostname(hostname: string): string | null {
  const parts = hostname.split(".");
  // Production/staging: subdomain.domain.tld (3+ parts, not www)
  if (parts.length >= 3 && parts[0] !== "www") {
    return parts[0];
  }
  // Local dev: subdomain.localhost (2 parts, second part is "localhost")
  if (parts.length === 2 && parts[1] === "localhost" && parts[0] !== "localhost") {
    return parts[0];
  }
  return null;
}
