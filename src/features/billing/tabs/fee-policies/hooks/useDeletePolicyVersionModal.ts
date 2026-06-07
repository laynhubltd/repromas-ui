import { BILLING_POLICY_UI_COPY } from "@/shared/constants/billingPolicyOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { useDeleteBillableEventPolicyMutation } from "../api/billableEventPolicyApi";
import type { BillableEventPolicy } from "../types/billable-event-policy";

export function useDeletePolicyVersionModal(
  target: BillableEventPolicy | null,
  _open: boolean,
  onClose: () => void,
) {
  const [deletePolicy, { isLoading: isDeleting }] =
    useDeleteBillableEventPolicyMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deletePolicy(target.id).unwrap();
      notifyMutationSuccess(BILLING_POLICY_UI_COPY.deleteSuccess);
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "DELETE" },
      });
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return {
    state: { isDeleting },
    actions: { handleConfirm, handleCancel },
  };
}
