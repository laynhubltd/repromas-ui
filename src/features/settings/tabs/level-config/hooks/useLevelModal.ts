import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
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
  const [formError, setFormError] = useState<string | null>(null);

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
      setFormError(null);

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

      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);

      if (parsed.status === 409) {
        notification.error({ message: parsed.message });
        const detail = (parsed.raw as { detail?: string }).detail ?? parsed.message;
        if (detail.toLowerCase().includes("name")) {
          form.setFields([{ name: "name", errors: [parsed.message] }]);
        } else if (detail.toLowerCase().includes("rank order")) {
          form.setFields([{ name: "rankOrder", errors: [parsed.message] }]);
        } else {
          setFormError(parsed.message);
        }
        return;
      }

      if (isEditMode && parsed.status === 404) {
        notification.error({ message: parsed.message });
        onClose();
        return;
      }

      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, setFormError);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFormError(null);
    onClose();
  };

  return {
    state: { formError, isLoading, isEditMode },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteLevelModal(target: Level | null, onClose: () => void) {
  const [deleteLevel, { isLoading }] = useDeleteLevelMutation();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteLevel(target.id).unwrap();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
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
