import type { OptionsConfig } from "@/features/dynamic-form/types";
import { CANDIDATE_GENDER_OPTIONS } from "@/shared/constants/admissionCandidateOptions";
import { serializeValidationConfigForForm } from "./parseFieldFormValues";

export type StaticOptionRow = {
  value: string;
  label: string;
};

export type FieldOptionValue = { value: number | string; label: string };

function coerceOptionRow(raw: unknown): StaticOptionRow | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  const value = row.value ?? row.id;
  const label = row.label ?? row.name;
  if (value == null || label == null) return null;
  const valueStr = String(value).trim();
  const labelStr = String(label).trim();
  if (!valueStr || !labelStr) return null;
  return { value: valueStr, label: labelStr };
}

export function parseStaticOptionsJson(json: string | undefined): StaticOptionRow[] {
  if (!json?.trim()) return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(coerceOptionRow).filter((r): r is StaticOptionRow => r != null);
  } catch {
    return [];
  }
}

export function rowsToFieldOptions(rows: StaticOptionRow[]): FieldOptionValue[] {
  return rows.map((row) => {
    const asNumber = Number(row.value);
    const value =
      Number.isFinite(asNumber) && String(asNumber) === row.value
        ? asNumber
        : row.value;
    return { value, label: row.label };
  });
}

export function serializeStaticOptionsJson(rows: StaticOptionRow[]): string {
  return JSON.stringify(rowsToFieldOptions(rows), null, 2);
}

export function buildStaticOptionsConfig(rows: StaticOptionRow[]): OptionsConfig {
  return {
    source: "STATIC",
    options: rowsToFieldOptions(rows),
  };
}

export function validateStaticOptionRows(rows: StaticOptionRow[]): string | null {
  if (rows.length === 0) return "Add at least one option.";
  const seen = new Set<string>();
  for (const row of rows) {
    if (!row.value?.trim()) return "Each option must have a value.";
    if (!row.label?.trim()) return "Each option must have a label.";
    if (seen.has(row.value.trim())) return "Option values must be unique.";
    seen.add(row.value.trim());
  }
  return null;
}

export function summarizeStaticOptions(
  options: FieldOptionValue[] | null | undefined,
): string {
  if (!options?.length) return "No static options configured.";
  const labels = options.map((o) => o.label).join(", ");
  return `${options.length} option${options.length === 1 ? "" : "s"}: ${labels}`;
}

export function buildEnumFromStaticOptions(
  options: FieldOptionValue[],
): string[] {
  return options.map((o) => String(o.value));
}

export function defaultStaticOptionsForColumn(
  columnName: string | undefined,
): FieldOptionValue[] {
  if (columnName === "gender") {
    return CANDIDATE_GENDER_OPTIONS.map((o) => ({
      value: o.value,
      label: o.label,
    }));
  }
  return [];
}

export function mergeValidationEnumFromStaticOptions(
  validationConfigJson: string | undefined,
  fallback: Record<string, unknown>,
  enumValues: string[],
): string | undefined {
  if (enumValues.length === 0) return undefined;
  const schema = (() => {
    if (!validationConfigJson?.trim()) return { ...fallback };
    try {
      const parsed = JSON.parse(validationConfigJson) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // fall through
    }
    return { ...fallback };
  })();

  const type = schema.type;
  const hasEnum = Array.isArray(schema.enum) && schema.enum.length > 0;
  if (type !== "string" || hasEnum) return undefined;

  return serializeValidationConfigForForm({
    ...schema,
    enum: enumValues,
  });
}

export function staticEnumMatchesValidation(
  options: FieldOptionValue[],
  validationConfig: Record<string, unknown>,
): boolean {
  const enumRaw = validationConfig.enum;
  if (!Array.isArray(enumRaw) || enumRaw.length === 0) return true;
  const staticValues = new Set(options.map((o) => String(o.value)));
  const enumValues = enumRaw.map((v) => String(v));
  if (staticValues.size !== enumValues.length) return false;
  return enumValues.every((v) => staticValues.has(v));
}
