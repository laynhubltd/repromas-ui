import type {
  BuilderContract,
  ContractFieldPreset,
  ContractFieldTypeOption,
  ContractHandler,
  ContractHydrateOrderGuide,
  ContractMappingType,
  ContractOptionsResolver,
  ContractSaveStrategy,
  ContractTargetEntity,
  FieldType,
  MappingConfig,
  MappingType,
  SaveStrategy,
  TargetEntity,
} from "@/features/dynamic-form/types";
import { FALLBACK_BUILDER_CONTRACT } from "@/shared/constants/dynamicFormOptions";

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

function normalizeTargetEntity(raw: unknown): ContractTargetEntity | null {
  const record = asRecord(raw);
  if (!record) return null;

  const key = readString(record, "key", "targetEntity", "target_entity");
  if (!key) return null;

  const defaultSaveStrategy =
    (readString(
      record,
      "defaultSaveStrategy",
      "default_save_strategy",
      "saveStrategy",
      "save_strategy",
    ) as SaveStrategy | undefined) ?? "MERGE";

  const sectionStepsRaw = record.sectionSteps ?? record.section_steps;
  const sectionSteps = Array.isArray(sectionStepsRaw)
    ? sectionStepsRaw.filter((s): s is string => typeof s === "string")
    : [];

  const allowedColumnNamesRaw =
    record.allowedColumnNames ?? record.allowed_column_names;
  const allowedColumnNames = Array.isArray(allowedColumnNamesRaw)
    ? allowedColumnNamesRaw.filter((c): c is string => typeof c === "string")
    : undefined;

  const systemColumnNamesRaw =
    record.systemColumnNames ?? record.system_column_names;
  const systemColumnNames = Array.isArray(systemColumnNamesRaw)
    ? systemColumnNamesRaw.filter((c): c is string => typeof c === "string")
    : undefined;

  const fieldPresetsRaw = record.fieldPresets ?? record.field_presets;
  const fieldPresets = Array.isArray(fieldPresetsRaw)
    ? normalizeArray(fieldPresetsRaw, normalizeFieldPreset)
    : undefined;

  const widgetFieldType = readString(
    record,
    "widgetFieldType",
    "widget_field_type",
  ) as FieldType | undefined;

  return {
    key: key as TargetEntity,
    label: readString(record, "label", "name"),
    defaultSaveStrategy,
    handlerKey:
      readString(record, "handlerKey", "handler_key") ?? null,
    defaultHydrateOrder:
      readNumber(record, "defaultHydrateOrder", "default_hydrate_order") ?? 100,
    sectionSteps,
    fieldPresets,
    payloadContract:
      (record.payloadContract ?? record.payload_contract ?? null) as
        | Record<string, unknown>
        | null
        | undefined,
    allowedColumnNames,
    systemColumnNames,
    subjectDataSource:
      readString(record, "subjectDataSource", "subject_data_source") ?? null,
    widgetFieldType: widgetFieldType ?? null,
  };
}

function normalizeFieldType(raw: unknown): ContractFieldTypeOption | null {
  if (typeof raw === "string" && raw.length > 0) {
    return { key: raw as FieldType, label: raw };
  }
  const record = asRecord(raw);
  if (!record) return null;

  const key = readString(
    record,
    "key",
    "value",
    "fieldType",
    "field_type",
    "type",
  );
  if (!key) return null;

  return {
    key: key as FieldType,
    label: readString(record, "label", "name") ?? key,
    disabled: readBoolean(record, "disabled", "isDisabled", "is_disabled"),
    isWidget: readBoolean(record, "isWidget", "is_widget"),
  };
}

function normalizeSaveStrategy(raw: unknown): ContractSaveStrategy | null {
  if (typeof raw === "string" && raw.length > 0) {
    return { key: raw as SaveStrategy, label: raw };
  }
  const record = asRecord(raw);
  if (!record) return null;

  const key = readString(record, "key", "value", "saveStrategy", "save_strategy");
  if (!key) return null;

  return {
    key: key as SaveStrategy,
    label: readString(record, "label", "name") ?? key,
    description: readString(record, "description"),
  };
}

