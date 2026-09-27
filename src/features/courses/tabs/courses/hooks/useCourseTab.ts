import { useAccessControl } from "@/features/access-control";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useServerTableState } from "@/shared/hooks/useServerTableState";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetCoursesQuery } from "../api/coursesApi";
import type { Course } from "../types/course";
import { useCourseBulkUpload } from "./useCourseBulkUpload";

export const GROUP_BY_ITEMS_PER_PAGE = 100;

// ─── Pure helper functions (exported for property-based testing) ──────────────

export function computeScopeFlags(
  role: { scope: string; scopeReferenceId?: string | number | null } | null | undefined,
) {
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
  sort?: string;
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
    sort = "code:asc",
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

  // ─── Search ───────────────────────────────────────────────────────────────
  const [codeSearch, setCodeSearch] = useState("");
  const debouncedCode = useDebouncedValue(codeSearch, 500);

  const [titleSearch, setTitleSearch] = useState("");
  const debouncedTitle = useDebouncedValue(titleSearch, 500);

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
    defaultSort: "code:asc",
    totalItems: rawTotalItems,
  });

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

  const { data, isLoading, isFetching, isError, error: queryError, refetch } = useGetCoursesQuery(queryParams);

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, queryError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, queryError],
  );

  const courses = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  useEffect(() => {
    if (data?.totalItems !== undefined) {
      setRawTotalItems(data.totalItems);
    }
  }, [data?.totalItems]);

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
    resetPage();
  }, [resetPage]);

  const handleTitleSearchChange = useCallback((value: string) => {
    setTitleSearch(value);
    resetPage();
  }, [resetPage]);

  const handleDepartmentFilterChange = useCallback((value: number | undefined) => {
    setDepartmentId(value);
    resetPage();
  }, [resetPage]);

  const handleShowInactiveChange = useCallback((checked: boolean) => {
    setShowInactive(checked);
    resetPage();
  }, [resetPage]);

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
    setTitleSearch("");
    setDepartmentId(undefined);
    resetPage();
  }, [resetPage]);

  const handleToggleGroupByDepartment = useCallback(() => {
    setGroupByDepartment((prev) => {
      const next = !prev;
      resetPage();
      return next;
    });
  }, [resetPage]);

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
      isFetching,
      isError,
      sectionError,
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
      getPaginationConfig,
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
