import { useCallback, useState } from "react";
import { useGetGraduationRequirementsQuery } from "../api/graduationRequirementsApi";
import type { ProgramGraduationRequirement } from "../types/graduation-requirement";

const ITEMS_PER_PAGE = 10;

export function useGraduationConfigTab() {
  // ─── Pagination & Sort ────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [sort, setSort] = useState("createdAt:desc");

  // ─── Filters ──────────────────────────────────────────────────────────────
  const [programFilter, setProgramFilter] = useState<number | undefined>(undefined);
  const [curriculumVersionFilter, setCurriculumVersionFilter] = useState<number | undefined>(undefined);

  // ─── Modal State ──────────────────────────────────────────────────────────
  const [formTarget, setFormTarget] = useState<ProgramGraduationRequirement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProgramGraduationRequirement | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);

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

  const { data, isLoading, isError, refetch } = useGetGraduationRequirementsQuery(queryParams);

  const requirements = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  // ─── Flags ────────────────────────────────────────────────────────────────
  const hasData = requirements.length > 0;
  const isFilterActive = programFilter !== undefined || curriculumVersionFilter !== undefined;

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleProgramFilterChange = useCallback((programId: number | undefined) => {
    setProgramFilter(programId);
    setPage(1);
  }, []);

  const handleCurriculumVersionFilterChange = useCallback(
    (curriculumVersionId: number | undefined) => {
      setCurriculumVersionFilter(curriculumVersionId);
      setPage(1);
    },
    [],
  );

  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort);
  }, []);

  const handlePageChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    setItemsPerPage(newPageSize);
  }, []);

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
