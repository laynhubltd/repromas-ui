import { useServerTableState } from "@/shared/hooks/useServerTableState";
import { useCallback, useEffect, useState } from "react";
import { useGetGraduationRequirementsQuery } from "../api/graduationRequirementsApi";
import type { ProgramGraduationRequirement } from "../types/graduation-requirement";

export function useGraduationConfigTab() {
  // ─── Filters ──────────────────────────────────────────────────────────────
  const [programFilter, setProgramFilter] = useState<number | undefined>(undefined);
  const [curriculumVersionFilter, setCurriculumVersionFilter] = useState<number | undefined>(undefined);

  // ─── Modal State ──────────────────────────────────────────────────────────
  const [formTarget, setFormTarget] = useState<ProgramGraduationRequirement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProgramGraduationRequirement | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);

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
    include: "curriculumVersion",
    ...(programFilter !== undefined ? { "exact[program]": programFilter } : {}),
    ...(curriculumVersionFilter !== undefined
      ? { "exact[curriculumVersion]": curriculumVersionFilter }
      : {}),
  };

  const { data, isLoading, isFetching, isError, refetch } = useGetGraduationRequirementsQuery(queryParams);

  const requirements = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  useEffect(() => {
    if (data?.totalItems !== undefined) {
      setRawTotalItems(data.totalItems);
    }
  }, [data?.totalItems]);

  // ─── Flags ────────────────────────────────────────────────────────────────
  const hasData = requirements.length > 0;
  const isFilterActive = programFilter !== undefined || curriculumVersionFilter !== undefined;

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleProgramFilterChange = useCallback((programId: number | undefined) => {
    setProgramFilter(programId);
    resetPage();
  }, [resetPage]);

  const handleCurriculumVersionFilterChange = useCallback(
    (curriculumVersionId: number | undefined) => {
      setCurriculumVersionFilter(curriculumVersionId);
      resetPage();
    },
    [resetPage],
  );

  const handleOpenCreate = useCallback(() => {
    setFormTarget(null);
    setFormModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((requirement: ProgramGraduationRequirement) => {
    setFormTarget(requirement);
    setFormModalOpen(true);
  }, []);

  const handleOpenDelete = useCallback((requirement: ProgramGraduationRequirement) => {
    setDeleteTarget(requirement);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormTarget(null);
    setFormModalOpen(false);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  return {
    state: {
      requirements,
      totalItems,
      isLoading,
      isFetching,
      isError,
      page,
      itemsPerPage,
      programFilter,
      curriculumVersionFilter,
      sort,
      formTarget,
      deleteTarget,
      formModalOpen,
    },
    actions: {
      handleProgramFilterChange,
      handleCurriculumVersionFilterChange,
      handleSortChange,
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
      hasData,
      isFilterActive,
    },
  };
}
