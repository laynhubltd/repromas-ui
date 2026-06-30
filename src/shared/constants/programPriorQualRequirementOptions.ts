export const PROGRAM_PRIOR_QUAL_REQUIREMENT_LIST_ITEMS_PER_PAGE = 100;

export const PROGRAM_PRIOR_QUAL_REQUIREMENT_SORT_DEFAULT =
  "programId:asc,requirementGroup:asc,id:asc";

export const PROGRAM_PRIOR_QUAL_REQUIREMENT_INCLUDE =
  "priorQualificationType,entryLevel,program.department.faculty";

export const AND_GROUP_LABEL = "Must have all";

export const OR_GROUP_ACTION_LABEL = "Pick one";

export const ALTERNATIVE_SET_OPTIONS = [
  { value: "ANY_OF_1", label: "Set 1" },
  { value: "ANY_OF_2", label: "Set 2" },
  { value: "ANY_OF_3", label: "Set 3" },
] as const;

export const MANDATORY_FILTER_OPTIONS = [
  { value: "true", label: "Required rules only" },
  { value: "false", label: "Nice-to-have only" },
] as const;

export function getAlternativeSetLabel(key: string): string {
  const preset = ALTERNATIVE_SET_OPTIONS.find((item) => item.value === key);
  return preset?.label ?? key;
}

export function getOrGroupSectionHeader(key: string): {
  accentLabel: string;
  title: string;
} {
  return {
    accentLabel: OR_GROUP_ACTION_LABEL,
    title: getAlternativeSetLabel(key),
  };
}

export function getRequirementGroupTitle(key: string): string {
  const { accentLabel, title } = getOrGroupSectionHeader(key);
  return `${accentLabel} · ${title}`;
}

export function getRequirementGroupModeLabel(requirementGroup: string | null): string {
  if (!requirementGroup) {
    return AND_GROUP_LABEL;
  }
  return getRequirementGroupTitle(requirementGroup);
}
