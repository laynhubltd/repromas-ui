import {
  getAlternativeSetLabel,
} from "@/shared/constants/programPriorQualRequirementOptions";
import type { ProgramPriorQualificationRequirement } from "../types/program-prior-qualification-requirement";

export type RequirementRuleIntent = "must_have" | "alternative" | "optional";

export { ALTERNATIVE_SET_OPTIONS } from "@/shared/constants/programPriorQualRequirementOptions";

export const REQUIREMENT_RULE_INTENT_OPTIONS: {
  value: RequirementRuleIntent;
  label: string;
  description: string;
}[] = [
  {
    value: "must_have",
    label: "Must have",
    description:
      "The candidate must meet this qualification. Every other must-have rule for the program also applies.",
  },
  {
    value: "alternative",
    label: "One of several options",
    description:
      "The candidate can meet this qualification or any other in the same pick-one group — not all of them.",
  },
  {
    value: "optional",
    label: "Nice to have",
    description:
      "Preferred, but not required. If the candidate does not meet it, they can still qualify.",
  },
];

export function intentFromRequirement(
  requirement: Pick<
    ProgramPriorQualificationRequirement,
    "requirementGroup" | "isMandatory"
  >,
): RequirementRuleIntent {
  if (!requirement.isMandatory) return "optional";
  if (requirement.requirementGroup) return "alternative";
  return "must_have";
}

export function resolveRequirementGroupFromIntent(
  intent: RequirementRuleIntent,
  requirementGroup: string | null | undefined,
): string | null {
  if (intent !== "alternative") return null;
  return requirementGroup?.trim() || "ANY_OF_1";
}

export function resolveIsMandatoryFromIntent(intent: RequirementRuleIntent): boolean {
  return intent !== "optional";
}

export { getAlternativeSetLabel };

export function describeRequirementRuleIntent(
  intent: RequirementRuleIntent,
  requirementGroup: string | null | undefined,
  typeLabel?: string,
): string {
  const qual = typeLabel ?? "this qualification";

  switch (intent) {
    case "must_have":
      return `Candidate must have ${qual}, along with every other must-have rule.`;
    case "optional":
      return `${qual} is preferred but not required.`;
    case "alternative":
      return `Candidate needs ${qual} or another qualification in ${getAlternativeSetLabel(requirementGroup ?? "ANY_OF_1")}.`;
    default: {
      const _exhaustive: never = intent;
      return _exhaustive;
    }
  }
}

export function getIntentDisplayLabel(intent: RequirementRuleIntent): string {
  return (
    REQUIREMENT_RULE_INTENT_OPTIONS.find((option) => option.value === intent)?.label ??
    intent
  );
}
