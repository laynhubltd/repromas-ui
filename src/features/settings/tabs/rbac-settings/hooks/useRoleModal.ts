// Feature: rbac-settings
import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import {
    useCreateRoleMutation,
    useDeleteRoleMutation,
    useUpdateRoleMutation,
} from "../api/rbacSettingsApi";
import type { Role, RoleScope } from "../types/rbac";

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

type RoleFormValues = {
  name: string;
  scope: RoleScope;
  description?: string;
};

export function useRoleFormModal(
  target: Role | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<RoleFormValues>();
  const [formError, setFormError] = useState<string | null>(null);

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  const isSubmitting = isCreating || isUpdating;

  // Pre-fill form in edit mode; set defaults in create mode
  useEffect(() => {
    if (open) {
      if (isEditMode && target) {
        form.setFieldsValue({
          name: target.name,
          scope: target.scope,
          description: target.description ?? undefined,
        });
      } else {
        form.setFieldsValue({ scope: "GLOBAL" });
      }
    }
  }, [open, isEditMode, target, form]);

  // Reset error when modal closes
  useEffect(() => {
    if (!open) {
      setFormError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormError(null);

      if (isEditMode) {
        await updateRole({
          id: target.id,
          name: values.name.trim(),
          scope: values.scope,
          description: values.description?.trim() ?? undefined,
        }).unwrap();
        notification.success({ message: "Role updated successfully." });
      } else {
        await createRole({
          name: values.name.trim(),
          scope: values.scope,
          description: values.description?.trim() ?? undefined,
        }).unwrap();
        notification.success({ message: "Role created successfully." });
      }

      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);

      if (parsed.status === 409) {
        setFormError("A role with this name already exists.");
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
    state: { isEditMode, isSubmitting, formError },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteRoleModal(
  target: Role | null,
  open: boolean,
  onClose: () => void,
  onDeleted?: (roleId: number) => void,
) {
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();
  const [error, setError] = useState<string | null>(null);

  // Reset error when modal closes
  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteRole(target.id).unwrap();
      notification.success({ message: "Role deleted successfully." });
      onDeleted?.(target.id);
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      if (parsed.status === 409) {
        setError("This role is assigned to one or more users. Revoke all assignments before deleting.");
      } else {
        notification.error({ message: parsed.message });
        setError(parsed.message);
      }
    }
  };

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  return {
    state: { isDeleting, error },
    actions: { handleConfirm, handleCancel },
  };
}
