/** Normalize API list payloads that may be a plain array or Hydra-style `{ member }`. */
export function normalizeCollectionResponse<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) {
    return raw as T[];
  }
  if (raw && typeof raw === "object" && Array.isArray((raw as { member?: unknown }).member)) {
    return (raw as { member: T[] }).member;
  }
  return [];
}
