const DEFAULT_SYSTEM_NAME = "Repromas Academic";
const DEFAULT_PANEL_BACKGROUND = "#026125";
const SHORT_LOWERCASE_SLUG_PATTERN = /^[a-z0-9-]{2,12}$/;

export type AuthBrandDisplayInput = {
  schoolName?: string;
  systemName?: string;
  tenantName?: string;
  tenantSlug?: string | null;
};

function formatSlugOrName(value: string): string {
  return SHORT_LOWERCASE_SLUG_PATTERN.test(value)
    ? value.toUpperCase()
    : value;
}

/** Resolves the institution display label from theme branding or tenant slug. */
export function resolveAuthBrandDisplayName({
  schoolName,
  systemName,
  tenantName,
  tenantSlug,
}: AuthBrandDisplayInput): string {
  const normalizedSchool = schoolName?.trim();
  if (normalizedSchool) return normalizedSchool;

  const normalizedSystem = systemName?.trim();
  if (normalizedSystem) return normalizedSystem;

  const normalizedTenant = tenantName?.trim();
  if (normalizedTenant) {
    return formatSlugOrName(normalizedTenant);
  }

  const normalizedSlug = tenantSlug?.trim();
  if (normalizedSlug) {
    return formatSlugOrName(normalizedSlug);
  }

  return DEFAULT_SYSTEM_NAME;
}

/** Falls back to brand dark green when primaryColor is unset or transparent. */
export function resolveAuthPanelBackground(primaryColor?: string): string {
  const normalized = primaryColor?.trim();
  if (!normalized || normalized.toLowerCase() === "transparent") {
    return DEFAULT_PANEL_BACKGROUND;
  }
  return normalized;
}
