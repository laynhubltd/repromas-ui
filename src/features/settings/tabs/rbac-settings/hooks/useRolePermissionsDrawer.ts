// Feature: rbac-settings
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { notification } from "antd";
import { useState } from "react";
import {
    useGetRoleQuery,
    useRemovePermissionFromRoleMutation,
} from "../api/rbacSettingsApi";
import { groupPermissionsByResource } from "../utils/groupPermissionsByResource";

export function useRolePermissionsDrawer(selectedRoleId: number | null, open: boolean) {
  const [addPermissionsModalOpen, setAddPermissionsModalOpen] = useState(false);
  const [removeConfirmId, setRemoveConfirmId] = useState<number | null>(null);

  const { data: role, isLoading } = useGetRoleQuery(selectedRoleId!, {
    skip: !selectedRoleId || !open,
  });

  const [removePermission] = useRemovePermissionFromRoleMutation();

  const assignedPermissions = role?.permissions ?? [];
  const assignedPermissionIds = new Set(assignedPermissions.map((p) => p.id));
  const assignedGroups = groupPermissionsByResource(assignedPermissions);

  const handleRemoveConfirm = async () => {
    if (!selectedRoleId || removeConfirmId === null) return;
    try {
      await removePermission({ roleId: selectedRoleId, permissionId: removeConfirmId }).unwrap();
      notification.success({ message: "Permission removed successfully." });
      setRemoveConfirmId(null);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
    }
  };

  return {
    state: {
      role,
      isLoading,
      addPermissionsModalOpen,
      assignedPermissionIds,
      removeConfirmId,
      assignedGroups,
    },
    actions: {
      setAddPermissionsModalOpen,
      setRemoveConfirmId,
      handleRemoveConfirm,
    },
  };
}
