import { resolveStepLabel } from "../constants/meAdmissionProgressOptions";
import {
  ADMISSION_PROGRESS_PHASES,
  ADMISSION_STEP_DESCRIPTIONS,
} from "../constants/meAdmissionProgressOptions";
import type {
  MeAdmissionProgressStep,
  ProgressStepStatus,
} from "../types/me-admission-progress";

export type AntStepStatus = "finish" | "process" | "wait" | "error";

export type StepBadgeColor =
  | "success"
  | "processing"
  | "warning"
  | "error"
  | "default";

export type ProgressStepDisplayItem = {
  key: string;
  title: string;
  description: string;
  status: AntStepStatus;
  apiStatus: string;
  statusLabel: string;
  badgeColor: StepBadgeColor;
  order: number;
  isCurrent: boolean;
  phaseKey: string;
};

export type ProgressPhaseGroup = {
  key: string;
  label: string;
  steps: ProgressStepDisplayItem[];
};

export function resolveStepStatusLabel(
  status: ProgressStepStatus | string,
): { label: string; badgeColor: StepBadgeColor } {
  switch (status) {
    case "completed":
      return { label: "Completed", badgeColor: "success" };
    case "in_progress":
      return { label: "In progress", badgeColor: "processing" };
    case "blocked":
      return { label: "Action required", badgeColor: "warning" };
    case "skipped":
      return { label: "Not required", badgeColor: "default" };
    case "not_started":
    default:
      return { label: "Not started", badgeColor: "default" };
  }
}

function resolveStepPhaseKey(stepKey: string): string {
  for (const phase of ADMISSION_PROGRESS_PHASES) {
    if (phase.stepKeys.some((key) => key === stepKey)) {
      return phase.key;
    }
  }
  return "application";
}

export function resolveAdmissionProgressPercent(
  steps: MeAdmissionProgressStep[],
): number {
  const relevant = steps.filter((step) => step.status !== "skipped");
  if (relevant.length === 0) return 0;

  const completed = relevant.filter((step) => step.status === "completed").length;
  return Math.round((completed / relevant.length) * 100);
}

export function resolveActiveStepNumber(
  steps: MeAdmissionProgressStep[],
  currentStep: string,
): number {
  const index = steps.findIndex((step) => step.key === currentStep);
  return index >= 0 ? index + 1 : 1;
}

export function mapProgressStepStatusToAnt(
  status: ProgressStepStatus | string,
): AntStepStatus {
  switch (status) {
    case "completed":
      return "finish";
    case "in_progress":
      return "process";
    case "blocked":
      return "error";
    case "skipped":
    case "not_started":
    default:
      return "wait";
  }
}

export function resolveCurrentStepIndex(
  steps: MeAdmissionProgressStep[],
  currentStep: string,
): number {
  const index = steps.findIndex((s) => s.key === currentStep);
  return index >= 0 ? index : 0;
}

export function buildProgressStepDisplayItems(
  steps: MeAdmissionProgressStep[],
  currentStep = "",
): ProgressStepDisplayItem[] {
  return steps.map((step) => {
    const statusMeta = resolveStepStatusLabel(step.status);
    const stepKey = step.key as keyof typeof ADMISSION_STEP_DESCRIPTIONS;

    return {
      key: step.key,
      title:
        step.status === "skipped"
          ? `${resolveStepLabel(step.key)} (not required)`
          : resolveStepLabel(step.key),
      description:
        ADMISSION_STEP_DESCRIPTIONS[stepKey] ??
        "Complete this step to move forward.",
      status: mapProgressStepStatusToAnt(step.status),
      apiStatus: step.status,
      statusLabel: statusMeta.label,
      badgeColor: statusMeta.badgeColor,
      order: step.order,
      isCurrent: step.key === currentStep,
      phaseKey: resolveStepPhaseKey(step.key),
    };
  });
}

export function groupProgressStepsByPhase(
  stepItems: ProgressStepDisplayItem[],
): ProgressPhaseGroup[] {
  return ADMISSION_PROGRESS_PHASES.map((phase) => ({
    key: phase.key,
    label: phase.label,
    steps: stepItems.filter((step) => step.phaseKey === phase.key),
  })).filter((phase) => phase.steps.length > 0);
}

export function shouldShowFeeBanner(
  portalState: string,
  nextAction: string,
): boolean {
  return portalState === "fee_pending" || nextAction === "pay_application_fee";
}

export function shouldShowPrimaryCta(nextAction: string): boolean {
  return Boolean(nextAction) && nextAction !== "none";
}

export function shouldPollProgress(nextAction: string): boolean {
  return (
    nextAction === "wait_for_screening" || nextAction === "wait_for_decision"
  );
}
