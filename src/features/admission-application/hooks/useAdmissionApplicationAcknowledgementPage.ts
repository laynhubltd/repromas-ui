import { appPaths } from "@/app/routing/app-path";
import { StudentPortalScope } from "@/features/access-control/student-portal-scopes";
import { useAccessControl } from "@/features/access-control/use-access-control";
import { useAppSelector } from "@/app/hooks";
import useAuthState from "@/features/auth/use-auth-state";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { RequestScreen } from "@/shared/types/error-ui";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetMeAdmissionApplicationQuery } from "../api/meAdmissionApplicationApi";
import { ACKNOWLEDGEMENT_SLIP_UI_COPY } from "../constants/acknowledgementSlipOptions";
import { ME_APPLICATION_UI_COPY } from "../constants/meAdmissionApplicationOptions";
import { buildAcknowledgementSlipModel } from "../utils/buildAcknowledgementSlipModel";
import { canViewApplicationDocuments } from "../utils/canViewApplicationDocuments";
import { getQueryHttpStatus } from "../utils/getQueryHttpStatus";
import { isDraftApplication } from "../utils/applicationDossierDisplay";
import { useAcknowledgementSlip } from "./useAcknowledgementSlip";

export function useAdmissionApplicationAcknowledgementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasStudentPortalScope } = useAccessControl();
  const { userProfile } = useAuthState();
  const logoUrl = useAppSelector((state) => state.theme.logoUrl);
  const schoolName = useAppSelector((state) => state.theme.schoolName);
  const isCandidate = hasStudentPortalScope([StudentPortalScope.Candidate]);
  const justSubmitted = searchParams.get("justSubmitted") === "1";

  const {
    data: application,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMeAdmissionApplicationQuery(undefined, { skip: !isCandidate });

  const slipPrint = useAcknowledgementSlip();

  const queryStatus = getQueryHttpStatus(error);
  const notStarted = isError && queryStatus === 404;
  const permissionDenied = isError && queryStatus === 403;

  const acknowledgementSlipModel = useMemo(() => {
    if (!application) return null;
    return buildAcknowledgementSlipModel({
      application,
      profilePictureUrl: userProfile?.profilePictureUrl,
      logoUrl,
      schoolName,
    });
  }, [application, userProfile?.profilePictureUrl, logoUrl, schoolName]);

  const sectionError = useMemo(() => {
    if (!isError || notStarted) return null;
    if (permissionDenied) return ME_APPLICATION_UI_COPY.permissionDenied;
    return deriveSectionErrorMessage(isError, error, {
      screen: RequestScreen.List,
      method: "GET",
    });
  }, [isError, notStarted, permissionDenied, error]);

  useEffect(() => {
    if (isLoading || !isCandidate) return;
    if (notStarted || (application && isDraftApplication(application))) {
      navigate(appPaths.StudentApply, { replace: true });
    }
  }, [application, isCandidate, isLoading, navigate, notStarted]);

  const handlePrint = useCallback(() => {
    slipPrint.actions.handlePrint();
  }, [slipPrint.actions]);

  const handleViewApplication = useCallback(() => {
    navigate(appPaths.StudentApplication);
  }, [navigate]);

  const handleBackToHome = useCallback(() => {
    navigate(appPaths.studentHome);
  }, [navigate]);

  const flags = useMemo(
    () => ({
      isCandidate,
      justSubmitted,
      notStarted,
      permissionDenied,
      canShowSlip:
        Boolean(acknowledgementSlipModel) &&
        canViewApplicationDocuments(application?.applicationStatus),
    }),
    [
      acknowledgementSlipModel,
      application?.applicationStatus,
      isCandidate,
      justSubmitted,
      notStarted,
      permissionDenied,
    ],
  );

  return {
    state: {
      isLoading,
      sectionError,
      acknowledgementSlipModel,
      slipContentRef: slipPrint.state.contentRef,
      pageTitle: ACKNOWLEDGEMENT_SLIP_UI_COPY.confirmationTitle,
    },
    actions: {
      refetch,
      handlePrint,
      handleViewApplication,
      handleBackToHome,
    },
    flags,
  };
}
