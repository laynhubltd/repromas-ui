/**
 * Suggests a valid tenant slug from an institution name.
 * 3–63 characters, lowercase alphanumeric and single hyphens.
 */
export function suggestSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63)
    .replace(/-+$/, "");
}
