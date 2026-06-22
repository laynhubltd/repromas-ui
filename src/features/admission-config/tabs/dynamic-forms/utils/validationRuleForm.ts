import type { FieldType } from "@/features/dynamic-form/types";
import { defaultValidationForFieldType } from "./fieldConfigDefaults";

export type JsonSchemaValueType = "string" | "number" | "integer" | "boolean" | "object";

export type StringFormat = "" | "email" | "date" | "uri" | "uuid";

export type ValidationRuleFormValues = {
  valueType: JsonSchemaValueType;
  format?: StringFormat;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  enumValues?: string[];
  required?: boolean;
};

export const VALUE_TYPE_OPTIONS: { value: JsonSchemaValueType; label: string }[] = [
  { value: "string", label: "Text (string)" },
  { value: "integer", label: "Whole number (integer)" },
  { value: "number", label: "Decimal number (number)" },
  { value: "boolean", label: "Yes/No (boolean)" },
  { value: "object", label: "Structured data (object)" },
];

export const STRING_FORMAT_OPTIONS: { value: StringFormat; label: string }[] = [
  { value: "", label: "None" },
  { value: "email", label: "Email" },
  { value: "date", label: "Date (YYYY-MM-DD)" },
  { value: "uri", label: "URL / URI" },
  { value: "uuid", label: "UUID" },
];

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  return undefined;
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string" && value.length > 0) return value;
  return undefined;
}

function asValueType(value: unknown): JsonSchemaValueType {
  if (
    value === "string" ||
    value === "number" ||
    value === "integer" ||
    value === "boolean" ||
    value === "object"
  ) {
    return value;
  }
  return "string";
}

function asStringFormat(value: unknown): StringFormat {
  if (value === "email" || value === "date" || value === "uri" || value === "uuid") {
    return value;
  }
  return "";
}

export function getDefaultRuleFormValues(
  fieldType: FieldType,
  isRequired = false,
): ValidationRuleFormValues {
  const defaults = defaultValidationForFieldType(fieldType);
  return {
    ...parseValidationSchemaToRuleForm(defaults, fieldType),
    required: isRequired,
  };
}

export function parseValidationSchemaToRuleForm(
  schema: Record<string, unknown>,
  fieldType: FieldType,
): ValidationRuleFormValues {
  const fallback = defaultValidationForFieldType(fieldType);
  const merged = { ...fallback, ...schema };

  const enumValues = Array.isArray(merged.enum)
    ? merged.enum.map((v) => String(v))
    : undefined;

  return {
    valueType: asValueType(merged.type),
    format: asStringFormat(merged.format),
    minLength: asNumber(merged.minLength),
    maxLength: asNumber(merged.maxLength),
    pattern: asString(merged.pattern),
    minimum: asNumber(merged.minimum),
    maximum: asNumber(merged.maximum),
    exclusiveMinimum: asNumber(merged.exclusiveMinimum),
    exclusiveMaximum: asNumber(merged.exclusiveMaximum),
    multipleOf: asNumber(merged.multipleOf),
    enumValues,
  };
}

export function buildValidationSchemaFromRuleForm(
  values: ValidationRuleFormValues,
): Record<string, unknown> {
  const schema: Record<string, unknown> = { type: values.valueType };

  if (values.valueType === "string") {
    if (values.format) schema.format = values.format;
    if (values.minLength != null) schema.minLength = values.minLength;
    if (values.maxLength != null) schema.maxLength = values.maxLength;
    if (values.pattern?.trim()) schema.pattern = values.pattern.trim();
    if (values.enumValues && values.enumValues.length > 0) {
      schema.enum = values.enumValues.map((v) => {
        if (v === "true") return true;
        if (v === "false") return false;
        if (/^-?\d+$/.test(v)) return Number(v);
        return v;
      });
    }
  }

  if (values.valueType === "number" || values.valueType === "integer") {
    if (values.minimum != null) schema.minimum = values.minimum;
    if (values.maximum != null) schema.maximum = values.maximum;
    if (values.exclusiveMinimum != null) {
      schema.exclusiveMinimum = values.exclusiveMinimum;
    }
    if (values.exclusiveMaximum != null) {
      schema.exclusiveMaximum = values.exclusiveMaximum;
    }
    if (values.multipleOf != null) schema.multipleOf = values.multipleOf;
  }

  return schema;
}

const VALUE_TYPE_LABELS: Record<JsonSchemaValueType, string> = {
  string: "Text",
  integer: "Whole number",
  number: "Decimal number",
  boolean: "Yes/No",
  object: "Structured data",
};

const FORMAT_LABELS: Record<string, string> = {
  email: "email format",
  date: "date format",
  uri: "URL format",
  uuid: "UUID format",
};

export function summarizeValidationConfig(
  schema: Record<string, unknown>,
  _fieldType: FieldType,
  isRequired?: boolean,
): string {
  if (!schema || Object.keys(schema).length === 0) {
    return isRequired ? "Required · No type rules" : "No validation rules";
  }

  const parts: string[] = [];
  if (isRequired) parts.push("Required");

  const valueType = asValueType(schema.type);
  parts.push(VALUE_TYPE_LABELS[valueType]);

  if (schema.format && typeof schema.format === "string") {
    parts.push(FORMAT_LABELS[schema.format] ?? schema.format);
  }

  const minLen = asNumber(schema.minLength);
  const maxLen = asNumber(schema.maxLength);
  if (minLen != null && maxLen != null) {
    parts.push(`${minLen}–${maxLen} chars`);
  } else if (maxLen != null) {
    parts.push(`max ${maxLen} chars`);
  } else if (minLen != null) {
    parts.push(`min ${minLen} chars`);
  }

  const min = asNumber(schema.minimum);
  const max = asNumber(schema.maximum);
  if (min != null && max != null) {
    parts.push(`between ${min} and ${max}`);
  } else if (min != null) {
    parts.push(`min ${min}`);
  } else if (max != null) {
    parts.push(`max ${max}`);
  }

  if (asNumber(schema.exclusiveMinimum) != null) parts.push("exclusive min");
  if (asNumber(schema.exclusiveMaximum) != null) parts.push("exclusive max");
  if (asNumber(schema.multipleOf) != null) parts.push(`multiple of ${schema.multipleOf}`);
  if (asString(schema.pattern)) parts.push("pattern set");
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    parts.push(`${schema.enum.length} allowed values`);
  }

  return parts.join(" · ");
}

export function parseAdvancedValidationJson(
  json: string,
  fallback: Record<string, unknown>,
): Record<string, unknown> {
  if (!json?.trim()) return fallback;
  try {
    const parsed = JSON.parse(json) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // fall through
  }
  return fallback;
}

export function isStringValueType(valueType: JsonSchemaValueType | undefined): boolean {
  return valueType === "string";
}

export function isNumericValueType(valueType: JsonSchemaValueType | undefined): boolean {
  return valueType === "number" || valueType === "integer";
}
