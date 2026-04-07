import { useCallback, useEffect, useRef, useState } from "react";
import { useGetStaffListQuery } from "../api/staffApi";
import type { Staff } from "../types/staff";

const ITEMS_PER_PAGE = 10;

export function useStaffTab() {
  // ─── Pagination & Sort ────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(ITEMS_PER_PAGE);
  const [sort, setSort] = useState("createdAt:desc");

  // ─── Search ───────────────────────────────────────────────────────────────
  const [fileNumberSearch, setFileNumberSearch] = useState("");
  const [debouncedFileNumber, setDebouncedFileNumber] = useState("");
  const fileNumberDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Filters ──────────────────────────────────────────────────────────────
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>(undefined);

  // ─── Modal / Drawer State ─────────────────────────────────────────────────
  const [formTarget, setFormTarget] = useState<Staff | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [drawerStaffId, setDrawerStaffId] = useState<number | null>(null);

  // ─── Cleanup timers on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (fileNumberDebounceTimer.current) clearTimeout(fileNumberDebounceTimer.current);
    };
  }, []);

  // ─── Query Params ─────────────────────────────────────────────────────────
  const queryParams = {
    page,
    itemsPerPage,
    sort,
    include: "profile,department" as const,
    ...(debouncedFileNumber ? { "search[fileNumber]": debouncedFileNumber } : {}),
    ...(departmentFilter !== undefined ? { "exact[department]": departmentFilter } : {}),
  };

  const { data, isLoading, isError, refetch } = useGetStaffListQuery(queryParams);

  const staff = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  // ─── Flags ────────────────────────────────────────────────────────────────
  const hasData = staff.length > 0;
  const isSearchActive = fileNumberSearch.trim().length > 0;
  const isFilterActive = departmentFilter !== undefined;

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleFileNumberSearchChange = useCallback((value: string) => {
    setFileNumberSearch(value);
    setPage(1);
    if (fileNumberDebounceTimer.current) clearTimeout(fileNumberDebounceTimer.current);
    fileNumberDebounceTimer.current = setTimeout(() => setDebouncedFileNumber(value), 300);
  }, []);

  const handleDepartmentFilterChange = useCallback((value: number | undefined) => {
    setDepartmentFilter(value);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setFormTarget(null);
    setFormModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((staffMember: Staff) => {
    setFormTarget(staffMember);
    setFormModalOpen(true);
  }, []);

  const handleOpenDelete = useCallback((staffMember: Staff) => {
    setDeleteTarget(staffMember);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormTarget(null);
    setFormModalOpen(false);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleOpenDrawer = useCallback((staffId: number) => {
    setDrawerStaffId(staffId);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerStaffId(null);
  }, []);

  const clearAllFilters = useCallback(() => {
    setDepartmentFilter(undefined);
    setPage(1);
  }, []);

  return {
    state: {
      staff,
      totalItems,
      isLoading,
      isError,
      page,
      itemsPerPage,
      fileNumberSearch,
      departmentFilter,
      sort,
      formTarget,
      deleteTarget,
      formModalOpen,
      drawerStaffId,
    },
    actions: {
      handleFileNumberSearchChange,
      handleDepartmentFilterChange,
      handleSortChange,
      handlePageChange,
      handleOpenCreate,
      handleOpenEdit,
      handleOpenDelete,
      handleCloseForm,
      handleCloseDelete,
      handleOpenDrawer,
      handleCloseDrawer,
      refetch,
      clearAllFilters,
    },
    flags: {
      hasData,
      isSearchActive,
      isFilterActive,
    },
  };
}
