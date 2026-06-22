import type { FormField } from "@/features/dynamic-form/types";

/** Lowercase snake_case segment from human-readable text. */
export function slugifySegment(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** Build dot-path metadata key from section title and field label. */
export function buildMetadataJsonKey(
  sectionTitle: string,
  fieldLabel: string,
): string {
  const sectionSlug = slugifySegment(sectionTitle) || "section";
  const fieldSlug = slugifySegment(fieldLabel) || "field";
  return `${sectionSlug}.${fieldSlug}`;
}

/** Return a unique key, appending _2, _3, … when baseKey is already used. */
export function ensureUniqueJsonKey(
  baseKey: string,
  usedKeys: Set<string>,
  excludeKey?: string,
): string {
  const taken = new Set(
    [...usedKeys].filter((key) => key !== excludeKey),
  );
  if (!taken.has(baseKey)) {
    return baseKey;
  }
  let counter = 2;
  while (taken.has(`${baseKey}_${counter}`)) {
    counter += 1;
  }
  return `${baseKey}_${counter}`;
}

export function flattenFormFields(
  fieldsBySectionId: Record<number, FormField[]>,
): FormField[] {
  return Object.values(fieldsBySectionId).flat();
}

export function collectMetadataJsonKeys(
  fields: FormField[],
  excludeFieldId?: number,
): Set<string> {
  const keys = new Set<string>();
  for (const field of fields) {
    if (excludeFieldId != null && field.id === excludeFieldId) continue;
    if (field.mappingConfig.type === "META_DATA") {
      const jsonKey = field.mappingConfig.json_key?.trim();
      if (jsonKey) keys.add(jsonKey);
    }
  }
  return keys;
}

export function buildMetadataMappingConfig(
  sectionTitle: string,
  fieldLabel: string,
  allFormFields: FormField[],
  currentFieldId: number,
): { type: "META_DATA"; json_key: string } {
  const usedKeys = collectMetadataJsonKeys(allFormFields, currentFieldId);
  const baseKey = buildMetadataJsonKey(sectionTitle, fieldLabel);
  return {
    type: "META_DATA",
    json_key: ensureUniqueJsonKey(baseKey, usedKeys),
  };
}

export type MetadataJsonKeyUpdate = { fieldId: number; json_key: string };

/**
 * Recompute json_key for all META_DATA fields in a section after a title change.
 * Uses stable ordering: displayOrder, then field id.
 */
export function recomputeMetadataJsonKeysForSection(
  sectionTitle: string,
  sectionFields: FormField[],
  allFormFields: FormField[],
): MetadataJsonKeyUpdate[] {
  const metadataFields = sectionFields
    .filter((f) => f.mappingConfig.type === "META_DATA")
    .sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id);

  const sectionFieldIds = new Set(metadataFields.map((f) => f.id));
  const usedKeys = new Set<string>();

  for (const field of allFormFields) {
    if (sectionFieldIds.has(field.id)) continue;
    if (field.mappingConfig.type === "META_DATA") {
      const jsonKey = field.mappingConfig.json_key?.trim();
      if (jsonKey) usedKeys.add(jsonKey);
    }
  }

  const updates: MetadataJsonKeyUpdate[] = [];

  for (const field of metadataFields) {
    const baseKey = buildMetadataJsonKey(sectionTitle, field.label);
    const json_key = ensureUniqueJsonKey(baseKey, usedKeys);
    usedKeys.add(json_key);

    if (
      field.mappingConfig.type === "META_DATA" &&
      field.mappingConfig.json_key !== json_key
    ) {
      updates.push({ fieldId: field.id, json_key });
    }
  }

  return updates;
}
