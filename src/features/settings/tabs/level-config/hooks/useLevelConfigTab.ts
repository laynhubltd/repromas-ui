import { useCallback, useEffect, useRef, useState } from "react";
import { useGetLevelsQuery } from "../api/levelApi";
import type { Level } from "../types/level";

export function useLevelConfigTab() {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("rankOrder:asc");
  const [formTarget, setFormTarget] = useState<Level | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Level | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);

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
    itemsPerPage,
    sort,
    ...(debouncedSearch ? { "search[name]": debouncedSearch } : {}),
  };

  const { data, isLoading, isError, refetch } = useGetLevelsQuery(queryParams);

  const levels = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort);
  }, []);

  const handlePageChange = useCallback((newPage: number, pageSize: number) => {
    setPage(newPage);
    setItemsPerPage(pageSize);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setFormTarget(null);
    setFormModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((level: Level) => {
    setFormTarget(level);
    setFormModalOpen(true);
  }, []);

  const handleOpenDelete = useCallback((level: Level) => {
    setDeleteTarget(level);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormModalOpen(false);
    setFormTarget(null);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  return {
    state: {
      levels,
      totalItems,
      isLoading,
      isError,
      page,
      itemsPerPage,
      search,
      sort,
      formTarget,
      deleteTarget,
      formModalOpen,
    },
    actions: {
      handleSearchChange,
      handleSortChange,
      handlePageChange,
      handleOpenCreate,
      handleOpenEdit,
      handleOpenDelete,
      handleCloseForm,
      handleCloseDelete,
      refetch,
    },
    flags: {
      hasData: levels.length > 0,
      isSearchActive: search.trim().length > 0,
    },
  };
}
