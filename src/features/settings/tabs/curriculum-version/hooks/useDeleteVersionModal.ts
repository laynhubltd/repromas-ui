import { parseApiError } from "@/shared/utils/error/parseApiError";
import { notification } from "antd";
import { useState } from "react";
import { useDeleteCurriculumVersionMutation } from "../api/curriculumVersionApi";
import type { CurriculumVersion } from "../types/curriculum-version";

export function useDeleteVersionModal(target: CurriculumVersion | null, onClose: () => void) {
  const [deleteCurriculumVersion, { isLoading }] = useDeleteCurriculumVersionMutation();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteCurriculumVersion(target.id).unwrap();
      notification.success({ message: "Version deleted successfully" });
      window.dispatchEvent(new CustomEvent("curriculumVersionDeleted"));
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      setError(parsed.message);
    }
  };

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  return {
    state: { error, isLoading },
    actions: { handleConfirm, handleCancel },
  };
}
