import type { TenantSignupFormValues } from "../types";

export function buildSignupFormData(
  values: TenantSignupFormValues,
  logoFile?: File | null,
  metadata?: Record<string, unknown> | null,
): FormData {
  const formData = new FormData();

  // Required Fields
  formData.append("name", values.name.trim());
  formData.append("code", values.code.trim().toUpperCase());
  formData.append("slug", values.slug.trim().toLowerCase());
  formData.append("institutionType", values.institutionType);
  formData.append("email", values.email.trim());
  formData.append("primaryColor", values.primaryColor.trim());

  // Logo: File takes precedence, otherwise remote logoUrl if in URL mode
  if (logoFile) {
    formData.append("logo", logoFile, logoFile.name || "logo.png");
  } else if (values.logoMode === "url" && values.logoUrl?.trim()) {
    formData.append("logoUrl", values.logoUrl.trim());
  }

  // Optional Brand & Academic
  if (values.tagline?.trim()) {
    formData.append("tagline", values.tagline.trim());
  }
  if (values.motto?.trim()) {
    formData.append("motto", values.motto.trim());
  }

  // Optional Campus Location & Contact
  if (values.fullAddress?.trim()) {
    formData.append("fullAddress", values.fullAddress.trim());
  }
  if (values.stateId) {
    formData.append("stateId", String(values.stateId));
  }
  if (values.postalCode?.trim()) {
    formData.append("postalCode", values.postalCode.trim());
  }
  if (values.phone?.trim()) {
    formData.append("phone", values.phone.trim());
  }
  if (values.contactEmail?.trim()) {
    formData.append("contactEmail", values.contactEmail.trim());
  }

  // Optional Social
  if (values.facebook?.trim()) {
    formData.append("facebook", values.facebook.trim());
  }
  if (values.twitter?.trim()) {
    formData.append("twitter", values.twitter.trim());
  }
  if (values.linkedin?.trim()) {
    formData.append("linkedin", values.linkedin.trim());
  }
  if (values.youtube?.trim()) {
    formData.append("youtube", values.youtube.trim());
  }

  // Optional Domain
  if (values.customDomain?.trim()) {
    formData.append("customDomain", values.customDomain.trim());
  }

  // Optional Metadata (must be a JSON string when sent in FormData)
  if (metadata && Object.keys(metadata).length > 0) {
    formData.append("metadata", JSON.stringify(metadata));
  }

  return formData;
}

