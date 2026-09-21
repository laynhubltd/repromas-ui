import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import {
  useAssignRoleToUserMutation,
  useRevokeRoleFromUserMutation,
} from "../api/rbacSettingsApi";
import type { RoleScope, UserRole } from "../types/rbac";
import { roleScopeOmitsReference } from "../types/rbac";
import { useAssignableRolePicker } from "./useAssignableRolePicker";

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

  const { roles, isLoading: isLoadingRoles, isSelfAssignmentRestricted, isEmpty } =
    useAssignableRolePicker({ targetUserId: userId, skip: !open });

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
    if (isSelfAssignmentRestricted) {
      notification.error({
        message: "Self-assignment restricted",
        description: "Users cannot assign roles to themselves under the delegated authority policy.",
      });
      return;
    }

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
    state: {
      isSubmitting: isSubmitting || isLoadingRoles,
      roles,
      selectedScope,
      isSelfAssignmentRestricted,
      isEmpty,
    },
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
  const [lockoutError, setLockoutError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setLockoutError(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!target) return;
    setLockoutError(null);
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
      const errObj = err as { status?: number; data?: { message?: string } };
      if (errObj?.status === 409) {
        setLockoutError(
          errObj.data?.message ||
          "Cannot revoke the last active System Administrator for this tenant.",
        );
      } else {
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "DELETE" },
        });
      }
    }
  };

  const handleCancel = () => {
    setLockoutError(null);
    onClose();
  };

  return {
    state: { isRevoking, lockoutError },
    actions: { handleConfirm, handleCancel },
  };
}
