import { useCallback, useEffect, useRef, useState } from "react";
import { useListScoreEvaluationStatusesQuery } from "../api/evaluationStatusApi";
import type { ScoreEvaluationStatus } from "../types/evaluation-status";

const ITEMS_PER_PAGE = 10;

export function useEvaluationStatusTab(): {
  state: {
    searchInput: string;
    isDefaultFilter: boolean | undefined;
    isStandardGradedFilter: boolean | undefined;
    page: number;
    itemsPerPage: number;
    upsertOpen: boolean;
    upsertTarget: ScoreEvaluationStatus | null;
    deleteOpen: boolean;
    deleteTarget: ScoreEvaluationStatus | null;
    statuses: ScoreEvaluationStatus[];
    totalItems: number;
    isLoading: boolean;
    isError: boolean;
  };
  actions: {
    handleSearchChange: (value: string) => void;
    handleIsDefaultFilterChange: (value: boolean | undefined) => void;
    handleIsStandardGradedFilterChange: (value: boolean | undefined) => void;
    handlePageChange: (page: number, pageSize: number) => void;
    handleOpenUpsert: (target?: ScoreEvaluationStatus) => void;
    handleCloseUpsert: () => void;
    handleOpenDelete: (target: ScoreEvaluationStatus) => void;
    handleCloseDelete: () => void;
    refetch: () => void;
  };
  flags: {
    hasData: boolean;
    isSearchOrFilterActive: boolean;
  };
} {
  // Search state — raw input + debounced value
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter state
  const [isDefaultFilter, setIsDefaultFilter] = useState<boolean | undefined>(
    undefined,
  );
  const [isStandardGradedFilter, setIsStandardGradedFilter] = useState<
    boolean | undefined
  >(undefined);

  // Pagination
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

  // Upsert modal state
  const [upsertOpen, setUpsertOpen] = useState(false);
  const [upsertTarget, setUpsertTarget] =
    useState<ScoreEvaluationStatus | null>(null);

  // Delete modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<ScoreEvaluationStatus | null>(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // Compose query params
  const queryParams = {
    page,
    itemsPerPage,
    sort: "isDefault:desc,name:asc" as const,
    ...(debouncedSearch
      ? {
          "search[name]": debouncedSearch,
          "search[code]": debouncedSearch,
        }
      : {}),
    ...(isDefaultFilter !== undefined
      ? { "boolean[isDefault]": isDefaultFilter }
      : {}),
    ...(isStandardGradedFilter !== undefined
      ? { "boolean[isStandardGraded]": isStandardGradedFilter }
      : {}),
  };

  const { data, isLoading, isError, refetch } =
    useListScoreEvaluationStatusesQuery(queryParams);

  const statuses = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  const handleIsDefaultFilterChange = useCallback(
    (value: boolean | undefined) => {
      setIsDefaultFilter(value);
      setPage(1);
    },
    [],
  );

  const handleIsStandardGradedFilterChange = useCallback(
    (value: boolean | undefined) => {
      setIsStandardGradedFilter(value);
      setPage(1);
    },
    [],
  );

  const handlePageChange = useCallback(
    (newPage: number, newPageSize: number) => {
      setPage(newPage);
      setItemsPerPage(newPageSize);
    },
    [],
  );

  const handleOpenUpsert = useCallback((target?: ScoreEvaluationStatus) => {
    setUpsertTarget(target ?? null);
    setUpsertOpen(true);
  }, []);

  const handleCloseUpsert = useCallback(() => {
    setUpsertOpen(false);
    setUpsertTarget(null);
  }, []);

  const handleOpenDelete = useCallback((target: ScoreEvaluationStatus) => {
    setDeleteTarget(target);
    setDeleteOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteOpen(false);
    setDeleteTarget(null);
  }, []);

  const isSearchOrFilterActive =
    debouncedSearch.trim().length > 0 ||
    isDefaultFilter !== undefined ||
    isStandardGradedFilter !== undefined;

  return {
    state: {
      searchInput,
      isDefaultFilter,
      isStandardGradedFilter,
      page,
      itemsPerPage,
      upsertOpen,
      upsertTarget,
      deleteOpen,
      deleteTarget,
      statuses,
      totalItems,
      isLoading,
      isError,
    },
    actions: {
      handleSearchChange,
      handleIsDefaultFilterChange,
      handleIsStandardGradedFilterChange,
      handlePageChange,
      handleOpenUpsert,
      handleCloseUpsert,
      handleOpenDelete,
      handleCloseDelete,
      refetch,
    },
    flags: {
      hasData: statuses.length > 0,
      isSearchOrFilterActive,
    },
  };
}
