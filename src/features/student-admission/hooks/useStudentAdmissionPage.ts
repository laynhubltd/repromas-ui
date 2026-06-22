import { appPaths } from "@/app/routing/app-path";
import { StudentPortalScope } from "@/features/access-control/student-portal-scopes";
import { useAccessControl } from "@/features/access-control/use-access-control";
import { useGetMeAdmissionProgressQuery } from "@/features/student-home/api/meAdmissionProgressApi";
import { useAdmissionProgressActions } from "@/features/student-home/hooks/useAdmissionProgressActions";
import {
  resolvePortalStateDisplay,
} from "@/features/student-home/constants/meAdmissionProgressOptions";
import type { MeAdmissionProgress } from "@/features/student-home/types/me-admission-progress";
import { getQueryHttpStatus } from "@/features/student-home/utils/getQueryHttpStatus";
import { usePaymentReturnPolling } from "@/features/student-payments/hooks/usePaymentReturnPolling";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useMemo } from "react";
import {
  STUDENT_ADMISSION_UI_COPY,
  canViewAdmissionLetter,
  shouldApplyAcceptanceFeeGuard,
} from "../constants/studentAdmissionOptions";

export function useStudentAdmissionPage() {
  const { hasStudentPortalScope } = useAccessControl();
  const isCandidate = hasStudentPortalScope([StudentPortalScope.Candidate]);

  const {
    data: progress,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMeAdmissionProgressQuery(undefined, {
    skip: !isCandidate,
    refetchOnMountOrArgChange: true,
  });

  const paymentReturnPolling = usePaymentReturnPolling({
    enabled: isCandidate,
    returnTo: appPaths.StudentAdmission,
  });

  const progressActions = useAdmissionProgressActions({
    progress,
    enabled: isCandidate,
    returnTo: appPaths.StudentAdmission,
  });

  const queryStatus = getQueryHttpStatus(error);
  const noCandidateLinked = isError && queryStatus === 404;
  const permissionDenied = isError && queryStatus === 403;

  const sectionError = useMemo(() => {
    if (!isError || noCandidateLinked) return null;
    if (permissionDenied) return STUDENT_ADMISSION_UI_COPY.permissionDenied;
    return deriveSectionErrorMessage(isError, error, {
      screen: RequestScreen.List,
      method: "GET",
    });
  }, [isError, noCandidateLinked, permissionDenied, error]);

  const portalDisplay = useMemo(
    () => resolvePortalStateDisplay(progress?.portalState),
    [progress?.portalState],
  );

  const flags = useMemo(
    () => ({
      isCandidate,
      noCandidateLinked: isCandidate && noCandidateLinked,
      permissionDenied,
      showLetter: canViewAdmissionLetter(progress?.portalState),
      applyAcceptanceFeeGuard: shouldApplyAcceptanceFeeGuard(
        progress?.portalState,
      ),
      showNotAdmittedState:
        isCandidate &&
        !noCandidateLinked &&
        !sectionError &&
        Boolean(progress) &&
        !canViewAdmissionLetter(progress?.portalState),
    }),
    [
      isCandidate,
      noCandidateLinked,
      permissionDenied,
      progress,
      sectionError,
    ],
  );

  return {
    state: {
      progress: progress as MeAdmissionProgress | undefined,
      isLoading,
      sectionError,
      portalDisplay,
      paymentReturnPolling,
      isPayNowLoading: progressActions.state.isPayNowLoading,
    },
    actions: {
      refetch,
      handleBillingPayNow: progressActions.actions.handleBillingPayNow,
    },
    flags,
  };
}
