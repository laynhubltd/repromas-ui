export type TenantStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | string;

export type TenantValidationResponse = {
  id?: number;
  name?: string;
  code?: string;
  slug?: string;
  customDomain?: string;
  status?: TenantStatus;
};

export type InstitutionCategory = "Higher Education" | "Basic Education" | "Other";

export type InstitutionType =
  | "UNIVERSITY"
  | "POLYTECHNIC"
  | "COLLEGE_OF_EDUCATION"
  | "MONOTECHNIC"
  | "INNOVATION_ENTERPRISE_INSTITUTION"
  | "VOCATIONAL_ENTERPRISE_INSTITUTION"
  | "BASIC_EDUCATION"
  | "SENIOR_SECONDARY_SCHOOL"
  | "OTHER";

export interface InstitutionTypeOption {
  value: InstitutionType;
  label: string;
  category: InstitutionCategory;
}

export type TenantSignupFormValues = {
  // Step 1: Institution Identity & Admin
  name: string;
  code: string;
  slug: string;
  institutionType: InstitutionType;
  email: string;
  customDomain?: string;

  // Step 2: Brand Identity
  primaryColor: string;
  logoMode?: "upload" | "url";
  logoFile?: File | null;
  logoUrl?: string;
  tagline?: string;
  motto?: string;

  // Step 3: Location, Contact & Social
  fullAddress?: string;
  stateId?: number;
  postalCode?: string;
  phone?: string;
  contactEmail?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
};

export type TenantSignupRequest = {
  name: string;
  code: string;
  slug: string;
  institutionType: string;
  email: string;
  primaryColor: string;
  logo?: File | null;
  logoUrl?: string | null;
  tagline?: string | null;
  motto?: string | null;
  fullAddress?: string | null;
  stateId?: number | null;
  postalCode?: string | null;
  phone?: string | null;
  contactEmail?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
  customDomain?: string | null;
  metadata?: Record<string, unknown> | string | null;
};

export type BrandConfigValue = {
  primaryColor: string;
  logoUrl?: string | null;
  tagline?: string | null;
  motto?: string | null;
  fullAddress?: string | null;
  state?: {
    id: number;
    name: string;
    code: string;
    countryCode?: string;
  } | null;
  postalCode?: string | null;
  phone?: string | null;
  email?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
  tenantName?: string;
  schoolName?: string;
  institutionType?: string;
  institutionTypeLabel?: string;
  institutionCategory?: string;
};

export type TenantSignupResponse = {
  tenant: {
    id: number;
    name: string;
    code: string;
    slug: string;
    customDomain?: string | null;
    status: string;
    institutionType?: string;
    institutionTypeLabel?: string;
    institutionCategory?: string;
    email: string | null;
    metadata?: Record<string, unknown> | null;
  };
  brandConfig: {
    id: number;
    configValue: BrandConfigValue;
    description: string | null;
    updatedAt: string | null;
  };
};
