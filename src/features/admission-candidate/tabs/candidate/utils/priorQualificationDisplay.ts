import type { CandidatePriorQualification } from "../types/admission-candidate";

function readScalar(value: unknown): string | null {
  if (typeof value === "number" && !Number.isNaN(value)) return String(value);
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return null;
}

/**
 * Formats assessedValue JSON according to priorQualificationType.assessmentFormat
 * (CGPA, CLASSIFICATION, POINTS, PASS_FAIL) matching PriorQualificationRequirementEvaluator.
 */
export function formatPriorQualificationAssessedValue(
  qual: CandidatePriorQualification,
): string {
  const assessed = qual.assessedValue ?? {};
  const format = qual.priorQualificationType?.assessmentFormat;

  if (format === "CGPA") {
    const cgpa = readScalar(assessed.cgpa);
    const maxScale = readScalar(
      qual.priorQualificationType?.scaleDefinition?.max ?? assessed.scale,
    );
    if (cgpa !== null) {
      return maxScale ? `${cgpa} / ${maxScale}` : `${cgpa} CGPA`;
    }
  }

  if (format === "CLASSIFICATION") {
    const cls = readScalar(assessed.class ?? assessed.classification);
    if (cls !== null) return cls;
  }

  if (format === "POINTS") {
    const pts = readScalar(assessed.points ?? assessed.totalPoints);
    if (pts !== null) return `${pts} pts`;
  }

  if (format === "PASS_FAIL") {
    const status = readScalar(assessed.status ?? assessed.result);
    if (status !== null) return status;
  }

  const entries = Object.entries(assessed)
    .map(([key, value]) => {
      const scalar = readScalar(value);
      return scalar !== null ? `${key}: ${scalar}` : null;
    })
    .filter((item): item is string => item !== null);

  return entries.length > 0 ? entries.join(" · ") : "—";
}
