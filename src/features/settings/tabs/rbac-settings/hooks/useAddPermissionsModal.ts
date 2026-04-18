// Feature: role-permission-assign
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { notification } from "antd";
import { useEffect, useState } from "react";
import {
    useAssignPermissionsToRoleMutation,
    useGetPermissionsQuery,
} from "../api/rbacSettingsApi";
import type { ResourceGroup } from "../types/rbac";
import { groupPermissionsByResource } from "../utils/groupPermissionsByResource";

export function useAddPermissionsModal(
  roleId: number | null,
  assignedPermissionIds: Set<number>,
  open: boolean,
  onClose: () => void,
): {
  state: {
    searchTerm: string;
    availableGroups: ResourceGroup[];
    selectedIds: Set<number>;
    isLoading: boolean;
    isSubmitting: boolean;
  };
  actions: {
    handleSearchChange: (value: string) => void;
    handleCheck: (permissionId: number, checked: boolean) => void;
    handleConfirm: () => Promise<void>;
    handleCancel: () => void;
  };
} {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [assignPermissionsToRole, { isLoading: isSubmitting }] =
    useAssignPermissionsToRoleMutation();

  // 300 ms debounce for search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: permissionsData, isLoading } = useGetPermissionsQuery(
    { itemsPerPage: 100, "search[name]": debouncedSearch || undefined },
    { skip: !open || !roleId },
  );

  const availablePermissions = (permissionsData?.member ?? []).filter(
    (p) => !assignedPermissionIds.has(p.id),
  );

  const availableGroups = groupPermissionsByResource(availablePermissions);

  const reset = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedIds(new Set());
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleCheck = (permissionId: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(permissionId);
      } else {
        next.delete(permissionId);
      }
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!roleId || selectedIds.size === 0) return;
    try {
      await assignPermissionsToRole({
        id: roleId,
        permissionIds: Array.from(selectedIds),
      }).unwrap();
      notification.success({ message: "Permissions assigned successfully." });
      reset();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return {
    state: {
      searchTerm,
      availableGroups,
      selectedIds,
      isLoading,
      isSubmitting,
    },
    actions: {
      handleSearchChange,
      handleCheck,
      handleConfirm,
      handleCancel,
    },
  };
}
