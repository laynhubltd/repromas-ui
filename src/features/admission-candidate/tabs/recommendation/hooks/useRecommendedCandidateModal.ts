import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useOfferAdmissionCandidateMutation } from "../../candidate/api/admissionCandidateApi";
import type { OfferCandidateRequest } from "../../candidate/types/admission-candidate";
import type { AdmissionRecommendedCandidate } from "../types/admission-recommended-candidate";

export function useRecommendedCandidateOfferModal(
  target: AdmissionRecommendedCandidate | null,
  open: boolean,
  onClose: () => void,
) {
  const [form] = Form.useForm<{
    manualOverride: boolean;
    overrideReason?: string;
  }>();
  const [offer, { isLoading }] = useOfferAdmissionCandidateMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      const values = await form.validateFields();
      const isOverride = values.manualOverride === true;
      const body: OfferCandidateRequest = {
        finalDecision: target.recommendedDecision,
        offeredProgramId: target.recommendedOfferedProgramId,
        seatBucket:
          target.recommendedDecision === "OFFER_CHANGE_OF_COURSE"
            ? target.quotaCategory
            : null,
        decisionSource: isOverride ? "MANUAL_OVERRIDE" : "RECOMMENDATION",
        overrideReason: isOverride ? (values.overrideReason ?? null) : null,
      };
      await offer({ id: target.candidateId, body }).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Offer", "created"));
      form.resetFields();
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Modal, method: "POST" },
        form,
      });
    }
  };

  return {
    state: { isLoading, target },
    actions: {
      handleConfirm,
      handleCancel: () => {
        form.resetFields();
        onClose();
      },
    },
    form,
  };
}
