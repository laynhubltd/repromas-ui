import type useAuthState from "@/features/auth/use-auth-state";
import type { TenantValidationResponse } from "@/features/tenant-discovery";

/**
 * Returns true when the authenticated user's company ID does not match the tenant's ID.
 * Moved out of host-router to keep routing files free of auth business logic.
 */
export function hasTenantClaimMismatch(
  auth: ReturnType<typeof useAuthState>,
  tenant: TenantValidationResponse,
): boolean {
  const tenantId = tenant.id != null ? String(tenant.id) : null;
  if (!tenantId) return false;

  const currentProfileCompanyId =
    auth.profiles.find((p) => p.profileId === auth.currentProfileId)?.company?.id ?? null;

  const companyId = currentProfileCompanyId ?? auth.userProfile?.company?.id ?? null;
  if (!companyId) return false;

  return String(companyId).trim() !== tenantId.trim();
}
