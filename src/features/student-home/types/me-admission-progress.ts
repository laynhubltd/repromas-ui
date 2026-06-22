export type PortalState =
  | "form_only"
  | "application_started"
  | "fee_pending"
  | "fee_paid"
  | "submitted"
  | "screening"
  | "documents_verified"
  | "decision_pending"
  | "offered_change_of_course"
  | "admitted"
  | "rejected"
  | "matriculated";

export type NextAction =
  | "continue_form"
  | "choose_program"
  | "pay_application_fee"
  | "submit_application"
  | "wait_for_screening"
  | "wait_for_decision"
  | "accept_offer"
  | "view_dossier"
  | "none";

export type ProgressStepKey =
  | "profile"
  | "application_form"
  | "program_choice"
  | "application_fee"
  | "submit_application"
  | "screening"
  | "document_verification"
  | "admission_decision"
  | "matriculation";

export type ProgressStepStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "blocked"
  | "skipped";

export type BlockerCode = "APPLICATION_FEE_UNPAID" | "CYCLE_NOT_OPEN" | string;

export type MeAdmissionProgressStep = {
  key: ProgressStepKey | string;
  status: ProgressStepStatus | string;
  order: number;
};

export type MeAdmissionProgressBlocker = {
  code: BlockerCode;
  step: ProgressStepKey | string;
};

export type MeAdmissionProgressFee = {
  required: boolean;
  feeChargeId: number | null;
  status: string;
  allowedToSubmit: boolean;
};

export type MeAdmissionProgress = {
  portalState: PortalState | string;
  cycleId: number;
  cycleStatus: string;
  candidateId: number;
  applicationId: number | null;
  formSubmissionId: number | null;
  currentStep: ProgressStepKey | string;
  nextAction: NextAction | string;
  steps: MeAdmissionProgressStep[];
  blockers: MeAdmissionProgressBlocker[];
  fee: MeAdmissionProgressFee | null;
};
