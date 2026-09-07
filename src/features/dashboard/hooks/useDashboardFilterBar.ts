import { useMemo, useState } from "react";
import { useAccessControl } from "@/features/access-control";
import { useInstitutionTerminology } from "@/shared/hooks/useInstitutionTerminology";
import { useGetAcademicSessionsQuery } from "@/features/settings/tabs/academic-calendar/api/academicCalendarApi";
import { useGetFacultiesQuery } from "@/features/academic-structure/api/facultiesApi";
import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useGetLevelsQuery } from "@/features/settings/tabs/level-config/api/levelApi";
import {
  DashboardFilterActionType,
  type DashboardFilterAction,
  type DashboardFilterState,
} from "../state/dashboardFilterState";

function extractArray<T>(data: unknown): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (
    typeof data === "object" &&
    data !== null &&
    "member" in data &&
    Array.isArray((data as { member: unknown[] }).member)
  ) {
    return (data as { member: T[] }).member;
  }
  return [];
}

export type UseDashboardFilterBarParams = {
  state: DashboardFilterState;
  dispatch: (action: DashboardFilterAction) => void;
};

export function useDashboardFilterBar({
  state,
  dispatch,
}: UseDashboardFilterBarParams) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const terminology = useInstitutionTerminology();
  const { activeRole } = useAccessControl();

  // Role Scope Clamping (Invariant D-1)
  const isFacultyScoped = activeRole?.scope === "FACULTY";
  const isDepartmentScoped = activeRole?.scope === "DEPARTMENT";
  const isProgramScoped = activeRole?.scope === "PROGRAM";

  const facultyScopeId = isFacultyScoped ? (activeRole?.scopeReferenceId ?? undefined) : undefined;
  const departmentScopeId = isDepartmentScoped ? (activeRole?.scopeReferenceId ?? undefined) : undefined;
  const programScopeId = isProgramScoped ? (activeRole?.scopeReferenceId ?? undefined) : undefined;

  // Active filter values (respecting enforced scopes)
  const effectiveFacultyId = facultyScopeId ?? state.facultyId;
  const effectiveDepartmentId = departmentScopeId ?? state.departmentId;
  const effectiveProgramId = programScopeId ?? state.programId;

  // Queries for dropdown options
  const { data: sessionsData, isLoading: isSessionsLoading } =
    useGetAcademicSessionsQuery({
      sort: "rankOrder:desc",
      itemsPerPage: 100,
    });

  const { data: facultiesData, isLoading: isFacultiesLoading } =
    useGetFacultiesQuery({
      itemsPerPage: 200,
    });

  const { data: departmentsData, isLoading: isDepartmentsLoading } =
    useGetDepartmentsQuery({
      itemsPerPage: 500,
    });

  const { data: programsData, isLoading: isProgramsLoading } =
    useGetProgramsQuery({
      itemsPerPage: 500,
    });

  const { data: levelsData, isLoading: isLevelsLoading } = useGetLevelsQuery({
    sort: "rankOrder:asc",
    itemsPerPage: 100,
  });

  // Extracted data arrays
  const sessions = useMemo(() => extractArray<{ id: number; name: string; isCurrent?: boolean }>(sessionsData), [sessionsData]);
  const faculties = useMemo(() => extractArray<{ id: number; name: string; code?: string }>(facultiesData), [facultiesData]);
  const allDepartments = useMemo(() => extractArray<{ id: number; name: string; facultyId?: number }>(departmentsData), [departmentsData]);
  const allPrograms = useMemo(() => extractArray<{ id: number; name: string; departmentId?: number }>(programsData), [programsData]);
  const levels = useMemo(() => extractArray<{ id: number; name: string; rankOrder?: number }>(levelsData), [levelsData]);

  // Cascading dropdown options
  const sessionOptions = useMemo(
    () =>
      sessions.map((s) => ({
        value: s.id,
        label: s.isCurrent ? `${s.name} (Current)` : s.name,
      })),
    [sessions]
  );

  const facultyOptions = useMemo(
    () =>
      faculties.map((f) => ({
        value: f.id,
        label: f.name,
      })),
    [faculties]
  );

  const departmentOptions = useMemo(() => {
    const filtered = effectiveFacultyId
      ? allDepartments.filter((d) => d.facultyId === effectiveFacultyId)
      : allDepartments;
    return filtered.map((d) => ({
      value: d.id,
      label: d.name,
    }));
  }, [allDepartments, effectiveFacultyId]);

  const programOptions = useMemo(() => {
    const filtered = effectiveDepartmentId
      ? allPrograms.filter((p) => p.departmentId === effectiveDepartmentId)
      : allPrograms;
    return filtered.map((p) => ({
      value: p.id,
      label: p.name,
    }));
  }, [allPrograms, effectiveDepartmentId]);

  const levelOptions = useMemo(
    () =>
      levels.map((l) => ({
        value: l.id,
        label: l.name,
      })),
    [levels]
  );

  // Active filter count (excluding permanent role-scoped locks)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (state.sessionId !== undefined) count++;
    if (!facultyScopeId && state.facultyId !== undefined) count++;
    if (!departmentScopeId && state.departmentId !== undefined) count++;
    if (!programScopeId && state.programId !== undefined) count++;
    if (state.levelId !== undefined) count++;
    return count;
  }, [
    state.sessionId,
    state.facultyId,
    state.departmentId,
    state.programId,
    state.levelId,
    facultyScopeId,
    departmentScopeId,
    programScopeId,
  ]);

  // Actions
  const handleSessionChange = (sessionId?: number) => {
    dispatch({ type: DashboardFilterActionType.SetSession, sessionId });
  };

  const handleFacultyChange = (facultyId?: number) => {
    if (facultyScopeId) return;
    dispatch({ type: DashboardFilterActionType.SetFaculty, facultyId });
  };

  const handleDepartmentChange = (departmentId?: number) => {
    if (departmentScopeId) return;
    dispatch({ type: DashboardFilterActionType.SetDepartment, departmentId });
  };

  const handleProgramChange = (programId?: number) => {
    if (programScopeId) return;
    dispatch({ type: DashboardFilterActionType.SetProgram, programId });
  };

  const handleLevelChange = (levelId?: number) => {
    dispatch({ type: DashboardFilterActionType.SetLevel, levelId });
  };

  const handleClearAll = () => {
    dispatch({ type: DashboardFilterActionType.Reset });
  };

  return {
    state: {
      popoverOpen,
      filters: {
        sessionId: state.sessionId,
        facultyId: effectiveFacultyId,
        departmentId: effectiveDepartmentId,
        programId: effectiveProgramId,
        levelId: state.levelId,
      },
      scopes: {
        isFacultyScoped,
        isDepartmentScoped,
        isProgramScoped,
        facultyScopeId,
        departmentScopeId,
        programScopeId,
      },
      options: {
        sessionOptions,
        facultyOptions,
        departmentOptions,
        programOptions,
        levelOptions,
      },
      activeFilterCount,
      isLoadingOptions:
        isSessionsLoading ||
        isFacultiesLoading ||
        isDepartmentsLoading ||
        isProgramsLoading ||
        isLevelsLoading,
    },
    actions: {
      setPopoverOpen,
      handleSessionChange,
      handleFacultyChange,
      handleDepartmentChange,
      handleProgramChange,
      handleLevelChange,
      handleClearAll,
    },
    terminology,
  };
}
