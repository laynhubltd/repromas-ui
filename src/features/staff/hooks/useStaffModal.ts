import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useEffect } from "react";
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
  const handleApiError = useApiError();

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
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

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

      notifyMutationSuccess(
        mutationSuccessMessage("Staff record", isEditMode ? "updated" : "created"),
      );
      form.resetFields();
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isEditMode ? "PATCH" : "POST",
        },
        form,
      });
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

export function useDeleteStaffModal(target: Staff | null, onClose: () => void) {
  const [deleteStaff, { isLoading }] = useDeleteStaffMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteStaff({ id: target.id }).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Staff record", "deleted"));
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
