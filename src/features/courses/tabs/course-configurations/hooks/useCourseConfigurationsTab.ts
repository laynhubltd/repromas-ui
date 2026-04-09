import type { Level } from "@/features/settings/tabs/level-config/types/level";
import { useCallback, useMemo, useState } from "react";
import { useGetCourseConfigurationsQuery } from "../api/courseConfigurationsApi";
import type { CourseConfiguration, CurriculumGridRow } from "../types/course-configuration";

const DEFAULT_PAGE_SIZE = 20;

export function useCourseConfigurationsTab() {
  // ─── Program / Version Selectors ──────────────────────────────────────────
  const [selectedProgramId, setSelectedProgramId] = useState<number | undefined>(undefined);
  const [selectedVersionId, setSelectedVersionId] = useState<number | undefined>(undefined);

  // ─── Filters ──────────────────────────────────────────────────────────────
  const [filterLevelId, setFilterLevelId] = useState<number | undefined>(undefined);
  const [filterSemesterTypeId, setFilterSemesterTypeId] = useState<number | undefined>(undefined);

  // ─── Pagination ───────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);

  // ─── Modal State ──────────────────────────────────────────────────────────
  const [formTarget, setFormTarget] = useState<CourseConfiguration | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CourseConfiguration | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [prefillLevelId, setPrefillLevelId] = useState<number | undefined>(undefined);
  const [prefillSemesterTypeId, setPrefillSemesterTypeId] = useState<number | undefined>(undefined);

  // ─── Flags ────────────────────────────────────────────────────────────────
  const isProgramSelected = selectedProgramId !== undefined;
  const isVersionSelected = selectedVersionId !== undefined;
  const bothSelected = isProgramSelected && isVersionSelected;
  const activeFilterCount =
    (filterLevelId !== undefined ? 1 : 0) + (filterSemesterTypeId !== undefined ? 1 : 0);

  // ─── Query ────────────────────────────────────────────────────────────────
  const queryParams = bothSelected
    ? {
        "exact[program]": selectedProgramId,
        "exact[version]": selectedVersionId,
        ...(filterLevelId !== undefined && { "exact[level]": filterLevelId }),
        ...(filterSemesterTypeId !== undefined && { "exact[semesterType]": filterSemesterTypeId }),
        include: "course,level,semesterType",
        sort: "id:asc",
        page,
        itemsPerPage,
      }
    : undefined;

  const { data, isLoading, isError, refetch } = useGetCourseConfigurationsQuery(
    queryParams!,
    { skip: !bothSelected },
  );

  const configs = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  // ─── Grid Grouping ────────────────────────────────────────────────────────
  const gridRows = useMemo<CurriculumGridRow[]>(() => {
    if (!configs.length) return [];

    const levelMap = new Map<number, Level>();
    const rowMap = new Map<number, Map<number, CourseConfiguration[]>>();

    for (const config of configs) {
      if (!config.level) continue;

      const { levelId, semesterTypeId } = config;

      if (!levelMap.has(levelId)) {
        levelMap.set(levelId, config.level);
      }

      if (!rowMap.has(levelId)) {
        rowMap.set(levelId, new Map());
      }

      const cellMap = rowMap.get(levelId)!;
      const existing = cellMap.get(semesterTypeId) ?? [];
      cellMap.set(semesterTypeId, [...existing, config]);
    }

    return Array.from(rowMap.entries()).map(([levelId, cells]) => ({
      level: levelMap.get(levelId)!,
      cells,
    }));
  }, [configs]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleProgramChange = useCallback((value: number | undefined) => {
    setSelectedProgramId(value);
    setSelectedVersionId(undefined);
    setFilterLevelId(undefined);
    setFilterSemesterTypeId(undefined);
    setPage(1);
  }, []);

  const handleVersionChange = useCallback((value: number | undefined) => {
    setSelectedVersionId(value);
    setFilterLevelId(undefined);
    setFilterSemesterTypeId(undefined);
    setPage(1);
  }, []);

  const handleLevelFilterChange = useCallback((value: number | undefined) => {
    setFilterLevelId(value);
    setPage(1);
  }, []);

  const handleSemesterTypeFilterChange = useCallback((value: number | undefined) => {
    setFilterSemesterTypeId(value);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilterLevelId(undefined);
    setFilterSemesterTypeId(undefined);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    setItemsPerPage(newPageSize);
  }, []);

  const handleOpenCreate = useCallback(
    (levelId?: number, semesterTypeId?: number) => {
      setFormTarget(null);
      setPrefillLevelId(levelId);
      setPrefillSemesterTypeId(semesterTypeId);
      setFormModalOpen(true);
    },
    [],
  );

  const handleOpenEdit = useCallback((config: CourseConfiguration) => {
    setFormTarget(config);
    setPrefillLevelId(undefined);
    setPrefillSemesterTypeId(undefined);
    setFormModalOpen(true);
  }, []);

  const handleOpenDelete = useCallback((config: CourseConfiguration) => {
    setDeleteTarget(config);
    setDeleteModalOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormTarget(null);
    setPrefillLevelId(undefined);
    setPrefillSemesterTypeId(undefined);
    setFormModalOpen(false);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteTarget(null);
    setDeleteModalOpen(false);
  }, []);

  return {
    state: {
      configs,
      totalItems,
      isLoading,
      isError,
      selectedProgramId,
      selectedVersionId,
      filterLevelId,
      filterSemesterTypeId,
      page,
      itemsPerPage,
      gridRows,
      formTarget,
      deleteTarget,
      formModalOpen,
      deleteModalOpen,
      prefillLevelId,
      prefillSemesterTypeId,
    },
    actions: {
      handleProgramChange,
      handleVersionChange,
      handleLevelFilterChange,
      handleSemesterTypeFilterChange,
      handleClearFilters,
      handlePageChange,
      handleOpenCreate,
      handleOpenEdit,
      handleOpenDelete,
      handleCloseForm,
      handleCloseDelete,
      refetch,
    },
    flags: {
      hasData: configs.length > 0,
      isProgramSelected,
      isVersionSelected,
      activeFilterCount,
    },
  };
}
