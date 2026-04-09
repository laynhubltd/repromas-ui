import { useAccessControl } from "@/features/access-control";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGetCoursesQuery } from "../api/coursesApi";
import type { Course } from "../types/course";
import { useCourseBulkUpload } from "./useCourseBulkUpload";

const ITEMS_PER_PAGE = 10;
export const GROUP_BY_ITEMS_PER_PAGE = 100;

// ─── Pure helper functions (exported for property-based testing) ──────────────

export function computeScopeFlags(role: { scope: string; scopeReferenceId: string | null } | null | undefined) {
  const flag = role?.scope === "GLOBAL" || role?.scope === "FACULTY";
  return {
    showDepartmentColumn: flag,
    showDepartmentFilter: flag,
    showGroupByToggle: flag,
  };
}

export function computeActiveFilterCount(params: {
  showDepartmentFilter: boolean;
  departmentId: number | undefined;
}): number {
  const { showDepartmentFilter, departmentId } = params;
  return showDepartmentFilter && departmentId !== undefined ? 1 : 0;
}

export function buildGroupedCourses(courses: Course[]): Map<number, Course[]> {
  const map = new Map<number, Course[]>();
  for (const course of courses) {
    const existing = map.get(course.departmentId) ?? [];
    map.set(course.departmentId, [...existing, course]);
  }
  return map;
}

export function buildQueryParams(params: {
  page: number;
  itemsPerPage: number;
  sort: string;
  groupByDepartment: boolean;
  showDepartmentColumn: boolean;
  showDepartmentFilter: boolean;
  departmentId: number | undefined;
  showInactive: boolean;
  debouncedCode: string;
  debouncedTitle: string;
}) {
  const {
    page,
    itemsPerPage,
    sort,
    groupByDepartment,
    showDepartmentColumn,
    showDepartmentFilter,
    departmentId,
    showInactive,
    debouncedCode,
    debouncedTitle,
  } = params;

  return {
    page,
    itemsPerPage: groupByDepartment ? GROUP_BY_ITEMS_PER_PAGE : itemsPerPage,
    sort,
    ...(showDepartmentColumn ? { include: "department" } : {}),
    "boolean[isActive]": showInactive ? undefined : (true as const),
    ...(debouncedCode ? { "search[code]": debouncedCode } : {}),
    ...(debouncedTitle ? { "search[title]": debouncedTitle } : {}),
    ...(showDepartmentFilter && departmentId !== undefined
      ? { "exact[departmentId]": departmentId }
      : {}),
  };
}

