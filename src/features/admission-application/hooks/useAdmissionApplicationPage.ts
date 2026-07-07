import { useAppSelector } from "@/app/hooks";
import { appPaths } from "@/app/routing/app-path";
import { StudentPortalScope } from "@/features/access-control/student-portal-scopes";
import { useAccessControl } from "@/features/access-control/use-access-control";
import { useBillingWorkflowDecision } from "@/features/billing";
import type { WorkflowPayNowPayload } from "@/features/billing/types/workflow-step-decision";
import useAuthState from "@/features/auth/use-auth-state";
import { FEE_EVENT_CODE } from "@/shared/constants/feeEventOptions";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { RequestScreen } from "@/shared/types/error-ui";
import { buildStudentApplyReturnTo } from "@/shared/utils/validateReturnUrl";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetMeAdmissionApplicationQuery } from "../api/meAdmissionApplicationApi";
import { ME_APPLICATION_UI_COPY } from "../constants/meAdmissionApplicationOptions";
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
import { buildAcknowledgementSlipModel } from "../utils/buildAcknowledgementSlipModel";
import { buildPrintableApplicationModel } from "../utils/buildPrintableApplicationModel";
import { canViewApplicationDocuments } from "../utils/canViewApplicationDocuments";
import { getQueryHttpStatus } from "../utils/getQueryHttpStatus";
import {
  getCandidateJambScores,
  sortJambScores,
} from "../utils/meApplicationJambDisplay";
import { useAcknowledgementSlip } from "./useAcknowledgementSlip";
import { useMyDocumentUploads } from "./useMyDocumentUploads";
import { usePrintableApplication } from "./usePrintableApplication";

export function useAdmissionApplicationPage() {
  const navigate = useNavigate();
  const { hasStudentPortalScope } = useAccessControl();
  const { userProfile } = useAuthState();
  const logoUrl = useAppSelector((state) => state.theme.logoUrl);
  const schoolName = useAppSelector((state) => state.theme.schoolName);
  const isCandidate = hasStudentPortalScope([StudentPortalScope.Candidate]);
  const [isPayNowLoading, setIsPayNowLoading] = useState(false);

  const {
    data: application,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMeAdmissionApplicationQuery(undefined, { skip: !isCandidate });

  const candidateId = application?.candidate?.id;
  const showDocumentActions = canViewApplicationDocuments(
    application?.applicationStatus,
  );

  const { state: documentUploadState } = useMyDocumentUploads({
    candidateId,
    skip: !isCandidate || !showDocumentActions,
  });

  const slipPrint = useAcknowledgementSlip();
  const applicationPrint = usePrintableApplication();

  const queryStatus = getQueryHttpStatus(error);
  const notStarted = isError && queryStatus === 404;
  const permissionDenied = isError && queryStatus === 403;

  const isDraft = application ? isDraftApplication(application) : false;

  const { flags: billingFlags } = useBillingWorkflowDecision("SUBMIT_APPLICATION", {
    eventCode: FEE_EVENT_CODE.ADMISSION_APPLICATION,
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

  const acknowledgementSlipModel = useMemo(() => {
    if (!application) return null;
    return buildAcknowledgementSlipModel({
      application,
      profilePictureUrl: userProfile?.profilePictureUrl,
      logoUrl,
      schoolName,
    });
  }, [application, userProfile?.profilePictureUrl, logoUrl, schoolName]);

  const printableApplicationModel = useMemo(() => {
    if (!application) return null;
    return buildPrintableApplicationModel({
      application,
      profilePictureUrl: userProfile?.profilePictureUrl,
      logoUrl,
      schoolName,
      documentUploads: documentUploadState.uploads,
    });
  }, [
    application,
    userProfile?.profilePictureUrl,
    logoUrl,
    schoolName,
    documentUploadState.uploads,
  ]);

  const flags = useMemo(
    () => ({
      isCandidate,
      notStarted,
      permissionDenied,
      hasApplication: Boolean(application),
      showFeeBanner: isDraft,
      showContinueApply: isDraft,
      showDocumentActions,
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
    [application, isCandidate, isDraft, notStarted, permissionDenied, showDocumentActions],
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

  const handlePrintAcknowledgementSlip = useCallback(() => {
    slipPrint.actions.handlePrint();
  }, [slipPrint.actions]);

  const handlePrintApplication = useCallback(() => {
    applicationPrint.actions.handlePrint();
  }, [applicationPrint.actions]);

  return {
    state: {
      application: application as MeAdmissionApplication | undefined,
      isLoading,
      sectionError,
      lifecycle,
      jambScoreRows,
      isPayNowLoading,
      acknowledgementSlipModel,
      printableApplicationModel,
      slipContentRef: slipPrint.state.contentRef,
      applicationContentRef: applicationPrint.state.contentRef,
    },
    actions: {
      refetch,
      handleStartApplication,
      handleContinueApply,
      handleViewPayments,
      handleBillingPayNow,
      handlePrintAcknowledgementSlip,
      handlePrintApplication,
    },
    flags,
  };
}
