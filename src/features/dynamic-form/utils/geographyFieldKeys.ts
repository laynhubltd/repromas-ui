const STATE_FIELD_KEYS = new Set(["stateId", "state_of_origin"]);
const LGA_FIELD_KEYS = new Set(["lgaId", "lga_of_origin"]);

export function resolveGeographyStateId(
  values: Record<string, unknown>,
): number | undefined {
  const raw = values.stateId ?? values.state_of_origin;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.length > 0) {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

export function isStateGeographyFieldKey(fieldKey: string): boolean {
  return STATE_FIELD_KEYS.has(fieldKey);
}

export function isLgaGeographyFieldKey(fieldKey: string): boolean {
  return LGA_FIELD_KEYS.has(fieldKey);
}

export function lgaFieldKeysInSection(
  fields: Array<{ fieldKey: string }>,
): string[] {
  return fields
    .filter((f) => isLgaGeographyFieldKey(f.fieldKey))
    .map((f) => f.fieldKey);
}
