import type { FieldType } from "../types";

const WIDGET_FIELD_TYPES = new Set<FieldType>([
  "WIDGET_OLEVEL",
  "WIDGET_JAMB",
  "WIDGET_PROGRAM_CHOICE",
]);

export function isWidgetFieldType(fieldType: FieldType): boolean {
  return WIDGET_FIELD_TYPES.has(fieldType);
}

export function isEmptyFieldValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "boolean") return false;
  if (typeof value === "number") return !Number.isFinite(value);
  if (Array.isArray(value)) return value.length === 0;
  return false;
}
