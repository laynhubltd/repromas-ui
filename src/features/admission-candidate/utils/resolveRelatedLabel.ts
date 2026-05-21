/** Prefer embedded relationship name; fall back to numeric id only when include is absent. */
export function resolveRelatedName(
  related?: { name: string } | null,
  fallbackId?: number | null,
): string {
  if (related?.name) return related.name;
  if (fallbackId != null) return String(fallbackId);
  return "—";
}
