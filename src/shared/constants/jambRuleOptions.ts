import type {
  JambRequirementType,
  JambScopeValue,
} from "@/features/admission-config/tabs/jamb-rule/types/jamb-rule";

export const JAMB_SCOPE_OPTIONS: { value: JambScopeValue; label: string }[] = [
  { value: "GLOBAL", label: "Global" },
  { value: "FACULTY", label: "Faculty" },
  { value: "DEPARTMENT", label: "Department" },
  { value: "PROGRAM", label: "Program" },
];

export const JAMB_REQUIREMENT_TYPE_OPTIONS: {
  value: JambRequirementType;
  label: string;
  description: string;
}[] = [
  {
    value: "COMPULSORY",
    label: "Compulsory",
    description: "Candidate must have every subject listed in this group",
  },
  {
    value: "ANY_OF",
    label: "Any Of",
    description: "Candidate must match at least N subjects from the options",
  },
];

export const JAMB_COMBINATION_LIST_SORT_DEFAULT = "priorityWeight:desc,name:asc";
export const JAMB_COMBINATION_LIST_ITEMS_PER_PAGE = 30;

export const JAMB_GROUP_LIST_SORT_DEFAULT = "name:asc";
export const JAMB_GROUP_INCLUDE = "combination";

export const JAMB_OPTION_LIST_SORT_DEFAULT = "subjectId:asc";
export const JAMB_OPTION_INCLUDE = "subject";

export const JAMB_OLEVEL_SUBJECTS_ITEMS_PER_PAGE = 100;
