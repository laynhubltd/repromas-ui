import type {
  CandidateEntryMode,
  CandidateGender,
} from "@/features/admission-candidate/types/admission-candidate";

export const CANDIDATE_GENDER_OPTIONS: {
  value: CandidateGender;
  label: string;
}[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

export const CANDIDATE_GENDER_FORM_OPTIONS: { value: string; label: string }[] =
  [
    { value: "M", label: "Male (M)" },
    { value: "F", label: "Female (F)" },
    { value: "O", label: "Other (O)" },
  ];

export const CANDIDATE_ENTRY_MODE_OPTIONS: {
  value: CandidateEntryMode;
  label: string;
}[] = [{ value: "JAMB", label: "JAMB" }];

export const ADMISSION_CANDIDATE_SORT_DEFAULT = "createdAt:desc";

export const ADMISSION_CANDIDATE_ITEMS_PER_PAGE = 30;

export const ADMISSION_CANDIDATE_LIST_INCLUDE =
  "application,screening,state";

export const ADMISSION_CANDIDATE_DETAIL_INCLUDE =
  "application.appliedProgram,application.offeredProgram,application.candidate.jambScores.subject,screening,state,lga,cycle";

export const CAPS_TEMPLATE_FILENAME =
  "admission-jamb-caps-upload-template.xlsx";

/** Cycle statuses that allow candidate ingestion (CAPS upload / single create). */
export const CANDIDATE_INGEST_ALLOWED_STATUSES = [
  "PRE_PROCESSING",
  "APPLICATION_OPEN",
] as const;
