// ── Read-side state snapshot (inside `configValue.state`) ─────────────────────

export type BrandingConfigStateValue = {
  id: number;
  name: string;
  code: string;
  countryCode: string;
};

// ── Config value (read from `configValue` in API responses) ───────────────────

export type BrandingConfigValue = {
  primaryColor: string;
  logoUrl: string | null;
  tagline: string | null;
  motto: string | null;
  fullAddress: string | null;
  /** Read-only nested object — write via `stateId`. */
  state: BrandingConfigStateValue | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  youtube: string | null;
  /** Resolved server-side from tenant context — never submitted on write. */
  tenantName: string;
  /** Resolved server-side from tenant full name — never submitted on write. */
  schoolName: string;
};

// ── API response (GET / POST / PUT) ─────────────────────────────────────────

export type BrandingConfig = {
  id: number;
  configValue: BrandingConfigValue;
  description: string | null;
  updatedAt: string;
};

// ── API request body (POST / PUT) ─────────────────────────────────────────────

export type UpsertBrandingConfigRequest = {
  primaryColor: string;
  logoUrl?: string | null;
  tagline?: string | null;
  motto?: string | null;
  fullAddress?: string | null;
  /** Write-only — send integer ID from GET /states. */
  stateId?: number | null;
  postalCode?: string | null;
  phone?: string | null;
  email?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
};

// ── Logo upload (POST /brand-config/logo) ─────────────────────────────────────

/** Server-accepted MIME types for brand logo upload. */
export const BRANDING_LOGO_ACCEPT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
] as const;

export const BRANDING_LOGO_ACCEPT_ATTRIBUTE =
  BRANDING_LOGO_ACCEPT_MIME_TYPES.join(",");

/** Recommended client-side max upload size (MB). */
export const BRANDING_LOGO_MAX_SIZE_MB = 2;

export const BRANDING_LOGO_CROP_ASPECT = 1;
export const BRANDING_LOGO_OUTPUT_WIDTH = 512;
export const BRANDING_LOGO_OUTPUT_HEIGHT = 512;

export type BrandingConfigLogoUploadResponse = {
  logoUrl: string;
  storagePath: string;
};

/** Multipart form field name for logo upload — must be `file`. */
export type BrandingConfigLogoUploadRequest = FormData;
