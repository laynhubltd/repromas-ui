import { humanizeEnumValue } from "@/shared/constants/billingDisplayLabels";
import type {
  MeApplicationStatus,
  MeFinalDecision,
} from "../types/me-admission-application";

export const ME_ADMISSION_APPLICATION_DOSSIER_INCLUDE =
  "candidate,candidate.state,candidate.lga,candidate.cycle,candidate.jambScores.subject,candidate.olevelSittings.grades.subject,appliedProgram,offeredProgram,screening";

export const ME_APPLICATION_STATUS_OPTIONS: {
  value: MeApplicationStatus;
  label: string;
}[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "DOCUMENTS_VERIFIED", label: "Documents verified" },
];

export const ME_FINAL_DECISION_OPTIONS: {
  value: MeFinalDecision;
  label: string;
}[] = [
  { value: "PENDING", label: "Awaiting decision" },
  { value: "ADMIT_MERIT", label: "Admitted (merit)" },
  { value: "ADMIT_CATCHMENT", label: "Admitted (catchment)" },
  { value: "ADMIT_ELDS", label: "Admitted (ELDS)" },
  { value: "OFFER_CHANGE_OF_COURSE", label: "Offer change of course" },
  { value: "REJECTED", label: "Not admitted" },
];

export type StatusDisplay = {
  label: string;
  color?: string;
};

export const ME_APPLICATION_UI_COPY = {
  pageTitle: "My Application",
  explorerTitle: "Application summary",
  explorerBody:
    "Review your admission application status, program choice, and screening results. To edit your form answers, use the Apply page.",
  notStartedTitle: "No application yet",
  notStartedBody:
    "You have not started an admission application. Begin by completing the application form.",
  startApplication: "Start application",
  continueApplication: "Continue application",
  viewPayments: "View payments",
  permissionDenied:
    "You do not have permission to view your application. Contact your institution administrator if this persists.",
  sectionIdentity: "Identity",
  sectionProgram: "Program choice",
  sectionOffer: "Offered program",
  sectionScreening: "Screening scores",
  sectionJamb: "JAMB subject scores",
  sectionOlevel: "O-Level results",
  scorePending: "Score pending — results will appear after screening is complete.",
  noJambScores: "No JAMB subject scores recorded.",
  noOlevelSittings: "No O-Level sittings recorded.",
  lifecycleStarted: "Application started",
  lifecycleFee: "Application fee",
  lifecycleSubmitted: "Submitted",
  lifecycleVerified: "Documents verified",
  lifecycleDecision: "Decision",
  lastUpdated: "Last updated",
  appliedProgram: "Applied program",
  offeredProgram: "Offered program",
  matriculated: "Matriculated",
  cycle: "Admission cycle",
  jambRegNo: "JAMB registration number",
  stateOfOrigin: "State of origin",
  lga: "LGA",
  entryMode: "Entry mode",
  jambTotal: "JAMB total",
  schoolRawScore: "School raw score",
  aggregateScore: "Aggregate score",
  examType: "Exam type",
  examYear: "Exam year",
  examRegNo: "Exam registration number",
  schoolName: "School name",
  printAcknowledgementSlip: "Print acknowledgement slip",
  printApplication: "Print application",
  acknowledgementPageTitle: "Application received",
  sectionDocuments: "Uploaded documents",
} as const;

const APPLICATION_STATUS_COLORS: Partial<Record<string, string>> = {
  DRAFT: "default",
  SUBMITTED: "processing",
  DOCUMENTS_VERIFIED: "success",
};

const FINAL_DECISION_COLORS: Partial<Record<string, string>> = {
  PENDING: "default",
  ADMIT_MERIT: "success",
  ADMIT_CATCHMENT: "success",
  ADMIT_ELDS: "success",
  OFFER_CHANGE_OF_COURSE: "warning",
  REJECTED: "error",
};

export function resolveApplicationStatusDisplay(
  status: string | undefined,
): StatusDisplay {
  if (!status) return { label: "—" };
  const match = ME_APPLICATION_STATUS_OPTIONS.find((o) => o.value === status);
  return {
    label: match?.label ?? humanizeEnumValue(status),
    color: APPLICATION_STATUS_COLORS[status],
  };
}

export function resolveFinalDecisionDisplay(
  decision: string | undefined,
): StatusDisplay {
  if (!decision) return { label: "—" };
  const match = ME_FINAL_DECISION_OPTIONS.find((o) => o.value === decision);
  return {
    label: match?.label ?? humanizeEnumValue(decision),
    color: FINAL_DECISION_COLORS[decision],
  };
}
