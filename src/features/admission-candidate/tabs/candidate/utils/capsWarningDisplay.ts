import {
  getApplicationStatusLabel,
  getCapsWarningStageLabel,
} from "@/shared/constants/admissionCandidateOptions";
import type { CapsUploadIssue } from "../types/admission-candidate";

export function formatCapsWarningStage(stage: string | undefined): string {
  return getCapsWarningStageLabel(stage);
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

  return getCapsWarningStageLabel(stage);
}

export function formatApplicationStatusLabel(
  status: string | undefined,
): string {
  return getApplicationStatusLabel(status);
}