function normalizeMappingType(raw: unknown): ContractMappingType | null {
  if (typeof raw === "string" && raw.length > 0) {
    return { key: raw as MappingType, label: raw };
  }
  const record = asRecord(raw);
  if (!record) return null;

  const key = readString(record, "key", "value", "mappingType", "mapping_type", "type");
  if (!key) return null;

  return {
    key: key as MappingType,
    label: readString(record, "label", "name") ?? key,
    description: readString(record, "description"),
    configShape: asRecord(record.configShape ?? record.config_shape) ?? undefined,
  };
}

function normalizeOptionsResolver(raw: unknown): ContractOptionsResolver | null {
  const record = asRecord(raw);
  if (!record) return null;

  const key = readString(record, "key", "resolverKey", "resolver_key", "source");
  if (!key) return null;

  const catalogEndpoint =
    readString(record, "catalogEndpoint", "catalog_endpoint") ?? "";
  if (!catalogEndpoint) return null;

  return {
    key,
    label: readString(record, "label", "name") ?? key,
    catalogEndpoint,
    description: readString(record, "description"),
  };
}

function normalizeHydrateOrderGuide(
  raw: unknown,
): ContractHydrateOrderGuide | null {
  const record = asRecord(raw);
  if (!record) return null;

  const targetEntity = readString(
    record,
    "targetEntity",
    "target_entity",
    "key",
  );
  const hydrateOrder = readNumber(record, "hydrateOrder", "hydrate_order");
  if (!targetEntity || hydrateOrder == null) return null;

  return {
    targetEntity: targetEntity as TargetEntity,
    hydrateOrder,
    reason: readString(record, "reason", "description"),
  };
}

function normalizeMappingConfig(raw: unknown): MappingConfig | null {
  const record = asRecord(raw);
  if (!record) return null;

  const type = readString(record, "type", "mappingType", "mapping_type");
  if (type === "COLUMN") {
    const column_name = readString(
      record,
      "column_name",
      "columnName",
      "column",
    );
    if (!column_name) return null;
    return { type: "COLUMN", column_name };
  }
  if (type === "META_DATA") {
    const json_key = readString(record, "json_key", "jsonKey", "json_path");
    if (!json_key) return null;
    return { type: "META_DATA", json_key };
  }
  if (type === "CUSTOM_HANDLER") {
    const handler_key = readString(
      record,
      "handler_key",
      "handlerKey",
      "handler",
    );
    if (!handler_key) return null;
    return { type: "CUSTOM_HANDLER", handler_key };
  }
  return null;
}

function normalizeFieldPreset(raw: unknown): ContractFieldPreset | null {
  const record = asRecord(raw);
  if (!record) return null;

  const fieldKey = readString(record, "fieldKey", "field_key");
  const label = readString(record, "label", "name");
  const fieldType = readString(
    record,
    "fieldType",
    "field_type",
  ) as FieldType | undefined;
  const mappingConfig = normalizeMappingConfig(
    record.mappingConfig ?? record.mapping_config,
  );
  if (!fieldKey || !label || !fieldType || !mappingConfig) return null;

  return {
    fieldKey,
    label,
    fieldType,
    mappingConfig,
    validationConfig: asRecord(record.validationConfig ?? record.validation_config) ?? undefined,
    optionsConfig:
      (record.optionsConfig ?? record.options_config ?? null) as
        | ContractFieldPreset["optionsConfig"]
        | null,
    helpText: readString(record, "helpText", "help_text") ?? null,
    isRequired: readBoolean(record, "isRequired", "is_required"),
    isReadOnly: readBoolean(record, "isReadOnly", "is_read_only"),
  };
}

function normalizeArray<T>(
  raw: unknown,
  normalize: (item: unknown) => T | null,
): T[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalize).filter((item): item is T => item != null);
}

