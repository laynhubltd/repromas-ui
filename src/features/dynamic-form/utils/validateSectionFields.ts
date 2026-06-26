import type { RenderField, RenderSection } from "../types";
import { evaluateVisibilityCondition } from "./evaluateVisibilityCondition";
import { isEmptyFieldValue, isWidgetFieldType } from "./fieldValueEmptiness";
import { validateAgainstJsonSchema } from "./validateJsonSchema";
import {
  hasWidgetContent,
  validateWidgetFieldsInSection,
} from "./widgetPayloadMappers";

function visibleFields(
  section: RenderSection,
  values: Record<string, unknown>,
): RenderField[] {
  return section.fields.filter((field) =>
    evaluateVisibilityCondition(
      field.visibilityConfig?.["x-condition"],
      values,
    ),
  );
}

function getFieldPropertySchema(
  jsonSchema: Record<string, unknown>,
  sectionId: number,
  fieldKey: string,
): Record<string, unknown> | undefined {
  const properties = jsonSchema.properties as
    | Record<string, unknown>
    | undefined;
  const sectionSchema = properties?.[String(sectionId)];
  if (!sectionSchema || typeof sectionSchema !== "object") return undefined;

  const fieldSchemas = (sectionSchema as { properties?: Record<string, unknown> })
    .properties;
  const fieldSchema = fieldSchemas?.[fieldKey];
  if (!fieldSchema || typeof fieldSchema !== "object") return undefined;

  return fieldSchema as Record<string, unknown>;
}

function validateScalarField(
  field: RenderField,
  value: unknown,
  jsonSchema: Record<string, unknown>,
  sectionId: number,
): string | null {
  if (field.isRequired && isEmptyFieldValue(value)) {
    return `${field.label} is required.`;
  }

  if (isEmptyFieldValue(value)) {
    return null;
  }

  const fieldPropertySchema = getFieldPropertySchema(
    jsonSchema,
    sectionId,
    field.fieldKey,
  );
  if (!fieldPropertySchema) {
    return null;
  }

  const result = validateAgainstJsonSchema(
    {
      type: "object",
      properties: { [field.fieldKey]: fieldPropertySchema },
    },
    { [field.fieldKey]: value },
  );

  if (result.valid) {
    return null;
  }

  const firstError = result.errors[0];
  return firstError?.message ?? `${field.label} is invalid.`;
}

export function validateSectionFields(
  section: RenderSection,
  values: Record<string, unknown>,
  jsonSchema: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of visibleFields(section, values)) {
    if (isWidgetFieldType(field.fieldType)) continue;

    const message = validateScalarField(
      field,
      values[field.fieldKey],
      jsonSchema,
      section.id,
    );
    if (message) {
      errors[field.fieldKey] = message;
    }
  }

  return errors;
}

export function validateDynamicFormSection(
  section: RenderSection,
  values: Record<string, unknown>,
  jsonSchema: Record<string, unknown>,
): Record<string, string> {
  return {
    ...validateWidgetFieldsInSection(section, values),
    ...validateSectionFields(section, values, jsonSchema),
  };
}

export function sanitizeSectionDataForSchemaValidation(
  section: RenderSection,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const field of visibleFields(section, values)) {
    const value = values[field.fieldKey];

    if (isWidgetFieldType(field.fieldType)) {
      if (field.isRequired || hasWidgetContent(field.fieldType, value)) {
        out[field.fieldKey] = value;
      }
      continue;
    }

    if (field.isRequired || !isEmptyFieldValue(value)) {
      out[field.fieldKey] = value;
    }
  }

  return out;
}
