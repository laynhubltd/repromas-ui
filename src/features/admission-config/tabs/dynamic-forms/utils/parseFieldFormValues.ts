import type {
  MappingConfig,
  MappingType,
  OptionsConfig,
  VisibilityConfig,
} from "@/features/dynamic-form/types";
import {
  parseOptionsConfigFromFormValues,
  serializeOptionsConfigForForm as serializeOptionsConfig,
} from "./optionsConfigForm";
import { coerceVisibilityValue } from "./visibilityRuleForm";

export type FieldFormValues = {
  label: string;
  helpText?: string;
  fieldType: string;
  displayOrder?: number;
  mappingType: MappingType;
  columnName?: string;
  handlerKey?: string;
  optionsSource?: string;
  staticOptionsJson?: string;
  dependsOnFieldKey?: string;
  validationConfigJson?: string;
  visibilityField?: string;
  visibilityOperator?: "equals" | "not_equals" | "in";
  visibilityValue?: string;
  visibilityInValues?: string[];
  visibilityEnabled?: boolean;
  isRequired: boolean;
  isReadOnly: boolean;
};

export function buildMappingConfigFromForm(
  values: FieldFormValues,
): MappingConfig {
  if (values.mappingType === "COLUMN") {
    return { type: "COLUMN", column_name: values.columnName ?? "" };
  }
  if (values.mappingType === "META_DATA") {
    throw new Error(
      "META_DATA mapping must be built via buildMetadataMappingConfig",
    );
  }
  return {
    type: "CUSTOM_HANDLER",
    handler_key: values.handlerKey ?? "",
  };
}

export function parseOptionsConfigFromForm(
  values: FieldFormValues,
): OptionsConfig | null {
  return parseOptionsConfigFromFormValues(values);
}

export function parseValidationConfigFromForm(
  values: FieldFormValues,
  fallback: Record<string, unknown>,
): Record<string, unknown> {
  if (!values.validationConfigJson?.trim()) return fallback;
  try {
    const parsed = JSON.parse(values.validationConfigJson) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // fall through
  }
  return fallback;
}

export function parseVisibilityConfigFromForm(
  values: FieldFormValues,
): VisibilityConfig | null {
  if (values.visibilityEnabled === false) return null;
  if (!values.visibilityField?.trim()) return null;

  const operator = values.visibilityOperator ?? "equals";
  const rawValue =
    operator === "in"
      ? (values.visibilityInValues ??
        values.visibilityValue?.split(",").map((v) => v.trim()))
      : values.visibilityValue;

  return {
    "x-condition": {
      field: values.visibilityField.trim(),
      operator,
      value: coerceVisibilityValue(rawValue, operator),
    },
  };
}

export function serializeOptionsConfigForForm(
  optionsConfig: OptionsConfig | null | undefined,
): {
  optionsSource: string;
  staticOptionsJson?: string;
  dependsOnFieldKey?: string;
} {
  return serializeOptionsConfig(optionsConfig);
}

export function serializeValidationConfigForForm(
  validationConfig: Record<string, unknown>,
): string {
  if (!validationConfig || Object.keys(validationConfig).length === 0) {
    return "{}";
  }
  return JSON.stringify(validationConfig, null, 2);
}

export function serializeVisibilityConfigForForm(
  visibilityConfig: VisibilityConfig | null | undefined,
): {
  visibilityField?: string;
  visibilityOperator?: "equals" | "not_equals" | "in";
  visibilityValue?: string;
  visibilityInValues?: string[];
  visibilityEnabled?: boolean;
} {
  const condition = visibilityConfig?.["x-condition"];
  if (!condition) return { visibilityEnabled: false };
  if (condition.operator === "in" && Array.isArray(condition.value)) {
    return {
      visibilityEnabled: true,
      visibilityField: condition.field,
      visibilityOperator: condition.operator,
      visibilityInValues: condition.value.map((v) => String(v)),
      visibilityValue: condition.value.map((v) => String(v)).join(", "),
    };
  }
  return {
    visibilityEnabled: true,
    visibilityField: condition.field,
    visibilityOperator: condition.operator,
    visibilityValue:
      condition.value != null ? String(condition.value) : undefined,
  };
}
