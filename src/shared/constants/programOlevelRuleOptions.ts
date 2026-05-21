export const PROGRAM_OLEVEL_REQUIREMENT_SORT_DEFAULT = "programId:asc,createdAt:desc";

export const PROGRAM_OLEVEL_REQUIREMENT_INCLUDE =
  "program.department.faculty,subject";

export const PROGRAM_OLEVEL_LIST_ITEMS_PER_PAGE = 100;

export const REQUIREMENT_CATEGORY_LABELS = {
  compulsory: "Compulsory",
  optional: "Optional",
} as const;

export const REQUIREMENT_CATEGORY_FORM_OPTIONS = [
  {
    value: true,
    label: REQUIREMENT_CATEGORY_LABELS.compulsory,
    description: "Candidate must have this subject to qualify",
  },
  {
    value: false,
    label: REQUIREMENT_CATEGORY_LABELS.optional,
    description: "Counted if present but not required for qualification",
  },
] as const;
