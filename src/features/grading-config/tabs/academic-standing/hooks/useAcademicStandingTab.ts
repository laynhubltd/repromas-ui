import { useMemo, useRef, useState } from "react";
import { useGetAcademicStandingsQuery } from "../api/academicStandingApi";
import type { AcademicStanding, AcademicStandingScope } from "../types/academic-standing";

export function useAcademicStandingTab() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [scopeFilter, setScopeFilter] = useState<AcademicStandingScope | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [upsertTarget, setUpsertTarget] = useState<AcademicStanding | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AcademicStanding | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value.trim());
      setPage(1);
    }, 300);
  };

  const handleScopeFilterChange = (scope?: AcademicStandingScope) => {
    setScopeFilter(scope);
    setPage(1);
  };

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    setPage(newPage);
    if (newPageSize && newPageSize !== itemsPerPage) {
      setItemsPerPage(newPageSize);
    }
  };

  const handleOpenUpsert = (target: AcademicStanding | null = null) => {
    setUpsertTarget(target);
    setUpsertOpen(true);
  };

  const handleCloseUpsert = () => {
    setUpsertOpen(false);
    setUpsertTarget(null);
  };

  const handleOpenDelete = (target: AcademicStanding) => {
    setDeleteTarget(target);
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const queryParams = {
    page,
    itemsPerPage,
    include: "boundaries,level,curriculumVersion",
    ...(debouncedSearch ? { "search[name]": debouncedSearch } : {}),
    ...(scopeFilter ? { "exact[scope]": scopeFilter } : {}),
  };

  const { data, isLoading, isError, refetch } = useGetAcademicStandingsQuery(queryParams);

  const standings = useMemo(() => data?.member ?? [], [data?.member]);
  const totalItems = data?.totalItems ?? 0;

  const globalCount = useMemo(
    () => standings.filter((s) => s.scope === "GLOBAL").length,
    [standings],
  );
  const scopedCount = useMemo(
    () => standings.filter((s) => s.scope !== "GLOBAL").length,
    [standings],
  );

  const hasData = standings.length > 0;
  const isSearchOrFilterActive = searchInput.trim().length > 0 || scopeFilter !== undefined;

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
      standings,
      totalItems,
      globalCount,
      scopedCount,
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
      hasData,
      isSearchOrFilterActive,
    },
  };
}
