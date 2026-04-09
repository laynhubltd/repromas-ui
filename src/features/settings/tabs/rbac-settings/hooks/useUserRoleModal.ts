// Feature: rbac-settings
import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import {
    useAssignRoleToUserMutation,
    useGetRolesQuery,
    useRevokeRoleFromUserMutation,
} from "../api/rbacSettingsApi";
import type { Role, RoleScope, UserRole } from "../types/rbac";

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
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedScope, setSelectedScope] = useState<RoleScope | null>(null);

  const [assignRole, { isLoading: isSubmitting }] = useAssignRoleToUserMutation();

  const { data: rolesData } = useGetRolesQuery(
    { itemsPerPage: 200 },
    { skip: !open },
  );
  const roles: Role[] = rolesData?.member ?? [];

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setFormError(null);
      setSelectedScope(null);
    }
  }, [open, form]);

  const handleRoleChange = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId);
    setSelectedScope(role?.scope ?? null);
    // Clear scopeReferenceId when role changes
    form.setFieldValue("scopeReferenceId", undefined);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormError(null);

      await assignRole({
        userId,
        roleId: values.roleId,
        scopeReferenceId: selectedScope === "GLOBAL" ? null : (values.scopeReferenceId ?? null),
      }).unwrap();

      notification.success({ message: "Role assigned successfully." });
      form.resetFields();
      setSelectedScope(null);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);

      if (parsed.status === 409) {
        setFormError("This role assignment already exists for this user.");
        return;
      }

      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, setFormError);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFormError(null);
    setSelectedScope(null);
    onClose();
  };

  return {
    state: { isSubmitting, formError, roles, selectedScope },
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
      const parsed = parseApiError(err);
      if (parsed.status === 404) {
        setError("This role assignment no longer exists.");
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
    state: { isRevoking, error },
    actions: { handleConfirm, handleCancel },
  };
}
