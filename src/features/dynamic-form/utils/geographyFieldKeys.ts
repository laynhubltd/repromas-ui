const STATE_FIELD_KEYS = new Set(["stateId", "state_of_origin"]);
const LGA_FIELD_KEYS = new Set(["lgaId", "lga_of_origin"]);

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
