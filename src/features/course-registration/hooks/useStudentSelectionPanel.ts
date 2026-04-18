import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useGetLevelsQuery } from "@/features/settings/tabs/level-config/api/levelApi";
import { useGetStudentsQuery } from "@/features/student/api/studentsApi";
import type { StudentStatus } from "@/features/student/types/student";
import { useCallback, useEffect, useRef, useState } from "react";

const ITEMS_PER_PAGE = 20;

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
  const [statusFilter, setStatusFilter] = useState<StudentStatus | undefined>(
    undefined,
  );

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
    sort: "lastName:asc",
    include: "currentLevel,program" as const,
    ...(debouncedMatric ? { "search[matricNumber]": debouncedMatric } : {}),
    ...(statusFilter !== undefined ? { "exact[status]": statusFilter } : {}),
    ...(programFilter !== undefined
      ? { "exact[programId]": programFilter }
      : {}),
  };

  const {
    data: studentsData,
    isLoading: isStudentsLoading,
    isError: isStudentsError,
    refetch,
  } = useGetStudentsQuery(queryParams);

  // ─── Reference Data ───────────────────────────────────────────────────────
  // Programs for the program filter dropdown
  const { data: programsData, isLoading: isProgramsLoading } =
    useGetProgramsQuery({
      itemsPerPage: 200,
      sort: "name:asc",
    });

  // Levels for the level filter dropdown
  const { data: levelsData, isLoading: isLevelsLoading } = useGetLevelsQuery({
    itemsPerPage: 100,
    sort: "rankOrder:asc",
  });

  const students = studentsData?.member ?? [];
  const totalItems = studentsData?.totalItems ?? 0;
  const programs = programsData?.member ?? [];
  const levels = levelsData?.member ?? [];

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

  /**
   * Level filter is applied client-side since the students API does not
   * support filtering by currentLevelId directly. We filter the returned
   * students by their currentLevel.id when a level filter is active.
   */
  const handleLevelFilterChange = useCallback((value: number | undefined) => {
    setLevelFilter(value);
    setPage(1);
  }, []);

  const handleStatusFilterChange = useCallback(
    (value: StudentStatus | undefined) => {
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

  // ─── Client-side level filtering ─────────────────────────────────────────
  // Apply level filter on the fetched students since the API doesn't support it
  const filteredStudents =
    levelFilter !== undefined
      ? students.filter((s) => s.currentLevel?.id === levelFilter)
      : students;

  return {
    state: {
      students: filteredStudents,
      totalItems:
        levelFilter !== undefined ? filteredStudents.length : totalItems,
      isLoading: isStudentsLoading,
      isError: isStudentsError,
      page,
      itemsPerPage: ITEMS_PER_PAGE,
      matricSearch,
      programFilter,
      levelFilter,
      statusFilter,
      programs,
      levels,
      isProgramsLoading,
      isLevelsLoading,
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
      hasData: filteredStudents.length > 0,
      isSearchActive,
      isFilterActive,
      isAnyFilterActive,
    },
  };
}
