import type {
  CandidateEntryMode,
  CandidateGender,
  CandidateIntakeMode,
  OfferDecision,
  SeatBucket,
} from "@/features/admission-candidate/tabs/candidate/types/admission-candidate";
import { humanizeEnumValue } from "@/shared/constants/billingDisplayLabels";

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

export const ADMISSION_CANDIDATE_LIST_INCLUDE = "application,screening,state";

export const ADMISSION_CANDIDATE_DETAIL_INCLUDE =
  "application.appliedProgram,application.offeredProgram,application.candidate.jambScores.subject,application.candidate.olevelSittings.grades.subject,screening,state,lga,cycle";

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
  manualModeHelper:
    "For walk-in or direct entry applicants without a JAMB registration number.",
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

export const OFFER_DECISION_OPTIONS: { value: OfferDecision; label: string }[] =
  [
    { value: "ADMIT_MERIT", label: "Admit (Merit)" },
    { value: "ADMIT_CATCHMENT", label: "Admit (Catchment)" },
    { value: "ADMIT_ELDS", label: "Admit (ELDS)" },
    { value: "OFFER_CHANGE_OF_COURSE", label: "Change of course" },
    { value: "REJECTED", label: "Rejected" },
  ];

export const SEAT_BUCKET_OPTIONS: { value: SeatBucket; label: string }[] = [
  { value: "MERIT", label: "Merit" },
  { value: "CATCHMENT", label: "Catchment" },
  { value: "ELDS", label: "ELDS" },
];

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  PENDING: "Pending",
  DOCUMENTS_VERIFIED: "Documents verified",
  OFFER_ADMISSION: "Offer admission",
  REJECTED: "Rejected",
};

export const FINAL_DECISION_LABELS: Record<string, string> = {
  PENDING: "Awaiting decision",
  OFFER_ADMISSION: "Offer admission",
  REJECTED: "Not admitted",
  ADMIT_MERIT: "Admitted (merit)",
  ADMIT_CATCHMENT: "Admitted (catchment)",
  ADMIT_ELDS: "Admitted (ELDS)",
  OFFER_CHANGE_OF_COURSE: "Offer change of course",
};

export const OFFER_DECISION_LABELS = Object.fromEntries(
  OFFER_DECISION_OPTIONS.map((o) => [o.value, o.label]),
) as Record<OfferDecision, string>;

export const SEAT_BUCKET_LABELS = Object.fromEntries(
  SEAT_BUCKET_OPTIONS.map((o) => [o.value, o.label]),
) as Record<SeatBucket, string>;

export const CANDIDATE_GENDER_LABELS = Object.fromEntries(
  CANDIDATE_GENDER_OPTIONS.map((o) => [o.value, o.label]),
) as Record<CandidateGender, string>;

export const CANDIDATE_ENTRY_MODE_LABELS = Object.fromEntries(
  CANDIDATE_ENTRY_MODE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<CandidateEntryMode, string>;

export const OFFER_DECISION_SOURCE_LABELS: Record<string, string> = {
  RECOMMENDATION: "From recommendation",
  MANUAL_OVERRIDE: "Manual override",
};

export const FINAL_DECISION_TAG_COLORS: Partial<Record<string, string>> = {
  PENDING: "default",
  OFFER_ADMISSION: "success",
  REJECTED: "error",
  ADMIT_MERIT: "success",
  ADMIT_CATCHMENT: "success",
  ADMIT_ELDS: "success",
  OFFER_CHANGE_OF_COURSE: "warning",
};

export function getApplicationStatusLabel(
  status: string | null | undefined,
): string {
  if (!status) return "—";
  return APPLICATION_STATUS_LABELS[status] ?? humanizeEnumValue(status);
}

export function getFinalDecisionLabel(
  decision: string | null | undefined,
): string {
  if (!decision) return "—";
  return FINAL_DECISION_LABELS[decision] ?? humanizeEnumValue(decision);
}

export function getOfferDecisionLabel(
  decision: string | null | undefined,
): string {
  if (!decision) return "—";
  return OFFER_DECISION_LABELS[decision as OfferDecision] ?? humanizeEnumValue(decision);
}

export function getSeatBucketLabel(bucket: string | null | undefined): string {
  if (!bucket) return "—";
  return SEAT_BUCKET_LABELS[bucket as SeatBucket] ?? humanizeEnumValue(bucket);
}

export function getCycleStatusLabel(status: string | null | undefined): string {
  if (!status) return "—";
  return CYCLE_STATUS_LABELS[status] ?? humanizeEnumValue(status);
}

export function getCapsWarningStageLabel(
  stage: string | null | undefined,
): string {
  if (!stage) return "—";
  return CAPS_WARNING_STAGE_COPY[stage] ?? humanizeEnumValue(stage);
}

export function getCandidateGenderLabel(
  gender: string | null | undefined,
): string {
  if (!gender) return "—";
  return CANDIDATE_GENDER_LABELS[gender as CandidateGender] ?? humanizeEnumValue(gender);
}

export function getCandidateEntryModeLabel(
  entryMode: string | null | undefined,
): string {
  if (!entryMode) return "—";
  return (
    CANDIDATE_ENTRY_MODE_LABELS[entryMode as CandidateEntryMode] ??
    humanizeEnumValue(entryMode)
  );
}

export function getOfferDecisionSourceLabel(
  source: string | null | undefined,
): string {
  if (!source) return "—";
  return OFFER_DECISION_SOURCE_LABELS[source] ?? humanizeEnumValue(source);
}
