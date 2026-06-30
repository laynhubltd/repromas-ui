import {
  getAllOnboardingChecklistStepIds,
  getOnboardingChecklistStepIds,
  PHASE1_CHECKLIST_STEP_IDS,
  PHASE2_CHECKLIST_STEP_IDS,
  SETUP_STEP_DEFINITIONS,
  SETUP_STEP_ORDER,
} from "../config/setupSteps";
import type {
  SetupEvaluation,
  SetupProbeCounts,
  SetupStepId,
  SetupStepState,
} from "../types/setup";

function isStepComplete(id: SetupStepId, probes: SetupProbeCounts): boolean {
  switch (id) {
    case "signedIn":
      return true;
    case "department":
      return probes.departments > 0;
    case "level":
      return probes.levels > 0;
    case "program":
      return probes.programs > 0;
    case "curriculumVersion":
      return probes.curriculumVersions > 0;
    case "course":
      return probes.courses > 0;
    case "staff":
      return probes.staff > 0;
    case "transitionStatusDefault":
      return probes.transitionStatusDefaults > 0;
    case "student":
      return probes.students > 0;
    case "admissionConfig":
      return probes.admissionConfigs > 0;
    case "admissionCandidate":
      return probes.admissionCandidates > 0;
    case "courseRegistration":
      return probes.students > 0 && probes.courses > 0;
    case "assessment":
      return probes.courses > 0 && probes.programs > 0 && probes.levels > 0;
    case "gradingConfig":
      return isPhase1CompleteByProbes(probes);
    case "billing":
      return isPhase1CompleteByProbes(probes);
    case "settings":
      return probes.departments > 0;
    default:
      return false;
  }
}

function isPhase1CompleteByProbes(probes: SetupProbeCounts): boolean {
  return (
    probes.departments > 0 &&
    probes.levels > 0 &&
    probes.programs > 0 &&
    probes.curriculumVersions > 0 &&
    probes.courses > 0
  );
}

function arePrerequisitesComplete(
  stepId: SetupStepId,
  completion: Record<SetupStepId, boolean>,
): boolean {
  const { prerequisites } = SETUP_STEP_DEFINITIONS[stepId];
  return prerequisites.every((prereq) => completion[prereq]);
}

export function evaluateSetupSteps(probes: SetupProbeCounts): SetupEvaluation {
  const completion = SETUP_STEP_ORDER.reduce(
    (acc, id) => {
      acc[id] = isStepComplete(id, probes);
      return acc;
    },
    {} as Record<SetupStepId, boolean>,
  );

  const steps = SETUP_STEP_ORDER.reduce(
    (acc, id) => {
      const complete = completion[id];
      const accessible = arePrerequisitesComplete(id, completion);
      acc[id] = {
        id,
        complete,
        accessible,
        active: false,
      };
      return acc;
    },
    {} as Record<SetupStepId, SetupStepState>,
  );

  const actionableOrder = getAllOnboardingChecklistStepIds();
  const currentStepId =
    actionableOrder.find((id) => !completion[id]) ??
    actionableOrder[actionableOrder.length - 1] ??
    "billing";

  steps[currentStepId].active = true;

  const phase1Trackable = PHASE1_CHECKLIST_STEP_IDS.filter(
    (id) => id !== "signedIn",
  );
  const phase1CompletedCount = phase1Trackable.filter(
    (id) => completion[id],
  ).length;
  const phase1TotalCount = phase1Trackable.length;
  const phase1ProgressPercent = Math.round(
    (phase1CompletedCount / phase1TotalCount) * 100,
  );
  const isPhase1Complete = isPhase1CompleteByProbes(probes);
  const isSetupComplete = getAllOnboardingChecklistStepIds().every(
    (id) => completion[id],
  );

  const visibleChecklistIds = getOnboardingChecklistStepIds(isPhase1Complete);

  const remainingStepCount = visibleChecklistIds.filter(
    (id) => !completion[id],
  ).length;

  return {
    steps,
    currentStepId,
    phase1StepIds: PHASE1_CHECKLIST_STEP_IDS,
    phase2StepIds: PHASE2_CHECKLIST_STEP_IDS,
    phase1CompletedCount,
    phase1TotalCount,
    phase1ProgressPercent,
    isPhase1Complete,
    isSetupComplete,
    remainingStepCount,
  };
}

export function canAccessSetupStep(
  stepId: SetupStepId,
  evaluation: SetupEvaluation,
): boolean {
  if (stepId === "signedIn") {
    return true;
  }

  const step = evaluation.steps[stepId];
  if (!step) {
    return false;
  }

  return step.accessible;
}

export function canAccessSettingsMenu(evaluation: SetupEvaluation): boolean {
  const { steps, isPhase1Complete, currentStepId } = evaluation;

  if (!steps.department.complete) {
    return false;
  }

  if (isPhase1Complete) {
    return true;
  }

  return (
    currentStepId === "level" ||
    currentStepId === "curriculumVersion" ||
    steps.level.accessible ||
    steps.curriculumVersion.accessible
  );
}
