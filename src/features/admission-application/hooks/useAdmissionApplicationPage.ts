import { appPaths } from "@/app/routing/app-path";
import { StudentPortalScope } from "@/features/access-control/student-portal-scopes";
import { useAccessControl } from "@/features/access-control/use-access-control";
import { useBillingWorkflowDecision } from "@/features/billing";
import type { WorkflowPayNowPayload } from "@/features/billing/types/workflow-step-decision";
import { ME_APPLICATION_UI_COPY } from "../constants/meAdmissionApplicationOptions";
import { useGetMeAdmissionApplicationQuery } from "../api/meAdmissionApplicationApi";
import type { MeAdmissionApplication } from "../types/me-admission-application";
import {
  deriveLifecycleState,
  isDraftApplication,
  shouldShowJambSection,
  shouldShowOfferCard,
  shouldShowOlevelSection,
  shouldShowScreeningPending,
  shouldShowScreeningSection,
} from "../utils/applicationDossierDisplay";
import { getQueryHttpStatus } from "../utils/getQueryHttpStatus";
import {
  getCandidateJambScores,
  sortJambScores,
} from "../utils/meApplicationJambDisplay";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { RequestScreen } from "@/shared/types/error-ui";
import { buildStudentApplyReturnTo } from "@/shared/utils/validateReturnUrl";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useAdmissionApplicationPage() {
  const navigate = useNavigate();
  const { hasStudentPortalScope } = useAccessControl();
  const isCandidate = hasStudentPortalScope([StudentPortalScope.Candidate]);
  const [isPayNowLoading, setIsPayNowLoading] = useState(false);

  const {
    data: application,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMeAdmissionApplicationQuery(undefined, { skip: !isCandidate });

  const queryStatus = getQueryHttpStatus(error);
  const notStarted = isError && queryStatus === 404;
  const permissionDenied = isError && queryStatus === 403;

  const isDraft = application ? isDraftApplication(application) : false;

  const { flags: billingFlags } = useBillingWorkflowDecision("SUBMIT_APPLICATION", {
    eventCode: "ADMISSION_APPLICATION_FEE",
    skip: !isCandidate || !isDraft,
  });

  const sectionError = useMemo(() => {
    if (!isError || notStarted) return null;
    if (permissionDenied) return ME_APPLICATION_UI_COPY.permissionDenied;
    return deriveSectionErrorMessage(isError, error, {
      screen: RequestScreen.List,
      method: "GET",
    });
  }, [isError, notStarted, permissionDenied, error]);

  const lifecycle = useMemo(() => {
    if (!application) {
      return null;
    }
    return deriveLifecycleState({
      application,
      feePaid: billingFlags.allowed,
    });
  }, [application, billingFlags.allowed]);

  const jambScoreRows = useMemo(
    () =>
      sortJambScores(getCandidateJambScores(application?.candidate?.jambScores)),
    [application?.candidate?.jambScores],
  );

  const flags = useMemo(
    () => ({
      isCandidate,
      notStarted,
      permissionDenied,
      hasApplication: Boolean(application),
      showFeeBanner: isDraft,
      showContinueApply: isDraft,
      showViewPayments:
        Boolean(application) &&
        !isDraft &&
        (application?.applicationStatus === "SUBMITTED" ||
          application?.applicationStatus === "DOCUMENTS_VERIFIED"),
      showOfferCard: application ? shouldShowOfferCard(application) : false,
      showScreeningSection: application
        ? shouldShowScreeningSection(application)
        : false,
      showScreeningPending: application
        ? shouldShowScreeningPending(application)
        : false,
      showJambSection: application ? shouldShowJambSection(application) : false,
      showOlevelSection: application ? shouldShowOlevelSection(application) : false,
      showCandidateMetadata: Boolean(application?.candidate?.metadata),
    }),
    [application, isCandidate, isDraft, notStarted, permissionDenied],
  );

  const handleStartApplication = useCallback(() => {
    navigate(appPaths.StudentApply);
  }, [navigate]);

  const handleContinueApply = useCallback(() => {
    navigate(appPaths.StudentApply);
  }, [navigate]);

  const handleViewPayments = useCallback(() => {
    navigate(appPaths.StudentPayments);
  }, [navigate]);

  const handleBillingPayNow = useCallback(
    async (_payload: WorkflowPayNowPayload) => {
      if (isPayNowLoading) return;

      setIsPayNowLoading(true);
      try {
        const params = new URLSearchParams({
          feeChargeId: String(_payload.feeChargeId),
          returnTo: buildStudentApplyReturnTo(0),
        });
        navigate(`${appPaths.StudentInvoices}?${params.toString()}`);
      } finally {
        setIsPayNowLoading(false);
      }
    },
    [isPayNowLoading, navigate],
  );

  return {
    state: {
      application: application as MeAdmissionApplication | undefined,
      isLoading,
      sectionError,
      lifecycle,
      jambScoreRows,
      isPayNowLoading,
    },
    actions: {
      refetch,
      handleStartApplication,
      handleContinueApply,
      handleViewPayments,
      handleBillingPayNow,
    },
    flags,
  };
}
