import { useMemo } from "react";
import {
  useGetSetupAdmissionCandidateCountQuery,
  useGetSetupAdmissionConfigCountQuery,
  useGetSetupCourseCountQuery,
  useGetSetupCurriculumVersionCountQuery,
  useGetSetupDefaultTransitionStatusCountQuery,
  useGetSetupDepartmentCountQuery,
  useGetSetupLevelCountQuery,
  useGetSetupProgramCountQuery,
  useGetSetupStaffCountQuery,
  useGetSetupStudentCountQuery,
} from "../api/setupStatusApi";
import { SETUP_STEP_DEFINITIONS } from "../config/setupSteps";
import type { SetupProbeCounts, SetupStepId } from "../types/setup";
import {
  canAccessSettingsMenu,
  canAccessSetupStep,
  evaluateSetupSteps,
} from "../utils/evaluateSetupSteps";

export function useSetupStatus() {
  const { data: departments = 0, isLoading: isDepartmentsLoading } =
    useGetSetupDepartmentCountQuery();
  const { data: levels = 0, isLoading: isLevelsLoading } =
    useGetSetupLevelCountQuery();
  const { data: programs = 0, isLoading: isProgramsLoading } =
    useGetSetupProgramCountQuery();
  const { data: curriculumVersions = 0, isLoading: isCvLoading } =
    useGetSetupCurriculumVersionCountQuery();
  const { data: courses = 0, isLoading: isCoursesLoading } =
    useGetSetupCourseCountQuery();
  const { data: staff = 0, isLoading: isStaffLoading } =
    useGetSetupStaffCountQuery();
  const { data: students = 0, isLoading: isStudentsLoading } =
    useGetSetupStudentCountQuery();
  const { data: admissionConfigs = 0, isLoading: isAdmissionConfigLoading } =
    useGetSetupAdmissionConfigCountQuery();
  const {
    data: admissionCandidates = 0,
    isLoading: isAdmissionCandidatesLoading,
  } = useGetSetupAdmissionCandidateCountQuery();
  const {
    data: transitionStatusDefaults = 0,
    isLoading: isTransitionStatusDefaultsLoading,
  } = useGetSetupDefaultTransitionStatusCountQuery();

  const isLoading =
    isDepartmentsLoading ||
    isLevelsLoading ||
    isProgramsLoading ||
    isCvLoading ||
    isCoursesLoading ||
    isStaffLoading ||
    isStudentsLoading ||
    isAdmissionConfigLoading ||
    isAdmissionCandidatesLoading ||
    isTransitionStatusDefaultsLoading;

  const probes: SetupProbeCounts = useMemo(
    () => ({
      departments,
      levels,
      programs,
      curriculumVersions,
      courses,
      staff,
      transitionStatusDefaults,
      students,
      admissionConfigs,
      admissionCandidates,
    }),
    [
      departments,
      levels,
      programs,
      curriculumVersions,
      courses,
      staff,
      transitionStatusDefaults,
      students,
      admissionConfigs,
      admissionCandidates,
    ],
  );

  const evaluation = useMemo(() => evaluateSetupSteps(probes), [probes]);

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
