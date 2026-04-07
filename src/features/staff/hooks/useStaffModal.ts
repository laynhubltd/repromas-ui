import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import {
    useCreateStaffMutation,
    useDeleteStaffMutation,
    useUpdateStaffMutation,
} from "../api/staffApi";
import type { CreateStaffRequest, Staff } from "../types/staff";

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

type StaffFormValues = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  roleId?: number | null;
  scopeReferenceId?: number | null;
  departmentId: number;
  fileNumber: string;
  metadata?: string | null;
};

/**
 * Upsert hook for Staff form modal.
 * - target === null  → create mode
 * - target !== null  → edit mode
 */
export function useStaffFormModal(
  target: Staff | null,
  open: boolean,
  onClose: () => void
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<StaffFormValues>();
  const [createStaff, { isLoading: isCreating }] = useCreateStaffMutation();
  const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const isLoading = isCreating || isUpdating;

  // Pre-fill form in edit mode
  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({
        departmentId: target.departmentId,
        fileNumber: target.fileNumber,
        metadata: target.metadata ? JSON.stringify(target.metadata, null, 2) : undefined,
      });
    }
  }, [open, target, form]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setFormError(null);
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormError(null);

      if (isEditMode) {
        await updateStaff({
          id: target.id,
          departmentId: values.departmentId,
          fileNumber: values.fileNumber.trim(),
          metadata: values.metadata ? JSON.parse(values.metadata as string) : null,
        }).unwrap();
      } else {
        const body: CreateStaffRequest = {
          email: values.email.trim(),
          firstName: values.firstName?.trim() || null,
          lastName: values.lastName?.trim() || null,
          phoneNumber: values.phoneNumber?.trim() || null,
          dateOfBirth: values.dateOfBirth || null,
          roleId: values.roleId ?? null,
          scopeReferenceId: values.scopeReferenceId ?? null,
          departmentId: values.departmentId,
          fileNumber: values.fileNumber.trim(),
          metadata: values.metadata ? JSON.parse(values.metadata as string) : null,
        };
        await createStaff(body).unwrap();
      }

      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });

      // 409 conflict on create — map to inline field errors by message content
      if (!isEditMode && parsed.status === 409) {
        const msg = parsed.message.toLowerCase();
        if (msg.includes("email")) {
          form.setFields([{ name: "email", errors: [parsed.message] }]);
          return;
        }
        if (msg.includes("filenumber") || msg.includes("file number") || msg.includes("file_number")) {
          form.setFields([{ name: "fileNumber", errors: [parsed.message] }]);
          return;
        }
      }

      // 409 conflict on edit — map fileNumber inline error
      if (isEditMode && parsed.status === 409) {
        const msg = parsed.message.toLowerCase();
        if (msg.includes("filenumber") || msg.includes("file number") || msg.includes("file_number")) {
          form.setFields([{ name: "fileNumber", errors: [parsed.message] }]);
          return;
        }
      }

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

export function useDeleteStaffModal(target: Staff | null, onClose: () => void) {
  const [deleteStaff, { isLoading }] = useDeleteStaffMutation();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteStaff({ id: target.id }).unwrap();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);

      if (parsed.status === 404) {
        notification.success({ message: "Staff record already removed" });
        onClose();
        return;
      }

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
