import { humanizeEnumValue } from "@/shared/constants/billingDisplayLabels";
import type {
  BlockerCode,
  NextAction,
  PortalState,
  ProgressStepKey,
} from "../types/me-admission-progress";

export type StatusDisplay = {
  label: string;
  color?: string;
};

export const ME_ADMISSION_PROGRESS_STEP_OPTIONS: {
  value: ProgressStepKey;
  label: string;
}[] = [
  { value: "profile", label: "Profile" },
  { value: "application_form", label: "Application form" },
  { value: "program_choice", label: "Program choice" },
  { value: "application_fee", label: "Application fee" },
  { value: "submit_application", label: "Submit application" },
  { value: "screening", label: "Screening" },
  { value: "document_verification", label: "Document verification" },
  { value: "admission_decision", label: "Admission decision" },
  { value: "matriculation", label: "Matriculation" },
];

export const ME_PORTAL_STATE_OPTIONS: {
  value: PortalState;
  label: string;
  color?: string;
}[] = [
  { value: "form_only", label: "Not started", color: "default" },
  { value: "application_started", label: "In progress", color: "processing" },
  { value: "fee_pending", label: "Application fee pending", color: "warning" },
  { value: "fee_paid", label: "Fee paid", color: "success" },
  { value: "submitted", label: "Submitted", color: "processing" },
  { value: "screening", label: "Screening in progress", color: "processing" },
  {
    value: "documents_verified",
    label: "Documents verified",
    color: "success",
  },
  { value: "decision_pending", label: "Awaiting decision", color: "default" },
  {
    value: "offered_change_of_course",
    label: "Change of course offered",
    color: "warning",
  },
  { value: "admitted", label: "Admitted", color: "success" },
  { value: "rejected", label: "Not admitted", color: "error" },
  { value: "matriculated", label: "Matriculated", color: "success" },
];

export const ME_NEXT_ACTION_OPTIONS: {
  value: NextAction;
  label: string;
}[] = [
  { value: "continue_form", label: "Continue application" },
  { value: "choose_program", label: "Choose program" },
  { value: "pay_application_fee", label: "Pay application fee" },
  { value: "submit_application", label: "Submit application" },
  { value: "wait_for_screening", label: "Waiting for screening" },
  { value: "wait_for_decision", label: "Waiting for decision" },
  { value: "accept_offer", label: "Review offer" },
  { value: "view_dossier", label: "View application" },
  { value: "none", label: "No action required" },
];

export const ME_PROGRESS_UI_COPY = {
  dashboardTitle: "Application Admission Progress",
  dashboardSubtitle:
    "Track where you are in the process and complete the next required step.",
  progressSectionTitle: "Application checklist",
  progressSectionHint:
    "Steps update automatically as you save your form, pay fees, and submit.",
  progressCompleteLabel: "complete",
  progressStepOf: "Step",
  progressOf: "of",
  waitingScreeningHint:
    "Your application is under review. We will update this page when screening progresses.",
  waitingDecisionHint:
    "Your application has been processed. Check back here for your admission decision.",
  explainerTitle: "Admission progress",
  explainerBody:
    "Track your application steps and complete the next required action. Use Apply to edit your form or Application to review submitted details.",
  permissionDenied:
    "You do not have permission to view admission progress. Contact your institution administrator if this persists.",
  noCandidateLinked:
    "No admission candidate profile is linked to your account yet.",
  viewFullApplication: "View full application",
  openApplicationForm: "Open application form",
  primaryCtaFallback: "Continue",
  blockerApplicationFeeUnpaid:
    "Application fee must be paid before you can submit.",
  blockerCycleNotOpen:
    "The admission cycle is closed. Submission is not available.",
} as const;

export const ADMISSION_PROGRESS_PHASES: {
  key: string;
  label: string;
  stepKeys: ProgressStepKey[];
}[] = [
  {
    key: "application",
    label: "Complete your application",
    stepKeys: [
      "profile",
      "application_form",
      "program_choice",
      "application_fee",
      "submit_application",
    ],
  },
  {
    key: "review",
    label: "Review & verification",
    stepKeys: ["screening", "document_verification"],
  },
  {
    key: "outcome",
    label: "Decision & enrollment",
    stepKeys: ["admission_decision", "matriculation"],
  },
];

export const ADMISSION_STEP_DESCRIPTIONS: Partial<
  Record<ProgressStepKey, string>
> = {
  profile: "Your candidate profile is set up.",
  application_form: "Fill in the admission form sections.",
  program_choice: "Select the program you are applying for.",
  application_fee: "Pay the required application fee if applicable.",
  submit_application: "Review and submit your application.",
  screening: "Institution reviews your application.",
  document_verification: "Submitted documents are verified.",
  admission_decision: "Admission outcome is published.",
  matriculation: "Complete matriculation after admission.",
};

export const ADMISSION_BLOCKER_LABELS: Partial<Record<BlockerCode, string>> = {
  APPLICATION_FEE_UNPAID: ME_PROGRESS_UI_COPY.blockerApplicationFeeUnpaid,
  CYCLE_NOT_OPEN: ME_PROGRESS_UI_COPY.blockerCycleNotOpen,
};

const PORTAL_STATE_COLORS: Partial<Record<string, string>> = Object.fromEntries(
  ME_PORTAL_STATE_OPTIONS.map((o) => [o.value, o.color]),
);

export function resolvePortalStateDisplay(
  portalState: string | undefined,
): StatusDisplay {
  if (!portalState) return { label: "—" };
  const match = ME_PORTAL_STATE_OPTIONS.find((o) => o.value === portalState);
  return {
    label: match?.label ?? humanizeEnumValue(portalState),
    color: PORTAL_STATE_COLORS[portalState],
  };
}

export function resolveNextActionCta(
  nextAction: string | undefined,
): string | null {
  if (!nextAction || nextAction === "none") return null;
  const match = ME_NEXT_ACTION_OPTIONS.find((o) => o.value === nextAction);
  return match?.label ?? humanizeEnumValue(nextAction);
}

export function resolveStepLabel(stepKey: string): string {
  const match = ME_ADMISSION_PROGRESS_STEP_OPTIONS.find(
    (o) => o.value === stepKey,
  );
  return match?.label ?? humanizeEnumValue(stepKey);
}

export function getAdmissionBlockerLabel(code: BlockerCode): string {
  return ADMISSION_BLOCKER_LABELS[code] ?? humanizeEnumValue(code);
}

export function resolveBlockerMessage(code: BlockerCode): string {
  return getAdmissionBlockerLabel(code);
}

export const PROGRESS_POLLING_INTERVAL_MS = 30_000;

export const PROGRESS_POLLING_NEXT_ACTIONS = new Set<string>([
  "wait_for_screening",
  "wait_for_decision",
]);
