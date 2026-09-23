import { useGetTransitionStatusesQuery } from "@/features/settings/tabs/student-transition-status/api/studentTransitionStatusApi";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGetStudentsQuery } from "../api/studentsApi";
import type { EntryMode, Student } from "../types/student";
import { useStudentBulkUpload } from "./useStudentBulkUpload";

const ITEMS_PER_PAGE = 10;

export function useStudentsTab() {
  // ─── Reference Data (Transition Statuses) ──────────────────────────────────
  const {
    data: transitionStatusesData,
    isLoading: isTransitionStatusesLoading,
  } = useGetTransitionStatusesQuery({ itemsPerPage: 100, sort: "name:asc" });
  const transitionStatuses = transitionStatusesData?.member ?? [];
  const defaultStatusInitialized = useRef(false);

  // ─── Pagination & Sort ────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [sort, setSort] = useState("matricNumber:desc");

  // ─── Search ───────────────────────────────────────────────────────────────
  const [firstNameSearch, setFirstNameSearch] = useState("");
  const debouncedFirstName = useDebouncedValue(firstNameSearch, 500);

  const [lastNameSearch, setLastNameSearch] = useState("");
  const debouncedLastName = useDebouncedValue(lastNameSearch, 500);

  const [matricSearch, setMatricSearch] = useState("");
  const debouncedMatric = useDebouncedValue(matricSearch, 500);

  // ─── Filters ──────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [entryModeFilter, setEntryModeFilter] = useState<EntryMode | undefined>(undefined);
  const [programFilter, setProgramFilter] = useState<number | undefined>(undefined);

  // ─── Auto-initialize default transition status on initial load ─────────────
  useEffect(() => {
    if (!defaultStatusInitialized.current && transitionStatuses.length > 0) {
      const defaultStatus = transitionStatuses.find((s) => s.isDefault);
      if (defaultStatus) {
        setStatusFilter(defaultStatus.id);
      }
      defaultStatusInitialized.current = true;
    }
  }, [transitionStatuses]);

  // ─── Modal / Drawer State ─────────────────────────────────────────────────
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [drawerStudentId, setDrawerStudentId] = useState<number | null>(null);

  // ─── Query Params ─────────────────────────────────────────────────────────
  const queryParams = {
    page,
    itemsPerPage,
    sort,
    include: "currentLevel,entrySession" as const,
    ...(debouncedFirstName ? { "search[firstName]": debouncedFirstName } : {}),
    ...(debouncedLastName ? { "search[lastName]": debouncedLastName } : {}),
    ...(debouncedMatric ? { "search[matricNumber]": debouncedMatric } : {}),
    ...(statusFilter !== undefined
      ? { "exact[currentTransition.status_id]": statusFilter }
      : {}),
    ...(entryModeFilter !== undefined ? { "exact[entryMode]": entryModeFilter } : {}),
    ...(programFilter !== undefined ? { "exact[programId]": programFilter } : {}),
  };

  const { data, isLoading, isError, refetch } = useGetStudentsQuery(queryParams);

  const students = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  // ─── Flags ────────────────────────────────────────────────────────────────
  const hasData = students.length > 0;
  const isSearchActive =
    firstNameSearch.trim().length > 0 ||
    lastNameSearch.trim().length > 0 ||
    matricSearch.trim().length > 0;
  const isFilterActive =
    statusFilter !== undefined ||
    entryModeFilter !== undefined ||
    programFilter !== undefined;

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleFirstNameSearchChange = useCallback((value: string) => {
    setFirstNameSearch(value);
    setPage(1);
  }, []);

  const handleLastNameSearchChange = useCallback((value: string) => {
    setLastNameSearch(value);
    setPage(1);
  }, []);

  const handleMatricSearchChange = useCallback((value: string) => {
    setMatricSearch(value);
    setPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((value: number | undefined) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const handleEntryModeFilterChange = useCallback((value: EntryMode | undefined) => {
    setEntryModeFilter(value);
    setPage(1);
  }, []);

  const handleProgramFilterChange = useCallback((value: number | undefined) => {
    setProgramFilter(value);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort);
  }, []);

  const handlePageChange = useCallback((newPage: number, newPageSize?: number) => {
    setPage(newPage);
    if (newPageSize) {
      setItemsPerPage(newPageSize);
    }
  }, []);

  const handleOpenBulkUpload = useCallback(() => {
    setBulkUploadModalOpen(true);
  }, []);

  const handleCloseBulkUpload = useCallback(() => {
    setBulkUploadModalOpen(false);
    refetch();
  }, [refetch]);

  const bulkUpload = useStudentBulkUpload({ onClose: handleCloseBulkUpload });

  const handleOpenCreate = useCallback(() => {
    setFormTarget(null);
    setFormModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((student: Student) => {
    setFormTarget(student);
    setFormModalOpen(true);
  }, []);

  const handleOpenDelete = useCallback((student: Student) => {
    setDeleteTarget(student);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormTarget(null);
    setFormModalOpen(false);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleOpenDrawer = useCallback((studentId: number) => {
    setDrawerStudentId(studentId);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerStudentId(null);
  }, []);

  return {
    state: {
      students,
      totalItems,
      isLoading,
      isError,
      page,
      itemsPerPage,
      firstNameSearch,
      lastNameSearch,
      matricSearch,
      statusFilter,
      entryModeFilter,
      programFilter,
      transitionStatuses,
      isTransitionStatusesLoading,
      sort,
      formTarget,
      deleteTarget,
      formModalOpen,
      drawerStudentId,
      bulkUploadModalOpen,
    },
    actions: {
      handleFirstNameSearchChange,
      handleLastNameSearchChange,
      handleMatricSearchChange,
      handleStatusFilterChange,
      handleEntryModeFilterChange,
      handleProgramFilterChange,
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
      handleOpenBulkUpload,
      handleCloseBulkUpload,
    },
    flags: {
      hasData,
      isSearchActive,
      isFilterActive,
    },
    bulkUpload,
  };
}