export function useCourseTab() {
  const { activeRole } = useAccessControl();

  // ─── Scope flags ──────────────────────────────────────────────────────────
  const { showDepartmentColumn, showDepartmentFilter, showGroupByToggle } =
    computeScopeFlags(activeRole);

  // ─── Pagination & Sort ────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(ITEMS_PER_PAGE);
  const [sort, setSort] = useState("code:asc");

  // ─── Search ───────────────────────────────────────────────────────────────
  const [codeSearch, setCodeSearch] = useState("");
  const [debouncedCode, setDebouncedCode] = useState("");

  const [titleSearch, setTitleSearch] = useState("");
  const [debouncedTitle, setDebouncedTitle] = useState("");

  const codeDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Filters ──────────────────────────────────────────────────────────────
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
  const [showInactive, setShowInactive] = useState(false);

  // ─── Group by Department ──────────────────────────────────────────────────
  const [groupByDepartment, setGroupByDepartment] = useState(false);

  // ─── Modal State ──────────────────────────────────────────────────────────
  const [formTarget, setFormTarget] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);

  // ─── Cleanup timers on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (codeDebounceTimer.current) clearTimeout(codeDebounceTimer.current);
      if (titleDebounceTimer.current) clearTimeout(titleDebounceTimer.current);
    };
  }, []);

  // ─── Query Params ─────────────────────────────────────────────────────────
  const queryParams = buildQueryParams({
    page,
    itemsPerPage,
    sort,
    groupByDepartment,
    showDepartmentColumn,
    showDepartmentFilter,
    departmentId,
    showInactive,
    debouncedCode,
    debouncedTitle,
  });

  const { data, isLoading, isError, refetch } = useGetCoursesQuery(queryParams);

  const courses = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  // ─── Group by Department (client-side) ────────────────────────────────────
  const groupedCourses = useMemo<Map<number, Course[]>>(() => {
    if (!groupByDepartment) return new Map();
    return buildGroupedCourses(courses);
  }, [groupByDepartment, courses]);

  // ─── Flags ────────────────────────────────────────────────────────────────
  const hasData = courses.length > 0;
  const isSearchActive =
    codeSearch.trim().length > 0 ||
    titleSearch.trim().length > 0 ||
    departmentId !== undefined;

  const activeFilterCount = computeActiveFilterCount({
    showDepartmentFilter,
    departmentId,
  });

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleCodeSearchChange = useCallback((value: string) => {
    setCodeSearch(value);
    setPage(1);
    if (codeDebounceTimer.current) clearTimeout(codeDebounceTimer.current);
    codeDebounceTimer.current = setTimeout(() => setDebouncedCode(value), 300);
  }, []);

  const handleTitleSearchChange = useCallback((value: string) => {
    setTitleSearch(value);
    setPage(1);
    if (titleDebounceTimer.current) clearTimeout(titleDebounceTimer.current);
    titleDebounceTimer.current = setTimeout(() => setDebouncedTitle(value), 300);
  }, []);

  const handleDepartmentFilterChange = useCallback((value: number | undefined) => {
    setDepartmentId(value);
    setPage(1);
  }, []);

  const handleShowInactiveChange = useCallback((checked: boolean) => {
    setShowInactive(checked);
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

  const handleOpenEdit = useCallback((course: Course) => {
    setFormTarget(course);
    setFormModalOpen(true);
  }, []);

  const handleOpenDelete = useCallback((course: Course) => {
    setDeleteTarget(course);
    setDeleteModalOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormTarget(null);
    setFormModalOpen(false);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteTarget(null);
    setDeleteModalOpen(false);
  }, []);

  const clearSearch = useCallback(() => {
    setCodeSearch("");
    setDebouncedCode("");
    setTitleSearch("");
    setDebouncedTitle("");
    setDepartmentId(undefined);
    setPage(1);
  }, []);

  const handleToggleGroupByDepartment = useCallback(() => {
    setGroupByDepartment((prev) => {
      const next = !prev;
      if (next) setPage(1);
      return next;
    });
  }, []);

  const handleOpenBulkUpload = useCallback(() => {
    setBulkUploadModalOpen(true);
  }, []);

  const handleCloseBulkUpload = useCallback(() => {
    setBulkUploadModalOpen(false);
    refetch();
  }, [refetch]);

  const bulkUpload = useCourseBulkUpload({ onClose: handleCloseBulkUpload });

  return {
    state: {
      courses,
      totalItems,
      isLoading,
      isError,
      page,
      itemsPerPage,
      sort,
      codeSearch,
      titleSearch,
      departmentId,
      showInactive,
      formTarget,
      deleteTarget,
      formModalOpen,
      deleteModalOpen,
      bulkUploadModalOpen,
      groupByDepartment,
      groupedCourses,
    },
    actions: {
      handleCodeSearchChange,
      handleTitleSearchChange,
      handleDepartmentFilterChange,
      handleShowInactiveChange,
      handleSortChange,
      handlePageChange,
      handleOpenCreate,
      handleOpenEdit,
      handleOpenDelete,
      handleCloseForm,
      handleCloseDelete,
      clearSearch,
      handleToggleGroupByDepartment,
      handleOpenBulkUpload,
      handleCloseBulkUpload,
      refetch,
    },
    flags: {
      hasData,
      isSearchActive,
      activeFilterCount,
      showDepartmentColumn,
      showDepartmentFilter,
      showGroupByToggle,
    },
    bulkUpload,
  };
}
