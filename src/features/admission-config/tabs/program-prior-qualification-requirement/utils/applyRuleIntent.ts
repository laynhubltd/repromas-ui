import type { ProgramPriorQualRequirementFormValues } from "../types/program-prior-qualification-requirement";
import {
  resolveIsMandatoryFromIntent,
  resolveRequirementGroupFromIntent,
} from "./requirementRuleIntent";

export function applyRuleIntentToFormValues(
  values: ProgramPriorQualRequirementFormValues,
): ProgramPriorQualRequirementFormValues {
  const intent = values.ruleIntent ?? "must_have";

  return {
    ...values,
    groupMode: intent === "alternative" ? "or" : "standalone",
    requirementGroup: resolveRequirementGroupFromIntent(intent, values.requirementGroup),
    isMandatory: resolveIsMandatoryFromIntent(intent),
  };
}

export function withDefaultRuleIntent(
  values: Partial<ProgramPriorQualRequirementFormValues>,
): ProgramPriorQualRequirementFormValues {
  return applyRuleIntentToFormValues({
    programId: values.programId!,
    priorQualificationTypeId: values.priorQualificationTypeId!,
    ruleIntent: values.ruleIntent ?? "must_have",
    groupMode: values.groupMode ?? "standalone",
    requirementGroup: values.requirementGroup ?? null,
    minimumPoints: values.minimumPoints,
    minimumClass: values.minimumClass,
    minimumClassRank: values.minimumClassRank,
    entryLevelId: values.entryLevelId,
    isMandatory: values.isMandatory ?? true,
  });
}
