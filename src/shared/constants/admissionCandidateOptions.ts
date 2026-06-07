import type {
  CandidateEntryMode,
  CandidateGender,
  CandidateIntakeMode,
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

export const CYCLE_STATUS_LABELS: Record<string, string> = {
  PRE_PROCESSING: "Pre-processing",
  APPLICATION_OPEN: "Application open",
  SCREENING: "Screening",
  OFFER: "Offer",
  MATRICULATION: "Matriculation",
  CLOSED: "Closed",
};

export const CANDIDATE_INTAKE_MODE_OPTIONS: {
  value: CandidateIntakeMode;
  label: string;
}[] = [
  { value: "manual", label: "Without JAMB registration" },
  { value: "jamb", label: "With JAMB registration" },
];

export const CAPS_WARNING_STAGE_COPY: Record<string, string> = {
  candidate: "Existing candidate",
  application: "Existing application",
  jamb_score: "Duplicate subject line",
  ignored_subject: "Subject not required",
  duplicate: "Duplicate score",
};

export const ADMISSION_CANDIDATE_CREATE_UI_COPY = {
  modalTitle: "Create admission candidate",
  modalTitleResult: "Candidate processed",
  intakeClosedBanner:
    "Candidate intake is closed for this cycle. Ingestion is only allowed during Pre-processing or Application Open.",
  manualModeHelper: "For walk-in or direct entry applicants without a JAMB registration number.",
  jambModeHelper:
    "Enter the JAMB registration number and optional subject scores for CAPS parity.",
  manualConfirmTitle: "Create without JAMB number?",
  manualConfirmBody:
    "No JAMB registration number was provided. A new candidate record will always be created, even if names match an existing person.",
  manualConfirmOk: "Create candidate",
  appliedProgramLabel: "Applied program",
  appliedProgramPlaceholder: "Select program",
  jambScoresTitle: "JAMB scores (optional)",
  addScoreRow: "Add score",
  resultCandidate: "Candidate",
  resultApplication: "Application",
  resultJambScores: "JAMB scores",
  resultScoresRecorded: "{count} score(s) recorded",
  resultScoresNone: "None",
  resultWarningsTitle: "Notes",
  billingHint:
    "An admission application was created. If application fees are configured, a draft charge may be generated — check Billing.",
  viewCandidate: "View candidate",
  viewApplication: "View application",
  done: "Done",
  create: "Create",
  cancel: "Cancel",
  successWithWarnings: "Candidate processed with notes.",
} as const;
