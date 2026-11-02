import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { createTableChangeHandler } from "@/shared/utils/table/createTableChangeHandler";
import { useCallback, useMemo, useState } from "react";
import { useGetRolesQuery } from "../api/rbacSettingsApi";
import type { Role, RoleScope } from "../types/rbac";

const ITEMS_PER_PAGE = 30;

export function useRolesPanel() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);
  const [scopeFilter, setScopeFilter] = useState<RoleScope | undefined>(undefined);
  const [sort, setSort] = useState("createdAt:desc");
  const [page, setPage] = useState(1);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleScopeFilterChange = useCallback((scope: RoleScope | undefined) => {
    setScopeFilter(scope);
    setPage(1);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setScopeFilter(undefined);
    setPage(1);
  }, []);

  const queryParams = {
    page,
    itemsPerPage: ITEMS_PER_PAGE,
    sort,
    ...(debouncedSearch ? { "search[name]": debouncedSearch } : {}),
    ...(scopeFilter ? { "exact[scope]": scopeFilter } : {}),
  };

  const { data, isLoading, isError, refetch } = useGetRolesQuery(queryParams);

  const roles = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  const handleTableChange = useMemo(
    () =>
      createTableChangeHandler<Role>({
        onPageChange: (p) => setPage(p),
        onSortChange: (newSort) => {
          setSort(newSort);
          setPage(1);
        },
        defaultSort: "createdAt:desc",
      }),
    [],
  );

  const handleManagePermissions = useCallback((role: Role) => {
    setSelectedRoleId((prev) => (prev === role.id ? null : role.id));
  }, []);

  const closeDrawer = useCallback(() => {
    setSelectedRoleId(null);
  }, []);

  // Compute active filter count: search + scope filter
  const activeFilterCount =
    (debouncedSearch.trim().length > 0 ? 1 : 0) + (scopeFilter !== undefined ? 1 : 0);

  return {
    state: {
      roles,
      totalItems,
      isLoading,
      isError,
      search,
      scopeFilter,
      sort,
      page,
      selectedRoleId,
      createModalOpen,
      editTarget,
      deleteTarget,
      filterOpen,
    },
    actions: {
      handleSearchChange,
      handleScopeFilterChange,
      handleTableChange,
      handleManagePermissions,
      clearAllFilters,
      closeDrawer,
      setCreateModalOpen,
      setEditTarget,
      setDeleteTarget,
      setPage,
      setFilterOpen,
      refetch,
    },
    flags: {
      hasData: roles.length > 0,
      isFilterActive: debouncedSearch.trim().length > 0 || scopeFilter !== undefined,
      activeFilterCount,
    },
  };
}
