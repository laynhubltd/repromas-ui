import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import type { SorterResult } from "antd/es/table/interface";
import { useCallback, useState } from "react";
import { useGetPermissionsQuery } from "../api/rbacSettingsApi";
import type { Permission } from "../types/rbac";

const ITEMS_PER_PAGE = 30;

export function usePermissionsPanel() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);
  const [sort, setSort] = useState("createdAt:desc");
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Permission | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null);
  const [syncModalOpen, setSyncModalOpen] = useState(false);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
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
      syncModalOpen,
    },
    actions: {
      handleSearchChange,
      handleSortChange,
      setCreateModalOpen,
      setEditTarget,
      setDeleteTarget,
      setSyncModalOpen,
      setPage,
      refetch,
    },
    flags: {
      hasData: permissions.length > 0,
      isSearchActive: search.trim().length > 0,
    },
  };
}
