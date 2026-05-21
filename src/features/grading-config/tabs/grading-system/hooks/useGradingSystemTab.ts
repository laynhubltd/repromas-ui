import { useCallback, useEffect, useRef, useState } from "react";
import { useListGradingSystemsQuery } from "../api/gradingSystemApi";
import type {
    GradingSystem,
    GradingSystemScope,
} from "../types/grading-system";

const ITEMS_PER_PAGE = 10;

export function useGradingSystemTab(): {
  state: {
    searchInput: string;
    scopeFilter: GradingSystemScope | undefined;
    page: number;
    itemsPerPage: number;
    upsertOpen: boolean;
    upsertTarget: GradingSystem | null;
    deleteOpen: boolean;
    deleteTarget: GradingSystem | null;
    systems: GradingSystem[];
    totalItems: number;
    isLoading: boolean;
    isError: boolean;
  };
  actions: {
    handleSearchChange: (value: string) => void;
    handleScopeFilterChange: (scope: GradingSystemScope | undefined) => void;
    handlePageChange: (page: number, pageSize: number) => void;
    handleOpenUpsert: (target?: GradingSystem) => void;
    handleCloseUpsert: () => void;
    handleOpenDelete: (target: GradingSystem) => void;
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

  // Scope filter
  const [scopeFilter, setScopeFilter] = useState<
    GradingSystemScope | undefined
  >(undefined);

  // Pagination
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

  // Upsert modal state
  const [upsertOpen, setUpsertOpen] = useState(false);
  const [upsertTarget, setUpsertTarget] = useState<GradingSystem | null>(null);

  // Delete modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GradingSystem | null>(null);

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
    sort: "name:asc",
    include: "referenceEntity",
    ...(debouncedSearch ? { "search[name]": debouncedSearch } : {}),
    ...(scopeFilter ? { "exact[scope]": scopeFilter } : {}),
  };

  const { data, isLoading, isError, refetch } =
    useListGradingSystemsQuery(queryParams);

  const systems = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  const handleScopeFilterChange = useCallback(
    (scope: GradingSystemScope | undefined) => {
      setScopeFilter(scope);
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

  const handleOpenUpsert = useCallback((target?: GradingSystem) => {
    setUpsertTarget(target ?? null);
    setUpsertOpen(true);
  }, []);

  const handleCloseUpsert = useCallback(() => {
    setUpsertOpen(false);
    setUpsertTarget(null);
  }, []);

  const handleOpenDelete = useCallback((target: GradingSystem) => {
    setDeleteTarget(target);
    setDeleteOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteOpen(false);
    setDeleteTarget(null);
  }, []);

  const isSearchOrFilterActive =
    debouncedSearch.trim().length > 0 || scopeFilter !== undefined;

  return {
    state: {
      searchInput,
      scopeFilter,
      page,
      itemsPerPage,
      upsertOpen,
      upsertTarget,
      deleteOpen,
      deleteTarget,
      systems,
      totalItems,
      isLoading,
      isError,
    },
    actions: {
      handleSearchChange,
      handleScopeFilterChange,
      handlePageChange,
      handleOpenUpsert,
      handleCloseUpsert,
      handleOpenDelete,
      handleCloseDelete,
      refetch,
    },
    flags: {
      hasData: systems.length > 0,
      isSearchOrFilterActive,
    },
  };
}
