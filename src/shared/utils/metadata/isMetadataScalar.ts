export function isMetadataScalar(
  value: unknown,
): value is string | number | boolean | bigint | null | undefined {
  return (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  );
}

export function isPlainMetadataObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
