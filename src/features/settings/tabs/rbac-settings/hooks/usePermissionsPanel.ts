// Feature: rbac-settings
import type { SorterResult } from "antd/es/table/interface";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGetPermissionsQuery } from "../api/rbacSettingsApi";
import type { Permission } from "../types/rbac";

const ITEMS_PER_PAGE = 30;

export function usePermissionsPanel() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("createdAt:desc");
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Permission | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(value), 300);
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
  };

  const { data, isLoading, isError, refetch } = useGetPermissionsQuery(queryParams);

  const permissions = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  const handleSortChange = useCallback(
    (sorter: SorterResult<Permission> | SorterResult<Permission>[]) => {
      const s = Array.isArray(sorter) ? sorter[0] : sorter;
      if (!s.columnKey || !s.order) {
        setSort("createdAt:desc");
        return;
      }
      setSort(`${String(s.columnKey)}:${s.order === "ascend" ? "asc" : "desc"}`);
    },
    [],
  );

  return {
    state: {
      permissions,
      totalItems,
      isLoading,
      isError,
      search,
      sort,
      page,
      createModalOpen,
      editTarget,
      deleteTarget,
    },
    actions: {
      handleSearchChange,
      handleSortChange,
      setCreateModalOpen,
      setEditTarget,
      setDeleteTarget,
      setPage,
      refetch,
    },
    flags: {
      hasData: permissions.length > 0,
      isSearchActive: search.trim().length > 0,
    },
  };
}
