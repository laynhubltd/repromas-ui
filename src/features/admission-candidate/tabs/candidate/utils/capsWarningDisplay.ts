import { CAPS_WARNING_STAGE_COPY } from "@/shared/constants/admissionCandidateOptions";
import { humanizeEnumValue } from "@/shared/constants/billingDisplayLabels";
import type { CapsUploadIssue } from "../types/admission-candidate";

export function formatCapsWarningStage(stage: string | undefined): string {
  if (!stage) return "—";
  return (
    CAPS_WARNING_STAGE_COPY[stage] ??
    humanizeEnumValue(stage.replace(/_/g, " "))
  );
}

export function formatCapsWarningMessage(issue: CapsUploadIssue): string {
  if (issue.message?.trim()) return issue.message.trim();

  const stage = issue.stage;
  if (stage === "candidate") {
    return "Existing candidate linked — no new profile created.";
  }
  if (stage === "application") {
    return "Application already on file — existing record shown.";
  }
  if (stage === "jamb_score") {
    return "Duplicate subject line ignored.";
  }
  if (stage === "ignored_subject") {
    return "A subject is not required for this program — score skipped.";
  }
  if (stage === "duplicate") {
    return "Score for this subject already exists — skipped.";
  }

  return formatCapsWarningStage(stage);
}

export function formatApplicationStatusLabel(
  status: string | undefined,
): string {
  if (!status) return "—";
  const labels: Record<string, string> = {
    PENDING: "Pending",
    DOCUMENTS_VERIFIED: "Documents verified",
    OFFER_ADMISSION: "Offer admission",
    REJECTED: "Rejected",
  };
  return labels[status] ?? humanizeEnumValue(status);
}
