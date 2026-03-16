export function getTenantFromHostname(hostname: string): string | null {
  const parts = hostname.split('.');
  // Assuming a format like 'tenant.domain.com' or 'tenant.localhost'
  // This will get the first part if there are at least 3 parts (e.g., futb.repromas.com) or 2 parts for localhost (e.g., futb.localhost)
  if (parts.length >= 2) {
    return parts[0];
  }
  return null;
}
