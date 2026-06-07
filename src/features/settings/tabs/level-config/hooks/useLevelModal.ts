import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useEffect } from "react";
import {
    useCreateLevelMutation,
    useDeleteLevelMutation,
    useUpdateLevelMutation,
} from "../api/levelApi";
import type { Level } from "../types/level";

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

export function useLevelFormModal(
  target: Level | null,
  open: boolean,
  onClose: () => void
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<{ name: string; rankOrder: number; description?: string }>();
  const [createLevel, { isLoading: isCreating }] = useCreateLevelMutation();
  const [updateLevel, { isLoading: isUpdating }] = useUpdateLevelMutation();
  const handleApiError = useApiError();

  const isLoading = isCreating || isUpdating;

  // Pre-fill form fields from target when open becomes true
  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({
        name: target.name,
        rankOrder: target.rankOrder,
        description: target.description ?? undefined,
      });
    }
  }, [open, target, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditMode) {
        await updateLevel({
          id: target.id,
          name: values.name.trim(),
          rankOrder: values.rankOrder,
          description: values.description?.trim() ?? null,
        }).unwrap();
      } else {
        await createLevel({
          name: values.name.trim(),
          rankOrder: values.rankOrder,
          description: values.description?.trim() ?? null,
        }).unwrap();
      }

      notifyMutationSuccess(
        mutationSuccessMessage("Level", isEditMode ? "updated" : "created"),
      );
      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const decision = handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isEditMode ? "PATCH" : "POST",
        },
        form,
      });
      if (isEditMode && decision.disableForm) {
        onClose();
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return {
    state: { isLoading, isEditMode },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteLevelModal(target: Level | null, onClose: () => void) {
  const [deleteLevel, { isLoading }] = useDeleteLevelMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteLevel(target.id).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Level", "deleted"));
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
