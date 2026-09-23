import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { useCallback, useMemo } from "react";
import {
  useAddAssignableRoleMutation,
  useGetRoleAssignableRolesQuery,
  useGetRolesQuery,
  useRemoveAssignableRoleMutation,
} from "../api/rbacSettingsApi";
import type { Role, RoleAssignableRole } from "../types/rbac";

export type TransferRoleItem = {
  key: string;
  id: number;
  title: string;
  scope: string;
  isSystem: boolean;
  disabled: boolean;
  disabledReason?: string;
};

export function useRoleAuthorityMatrix(roleId: number | null) {
  const handleApiError = useApiError();

  const { data: allRolesData, isLoading: isLoadingAllRoles } = useGetRolesQuery(
    { itemsPerPage: 100, sort: "name:asc" },
    { skip: !roleId },
  );

  const {
    data: assignableRolesData,
    isLoading: isLoadingAssignableRoles,
    isFetching: isFetchingAssignableRoles,
  } = useGetRoleAssignableRolesQuery(roleId ?? 0, {
    skip: !roleId,
  });

  const [addAssignableRole, { isLoading: isAdding }] = useAddAssignableRoleMutation();
  const [removeAssignableRole, { isLoading: isRemoving }] =
    useRemoveAssignableRoleMutation();

  const isMutating = isAdding || isRemoving;
  const isLoading =
    isLoadingAllRoles || isLoadingAssignableRoles || isFetchingAssignableRoles;

  const currentRole = useMemo(() => {
    if (!roleId || !allRolesData?.member) return null;
    return allRolesData.member.find((r) => r.id === roleId) ?? null;
  }, [roleId, allRolesData?.member]);

  const targetKeys = useMemo(() => {
    if (!assignableRolesData) return [];
    return assignableRolesData.map((ar: RoleAssignableRole) =>
      String(ar.assignableRoleId),
    );
  }, [assignableRolesData]);

  const dataSource: TransferRoleItem[] = useMemo(() => {
    const roles: Role[] = allRolesData?.member ?? [];
    return roles.map((r) => {
      const isSelf = r.id === roleId;
      const isSystem = Boolean(r.isSystem);

      let disabled = false;
      let disabledReason: string | undefined;

      if (isSelf) {
        disabled = true;
        disabledReason = "A role cannot assign itself.";
      } else if (isSystem) {
        disabled = true;
        disabledReason = "System roles cannot be delegated to an authority range.";
      }

      return {
        key: String(r.id),
        id: r.id,
        title: r.name,
        scope: r.scope,
        isSystem,
        disabled,
        disabledReason,
      };
    });
  }, [allRolesData?.member, roleId]);

  const handleTransferChange = useCallback(
    async (
      _nextTargetKeys: string[],
      direction: "left" | "right",
      moveKeys: string[],
    ) => {
      if (!roleId) return;

      try {
        if (direction === "right") {
          // Adding assignable roles
          for (const key of moveKeys) {
            const assignableRoleId = Number(key);
            await addAssignableRole({ roleId, assignableRoleId }).unwrap();
          }
          notifyMutationSuccess("Assignable role range updated.");
        } else {
          // Removing assignable roles
          for (const key of moveKeys) {
            const targetRoleId = Number(key);
            await removeAssignableRole({ roleId, targetRoleId }).unwrap();
          }
          notifyMutationSuccess("Assignable role removed from authority range.");
        }
      } catch (err: unknown) {
        handleApiError(err, {
          context: {
            screen: RequestScreen.Modal,
            method: direction === "right" ? "POST" : "DELETE",
          },
        });
      }
    },
    [roleId, addAssignableRole, removeAssignableRole, handleApiError],
  );

  return {
    state: {
      currentRole,
      dataSource,
      targetKeys,
      isLoading,
      isMutating,
    },
    actions: {
      handleTransferChange,
    },
  };
}