function mergeTargetEntityWithFallback(
  entity: ContractTargetEntity,
  fallbackByKey: Map<TargetEntity, ContractTargetEntity>,
  handlers: ContractHandler[],
): ContractTargetEntity {
  const fallback = fallbackByKey.get(entity.key);
  const handler = handlers.find((h) => h.targetEntity === entity.key);

  return {
    ...entity,
    label: entity.label ?? fallback?.label,
    defaultSaveStrategy:
      entity.defaultSaveStrategy || fallback?.defaultSaveStrategy || "MERGE",
    handlerKey:
      entity.handlerKey ?? fallback?.handlerKey ?? handler?.handlerKey ?? null,
    defaultHydrateOrder:
      entity.defaultHydrateOrder === 100 && fallback?.defaultHydrateOrder != null
        ? fallback.defaultHydrateOrder
        : entity.defaultHydrateOrder,
    sectionSteps:
      entity.sectionSteps.length > 0
        ? entity.sectionSteps
        : (fallback?.sectionSteps ?? []),
    fieldPresets:
      entity.fieldPresets && entity.fieldPresets.length > 0
        ? entity.fieldPresets
        : fallback?.fieldPresets,
    payloadContract:
      entity.payloadContract ?? fallback?.payloadContract ?? null,
    allowedColumnNames:
      entity.allowedColumnNames ?? fallback?.allowedColumnNames,
    systemColumnNames: entity.systemColumnNames ?? fallback?.systemColumnNames,
    subjectDataSource:
      entity.subjectDataSource ?? fallback?.subjectDataSource ?? null,
    widgetFieldType:
      entity.widgetFieldType ??
      fallback?.widgetFieldType ??
      handler?.widgetFieldType ??
      null,
  };
}

/**
 * Coerces a raw GET /dynamic-form-builder-contract payload into the typed
 * BuilderContract shape, tolerating snake_case keys and minor shape drift.
 */
export function normalizeBuilderContract(raw: unknown): BuilderContract {
  const record = asRecord(raw);
  if (!record) return FALLBACK_BUILDER_CONTRACT;

  const handlers = Array.isArray(record.handlers)
    ? (record.handlers as BuilderContract["handlers"])
    : FALLBACK_BUILDER_CONTRACT.handlers;

  const targetEntities = normalizeArray(
    record.targetEntities ?? record.target_entities,
    normalizeTargetEntity,
  );
  const fieldTypes = normalizeArray(
    record.fieldTypes ?? record.field_types,
    normalizeFieldType,
  );

  const fallback = FALLBACK_BUILDER_CONTRACT;
  const fallbackByKey = new Map(
    fallback.targetEntities.map((entity) => [entity.key, entity]),
  );
  const mergedTargetEntities =
    targetEntities.length > 0
      ? targetEntities.map((entity) =>
          mergeTargetEntityWithFallback(entity, fallbackByKey, handlers),
        )
      : fallback.targetEntities;

  return {
    targetEntities: mergedTargetEntities,
    handlers,
    saveStrategies:
      normalizeArray(
        record.saveStrategies ?? record.save_strategies,
        normalizeSaveStrategy,
      ).length > 0
        ? normalizeArray(
            record.saveStrategies ?? record.save_strategies,
            normalizeSaveStrategy,
          )
        : fallback.saveStrategies,
    mappingTypes:
      normalizeArray(
        record.mappingTypes ?? record.mapping_types,
        normalizeMappingType,
      ).length > 0
        ? normalizeArray(
            record.mappingTypes ?? record.mapping_types,
            normalizeMappingType,
          )
        : fallback.mappingTypes,
    fieldTypes: fieldTypes.length > 0 ? fieldTypes : fallback.fieldTypes,
    optionsResolvers: (() => {
      const fromApi = normalizeArray(
        record.optionsResolvers ?? record.options_resolvers,
        normalizeOptionsResolver,
      );
      if (fromApi.length === 0) return fallback.optionsResolvers;
      const keys = new Set(fromApi.map((r) => r.key));
      const merged = [...fromApi];
      for (const resolver of fallback.optionsResolvers) {
        if (!keys.has(resolver.key)) merged.push(resolver);
      }
      return merged;
    })(),
    hydrateOrderGuide:
      normalizeArray(
        record.hydrateOrderGuide ?? record.hydrate_order_guide,
        normalizeHydrateOrderGuide,
      ).length > 0
        ? normalizeArray(
            record.hydrateOrderGuide ?? record.hydrate_order_guide,
            normalizeHydrateOrderGuide,
          )
        : fallback.hydrateOrderGuide,
  };
}
