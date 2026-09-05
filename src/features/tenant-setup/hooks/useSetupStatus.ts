import { useMemo } from "react";
import { useGetSetupChecklistQuery } from "../api/setupStatusApi";
import { SETUP_STEP_DEFINITIONS } from "../config/setupSteps";
import type { SetupProbeCounts, SetupStepId } from "../types/setup";
import {
  canAccessSettingsMenu,
  canAccessSetupStep,
  evaluateSetupSteps,
} from "../utils/evaluateSetupSteps";

export function useSetupStatus() {
  const { data, isLoading } = useGetSetupChecklistQuery();
  
  const checklist = data?.checklist ?? {};

  const probes: SetupProbeCounts = useMemo(
    () => ({
      departments: checklist.department?.count ?? 0,
      levels: checklist.level?.count ?? 0,
      programs: checklist.program?.count ?? 0,
      curriculumVersions: checklist.curriculumVersion?.count ?? 0,
      courses: checklist.course?.count ?? 0,
      staff: checklist.staff?.count ?? 0,
      transitionStatusDefaults: checklist.transitionStatusDefault?.count ?? 0,
      students: checklist.student?.count ?? 0,
      admissionConfigs: checklist.admissionConfig?.count ?? 0,
      admissionCandidates: checklist.admissionCandidate?.count ?? 0,
    }),
    [checklist],
  );

  const evaluation = useMemo(() => evaluateSetupSteps(checklist), [checklist]);

  const canAccess = (stepId: SetupStepId): boolean => {
    if (stepId === "settings") {
      return canAccessSettingsMenu(evaluation);
    }
    return canAccessSetupStep(stepId, evaluation);
  };

  const getStepRoute = (stepId: SetupStepId): string =>
    SETUP_STEP_DEFINITIONS[stepId].route;

  return {
    state: {
      probes,
      evaluation,
      isLoading,
    },
    actions: {
      canAccess,
      getStepRoute,
    },
    flags: {
      isPhase1Complete: evaluation.isPhase1Complete,
      isSetupComplete: evaluation.isSetupComplete,
      shouldGateMenus: !evaluation.isSetupComplete,
      currentStepId: evaluation.currentStepId,
    },
  };
}
