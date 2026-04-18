export type TenantStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | string;

export type TenantValidationResponse = {
  id?: number;
  name?: string;
  code?: string;
  slug?: string;
  customDomain?: string;
  status?: TenantStatus;
};

export type TenantSignupRequest = {
  name: string;
  code: string;
  slug: string;
  primaryColor: string;
  email?: string | null;
  customDomain?: string | null;
  logoUrl?: string | null;
  tagline?: string | null;
  metadata?: { address?: string; phone?: string } | null;
};

export type BrandConfigValue = {
  primaryColor: string;
  logoUrl: string | null;
  tagline: string | null;
};

export type TenantSignupResponse = {
  tenant: {
    id: number;
    name: string;
    code: string;
    slug: string;
    customDomain: string | null;
    status: string;
    email: string | null;
    metadata: Record<string, unknown> | null;
  };
  brandConfig: {
    id: number;
    configValue: BrandConfigValue;
    description: string | null;
    updatedAt: string | null;
  };
};
