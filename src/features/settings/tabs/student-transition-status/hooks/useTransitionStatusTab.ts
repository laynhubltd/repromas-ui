import { parseApiError } from "@/shared/utils/error/parseApiError";
import { notification } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    useGetTransitionStatusesQuery,
    useLazyGetEnrollmentTransitionsQuery,
} from "../api/studentTransitionStatusApi";
import type {
    StateCategory,
    StudentTransitionStatus,
    TransitionStatusListParams,
} from "../types/student-transition-status";

export function useTransitionStatusTab() {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<StateCategory | undefined>(undefined);
  const [sort, setSort] = useState("name:asc");
  const [formTarget, setFormTarget] = useState<StudentTransitionStatus | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentTransitionStatus | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [usageCheckLoading, setUsageCheckLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);

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

  const queryParams: TransitionStatusListParams = {
    page,
    itemsPerPage,
    sort,
    ...(debouncedSearch ? { "search[name]": debouncedSearch } : {}),
    ...(categoryFilter ? { "exact[stateCategory]": categoryFilter } : {}),
  };

  const { data, isLoading, isError, refetch } = useGetTransitionStatusesQuery(queryParams);

  const statuses = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  const [triggerUsageCheck] = useLazyGetEnrollmentTransitionsQuery();

  const handleCategoryFilterChange = useCallback((value: StateCategory | undefined) => {
    setCategoryFilter(value);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setCategoryFilter(undefined);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort);
  }, []);

  const handlePageChange = useCallback((newPage: number, pageSize: number) => {
    setPage(newPage);
    setItemsPerPage(pageSize);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setFormTarget(null);
    setUsageCount(0);
    setFormModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback(
    async (status: StudentTransitionStatus) => {
      setUsageCheckLoading(true);
      try {
        const result = await triggerUsageCheck({
          "exact[status]": status.id,
          itemsPerPage: 1,
        }).unwrap();
        setUsageCount(result.totalItems);
        setFormTarget(status);
        setFormModalOpen(true);
      } catch (err: unknown) {
        const parsed = parseApiError(err);
        notification.error({ message: parsed.message });
      } finally {
        setUsageCheckLoading(false);
      }
    },
    [triggerUsageCheck]
  );

  const handleOpenDelete = useCallback(
    async (status: StudentTransitionStatus) => {
      setUsageCheckLoading(true);
      try {
        const result = await triggerUsageCheck({
          "exact[status]": status.id,
          itemsPerPage: 1,
        }).unwrap();
        setUsageCount(result.totalItems);
        setDeleteTarget(status);
        setDeleteModalOpen(true);
      } catch (err: unknown) {
        const parsed = parseApiError(err);
        notification.error({ message: parsed.message });
      } finally {
        setUsageCheckLoading(false);
      }
    },
    [triggerUsageCheck]
  );

  const handleCloseForm = useCallback(() => {
    setFormModalOpen(false);
    setFormTarget(null);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  }, []);

  const activeFilterCount = [categoryFilter].filter(Boolean).length;

  return {
    state: {
      statuses,
      totalItems,
      isLoading,
      isError,
      page,
      itemsPerPage,
      search,
      categoryFilter,
      sort,
      formTarget,
      deleteTarget,
      formModalOpen,
      deleteModalOpen,
      usageCheckLoading,
      usageCount,
    },
    actions: {
      handleSearchChange,
      handleCategoryFilterChange,
      handleClearFilters,
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
      hasData: statuses.length > 0,
      isSearchActive: search.trim().length > 0,
      activeFilterCount,
    },
  };
}
