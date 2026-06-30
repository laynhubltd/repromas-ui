import type {
  AssessmentFormat,
  PriorQualificationType,
  ScaleDefinition,
} from "../types/prior-qualification-type";

function summarizeScale(
  format: AssessmentFormat,
  scaleDefinition: ScaleDefinition,
): string {
  switch (format) {
    case "POINTS": {
      const maxPoints = (scaleDefinition as { maxPoints?: number }).maxPoints;
      return maxPoints != null ? `max ${maxPoints} pts` : "—";
    }
    case "CLASSIFICATION": {
      const classes = (scaleDefinition as { classes?: string[] }).classes;
      const grades = (scaleDefinition as { grades?: string[] }).grades;
      const count = classes?.length ?? grades?.length;
      if (!count) return "—";
      return classes?.length
        ? `${count} class${count === 1 ? "" : "es"}`
        : `${count} grade${count === 1 ? "" : "s"}`;
    }
    case "CGPA": {
      const min = (scaleDefinition as { min?: number }).min;
      const max = (scaleDefinition as { max?: number }).max;
      if (min == null || max == null) return "—";
      return `${min}–${max} CGPA`;
    }
    case "PASS_FAIL":
      return "PASS / FAIL";
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}

export function formatScaleSummary(row: PriorQualificationType): string {
  return summarizeScale(row.assessmentFormat, row.scaleDefinition);
}

export function formatScaleSummaryFromParts(
  format: AssessmentFormat,
  scaleDefinition: ScaleDefinition,
): string {
  return summarizeScale(format, scaleDefinition);
}
