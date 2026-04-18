// Feature: rbac-settings
import type { SorterResult } from "antd/es/table/interface";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGetRolesQuery } from "../api/rbacSettingsApi";
import type { Role, RoleScope } from "../types/rbac";

const ITEMS_PER_PAGE = 30;

export function useRolesPanel() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState<RoleScope | undefined>(undefined);
  const [sort, setSort] = useState("createdAt:desc");
  const [page, setPage] = useState(1);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  const handleScopeFilterChange = useCallback((scope: RoleScope | undefined) => {
    setScopeFilter(scope);
    setPage(1);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setScopeFilter(undefined);
    setPage(1);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
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

  const handleSortChange = useCallback(
    (sorter: SorterResult<Role> | SorterResult<Role>[]) => {
      const s = Array.isArray(sorter) ? sorter[0] : sorter;
      if (!s.columnKey || !s.order) {
        setSort("createdAt:desc");
        return;
      }
      setSort(`${String(s.columnKey)}:${s.order === "ascend" ? "asc" : "desc"}`);
    },
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
      handleSortChange,
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
