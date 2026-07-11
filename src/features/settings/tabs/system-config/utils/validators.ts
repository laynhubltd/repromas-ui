import type { Rule } from "antd/es/form";

export const minCreditsRules: Rule[] = [
  { required: true, message: "Minimum credits is required" },
  { type: "integer", min: 0, message: "Minimum credits must be a non-negative integer" },
];

export const maxCreditsRules: Rule[] = [
  { required: true, message: "Maximum credits is required" },
  { type: "integer", min: 0, message: "Maximum credits must be a non-negative integer" },
];

export const creditLoadValidator: Rule = ({ getFieldValue }) => ({
  validator(_, value) {
    const minCredits = getFieldValue("minCredits");
    if (value !== undefined && minCredits !== undefined && minCredits > value) {
      return Promise.reject(
        new Error("Minimum credits must be less than or equal to maximum credits.")
      );
    }
    return Promise.resolve();
  },
});

export const descriptionRules: Rule[] = [
  { max: 255, message: "Description must be at most 255 characters." },
];

/**
 * Pure function exported for independent testability (Property 6).
 * Returns null if valid, or an error message string if invalid.
 */
import type { BrandingConfigFormState } from "../state/brandingConfigFormState";

export type BrandingFormFieldErrors = Partial<
  Record<
    | "primaryColor"
    | "email"
    | "facebook"
    | "twitter"
    | "linkedin"
    | "youtube"
    | "stateId",
    string
  >
>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateOptionalUrl(
  value: string,
  example: string,
): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (!isValidHttpUrl(trimmed)) {
    return `Enter a full URL (e.g. ${example})`;
  }
  return undefined;
}

export function validateBrandingForm(
  form: BrandingConfigFormState,
  validStateIds: Set<number>,
): BrandingFormFieldErrors | null {
  const errors: BrandingFormFieldErrors = {};

  if (!form.primaryColor.trim()) {
    errors.primaryColor = "Primary color is required.";
  }

  const email = form.email.trim();
  if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  const facebookError = validateOptionalUrl(
    form.facebook,
    "https://facebook.com/...",
  );
  if (facebookError) errors.facebook = facebookError;

  const twitterError = validateOptionalUrl(
    form.twitter,
    "https://twitter.com/...",
  );
  if (twitterError) errors.twitter = twitterError;

  const linkedinError = validateOptionalUrl(
    form.linkedin,
    "https://linkedin.com/...",
  );
  if (linkedinError) errors.linkedin = linkedinError;

  const youtubeError = validateOptionalUrl(
    form.youtube,
    "https://youtube.com/...",
  );
  if (youtubeError) errors.youtube = youtubeError;

  if (form.stateId !== null && !validStateIds.has(form.stateId)) {
    errors.stateId = "Selected state was not recognised. Please choose again.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export function validateCreditLoad(
  minCredits: number,
  maxCredits: number
): string | null {
  if (!Number.isInteger(minCredits) || minCredits < 0) {
    return "Minimum credits must be a non-negative integer";
  }
  if (!Number.isInteger(maxCredits) || maxCredits < 0) {
    return "Maximum credits must be a non-negative integer";
  }
  if (minCredits > maxCredits) {
    return "Minimum credits must be less than or equal to maximum credits.";
  }
  return null;
}
