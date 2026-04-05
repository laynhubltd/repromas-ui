export type TenantStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | string;

export type TenantValidationResponse = {
  id?: number;
  name?: string;
  code?: string;
  slug?: string;
  customDomain?: string;
  status?: TenantStatus;
};
