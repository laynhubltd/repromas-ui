import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useGetTransitionStatusesQuery } from "@/features/settings/tabs/student-transition-status/api/studentTransitionStatusApi";
import { useGetNonTerminalStudentsQuery } from "@/features/student/api/studentsApi";
import { useCallback, useEffect, useRef, useState } from "react";

const ITEMS_PER_PAGE = 5;

/**
 * Hook that contains all business logic for the StudentSelectionPanel.
 *
 * Reuses existing student feature APIs (useGetStudentsQuery) and reference
 * data APIs (programs, levels) to provide search, filter, and selection
 * functionality for the admin/staff course registration workflow.
 *
 * Requirements: 2.3, 2.4, 2.5, 2.6, 15.5, 15.6
 */
export function useStudentSelectionPanel(
  selectedStudentId: number | null,
  onStudentSelect: (studentId: number) => void,
) {
  // ─── Reference Data (Transition Statuses) ──────────────────────────────────
  const {
    data: transitionStatusesData,
    isLoading: isTransitionStatusesLoading,
  } = useGetTransitionStatusesQuery({ itemsPerPage: 100, sort: "name:asc" });
  const transitionStatuses = transitionStatusesData?.member ?? [];
  const defaultStatusInitialized = useRef(false);

  // ─── Pagination ───────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);

  // ─── Search ───────────────────────────────────────────────────────────────
  const [matricSearch, setMatricSearch] = useState("");
  const [debouncedMatric, setDebouncedMatric] = useState("");
  const matricDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // ─── Filters ──────────────────────────────────────────────────────────────
  const [programFilter, setProgramFilter] = useState<number | undefined>(
    undefined,
  );
  const [levelFilter, setLevelFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(
    undefined,
  );

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

  // ─── Cleanup timers on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (matricDebounceTimer.current)
        clearTimeout(matricDebounceTimer.current);
    };
  }, []);

  // ─── Student Query ────────────────────────────────────────────────────────
  // Reuses the existing student feature API — Requirement 15.1, 15.2
  const queryParams = {
    page,
    itemsPerPage: ITEMS_PER_PAGE,
    sort: "matricNumber:desc",
    include: "currentLevel,program" as const,
    ...(debouncedMatric ? { "search[matricNumber]": debouncedMatric } : {}),
    ...(statusFilter !== undefined
      ? { "exact[currentTransition.status_id]": statusFilter }
      : {}),
    ...(programFilter !== undefined
      ? { "exact[programId]": programFilter }
      : {}),
    ...(levelFilter !== undefined
      ? { "exact[currentLevelId]": levelFilter }
      : {}),
  };

  const {
    data: studentsData,
    isLoading: isStudentsLoading,
    isError: isStudentsError,
    refetch,
  } = useGetNonTerminalStudentsQuery(queryParams);

  // ─── Reference Data ───────────────────────────────────────────────────────
  // Programs for the program filter dropdown
  const { data: programsData, isLoading: isProgramsLoading } =
    useGetProgramsQuery({
      itemsPerPage: 100,
      sort: "name:asc",
    });

  const students = studentsData?.member ?? [];
  const totalItems = studentsData?.totalItems ?? 0;
  const programs = programsData?.member ?? [];

  // ─── Derived Flags ────────────────────────────────────────────────────────
  const isSearchActive = debouncedMatric.trim().length > 0;
  const isFilterActive =
    programFilter !== undefined ||
    levelFilter !== undefined ||
    statusFilter !== undefined;
  const isAnyFilterActive = isSearchActive || isFilterActive;

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleMatricSearchChange = useCallback((value: string) => {
    setMatricSearch(value);
    setPage(1);
    if (matricDebounceTimer.current) clearTimeout(matricDebounceTimer.current);
    matricDebounceTimer.current = setTimeout(
      () => setDebouncedMatric(value),
      300,
    );
  }, []);

  const handleProgramFilterChange = useCallback((value: number | undefined) => {
    setProgramFilter(value);
    setPage(1);
  }, []);

  const handleLevelFilterChange = useCallback((value: number | undefined) => {
    setLevelFilter(value);
    setPage(1);
  }, []);

  const handleStatusFilterChange = useCallback(
    (value: number | undefined) => {
      setStatusFilter(value);
      setPage(1);
    },
    [],
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleStudentSelect = useCallback(
    (studentId: number) => {
      onStudentSelect(studentId);
    },
    [onStudentSelect],
  );

  const handleClearFilters = useCallback(() => {
    setMatricSearch("");
    setDebouncedMatric("");
    setProgramFilter(undefined);
    setLevelFilter(undefined);
    setStatusFilter(undefined);
    setPage(1);
  }, []);

  return {
    state: {
      students,
      totalItems,
      isLoading: isStudentsLoading,
      isError: isStudentsError,
      page,
      itemsPerPage: ITEMS_PER_PAGE,
      matricSearch,
      programFilter,
      levelFilter,
      statusFilter,
      programs,
      isProgramsLoading,
      transitionStatuses,
      isTransitionStatusesLoading,
      selectedStudentId,
    },
    actions: {
      handleMatricSearchChange,
      handleProgramFilterChange,
      handleLevelFilterChange,
      handleStatusFilterChange,
      handlePageChange,
      handleStudentSelect,
      handleClearFilters,
      refetch,
    },
    flags: {
      hasData: students.length > 0,
      isSearchActive,
      isFilterActive,
      isAnyFilterActive,
    },
  };
}
