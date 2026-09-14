// Feature: rbac-settings
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { Form, notification } from "antd";
import { useEffect } from "react";
import {
    useAssignRoleToUserMutation,
    useGetRolesQuery,
    useRevokeRoleFromUserMutation,
} from "../api/rbacSettingsApi";
import type { Role, RoleScope, UserRole } from "../types/rbac";
import { roleScopeOmitsReference } from "../types/rbac";

// ─── Assign Role to User ──────────────────────────────────────────────────────

type UserRoleFormValues = {
  roleId: number;
  scopeReferenceId?: number;
};

export function useUserRoleFormModal(
  userId: number,
  open: boolean,
  onClose: () => void,
  onSuccess?: () => void,
) {
  const [form] = Form.useForm<UserRoleFormValues>();
  const handleApiError = useApiError();

  const [assignRole, { isLoading: isSubmitting }] = useAssignRoleToUserMutation();

  const { data: rolesData } = useGetRolesQuery(
    { itemsPerPage: 200 },
    { skip: !open },
  );
  const roles: Role[] = rolesData?.member ?? [];

  const selectedRoleId = Form.useWatch("roleId", form);
  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const selectedScope: RoleScope | null = selectedRole?.scope ?? null;

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleRoleChange = () => {
    // Clear scopeReferenceId when role changes
    form.setFieldValue("scopeReferenceId", undefined);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      await assignRole({
        userId,
        roleId: values.roleId,
        scopeReferenceId:
          selectedScope && roleScopeOmitsReference(selectedScope)
            ? null
            : (values.scopeReferenceId ?? null),
      }).unwrap();

      notification.success({ message: "Role assigned successfully." });
      form.resetFields();
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Modal, method: "POST" },
        form,
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return {
    state: { isSubmitting, roles, selectedScope },
    actions: { handleSubmit, handleCancel, handleRoleChange },
    form,
  };
}

// ─── Revoke Role from User ────────────────────────────────────────────────────

export function useRevokeUserRoleModal(
  target: UserRole | null,
  userId: number,
  open: boolean,
  onClose: () => void,
  onSuccess?: () => void,
) {
  const [revokeRole, { isLoading: isRevoking }] = useRevokeRoleFromUserMutation();
  const handleApiError = useApiError();

  void open;

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await revokeRole({
        userId,
        roleId: target.roleId,
        ...(target.scopeReferenceId !== null
          ? { scopeReferenceId: target.scopeReferenceId }
          : {}),
      }).unwrap();
      notification.success({ message: "Role revoked successfully." });
      onSuccess?.();
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
    state: { isRevoking },
    actions: { handleConfirm, handleCancel },
  };
}
