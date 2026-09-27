import { useGetLevelsQuery } from "@/features/settings/tabs/level-config/api/levelApi";
import type { Level } from "@/features/settings/tabs/level-config/types/level";
import { useServerTableState } from "@/shared/hooks/useServerTableState";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useCallback, useEffect, useMemo, useState } from "react";
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

  // ─── Levels Query ─────────────────────────────────────────────────────────
  const { data: levelsData } = useGetLevelsQuery(
    { itemsPerPage: 100 },
    { skip: !bothSelected },
  );
  const levels = levelsData?.member ?? [];

  // ─── Pagination & Sort (Server Table State) ──────────────────────────────
  const [rawTotalItems, setRawTotalItems] = useState(0);

  const {
    page,
    pageSize: itemsPerPage,
    handlePageChange,
    resetPage,
    getPaginationConfig,
  } = useServerTableState({
    defaultPageSize: DEFAULT_PAGE_SIZE,
    totalItems: rawTotalItems,
  });

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

  const { data, isLoading, isFetching, isError, error: queryError, refetch } = useGetCourseConfigurationsQuery(
    queryParams!,
    { skip: !bothSelected },
  );

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, queryError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, queryError],
  );

  const configs = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  useEffect(() => {
    if (data?.totalItems !== undefined) {
      setRawTotalItems(data.totalItems);
    }
  }, [data?.totalItems]);

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
    resetPage();
  }, [resetPage]);

  const handleVersionChange = useCallback((value: number | undefined) => {
    setSelectedVersionId(value);
    setFilterLevelId(undefined);
    setFilterSemesterTypeId(undefined);
    resetPage();
  }, [resetPage]);

  const handleLevelFilterChange = useCallback((value: number | undefined) => {
    setFilterLevelId(value);
    resetPage();
  }, [resetPage]);

  const handleSemesterTypeFilterChange = useCallback((value: number | undefined) => {
    setFilterSemesterTypeId(value);
    resetPage();
  }, [resetPage]);

  const handleClearFilters = useCallback(() => {
    setFilterLevelId(undefined);
    setFilterSemesterTypeId(undefined);
    resetPage();
  }, [resetPage]);

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
      levels,
      isLoading,
      isFetching,
      isError,
      sectionError,
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
      getPaginationConfig,
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
