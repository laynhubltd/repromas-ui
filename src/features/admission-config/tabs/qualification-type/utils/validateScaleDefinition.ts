import type {
  AssessmentFormat,
  ScaleDefinition,
} from "../types/prior-qualification-type";

export type ScaleValidationResult =
  | { valid: true; scaleDefinition: ScaleDefinition }
  | { valid: false; message: string };

function isEmptyObject(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  );
}

function validateClassificationItems(
  items: string[] | undefined,
  keyLabel: string,
): ScaleValidationResult {
  const trimmed = (items ?? []).map((item) => item.trim()).filter(Boolean);

  if (trimmed.length < 2) {
    return {
      valid: false,
      message: `At least two ${keyLabel} entries are required.`,
    };
  }

  const seen = new Set<string>();
  for (const item of trimmed) {
    const normalized = item.toUpperCase();
    if (seen.has(normalized)) {
      return {
        valid: false,
        message: `Duplicate ${keyLabel.slice(0, -1)} "${item}" is not allowed.`,
      };
    }
    seen.add(normalized);
  }

  return { valid: true, scaleDefinition: { [keyLabel]: trimmed } as ScaleDefinition };
}

export function validateScaleDefinition(
  format: AssessmentFormat,
  scaleDefinition: ScaleDefinition | undefined | null,
): ScaleValidationResult {
  if (!scaleDefinition || isEmptyObject(scaleDefinition)) {
    return { valid: false, message: "Scale definition is required." };
  }

  switch (format) {
    case "POINTS": {
      const maxPoints = (scaleDefinition as { maxPoints?: unknown }).maxPoints;
      if (typeof maxPoints !== "number" || !Number.isFinite(maxPoints) || maxPoints <= 0) {
        return { valid: false, message: "Max points must be greater than 0." };
      }
      return { valid: true, scaleDefinition: { maxPoints } };
    }

    case "CLASSIFICATION": {
      const classes = (scaleDefinition as { classes?: string[] }).classes;
      const grades = (scaleDefinition as { grades?: string[] }).grades;

      if (classes?.length) {
        return validateClassificationItems(classes, "classes");
      }
      if (grades?.length) {
        return validateClassificationItems(grades, "grades");
      }
      return {
        valid: false,
        message: "At least two class or grade entries are required.",
      };
    }

    case "CGPA": {
      const min = (scaleDefinition as { min?: unknown }).min;
      const max = (scaleDefinition as { max?: unknown }).max;

      if (typeof min !== "number" || !Number.isFinite(min) || min < 0) {
        return { valid: false, message: "Minimum CGPA must be 0 or greater." };
      }
      if (typeof max !== "number" || !Number.isFinite(max) || max <= min) {
        return { valid: false, message: "Maximum CGPA must be greater than minimum." };
      }
      return { valid: true, scaleDefinition: { min, max } };
    }

    case "PASS_FAIL":
      return { valid: true, scaleDefinition: { values: ["PASS", "FAIL"] } };

    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}
