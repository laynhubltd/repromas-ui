import { useGetCurriculumVersionsQuery } from "@/features/settings/tabs/curriculum-version/api/curriculumVersionApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import {
  useGetAcademicSessionsQuery,
  useGetSemesterTypesQuery,
} from "@/features/settings/tabs/academic-calendar/api/academicCalendarApi";
import { useGetLevelsQuery } from "@/features/settings/tabs/level-config/api/levelApi";
import { useCallback, useMemo, useState } from "react";
import type { Program } from "@/features/program/tabs/programs/types/program";
import type {
  AcademicSession,
  SemesterType,
} from "@/features/settings/tabs/academic-calendar/types/academic-calendar";
import type { CurriculumVersion } from "@/features/settings/tabs/curriculum-version/types/curriculum-version";
import type { Level } from "@/features/settings/tabs/level-config/types/level";
import type { BroadsheetFilterParams } from "../types/result-broadsheet";

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

export function useBroadsheetFilters() {
  const [explicitSessionId, setExplicitSessionId] = useState<number | undefined>(undefined);
  const [explicitSemesterTypeId, setExplicitSemesterTypeId] = useState<number | undefined>(undefined);
  const [programId, setProgramId] = useState<number | undefined>(undefined);
  const [levelId, setLevelId] = useState<number | undefined>(undefined);
  const [curriculumVersionId, setCurriculumVersionId] = useState<number | undefined>(undefined);

  // Queries for filter dropdowns
  const { data: sessionsData, isLoading: isSessionsLoading } = useGetAcademicSessionsQuery({
    sort: "rankOrder:desc",
    itemsPerPage: 100,
  });

  const { data: semesterTypesData, isLoading: isSemesterTypesLoading } = useGetSemesterTypesQuery({
    sort: "sortOrder:asc",
    itemsPerPage: 100,
  });

  const { data: programsData, isLoading: isProgramsLoading } = useGetProgramsQuery({
    sort: "name:asc",
    itemsPerPage: 500,
  });

  const { data: levelsData, isLoading: isLevelsLoading } = useGetLevelsQuery({
    sort: "name:asc",
    itemsPerPage: 100,
  });

  const { data: curriculumVersionsData, isLoading: isCurriculumVersionsLoading } =
    useGetCurriculumVersionsQuery({ itemsPerPage: 1000 });

  const sessions = useMemo(() => extractArray<AcademicSession>(sessionsData), [sessionsData]);
  const semesterTypes = useMemo(() => extractArray<SemesterType>(semesterTypesData), [semesterTypesData]);
  const programs = useMemo(() => extractArray<Program>(programsData), [programsData]);
  const levels = useMemo(() => extractArray<Level>(levelsData), [levelsData]);
  const allCurriculumVersions = useMemo(
    () => extractArray<CurriculumVersion & { referenceId?: number; programId?: number }>(curriculumVersionsData),
    [curriculumVersionsData],
  );

  const curriculumVersions = useMemo(() => {
    if (!programId) return [];
    return allCurriculumVersions.filter(
      (cv) => cv.referenceId === programId || cv.programId === programId,
    );
  }, [allCurriculumVersions, programId]);

  // Derived effective session and semester type (pure calculation, no effect cascades)
  const sessionId = useMemo(() => {
    if (explicitSessionId !== undefined) return explicitSessionId;
    if (sessions.length === 0) return undefined;
    const currentSession = sessions.find((s) => s.isCurrent) ?? sessions[0];
    return currentSession?.id;
  }, [explicitSessionId, sessions]);

  const semesterTypeId = useMemo(() => {
    if (explicitSemesterTypeId !== undefined) return explicitSemesterTypeId;
    return semesterTypes[0]?.id;
  }, [explicitSemesterTypeId, semesterTypes]);

  // Cohort key tracking: Pure derivation of visibleCourseCodes without effect cascades
  const cohortKey = `${sessionId ?? ""}:${semesterTypeId ?? ""}:${programId ?? ""}:${levelId ?? ""}:${curriculumVersionId ?? ""}`;

  const [courseVisibilityState, setCourseVisibilityState] = useState<{
    cohortKey: string;
    visibleCourseCodes: string[] | undefined;
  }>({ cohortKey: "", visibleCourseCodes: undefined });

  const visibleCourseCodes =
    courseVisibilityState.cohortKey === cohortKey
      ? courseVisibilityState.visibleCourseCodes
      : undefined;

  const setVisibleCourseCodes = useCallback(
    (codes: string[] | undefined) => {
      setCourseVisibilityState({ cohortKey, visibleCourseCodes: codes });
    },
    [cohortKey],
  );

  // When program changes, reset curriculumVersion if no longer valid
  const handleProgramChange = useCallback((id: number | undefined) => {
    setProgramId(id);
    setCurriculumVersionId(undefined);
  }, []);

  const isFilterComplete = Boolean(programId && levelId && sessionId && semesterTypeId);

  const filterParams: BroadsheetFilterParams | null = useMemo(() => {
    if (!isFilterComplete || !programId || !levelId) return null;
    return {
      programId,
      levelId,
      sessionId,
      semesterTypeId,
      curriculumVersionId,
    };
  }, [isFilterComplete, programId, levelId, sessionId, semesterTypeId, curriculumVersionId]);

  return {
    state: {
      sessionId,
      semesterTypeId,
      programId,
      levelId,
      curriculumVersionId,
      visibleCourseCodes,
      isFilterComplete,
      cohortKey,
      filterParams,
    },
    data: {
      sessions,
      semesterTypes,
      programs,
      levels,
      curriculumVersions,
      isLoadingOptions:
        isSessionsLoading ||
        isSemesterTypesLoading ||
        isProgramsLoading ||
        isLevelsLoading ||
        isCurriculumVersionsLoading,
    },
    actions: {
      setSessionId: setExplicitSessionId,
      setSemesterTypeId: setExplicitSemesterTypeId,
      setProgramId: handleProgramChange,
      setLevelId,
      setCurriculumVersionId,
      setVisibleCourseCodes,
    },
  };
}
