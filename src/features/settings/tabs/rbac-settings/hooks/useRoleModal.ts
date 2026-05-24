// Feature: rbac-settings
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { Form, notification } from "antd";
import { useEffect } from "react";
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
  const handleApiError = useApiError();

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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

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
    state: { isEditMode, isSubmitting },
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
  const handleApiError = useApiError();

  void open;

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteRole(target.id).unwrap();
      notification.success({ message: "Role deleted successfully." });
      onDeleted?.(target.id);
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
