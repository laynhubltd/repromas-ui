import {
  getOnboardingChecklistStepIds,
  SETUP_STEP_DEFINITIONS,
} from "../config/setupSteps";
import {
  SETUP_CHECKLIST_CTA_LABEL,
  SETUP_CHECKLIST_PHASE2_SUBTITLE,
  SETUP_CHECKLIST_PHASE2_TITLE,
  SETUP_CHECKLIST_SUBTITLE,
  SETUP_CHECKLIST_TITLE,
  SETUP_STEP_DESCRIPTIONS,
  SETUP_STEP_LABELS,
} from "@/shared/constants/setupChecklistOptions";
import { useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "react";
import type { SetupStepId } from "../types/setup";
import { useSetupStatus } from "./useSetupStatus";

export type SetupChecklistStepView = {
  id: SetupStepId;
  stepNumber: number;
  title: string;
  description: string;
  done: boolean;
  active: boolean;
};

export function useSetupChecklist() {
  const navigate = useNavigate();
  const { state, actions, flags } = useSetupStatus();

  const visibleStepIds = useMemo(
    () => getOnboardingChecklistStepIds(flags.isPhase1Complete),
    [flags.isPhase1Complete],
  );

  const checklistSteps: SetupChecklistStepView[] = useMemo(() => {
    return visibleStepIds.map((id, index) => {
      const stepState = state.evaluation.steps[id];
      return {
        id,
        stepNumber: index + 1,
        title: SETUP_STEP_LABELS[id],
        description: SETUP_STEP_DESCRIPTIONS[id],
        done: stepState.complete,
        active: stepState.active,
      };
    });
  }, [visibleStepIds, state.evaluation.steps]);

  const progressPercent = useMemo(() => {
    const completed = checklistSteps.filter((s) => s.done).length;
    const total = checklistSteps.length;
    if (total === 0) {
      return 0;
    }
    return Math.round((completed / total) * 100);
  }, [checklistSteps]);

  const currentStepRoute = actions.getStepRoute(flags.currentStepId);

  const handleContinueSetup = useCallback(() => {
    navigate(currentStepRoute);
  }, [navigate, currentStepRoute]);

  const handleGoToStep = useCallback(
    (stepId: SetupStepId) => {
      navigate(SETUP_STEP_DEFINITIONS[stepId].route);
    },
    [navigate],
  );

  return {
    state: {
      title: flags.isPhase1Complete
        ? SETUP_CHECKLIST_PHASE2_TITLE
        : SETUP_CHECKLIST_TITLE,
      subtitle: flags.isPhase1Complete
        ? SETUP_CHECKLIST_PHASE2_SUBTITLE
        : SETUP_CHECKLIST_SUBTITLE,
      checklistSteps,
      progressPercent,
      currentStepId: flags.currentStepId,
      currentStepLabel: SETUP_STEP_LABELS[flags.currentStepId],
      currentStepRoute,
      ctaLabel: SETUP_CHECKLIST_CTA_LABEL,
      remainingStepCount: state.evaluation.remainingStepCount,
      isLoading: state.isLoading,
    },
    actions: {
      handleContinueSetup,
      handleGoToStep,
    },
    flags: {
      showSetupChecklist: !flags.isSetupComplete,
      showKpis: flags.isSetupComplete,
      isPhase1Complete: flags.isPhase1Complete,
    },
  };
}
