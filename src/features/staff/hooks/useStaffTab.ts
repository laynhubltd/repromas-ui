import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useServerTableState } from "@/shared/hooks/useServerTableState";
import { useCallback, useEffect, useState } from "react";
import { useGetStaffListQuery } from "../api/staffApi";
import type { Staff } from "../types/staff";

export function useStaffTab() {
  // ─── Search ───────────────────────────────────────────────────────────────
  const [fileNumberSearch, setFileNumberSearch] = useState("");
  const debouncedFileNumber = useDebouncedValue(fileNumberSearch, 500);

  // ─── Filters ──────────────────────────────────────────────────────────────
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>(undefined);

  // ─── Modal / Drawer State ─────────────────────────────────────────────────
  const [formTarget, setFormTarget] = useState<Staff | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [drawerStaffId, setDrawerStaffId] = useState<number | null>(null);

  // ─── Pagination & Sort (Server Table State) ──────────────────────────────
  const [rawTotalItems, setRawTotalItems] = useState(0);

  const {
    page,
    pageSize: itemsPerPage,
    sort,
    handlePageChange,
    handleSortChange,
    resetPage,
    getPaginationConfig,
  } = useServerTableState({
    defaultPageSize: 10,
    defaultSort: "createdAt:desc",
    totalItems: rawTotalItems,
  });

  // ─── Query Params ─────────────────────────────────────────────────────────
  const queryParams = {
    page,
    itemsPerPage,
    sort,
    include: "profile,department" as const,
    ...(debouncedFileNumber ? { "search[fileNumber]": debouncedFileNumber } : {}),
    ...(departmentFilter !== undefined ? { "exact[department]": departmentFilter } : {}),
  };

  const { data, isLoading, isFetching, isError, refetch } = useGetStaffListQuery(queryParams);

  const staff = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  useEffect(() => {
    if (data?.totalItems !== undefined) {
      setRawTotalItems(data.totalItems);
    }
  }, [data?.totalItems]);

  // ─── Flags ────────────────────────────────────────────────────────────────
  const hasData = staff.length > 0;
  const isSearchActive = fileNumberSearch.trim().length > 0;
  const isFilterActive = departmentFilter !== undefined;

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleFileNumberSearchChange = useCallback((value: string) => {
    setFileNumberSearch(value);
    resetPage();
  }, [resetPage]);

  const handleDepartmentFilterChange = useCallback((value: number | undefined) => {
    setDepartmentFilter(value);
    resetPage();
  }, [resetPage]);

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
    resetPage();
  }, [resetPage]);

  return {
    state: {
      staff,
      totalItems,
      isLoading,
      isFetching,
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
      getPaginationConfig,
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
