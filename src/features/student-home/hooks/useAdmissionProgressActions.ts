import { appPaths } from "@/app/routing/app-path";
import type { WorkflowPayNowPayload } from "@/features/billing/types/workflow-step-decision";
import { validateReturnUrl } from "@/shared/utils/validateReturnUrl";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { MeAdmissionProgress } from "../types/me-admission-progress";

type UseAdmissionProgressActionsOptions = {
  progress: MeAdmissionProgress | undefined;
  enabled?: boolean;
  returnTo?: string;
};

export function useAdmissionProgressActions({
  progress,
  enabled = true,
  returnTo: returnToOption = appPaths.studentHome,
}: UseAdmissionProgressActionsOptions) {
  const navigate = useNavigate();
  const [isPayNowLoading, setIsPayNowLoading] = useState(false);

  const handleBillingPayNow = useCallback(
    async (_payload: WorkflowPayNowPayload) => {
      if (!enabled || isPayNowLoading) return;

      setIsPayNowLoading(true);
      try {
        const returnTo =
          validateReturnUrl(returnToOption) ?? returnToOption;
        const params = new URLSearchParams({
          feeChargeId: String(_payload.feeChargeId),
          returnTo,
        });
        navigate(`${appPaths.StudentInvoices}?${params.toString()}`);
      } finally {
        setIsPayNowLoading(false);
      }
    },
    [enabled, isPayNowLoading, navigate, returnToOption],
  );

  const handlePayApplicationFee = useCallback(() => {
    if (!enabled || !progress?.fee?.feeChargeId) return;

    const returnTo = validateReturnUrl(appPaths.studentHome) ?? appPaths.studentHome;
    const params = new URLSearchParams({
      feeChargeId: String(progress.fee.feeChargeId),
      returnTo,
    });
    navigate(`${appPaths.StudentInvoices}?${params.toString()}`);
  }, [enabled, navigate, progress?.fee?.feeChargeId]);

  const handlePrimaryAction = useCallback(() => {
    if (!enabled || !progress) return;

    switch (progress.nextAction) {
      case "continue_form":
      case "choose_program":
      case "submit_application":
        navigate(appPaths.StudentApply);
        break;
      case "pay_application_fee":
        handlePayApplicationFee();
        break;
      case "accept_offer":
      case "view_dossier":
        navigate(appPaths.StudentApplication);
        break;
      case "wait_for_screening":
      case "wait_for_decision":
      case "none":
      default:
        break;
    }
  }, [enabled, handlePayApplicationFee, navigate, progress]);

  const handleViewApplication = useCallback(() => {
    if (!enabled) return;
    navigate(appPaths.StudentApplication);
  }, [enabled, navigate]);

  return {
    actions: {
      handlePrimaryAction,
      handleBillingPayNow,
      handleViewApplication,
    },
    state: {
      isPayNowLoading,
    },
  };
}
