import { StudentPortalScope } from "@/features/access-control/student-portal-scopes";
import { useAccessControl } from "@/features/access-control/use-access-control";
import { usePaymentReturnPolling } from "@/features/student-payments/hooks/usePaymentReturnPolling";
import { appPaths } from "@/app/routing/app-path";
import { useMemo } from "react";
import { useAdmissionProgressActions } from "./useAdmissionProgressActions";
import { useAdmissionProgressData } from "./useAdmissionProgressData";

export function useStudentHomePage() {
  const { hasStudentPortalScope } = useAccessControl();
  const isCandidate = hasStudentPortalScope([StudentPortalScope.Candidate]);
  const isStudent = hasStudentPortalScope([StudentPortalScope.Student]);

  const progressData = useAdmissionProgressData();
  const { progress } = progressData.state;

  const paymentReturnPolling = usePaymentReturnPolling({
    enabled: isCandidate,
    returnTo: appPaths.studentHome,
  });

  const progressActions = useAdmissionProgressActions({
    progress,
    enabled: isCandidate,
  });

  const flags = useMemo(
    () => ({
      isCandidate,
      isStudent,
      showCandidateHome: isCandidate,
      showCandidateProgress: isCandidate && progressData.flags.showProgress,
      showStudentWelcome: isStudent && !isCandidate,
      showScopeLoading: !isCandidate && !isStudent,
      noCandidateLinked: progressData.flags.noCandidateLinked,
      permissionDenied: progressData.flags.permissionDenied,
      showPrimaryCta: progressData.flags.showPrimaryCta,
      showFeeBanner: progressData.flags.showFeeBanner,
      showDossierLink: progressData.flags.showDossierLink,
      isPolling: progressData.flags.isPolling,
    }),
    [isCandidate, isStudent, progressData.flags],
  );

  return {
    state: {
      ...progressData.state,
      paymentReturnPolling,
      isPayNowLoading: progressActions.state.isPayNowLoading,
    },
    actions: {
      refetch: progressData.actions.refetch,
      ...progressActions.actions,
    },
    flags,
  };
}
