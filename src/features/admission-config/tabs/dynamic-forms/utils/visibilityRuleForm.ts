import type {
  FieldType,
  FormField,
  OptionsConfig,
  VisibilityConfig,
} from "@/features/dynamic-form/types";

export type VisibilityFormSlice = {
  visibilityField?: string;
  visibilityOperator?: "equals" | "not_equals" | "in";
  visibilityValue?: string;
  visibilityInValues?: string[];
  visibilityEnabled?: boolean;
};

const OPERATOR_LABELS: Record<string, string> = {
  equals: "is equal to",
  not_equals: "is not equal to",
  in: "is one of",
};

export function coerceVisibilityValue(
  raw: string | string[] | undefined,
  operator: "equals" | "not_equals" | "in",
): unknown {
  if (operator === "in") {
    const values = Array.isArray(raw)
      ? raw
      : (raw ?? "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
    return values.map((v) => {
      if (v === "true") return true;
      if (v === "false") return false;
      if (/^-?\d+$/.test(v)) return Number(v);
      return v;
    });
  }

  const str = Array.isArray(raw) ? raw[0] : raw;
  if (str === "true") return true;
  if (str === "false") return false;
  if (str && /^-?\d+$/.test(str)) return Number(str);
  return str;
}

export function serializeVisibilityValueForForm(
  value: unknown,
  operator: "equals" | "not_equals" | "in",
): { visibilityValue?: string; visibilityInValues?: string[] } {
  if (operator === "in" && Array.isArray(value)) {
    return {
      visibilityInValues: value.map((v) => String(v)),
      visibilityValue: value.map((v) => String(v)).join(", "),
    };
  }
  return {
    visibilityValue: value != null ? String(value) : undefined,
  };
}

export function parseVisibilityConfigToFormSlice(
  config: VisibilityConfig | null | undefined,
): VisibilityFormSlice {
  const condition = config?.["x-condition"];
  if (!condition) {
    return { visibilityEnabled: false };
  }

  const serialized = serializeVisibilityValueForForm(
    condition.value,
    condition.operator,
  );

  return {
    visibilityEnabled: true,
    visibilityField: condition.field,
    visibilityOperator: condition.operator,
    ...serialized,
  };
}

export function buildVisibilityConfigFromFormSlice(
  slice: VisibilityFormSlice,
): VisibilityConfig | null {
  if (!slice.visibilityEnabled || !slice.visibilityField?.trim()) {
    return null;
  }

  const operator = slice.visibilityOperator ?? "equals";
  const rawValue =
    operator === "in"
      ? (slice.visibilityInValues ?? slice.visibilityValue?.split(",").map((v) => v.trim()))
      : slice.visibilityValue;

  return {
    "x-condition": {
      field: slice.visibilityField.trim(),
      operator,
      value: coerceVisibilityValue(rawValue, operator),
    },
  };
}

export function summarizeVisibilityConfig(
  config: VisibilityConfig | null | undefined,
  sectionFields: FormField[] = [],
): string {
  const condition = config?.["x-condition"];
  if (!condition) return "Always visible";

  const trigger = sectionFields.find((f) => f.fieldKey === condition.field);
  const triggerLabel = trigger?.label ?? condition.field;
  const opLabel = OPERATOR_LABELS[condition.operator] ?? condition.operator;

  let valueLabel: string;
  if (Array.isArray(condition.value)) {
    valueLabel = condition.value.map((v) => `"${String(v)}"`).join(", ");
  } else {
    valueLabel = `"${String(condition.value)}"`;
  }

  return `Visible when ${triggerLabel} ${opLabel} ${valueLabel}`;
}

export function getTriggerFieldOptions(
  sectionFields: FormField[],
  currentFieldKey: string,
): { value: string; label: string; fieldType: FieldType; optionsConfig: OptionsConfig | null }[] {
  return sectionFields
    .filter((f) => f.fieldKey !== currentFieldKey)
    .map((f) => ({
      value: f.fieldKey,
      label: `${f.label} (${f.fieldKey})`,
      fieldType: f.fieldType,
      optionsConfig: f.optionsConfig,
    }));
}

export function getStaticOptionsForField(
  optionsConfig: OptionsConfig | null,
): { value: string; label: string }[] {
  if (!optionsConfig || optionsConfig.source !== "STATIC" || !("options" in optionsConfig)) {
    return [];
  }
  return optionsConfig.options.map((o) => ({
    value: String(o.value),
    label: o.label,
  }));
}
