/**
 * Object utilities used by API error parsing and access control.
 */
export function hasItems<T>(arr: T[] | undefined | null): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

export function errorsToString(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error)
    return String((error as { message: unknown }).message);
  if (error && typeof error === "object") {
    const entries = Object.entries(error as Record<string, unknown>);
    return entries
      .map(([k, v]) =>
        Array.isArray(v) ? `${k}: ${v.join(", ")}` : `${k}: ${String(v)}`,
      )
      .join("; ");
  }
  return "An error occurred";
}

export function errorsToObject(error: unknown): Record<string, string> {
  if (!error || typeof error !== "object") return {};
  const obj = error as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) out[k] = v.join(", ");
    else if (v != null) out[k] = String(v);
  }
  return out;
}
