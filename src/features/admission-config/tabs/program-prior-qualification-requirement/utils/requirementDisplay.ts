import { getRequirementGroupTitle } from "@/shared/constants/programPriorQualRequirementOptions";
import type { ProgramPriorQualificationRequirement } from "../types/program-prior-qualification-requirement";

export function formatThresholdSummary(
  requirement: ProgramPriorQualificationRequirement,
): string {
  const format = requirement.priorQualificationType?.assessmentFormat;

  if (format === "POINTS" && requirement.minimumPoints != null) {
    return `≥ ${requirement.minimumPoints} pts`;
  }

  if (format === "CLASSIFICATION") {
    if (requirement.minimumClass) {
      return `≥ ${requirement.minimumClass}`;
    }
    if (requirement.minimumClassRank != null) {
      return `rank ≤ ${requirement.minimumClassRank}`;
    }
  }

  if (format === "CGPA" || format === "PASS_FAIL") {
    return "Qualification required";
  }

  if (requirement.minimumPoints != null) {
    return `≥ ${requirement.minimumPoints} pts`;
  }
  if (requirement.minimumClass) {
    return `≥ ${requirement.minimumClass}`;
  }

  return "—";
}

export function formatRequirementLineLabel(
  requirement: ProgramPriorQualificationRequirement,
): string {
  const type = requirement.priorQualificationType;
  if (!type) return `Type #${requirement.priorQualificationTypeId}`;
  return `${type.code} — ${formatThresholdSummary(requirement)}`;
}

export function formatOrGroupHeader(key: string): string {
  return getRequirementGroupTitle(key);
}

export function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getClassificationOptionsFromType(
  requirement: ProgramPriorQualificationRequirement,
): string[] {
  const scale = requirement.priorQualificationType?.scaleDefinition;
  if (!scale || typeof scale !== "object") return [];
  const classes = (scale as { classes?: string[] }).classes;
  if (classes?.length) return classes;
  const grades = (scale as { grades?: string[] }).grades;
  return grades ?? [];
}
