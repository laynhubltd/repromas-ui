export const STEP_FIELD_NAMES = {
  0: ["name", "code", "slug", "institutionType", "email", "customDomain"],
  1: ["primaryColor", "logo", "logoFile", "logoUrl", "tagline", "motto"],
  2: [
    "fullAddress",
    "stateId",
    "postalCode",
    "phone",
    "contactEmail",
    "facebook",
    "twitter",
    "linkedin",
    "youtube",
  ],
} as const;

export const FIELD_TO_STEP_MAP: Record<string, number> = {
  // Step 0: Institution & Admin
  name: 0,
  code: 0,
  slug: 0,
  institutionType: 0,
  email: 0,
  customDomain: 0,

  // Step 1: Brand Identity & Logo
  primaryColor: 1,
  logo: 1,
  logoFile: 1,
  logoUrl: 1,
  tagline: 1,
  motto: 1,

  // Step 2: Location, Contact & Social
  fullAddress: 2,
  stateId: 2,
  postalCode: 2,
  phone: 2,
  contactEmail: 2,
  facebook: 2,
  twitter: 2,
  linkedin: 2,
  youtube: 2,
  metadata: 2,
};

/**
 * Returns the earliest step index (0, 1, or 2) that contains one of the given error field names.
 */
export function getFirstStepWithError(fieldNames: string[]): number | null {
  let minStep: number | null = null;
  for (const field of fieldNames) {
    const step = FIELD_TO_STEP_MAP[field];
    if (typeof step === "number") {
      if (minStep === null || step < minStep) {
        minStep = step;
      }
    }
  }
  return minStep;
}

