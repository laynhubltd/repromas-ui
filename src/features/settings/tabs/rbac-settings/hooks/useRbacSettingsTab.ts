// Feature: rbac-settings
import { useAppSelector } from "@/app/hooks";
import {
    useGetPermissionsQuery,
    useGetRolesQuery,
    useGetUserRolesQuery,
} from "../api/rbacSettingsApi";

export function useRbacSettingsTab() {
  const userProfile = useAppSelector((state) => state.auth.userProfile);
  const userId = userProfile?.id ? parseInt(userProfile.id, 10) : 0;

  const { data: permissionsData, isLoading: isPermissionsLoading } =
    useGetPermissionsQuery({ itemsPerPage: 1 });

  const { data: rolesData, isLoading: isRolesLoading } =
    useGetRolesQuery({ itemsPerPage: 1 });

  const { data: userRolesData, isLoading: isUserRolesLoading } =
    useGetUserRolesQuery({ userId }, { skip: userId === 0 });

  return {
    state: {
      permissionsTotal: permissionsData?.totalItems ?? 0,
      rolesTotal: rolesData?.totalItems ?? 0,
      userRolesTotal: userRolesData?.totalItems ?? 0,
      isMetricsLoading: isPermissionsLoading || isRolesLoading || isUserRolesLoading,
    },
  };
}
