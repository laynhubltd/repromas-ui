import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useEffect } from "react";
import {
    useCreateLevelCategoryMutation,
    useDeleteLevelCategoryMutation,
    useUpdateLevelCategoryMutation,
} from "../api/levelApi";
import type { LevelCategory } from "../types/levelCategory";

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

export function useLevelCategoryFormModal(
  target: LevelCategory | null,
  open: boolean,
  onClose: () => void
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<{ name: string; code: string; description?: string; semestersPerLevel?: number }>();
  const [createCategory, { isLoading: isCreating }] = useCreateLevelCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateLevelCategoryMutation();
  const handleApiError = useApiError();

  const isLoading = isCreating || isUpdating;

  // Pre-fill form fields from target when open becomes true
  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({
        name: target.name,
        code: target.code,
        description: target.description ?? undefined,
        semestersPerLevel: target.semestersPerLevel,
      });
    } else if (open && !target) {
        // default value
        form.setFieldsValue({
            semestersPerLevel: 2
        });
    }
  }, [open, target, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditMode) {
        await updateCategory({
          id: target.id,
          name: values.name.trim(),
          code: values.code.trim(),
          description: values.description?.trim() ?? null,
          semestersPerLevel: values.semestersPerLevel,
        }).unwrap();
      } else {
        await createCategory({
          name: values.name.trim(),
          code: values.code.trim(),
          description: values.description?.trim() ?? null,
          semestersPerLevel: values.semestersPerLevel,
        }).unwrap();
      }

      notifyMutationSuccess(
        mutationSuccessMessage("Level Category", isEditMode ? "updated" : "created"),
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

export function useDeleteLevelCategoryModal(target: LevelCategory | null, onClose: () => void) {
  const [deleteCategory, { isLoading }] = useDeleteLevelCategoryMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteCategory(target.id).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Level Category", "deleted"));
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
