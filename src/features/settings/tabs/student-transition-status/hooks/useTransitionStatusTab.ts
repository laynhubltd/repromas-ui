import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useGetTransitionStatusesQuery,
  useLazyGetEnrollmentTransitionsQuery,
} from "../api/studentTransitionStatusApi";
import type {
  StateCategory,
  StudentTransitionStatus,
  TransitionStatusListParams,
} from "../types/student-transition-status";
import { sortDisplayStatuses } from "../utils/sortDisplayStatuses";

export function useTransitionStatusTab() {
  const handleApiError = useApiError();
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    StateCategory | undefined
  >(undefined);
  const [isDefaultFilter, setIsDefaultFilter] = useState<boolean | undefined>(
    undefined,
  );
  const [sort, setSort] = useState("name:asc");
  const [formTarget, setFormTarget] = useState<StudentTransitionStatus | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<StudentTransitionStatus | null>(
    null,
  );
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
    ...(isDefaultFilter !== undefined
      ? { "boolean[isDefault]": isDefaultFilter }
      : {}),
  };

  const { data, isLoading, isError, error: queryError, refetch } =
    useGetTransitionStatusesQuery(queryParams);

  const { data: defaultProbeData, isLoading: isDefaultProbeLoading } =
    useGetTransitionStatusesQuery({
      page: 1,
      itemsPerPage: 1,
      "boolean[isDefault]": true,
    });

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, queryError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, queryError],
  );

  const statuses = data?.member ?? [];
  const displayStatuses = useMemo(
    () => sortDisplayStatuses(statuses, sort),
    [statuses, sort],
  );
  const totalItems = data?.totalItems ?? 0;
  const hasDefaultConfigured = (defaultProbeData?.totalItems ?? 0) > 0;

  const [triggerUsageCheck] = useLazyGetEnrollmentTransitionsQuery();

  const handleCategoryFilterChange = useCallback(
    (value: StateCategory | undefined) => {
      setCategoryFilter(value);
      setPage(1);
    },
    [],
  );

  const handleIsDefaultFilterChange = useCallback(
    (value: boolean | undefined) => {
      setIsDefaultFilter(value);
      setPage(1);
    },
    [],
  );

  const handleClearFilters = useCallback(() => {
    setCategoryFilter(undefined);
    setIsDefaultFilter(undefined);
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
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "GET" },
        });
      } finally {
        setUsageCheckLoading(false);
      }
    },
    [triggerUsageCheck, handleApiError],
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
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "GET" },
        });
      } finally {
        setUsageCheckLoading(false);
      }
    },
    [triggerUsageCheck, handleApiError],
  );

  const handleCloseForm = useCallback(() => {
    setFormModalOpen(false);
    setFormTarget(null);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  }, []);

  const activeFilterCount = [categoryFilter, isDefaultFilter].filter(
    (v) => v !== undefined,
  ).length;

  return {
    state: {
      statuses: displayStatuses,
      totalItems,
      isLoading: isLoading || isDefaultProbeLoading,
      isError,
      sectionError,
      page,
      itemsPerPage,
      search,
      categoryFilter,
      isDefaultFilter,
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
      handleIsDefaultFilterChange,
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
      hasDefaultConfigured,
    },
  };
}
