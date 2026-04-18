import { useCallback, useEffect, useRef, useState } from "react";
import { useGetStudentsQuery } from "../api/studentsApi";
import type { EntryMode, Student, StudentStatus } from "../types/student";
import { useStudentBulkUpload } from "./useStudentBulkUpload";

const ITEMS_PER_PAGE = 10;

export function useStudentsTab() {
  // ─── Pagination & Sort ────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(ITEMS_PER_PAGE);
  const [sort, setSort] = useState("lastName:asc");

  // ─── Search ───────────────────────────────────────────────────────────────
  const [firstNameSearch, setFirstNameSearch] = useState("");
  const [debouncedFirstName, setDebouncedFirstName] = useState("");

  const [lastNameSearch, setLastNameSearch] = useState("");
  const [debouncedLastName, setDebouncedLastName] = useState("");

  const [matricSearch, setMatricSearch] = useState("");
  const [debouncedMatric, setDebouncedMatric] = useState("");

  const firstNameDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastNameDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const matricDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Filters ──────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<StudentStatus | undefined>(undefined);
  const [entryModeFilter, setEntryModeFilter] = useState<EntryMode | undefined>(undefined);
  const [programFilter, setProgramFilter] = useState<number | undefined>(undefined);

  // ─── Modal / Drawer State ─────────────────────────────────────────────────
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [drawerStudentId, setDrawerStudentId] = useState<number | null>(null);

  // ─── Cleanup timers on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (firstNameDebounceTimer.current) clearTimeout(firstNameDebounceTimer.current);
      if (lastNameDebounceTimer.current) clearTimeout(lastNameDebounceTimer.current);
      if (matricDebounceTimer.current) clearTimeout(matricDebounceTimer.current);
    };
  }, []);

  // ─── Query Params ─────────────────────────────────────────────────────────
  const queryParams = {
    page,
    itemsPerPage,
    sort,
    include: "currentLevel" as const,
    ...(debouncedFirstName ? { "search[firstName]": debouncedFirstName } : {}),
    ...(debouncedLastName ? { "search[lastName]": debouncedLastName } : {}),
    ...(debouncedMatric ? { "search[matricNumber]": debouncedMatric } : {}),
    ...(statusFilter !== undefined ? { "exact[status]": statusFilter } : {}),
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
    if (firstNameDebounceTimer.current) clearTimeout(firstNameDebounceTimer.current);
    firstNameDebounceTimer.current = setTimeout(() => setDebouncedFirstName(value), 300);
  }, []);

  const handleLastNameSearchChange = useCallback((value: string) => {
    setLastNameSearch(value);
    setPage(1);
    if (lastNameDebounceTimer.current) clearTimeout(lastNameDebounceTimer.current);
    lastNameDebounceTimer.current = setTimeout(() => setDebouncedLastName(value), 300);
  }, []);

  const handleMatricSearchChange = useCallback((value: string) => {
    setMatricSearch(value);
    setPage(1);
    if (matricDebounceTimer.current) clearTimeout(matricDebounceTimer.current);
    matricDebounceTimer.current = setTimeout(() => setDebouncedMatric(value), 300);
  }, []);

  const handleStatusFilterChange = useCallback((value: StudentStatus | undefined) => {
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

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
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
