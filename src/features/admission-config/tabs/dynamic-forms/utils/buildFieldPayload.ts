import type {
  ContractFieldPreset,
  ContractTargetEntity,
  CreateFormFieldRequest,
  FieldType,
  FormField,
  TargetEntity,
} from "@/features/dynamic-form/types";
import {
  ADMISSION_DOCUMENT_UPLOAD_HANDLER,
  DOCUMENT_TYPE_OPTIONS_RESOLVER,
} from "@/shared/constants/dynamicFormOptions";
import {
  defaultValidationForFieldType,
  getColumnFieldProfile,
} from "./fieldConfigDefaults";
import {
  buildMetadataJsonKey,
  collectMetadataJsonKeys,
  ensureUniqueJsonKey,
} from "./metadataJsonKey";

export type EntityFieldCreationMode =
  | "widget-preset"
  | "preset-only"
  | "column-or-metadata"
  | "file-field";

export function getEntityFieldCreationMode(
  targetEntity: TargetEntity,
  _entityConfig: ContractTargetEntity | null,
  isWidgetEntity: boolean,
): EntityFieldCreationMode {
  if (targetEntity === "AdmissionDocumentUpload") return "file-field";
  if (isWidgetEntity) return "widget-preset";
  if (targetEntity === "AdmissionApplication") return "preset-only";
  return "column-or-metadata";
}

export function getNextDisplayOrder(fields: FormField[]): number {
  if (fields.length === 0) return 1;
  return Math.max(...fields.map((f) => f.displayOrder)) + 1;
}

export function buildPresetFieldRequest(
  preset: ContractFieldPreset,
  displayOrder: number,
): CreateFormFieldRequest {
  return {
    fieldKey: preset.fieldKey,
    label: preset.label,
    helpText: preset.helpText ?? null,
    fieldType: preset.fieldType,
    displayOrder,
    mappingConfig: preset.mappingConfig,
    validationConfig: preset.validationConfig ?? defaultValidationForFieldType(preset.fieldType),
    optionsConfig: preset.optionsConfig ?? null,
    isRequired: preset.isRequired ?? false,
    isReadOnly: preset.isReadOnly ?? false,
  };
}

export function buildColumnFieldRequest(
  columnName: string,
  displayOrder: number,
  existingFields: FormField[],
): CreateFormFieldRequest | null {
  const profile = getColumnFieldProfile(columnName);
  if (!profile) return null;

  const usedKeys = new Set(existingFields.map((f) => f.fieldKey));
  const usedColumns = new Set(
    existingFields
      .filter((f) => f.mappingConfig.type === "COLUMN")
      .map((f) =>
        f.mappingConfig.type === "COLUMN" ? f.mappingConfig.column_name : "",
      ),
  );
  if (usedColumns.has(columnName)) return null;

  let fieldKey = profile.fieldKey;
  if (usedKeys.has(fieldKey)) {
    fieldKey = `${profile.fieldKey}_${displayOrder}`;
  }

  return {
    fieldKey,
    label: profile.label,
    fieldType: profile.fieldType,
    displayOrder,
    mappingConfig: { type: "COLUMN", column_name: columnName },
    validationConfig: profile.validationConfig,
    optionsConfig: profile.optionsConfig ?? null,
    isRequired: false,
    isReadOnly: false,
  };
}

export function buildMetadataFieldRequest(
  fieldType: FieldType,
  displayOrder: number,
  sectionTitle: string,
  existingFormFields: FormField[] = [],
): CreateFormFieldRequest {
  const label = `Metadata field ${displayOrder}`;
  const usedJsonKeys = collectMetadataJsonKeys(existingFormFields);
  const json_key = ensureUniqueJsonKey(
    buildMetadataJsonKey(sectionTitle, label),
    usedJsonKeys,
  );

  return {
    fieldKey: `meta${displayOrder}`,
    label,
    fieldType,
    displayOrder,
    mappingConfig: { type: "META_DATA", json_key },
    validationConfig: defaultValidationForFieldType(fieldType),
    optionsConfig: null,
    isRequired: false,
    isReadOnly: false,
  };
}

export function getUnusedAllowlistedColumns(
  entityConfig: ContractTargetEntity | null,
  existingFields: FormField[],
): string[] {
  if (!entityConfig?.allowedColumnNames?.length) return [];
  const system = new Set(entityConfig.systemColumnNames ?? []);
  const used = new Set(
    existingFields
      .filter((f) => f.mappingConfig.type === "COLUMN")
      .map((f) =>
        f.mappingConfig.type === "COLUMN" ? f.mappingConfig.column_name : "",
      ),
  );
  return entityConfig.allowedColumnNames.filter(
    (col) => !system.has(col) && !used.has(col),
  );
}

/**
 * Builds a fully pre-configured FILE field request for AdmissionDocumentUpload sections.
 * mappingConfig and optionsConfig are always fixed — the admin only provides label + fieldKey.
 */
export function buildFileFieldRequest(
  fieldKey: string,
  label: string,
  displayOrder: number,
  isRequired: boolean,
): CreateFormFieldRequest {
  return {
    fieldKey,
    label,
    fieldType: "FILE",
    displayOrder,
    mappingConfig: {
      type: "CUSTOM_HANDLER",
      handler_key: ADMISSION_DOCUMENT_UPLOAD_HANDLER,
    },
    optionsConfig: {
      source: DOCUMENT_TYPE_OPTIONS_RESOLVER,
      params: {},
    },
    validationConfig: { type: "integer", minimum: 1 },
    isRequired,
    isReadOnly: false,
  };
}
