import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export type SchemaValidationResult = {
  valid: boolean;
  errors: Array<{ path: string; message: string }>;
};

export function validateAgainstJsonSchema(
  schema: Record<string, unknown>,
  data: unknown,
): SchemaValidationResult {
  const validate = ajv.compile(schema);
  const valid = validate(data) === true;

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = (validate.errors ?? []).map((err) => ({
    path: (err.instancePath || err.schemaPath).replace(/^\//, "").replace(/\//g, "."),
    message: err.message ?? "Invalid value",
  }));

  return { valid: false, errors };
}

export function validateSectionPayload(
  jsonSchema: Record<string, unknown>,
  sectionId: number,
  sectionData: Record<string, unknown>,
): SchemaValidationResult {
  const properties = jsonSchema.properties as Record<string, unknown> | undefined;
  const sectionSchema = properties?.[String(sectionId)];

  if (!sectionSchema || typeof sectionSchema !== "object") {
    return { valid: true, errors: [] };
  }

  return validateAgainstJsonSchema(
    sectionSchema as Record<string, unknown>,
    sectionData,
  );
}
