import { useGetRolesQuery } from "@/features/settings/tabs/rbac-settings/api/rbacSettingsApi";
import type { Role } from "@/features/settings/tabs/rbac-settings/types/rbac";
import { useApiError } from "@/shared/hooks/useApiError";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useGetUsersQuery } from "../api/userManagementApi";
import {
  UserManagementActionType,
  initialUserManagementState,
  userManagementReducer,
} from "../state/userManagementState";
import type { TenantUser } from "../types/user-management";

const ITEMS_PER_PAGE = 30;
// Bounded reference domain ceiling — backend clamps to 100 max
const ROLES_QUERY = { itemsPerPage: 100 } as const;

export function useUserManagementTab() {
  // ── Filter + pagination state (reducer) ───────────────────────────────────

  const [listState, dispatch] = useReducer(
    userManagementReducer,
    initialUserManagementState,
  );

  // ── Modal / drawer open state (isolated useState — single booleans) ───────

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<TenantUser | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTarget, setDrawerTarget] = useState<TenantUser | null>(null);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleModalTarget, setRoleModalTarget] = useState<TenantUser | null>(null);

  const [resendModalOpen, setResendModalOpen] = useState(false);
  const [resendTarget, setResendTarget] = useState<TenantUser | null>(null);

  const debouncedSearch = useDebouncedValue(listState.search, 300);

  // Sync debounced search to reducer when value updates
  useEffect(() => {
    dispatch({
      type: UserManagementActionType.SetDebouncedSearch,
      search: debouncedSearch,
    });
  }, [debouncedSearch]);

  // ── Queries ───────────────────────────────────────────────────────────────

  const {
    data: usersData,
    isLoading: isUsersLoading,
    isFetching: isUsersFetching,
    isError: isUsersError,
    error: usersError,
    refetch,
  } = useGetUsersQuery({
    page: listState.page,
    itemsPerPage: ITEMS_PER_PAGE,
    // Only send the email param when the user has typed something
    ...(debouncedSearch.trim()
      ? { email: debouncedSearch.trim() }
      : {}),
  });

  const { data: rolesData, isLoading: isRolesLoading } =
    useGetRolesQuery(ROLES_QUERY);

  // ── Derived values ────────────────────────────────────────────────────────

  const handleApiError = useApiError();

  const users: TenantUser[] = usersData?.member ?? [];
  const totalItems: number = usersData?.totalItems ?? 0;

  const roles: Role[] = useMemo(
    () => rolesData?.member ?? [],
    [rolesData?.member],
  );

  const roleOptions = useMemo(
    () => roles.map((r) => ({ value: r.id, label: r.name })),
    [roles],
  );

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isUsersError, usersError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isUsersError, usersError],
  );

  const isLoading = isUsersLoading || isUsersFetching;

  // ── Form modal actions ────────────────────────────────────────────────────

  const handleOpenCreate = useCallback(() => {
    setFormTarget(null);
    setFormModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((user: TenantUser) => {
    setFormTarget(user);
    setFormModalOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormModalOpen(false);
    setFormTarget(null);
  }, []);

  // ── Drawer actions ────────────────────────────────────────────────────────

  const handleOpenDrawer = useCallback((user: TenantUser) => {
    setDrawerTarget(user);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setDrawerTarget(null);
  }, []);

  // ── Role modal actions ────────────────────────────────────────────────────

  const handleOpenRoleModal = useCallback((user: TenantUser) => {
    setRoleModalTarget(user);
    setRoleModalOpen(true);
  }, []);

  const handleCloseRoleModal = useCallback(() => {
    setRoleModalOpen(false);
    setRoleModalTarget(null);
  }, []);

  // ── Resend modal actions ──────────────────────────────────────────────────

  const handleOpenResend = useCallback((user: TenantUser) => {
    setResendTarget(user);
    setResendModalOpen(true);
  }, []);

  const handleCloseResend = useCallback(() => {
    setResendModalOpen(false);
    setResendTarget(null);
  }, []);

  // ── List controls ─────────────────────────────────────────────────────────

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: UserManagementActionType.SetPage, page });
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    dispatch({ type: UserManagementActionType.SetSearch, search });
  }, []);

  // ── Return shape ──────────────────────────────────────────────────────────

  return {
    state: {
      users,
      totalItems,
      page: listState.page,
      search: listState.search,
      roles,
      roleOptions,
      isLoading,
      isRolesLoading,
      sectionError,
      // modal / drawer targets
      formTarget,
      drawerTarget,
      roleModalTarget,
      resendTarget,
      // modal / drawer open flags
      formModalOpen,
      drawerOpen,
      roleModalOpen,
      resendModalOpen,
    },
    actions: {
      handleOpenCreate,
      handleOpenEdit,
      handleCloseForm,
      handleOpenDrawer,
      handleCloseDrawer,
      handleOpenRoleModal,
      handleCloseRoleModal,
      handleOpenResend,
      handleCloseResend,
      handlePageChange,
      handleSearchChange,
      refetch,
    },
    flags: {
      hasUsers: users.length > 0,
      isFiltering: listState.search.trim().length > 0,
    },
    // pass-through for child hooks — avoids re-fetching roles in modals
    _internal: { handleApiError },
  };
}
