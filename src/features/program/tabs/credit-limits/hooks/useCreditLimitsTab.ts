import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import {
    useGetAcademicSessionsQuery,
    useGetSemesterTypesQuery,
} from "@/features/settings/tabs/academic-calendar/api/academicCalendarApi";
import { useGetLevelsQuery } from "@/features/settings/tabs/level-config/api/levelApi";
import type { Level } from "@/features/settings/tabs/level-config/types/level";
import { useGetTransitionStatusesQuery } from "@/features/settings/tabs/student-transition-status/api/studentTransitionStatusApi";
import type { StudentTransitionStatus } from "@/features/settings/tabs/student-transition-status/types/student-transition-status";
import { useMemo, useState } from "react";
import { useListRegistrationCreditLimitsQuery } from "../api/registrationCreditLimitApi";
import type {
    LevelOption,
    ProgramOption,
    RegistrationCreditLimit,
    RegistrationCreditLimitListParams,
    SemesterTypeOption,
    SessionOption,
    StatusOption,
} from "../types/credit-limits";

const ITEMS_PER_PAGE = 30;

type ActiveFilters = {
  programId?: number;
  levelId?: number;
  sessionId?: number;
  semesterTypeId?: number;
  statusId?: number;
};

export function useCreditLimitsTab() {
  // ── Pagination state ───────────────────────────────────────────────────────

  const [page, setPage] = useState(1);

  // ── Filter state ───────────────────────────────────────────────────────────

  const [filters, setFilters] = useState<ActiveFilters>({});

  // ── Modal state ────────────────────────────────────────────────────────────

  const [formTarget, setFormTarget] = useState<RegistrationCreditLimit | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    useState<RegistrationCreditLimit | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // ── Build query params ─────────────────────────────────────────────────────

  const queryParams = useMemo<RegistrationCreditLimitListParams>(() => {
    const params: RegistrationCreditLimitListParams = {
      page,
      itemsPerPage: ITEMS_PER_PAGE,
    };
    if (filters.programId !== undefined)
      params["exact[programId]"] = filters.programId;
    if (filters.levelId !== undefined)
      params["exact[levelId]"] = filters.levelId;
    if (filters.sessionId !== undefined)
      params["exact[sessionId]"] = filters.sessionId;
    if (filters.semesterTypeId !== undefined)
      params["exact[semesterTypeId]"] = filters.semesterTypeId;
    if (filters.statusId !== undefined)
      params["exact[statusId]"] = filters.statusId;
    return params;
  }, [page, filters]);

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data, isLoading, isError, refetch } =
    useListRegistrationCreditLimitsQuery(queryParams);

  const { data: programsData, isLoading: programsLoading } =
    useGetProgramsQuery({
      itemsPerPage: 200,
      sort: "name:asc",
    });

  const { data: levelsData, isLoading: levelsLoading } = useGetLevelsQuery({
    itemsPerPage: 100,
    sort: "rankOrder:asc",
  });

  const { data: sessionsData, isLoading: sessionsLoading } =
    useGetAcademicSessionsQuery({ itemsPerPage: 100, sort: "name:asc" });

  const { data: semesterTypesData, isLoading: semesterTypesLoading } =
    useGetSemesterTypesQuery({ itemsPerPage: 100, sort: "sortOrder:asc" });

  const { data: statusesData, isLoading: statusesLoading } =
    useGetTransitionStatusesQuery({
      itemsPerPage: 100,
      sort: "name:asc",
    });

  // ── Derived data ───────────────────────────────────────────────────────────

  const limits: RegistrationCreditLimit[] = data?.member ?? [];
  const totalLimits: number = data?.totalItems ?? 0;

  const programs: ProgramOption[] = useMemo(
    () => (programsData?.member ?? []).map((p) => ({ id: p.id, name: p.name })),
    [programsData],
  );

  const levels: LevelOption[] = useMemo(
    () =>
      (levelsData?.member ?? []).map((l: Level) => ({
        id: l.id,
        name: l.name,
      })),
    [levelsData],
  );

  const sessions: SessionOption[] = useMemo(
    () =>
      (sessionsData?.member ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        isCurrent: s.isCurrent,
      })),
    [sessionsData],
  );

  const semesterTypes: SemesterTypeOption[] = useMemo(
    () =>
      (semesterTypesData?.member ?? []).map((st) => ({
        id: st.id,
        name: st.name,
      })),
    [semesterTypesData],
  );

  const statuses: StatusOption[] = useMemo(
    () =>
      (statusesData?.member ?? []).map((s: StudentTransitionStatus) => ({
        id: s.id,
        name: s.name,
      })),
    [statusesData],
  );

  const programsConfigured: number = useMemo(() => {
    const ids = new Set(
      limits.map((l) => l.programId).filter((id): id is number => id !== null),
    );
    return ids.size;
  }, [limits]);

  const activeFilterCount: number = Object.values(filters).filter(
    (v) => v !== undefined,
  ).length;

  const pagination = {
    current: page,
    total: totalLimits,
    pageSize: ITEMS_PER_PAGE,
    onChange: (p: number) => setPage(p),
  };

  // ── Action handlers ────────────────────────────────────────────────────────

  const handlePageChange = (p: number) => {
    setPage(p);
  };

  const handleFilterChange = (
    field: keyof ActiveFilters,
    value: number | undefined,
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleOpenCreate = () => {
    setFormTarget(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (record: RegistrationCreditLimit) => {
    setFormTarget(record);
    setFormModalOpen(true);
  };

  const handleOpenDelete = (record: RegistrationCreditLimit) => {
    setDeleteTarget(record);
    setDeleteModalOpen(true);
  };

  const handleCloseForm = () => {
    setFormModalOpen(false);
    setFormTarget(null);
  };

  const handleCloseDelete = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  // ── Return shape ───────────────────────────────────────────────────────────

  return {
    state: {
      limits,
      programs,
      levels,
      sessions,
      semesterTypes,
      statuses,
      isLoading,
      isError,
      totalLimits,
      programsConfigured,
      formTarget,
      deleteTarget,
      formModalOpen,
      deleteModalOpen,
      filters,
      activeFilterCount,
      pagination,
      programsLoading,
      levelsLoading,
      sessionsLoading,
      semesterTypesLoading,
      statusesLoading,
    },
    actions: {
      handleOpenCreate,
      handleOpenEdit,
      handleOpenDelete,
      handleCloseForm,
      handleCloseDelete,
      handlePageChange,
      handleFilterChange,
      handleClearFilters,
      refetch,
    },
    flags: {
      hasLimits: limits.length > 0,
      isFiltering: activeFilterCount > 0,
    },
  };
}
