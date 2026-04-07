import { useAccessControl } from "@/features/access-control";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGetProgramsQuery } from "../api/programsApi";
import type { Program } from "../types/program";

const ITEMS_PER_PAGE = 10;
const GROUP_BY_ITEMS_PER_PAGE = 100;

export function useProgramsTab() {
  const { activeRole } = useAccessControl();

  // ─── Pagination & Sort ────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [sort, setSort] = useState("name:asc");

  // ─── Search ───────────────────────────────────────────────────────────────
  const [nameSearch, setNameSearch] = useState("");
  const [debouncedName, setDebouncedName] = useState("");
  const [degreeTitleSearch, setDegreeTitleSearch] = useState("");
  const [debouncedDegreeTitle, setDebouncedDegreeTitle] = useState("");

  const nameDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const degreeTitleDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Filters ──────────────────────────────────────────────────────────────
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>(undefined);

  // ─── Group by Department ──────────────────────────────────────────────────
  const [groupByDepartment, setGroupByDepartment] = useState(false);

  // ─── Modal State ──────────────────────────────────────────────────────────
  const [formTarget, setFormTarget] = useState<Program | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);

  // ─── Cleanup timers on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (nameDebounceTimer.current) clearTimeout(nameDebounceTimer.current);
      if (degreeTitleDebounceTimer.current) clearTimeout(degreeTitleDebounceTimer.current);
    };
  }, []);

  // ─── Flags (computed early — used in queryParams) ─────────────────────────
  const showDepartmentFilter =
    activeRole?.scope === "GLOBAL" || activeRole?.scope === "FACULTY";
  const showGroupByToggle = showDepartmentFilter;

  // ─── Query Params ─────────────────────────────────────────────────────────
  const effectiveItemsPerPage = groupByDepartment ? GROUP_BY_ITEMS_PER_PAGE : itemsPerPage;

  const queryParams = {
    page,
    itemsPerPage: effectiveItemsPerPage,
    sort,
    ...(debouncedName ? { "search[name]": debouncedName } : {}),
    ...(debouncedDegreeTitle ? { "search[degreeTitle]": debouncedDegreeTitle } : {}),
    ...(departmentFilter !== undefined ? { "exact[department]": departmentFilter } : {}),
    ...(showDepartmentFilter ? { include: "department" } : {}),
  };

  const { data, isLoading, isError, refetch } = useGetProgramsQuery(queryParams);

  const programs = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  // ─── Group by Department (client-side) ────────────────────────────────────
  const groupedPrograms = useMemo<Map<number, Program[]>>(() => {
    if (!groupByDepartment) return new Map();
    const map = new Map<number, Program[]>();
    for (const program of programs) {
      const existing = map.get(program.departmentId) ?? [];
      map.set(program.departmentId, [...existing, program]);
    }
    return map;
  }, [groupByDepartment, programs]);

  // ─── Flags ────────────────────────────────────────────────────────────────
  const hasData = programs.length > 0;
  const isNameSearchActive = nameSearch.trim().length > 0;
  const isDegreeTitleSearchActive = degreeTitleSearch.trim().length > 0;

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleNameSearchChange = useCallback((value: string) => {
    setNameSearch(value);
    setPage(1);
    if (nameDebounceTimer.current) clearTimeout(nameDebounceTimer.current);
    nameDebounceTimer.current = setTimeout(() => setDebouncedName(value), 300);
  }, []);

  const handleDegreeTitleSearchChange = useCallback((value: string) => {
    setDegreeTitleSearch(value);
    setPage(1);
    if (degreeTitleDebounceTimer.current) clearTimeout(degreeTitleDebounceTimer.current);
    degreeTitleDebounceTimer.current = setTimeout(() => setDebouncedDegreeTitle(value), 300);
  }, []);

  const handleDepartmentFilterChange = useCallback((departmentId: number | undefined) => {
    setDepartmentFilter(departmentId);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort);
  }, []);

  const handlePageChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    setItemsPerPage(newPageSize);
  }, []);

  const handleOpenCreate = useCallback((defaults?: Partial<Program>) => {
    setFormTarget(defaults ? ({ ...defaults } as Program) : null);
    setFormModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((program: Program) => {
    setFormTarget(program);
    setFormModalOpen(true);
  }, []);

  const handleOpenDelete = useCallback((program: Program) => {
    setDeleteTarget(program);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormTarget(null);
    setFormModalOpen(false);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleToggleGroupByDepartment = useCallback(() => {
    setGroupByDepartment((prev) => {
      const next = !prev;
      if (next) setPage(1);
      return next;
    });
  }, []);

  return {
    state: {
      programs,
      totalItems,
      isLoading,
      isError,
      page,
      itemsPerPage,
      nameSearch,
      degreeTitleSearch,
      departmentFilter,
      sort,
      formTarget,
      deleteTarget,
      formModalOpen,
      groupByDepartment,
      groupedPrograms,
    },
    actions: {
      handleNameSearchChange,
      handleDegreeTitleSearchChange,
      handleDepartmentFilterChange,
      handleSortChange,
      handlePageChange,
      handleOpenCreate,
      handleOpenEdit,
      handleOpenDelete,
      handleCloseForm,
      handleCloseDelete,
      handleToggleGroupByDepartment,
      refetch,
    },
    flags: {
      hasData,
      isNameSearchActive,
      isDegreeTitleSearchActive,
      showDepartmentFilter,
      showGroupByToggle,
    },
  };
}
