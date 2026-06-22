import { StudentPortalScope } from "@/features/access-control/student-portal-scopes";
import { useAccessControl } from "@/features/access-control/use-access-control";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useMemo, useEffect, useState } from "react";
import { useGetMeAdmissionProgressQuery } from "../api/meAdmissionProgressApi";
import {
  ME_PROGRESS_UI_COPY,
  PROGRESS_POLLING_INTERVAL_MS,
  resolveNextActionCta,
  resolvePortalStateDisplay,
} from "../constants/meAdmissionProgressOptions";
import type { MeAdmissionProgress } from "../types/me-admission-progress";
import {
  buildProgressStepDisplayItems,
  groupProgressStepsByPhase,
  resolveActiveStepNumber,
  resolveAdmissionProgressPercent,
  resolveCurrentStepIndex,
  shouldPollProgress,
  shouldShowFeeBanner,
  shouldShowPrimaryCta,
} from "../utils/admissionProgressDisplay";
import { getQueryHttpStatus } from "../utils/getQueryHttpStatus";

export function useAdmissionProgressData() {
  const { hasStudentPortalScope } = useAccessControl();
  const isCandidate = hasStudentPortalScope([StudentPortalScope.Candidate]);
  const [pollingInterval, setPollingInterval] = useState(0);

  const {
    data: progress,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMeAdmissionProgressQuery(undefined, {
    skip: !isCandidate,
    pollingInterval,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (!isCandidate) {
      setPollingInterval(0);
      return;
    }
    if (progress && shouldPollProgress(progress.nextAction)) {
      setPollingInterval(PROGRESS_POLLING_INTERVAL_MS);
    } else {
      setPollingInterval(0);
    }
  }, [isCandidate, progress?.nextAction]);

  const queryStatus = getQueryHttpStatus(error);
  const noCandidateLinked = isError && queryStatus === 404;
  const permissionDenied = isError && queryStatus === 403;

  const sectionError = useMemo(() => {
    if (!isError || noCandidateLinked) return null;
    if (permissionDenied) return ME_PROGRESS_UI_COPY.permissionDenied;
    return deriveSectionErrorMessage(isError, error, {
      screen: RequestScreen.List,
      method: "GET",
    });
  }, [isError, noCandidateLinked, permissionDenied, error]);

  const portalDisplay = useMemo(
    () => resolvePortalStateDisplay(progress?.portalState),
    [progress?.portalState],
  );

  const primaryCtaLabel = useMemo(
    () =>
      resolveNextActionCta(progress?.nextAction) ??
      ME_PROGRESS_UI_COPY.primaryCtaFallback,
    [progress?.nextAction],
  );

  const stepDisplayItems = useMemo(
    () =>
      buildProgressStepDisplayItems(
        progress?.steps ?? [],
        progress?.currentStep ?? "",
      ),
    [progress?.currentStep, progress?.steps],
  );

  const phaseGroups = useMemo(
    () => groupProgressStepsByPhase(stepDisplayItems),
    [stepDisplayItems],
  );

  const progressPercent = useMemo(
    () => resolveAdmissionProgressPercent(progress?.steps ?? []),
    [progress?.steps],
  );

  const activeStepNumber = useMemo(
    () =>
      resolveActiveStepNumber(
        progress?.steps ?? [],
        progress?.currentStep ?? "",
      ),
    [progress?.currentStep, progress?.steps],
  );

  const totalSteps = progress?.steps.length ?? 0;

  const currentStepIndex = useMemo(
    () =>
      resolveCurrentStepIndex(
        progress?.steps ?? [],
        progress?.currentStep ?? "",
      ),
    [progress?.currentStep, progress?.steps],
  );

  const flags = useMemo(
    () => ({
      isCandidate,
      showProgress: isCandidate && !noCandidateLinked,
      noCandidateLinked: isCandidate && noCandidateLinked,
      permissionDenied,
      showPrimaryCta: progress ? shouldShowPrimaryCta(progress.nextAction) : false,
      showFeeBanner: progress
        ? shouldShowFeeBanner(progress.portalState, progress.nextAction)
        : false,
      showDossierLink: Boolean(progress?.applicationId),
      isPolling: progress ? shouldPollProgress(progress.nextAction) : false,
    }),
    [isCandidate, noCandidateLinked, permissionDenied, progress],
  );

  return {
    state: {
      progress: progress as MeAdmissionProgress | undefined,
      isLoading,
      sectionError,
      portalDisplay,
      primaryCtaLabel,
      stepDisplayItems,
      phaseGroups,
      currentStepIndex,
      progressPercent,
      activeStepNumber,
      totalSteps,
    },
    actions: {
      refetch,
    },
    flags,
  };
}
