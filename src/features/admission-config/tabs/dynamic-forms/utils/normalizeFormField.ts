import type {
  FieldType,
  FormField,
  MappingConfig,
  OptionsConfig,
  VisibilityConfig,
} from "@/features/dynamic-form/types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(
  record: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return undefined;
}

function readNumber(
  record: Record<string, unknown>,
  ...keys: string[]
): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function readBoolean(
  record: Record<string, unknown>,
  ...keys: string[]
): boolean | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
  }
  return undefined;
}

function normalizeMappingConfig(raw: unknown): MappingConfig {
  const record = asRecord(raw);
  if (!record) return { type: "META_DATA", json_key: "" };

  const type = readString(record, "type", "mappingType", "mapping_type");
  if (type === "COLUMN") {
    return {
      type: "COLUMN",
      column_name:
        readString(record, "column_name", "columnName", "column") ?? "",
    };
  }
  if (type === "CUSTOM_HANDLER") {
    return {
      type: "CUSTOM_HANDLER",
      handler_key:
        readString(record, "handler_key", "handlerKey", "handler") ?? "",
    };
  }
  return {
    type: "META_DATA",
    json_key: readString(record, "json_key", "jsonKey", "json_path") ?? "",
  };
}

/** Coerces a raw section-field payload into the typed FormField shape. */
export function normalizeFormField(raw: unknown): FormField | null {
  const record = asRecord(raw);
  if (!record) return null;

  const id = readNumber(record, "id");
  const sectionId = readNumber(record, "sectionId", "section_id");
  const fieldKey = readString(record, "fieldKey", "field_key");
  const label = readString(record, "label", "name");
  const fieldType = readString(
    record,
    "fieldType",
    "field_type",
  ) as FieldType | undefined;
  const displayOrder = readNumber(record, "displayOrder", "display_order");

  if (
    id == null ||
    sectionId == null ||
    !fieldKey ||
    !label ||
    !fieldType ||
    displayOrder == null
  ) {
    return null;
  }

  return {
    id,
    sectionId,
    fieldKey,
    label,
    helpText: readString(record, "helpText", "help_text") ?? null,
    fieldType,
    displayOrder,
    mappingConfig: normalizeMappingConfig(
      record.mappingConfig ?? record.mapping_config,
    ),
    validationConfig:
      asRecord(record.validationConfig ?? record.validation_config) ?? {},
    visibilityConfig:
      (record.visibilityConfig ?? record.visibility_config ?? null) as
        | VisibilityConfig
        | null,
    optionsConfig:
      (record.optionsConfig ?? record.options_config ?? null) as OptionsConfig | null,
    isRequired: readBoolean(record, "isRequired", "is_required") ?? false,
    isReadOnly: readBoolean(record, "isReadOnly", "is_read_only") ?? false,
    createdAt: readString(record, "createdAt", "created_at") ?? "",
    updatedAt: readString(record, "updatedAt", "updated_at") ?? "",
  };
}

export function normalizeFormFieldCollection(raw: unknown): FormField[] {
  if (Array.isArray(raw)) {
    return raw
      .map(normalizeFormField)
      .filter((field): field is FormField => field != null);
  }
  if (raw && typeof raw === "object" && Array.isArray((raw as { member?: unknown }).member)) {
    return (raw as { member: unknown[] }).member
      .map(normalizeFormField)
      .filter((field): field is FormField => field != null);
  }
  return [];
}
