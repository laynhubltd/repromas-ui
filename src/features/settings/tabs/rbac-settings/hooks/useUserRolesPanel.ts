// Feature: rbac-settings
import { useState } from "react";
import { useGetUserRolesQuery } from "../api/rbacSettingsApi";
import type { UserRole } from "../types/rbac";

export function useUserRolesPanel(userId: number) {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<UserRole | null>(null);
  const [showNextLoginCallout, setShowNextLoginCallout] = useState(false);

  const { data, isLoading, isError, refetch } = useGetUserRolesQuery({ userId });

  const userRoles = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  const handleAssignSuccess = () => {
    setShowNextLoginCallout(true);
  };

  const handleRevokeSuccess = () => {
    setShowNextLoginCallout(true);
  };

  return {
    state: {
      userRoles,
      totalItems,
      isLoading,
      isError,
      assignModalOpen,
      revokeTarget,
      showNextLoginCallout,
    },
    actions: {
      setAssignModalOpen,
      setRevokeTarget,
      handleAssignSuccess,
      handleRevokeSuccess,
      refetch,
    },
    flags: {
      hasData: userRoles.length > 0,
    },
  };
}
