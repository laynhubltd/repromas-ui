// Feature: rbac-settings
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { notification } from "antd";
import { useState } from "react";
import {
    useAssignPermissionsToRoleMutation,
    useGetPermissionsQuery,
    useGetRoleQuery,
    useRemovePermissionFromRoleMutation,
} from "../api/rbacSettingsApi";
import { groupPermissionsByResource } from "../utils/groupPermissionsByResource";

export function useRolePermissionsDrawer(selectedRoleId: number | null, open: boolean) {
  const [addingPermissions, setAddingPermissions] = useState(false);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [removeConfirmId, setRemoveConfirmId] = useState<number | null>(null);

  const { data: role, isLoading } = useGetRoleQuery(selectedRoleId!, {
    skip: !selectedRoleId || !open,
  });
  const { data: allPermissionsData } = useGetPermissionsQuery(
    { itemsPerPage: 200 },
    { skip: !open },
  );

  const [assignPermissions] = useAssignPermissionsToRoleMutation();
  const [removePermission] = useRemovePermissionFromRoleMutation();

  const assignedPermissions = role?.permissions ?? [];
  const assignedIds = new Set(assignedPermissions.map((p) => p.id));

  const availablePermissions = (allPermissionsData?.member ?? []).filter(
    (p) => !assignedIds.has(p.id),
  );

  const assignedGroups = groupPermissionsByResource(assignedPermissions);
  const availableGroups = groupPermissionsByResource(availablePermissions);

  const availableOptions = availableGroups.flatMap((group) =>
    group.permissions.map((p) => ({
      value: p.id,
      label: `[${group.label}] ${p.name} (${p.slug})`,
    })),
  );

  const handleConfirmAdd = async () => {
    if (!selectedRoleId || selectedPermissionIds.length === 0) return;
    try {
      setIsAssigning(true);
      await assignPermissions({
        id: selectedRoleId,
        permissionIds: selectedPermissionIds,
      }).unwrap();
      notification.success({ message: "Permissions assigned successfully." });
      setSelectedPermissionIds([]);
      setAddingPermissions(false);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
    } finally {
      setIsAssigning(false);
    }
  };

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

  const handleCancelAdd = () => {
    setAddingPermissions(false);
    setSelectedPermissionIds([]);
  };

  return {
    state: {
      role,
      isLoading,
      addingPermissions,
      selectedPermissionIds,
      isAssigning,
      removeConfirmId,
      assignedGroups,
      availableOptions,
      availablePermissions,
    },
    actions: {
      setAddingPermissions,
      setSelectedPermissionIds,
      setRemoveConfirmId,
      handleConfirmAdd,
      handleRemoveConfirm,
      handleCancelAdd,
    },
  };
}
