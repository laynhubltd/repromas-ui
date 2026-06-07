import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { notification } from "antd";
import { useDeleteCurriculumVersionMutation } from "../api/curriculumVersionApi";
import type { CurriculumVersion } from "../types/curriculum-version";

export function useDeleteVersionModal(target: CurriculumVersion | null, onClose: () => void) {
  const [deleteCurriculumVersion, { isLoading }] = useDeleteCurriculumVersionMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteCurriculumVersion(target.id).unwrap();
      notification.success({ message: "Version deleted successfully" });
      window.dispatchEvent(new CustomEvent("curriculumVersionDeleted"));
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
    state: { isLoading },
    actions: { handleConfirm, handleCancel },
  };
}
