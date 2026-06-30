import type { AssessmentFormat } from "@/features/admission-config/tabs/qualification-type/types/prior-qualification-type";
import type { ProgramPriorQualRequirementFormValues } from "../types/program-prior-qualification-requirement";
import { applyRuleIntentToFormValues } from "./applyRuleIntent";
import { normalizeMinimumClass, normalizeRequirementGroup } from "./normalizeMinimumClass";

export type ThresholdValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export function validateRequirementThreshold(
  format: AssessmentFormat | undefined,
  values: Pick<
    ProgramPriorQualRequirementFormValues,
    "minimumPoints" | "minimumClass" | "minimumClassRank"
  >,
  maxPoints?: number,
): ThresholdValidationResult {
  if (!format) {
    return { valid: false, message: "Qualification type is required." };
  }

  switch (format) {
    case "POINTS": {
      const points = values.minimumPoints;
      if (points == null || !Number.isFinite(points) || points <= 0) {
        return { valid: false, message: "Minimum points must be greater than 0." };
      }
      if (maxPoints != null && points > maxPoints) {
        return {
          valid: false,
          message: `Minimum points cannot exceed ${maxPoints}.`,
        };
      }
      return { valid: true };
    }
    case "CLASSIFICATION": {
      const hasClass = Boolean(values.minimumClass?.trim());
      const hasRank =
        values.minimumClassRank != null && Number.isFinite(values.minimumClassRank);
      if (!hasClass && !hasRank) {
        return {
          valid: false,
          message: "Minimum class or class rank is required.",
        };
      }
      return { valid: true };
    }
    case "CGPA":
    case "PASS_FAIL":
      return { valid: true };
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}

export function buildThresholdFieldsFromForm(
  format: AssessmentFormat | undefined,
  values: ProgramPriorQualRequirementFormValues,
): {
  minimumPoints: number | null;
  minimumClass: string | null;
  minimumClassRank: number | null;
} {
  switch (format) {
    case "POINTS":
      return {
        minimumPoints: values.minimumPoints ?? null,
        minimumClass: null,
        minimumClassRank: null,
      };
    case "CLASSIFICATION":
      return {
        minimumPoints: null,
        minimumClass: normalizeMinimumClass(values.minimumClass),
        minimumClassRank: values.minimumClassRank ?? null,
      };
    case "CGPA":
    case "PASS_FAIL":
      return {
        minimumPoints: null,
        minimumClass: null,
        minimumClassRank: null,
      };
    default:
      return {
        minimumPoints: null,
        minimumClass: null,
        minimumClassRank: null,
      };
  }
}

export function buildCreateRequirementPayload(
  values: ProgramPriorQualRequirementFormValues,
  format: AssessmentFormat | undefined,
) {
  const resolved = applyRuleIntentToFormValues(values);
  const thresholds = buildThresholdFieldsFromForm(format, resolved);
  return {
    programId: resolved.programId,
    priorQualificationTypeId: resolved.priorQualificationTypeId,
    requirementGroup: normalizeRequirementGroup(resolved.groupMode, resolved.requirementGroup),
    ...thresholds,
    maxFailGrades: null,
    entryLevelId: resolved.entryLevelId ?? null,
    isMandatory: resolved.isMandatory,
  };
}

export function buildUpdateRequirementPayload(
  values: ProgramPriorQualRequirementFormValues,
  format: AssessmentFormat | undefined,
  target: { id: number; programId: number; priorQualificationTypeId: number },
) {
  const resolved = applyRuleIntentToFormValues(values);
  const thresholds = buildThresholdFieldsFromForm(format, resolved);
  return {
    id: target.id,
    programId: target.programId,
    priorQualificationTypeId: target.priorQualificationTypeId,
    requirementGroup: normalizeRequirementGroup(resolved.groupMode, resolved.requirementGroup),
    ...thresholds,
    maxFailGrades: null,
    entryLevelId: resolved.entryLevelId ?? null,
    isMandatory: resolved.isMandatory,
  };
}
