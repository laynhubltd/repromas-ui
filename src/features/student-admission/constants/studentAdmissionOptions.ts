import type { WorkflowStep } from "@/shared/constants/billingWorkflowOptions";

export const ADMISSION_LETTER_WORKFLOW_STEP: WorkflowStep = "MATRICULATE";
export const ADMISSION_ACCEPTANCE_FEE_EVENT_CODE = "ADMISSION_ACCEPTANCE_FEE";
export const ADMISSION_REGISTRATION_FEE_EVENT_CODE = "ADMISSION_REGISTRATION_FEE";

export const STUDENT_ADMISSION_UI_COPY = {
  pageTitle: "Admission",
  explorerTitle: "Your admission letter",
  explorerBody:
    "View and print your provisional admission letter once you have been admitted. Payment of the acceptance fee is required before the letter can be accessed.",
  notCandidateMessage:
    "This page is available to admission candidates only.",
  notAdmittedTitle: "Admission letter not available yet",
  notAdmittedBody:
    "Your admission letter will appear here once you have been admitted. Check your application status on the Home or Application page.",
  noCandidateLinkedTitle: "No admission record found",
  noCandidateLinkedBody:
    "Start your application from the Apply page to track your admission progress.",
  permissionDenied: "You do not have permission to view admission details.",
  printLetter: "Print letter / Save as PDF",
} as const;

export function canViewAdmissionLetter(portalState: string | undefined): boolean {
  return portalState === "admitted" || portalState === "matriculated";
}

export function shouldApplyAcceptanceFeeGuard(
  portalState: string | undefined,
): boolean {
  return portalState === "admitted";
}
