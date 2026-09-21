import useAuthState from "@/features/auth/use-auth-state";
import { useMemo } from "react";
import { useGetAssignableRolesForPickerQuery } from "../api/rbacSettingsApi";

export type UseAssignableRolePickerOptions = {
  targetUserId?: number | null;
  skip?: boolean;
};

export function useAssignableRolePicker(options?: UseAssignableRolePickerOptions) {
  const { targetUserId, skip = false } = options ?? {};
  const { userProfile, entity, roles: authRoles } = useAuthState();

  const { data: assignableRoles, isLoading, isFetching, refetch } =
    useGetAssignableRolesForPickerQuery(undefined, { skip });

  const currentUserId = userProfile?.id ?? entity?.id ?? null;

  const canAssignAll = useMemo(() => {
    return (authRoles ?? []).some(
      (r) =>
        Boolean((r as unknown as { canAssignAll?: boolean }).canAssignAll) ||
        r.scope === "GLOBAL" ||
        r.name === "System Administrator",
    );
  }, [authRoles]);

  const isSelfAssignment = useMemo(() => {
    if (!targetUserId || !currentUserId) return false;
    return Number(targetUserId) === Number(currentUserId);
  }, [targetUserId, currentUserId]);

  const isSelfAssignmentRestricted = isSelfAssignment && !canAssignAll;

  const roles = assignableRoles ?? [];

  return {
    roles,
    isLoading: isLoading || isFetching,
    canAssignAll,
    isSelfAssignment,
    isSelfAssignmentRestricted,
    isEmpty: !isLoading && roles.length === 0,
    currentUserId,
    refetch,
  };
}
