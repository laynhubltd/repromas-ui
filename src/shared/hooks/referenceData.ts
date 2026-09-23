import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useGetFacultiesQuery } from "@/features/academic-structure/api/facultiesApi";
import type { Department, Faculty } from "@/features/academic-structure/types/faculty";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import type { Program } from "@/features/program/tabs/programs/types/program";
import {
  useGetAcademicSessionsQuery,
  useGetSemesterTypesQuery,
} from "@/features/settings/tabs/academic-calendar/api/academicCalendarApi";
import type {
  AcademicSession,
  SemesterType,
} from "@/features/settings/tabs/academic-calendar/types/academic-calendar";
import { useGetLevelsQuery } from "@/features/settings/tabs/level-config/api/levelApi";
import type { Level } from "@/features/settings/tabs/level-config/types/level";
import { useMemo } from "react";

export interface ReferenceDataOptions {
  skip?: boolean;
}

const CANONICAL_QUERY_100 = { itemsPerPage: 100 } as const;
const CANONICAL_QUERY_SESSIONS = {
  itemsPerPage: 100,
  sort: "rankOrder:desc",
} as const;
const CANONICAL_QUERY_SEMESTERS = {
  itemsPerPage: 100,
  sort: "sortOrder:asc",
} as const;
const CANONICAL_QUERY_LEVELS = {
  itemsPerPage: 100,
  sort: "rankOrder:asc",
} as const;

export function usePrograms(options?: ReferenceDataOptions) {
  const result = useGetProgramsQuery(CANONICAL_QUERY_100, {
    skip: options?.skip,
  });
  const data: Program[] = useMemo(
    () => result.data?.member ?? [],
    [result.data],
  );
  return { ...result, programs: data };
}

export function useDepartments(options?: ReferenceDataOptions) {
  const result = useGetDepartmentsQuery(CANONICAL_QUERY_100, {
    skip: options?.skip,
  });
  const data: Department[] = useMemo(
    () => result.data?.member ?? [],
    [result.data],
  );
  return { ...result, departments: data };
}

export function useFaculties(options?: ReferenceDataOptions) {
  const result = useGetFacultiesQuery(CANONICAL_QUERY_100, {
    skip: options?.skip,
  });
  const data: Faculty[] = useMemo(
    () => result.data?.member ?? [],
    [result.data],
  );
  return { ...result, faculties: data };
}

export function useAcademicSessions(options?: ReferenceDataOptions) {
  const result = useGetAcademicSessionsQuery(CANONICAL_QUERY_SESSIONS, {
    skip: options?.skip,
  });
  const data: AcademicSession[] = useMemo(
    () => result.data?.member ?? [],
    [result.data],
  );
  return { ...result, sessions: data };
}

export function useSemesterTypes(options?: ReferenceDataOptions) {
  const result = useGetSemesterTypesQuery(CANONICAL_QUERY_SEMESTERS, {
    skip: options?.skip,
  });
  const data: SemesterType[] = useMemo(
    () => result.data?.member ?? [],
    [result.data],
  );
  return { ...result, semesterTypes: data };
}

export function useLevels(options?: ReferenceDataOptions) {
  const result = useGetLevelsQuery(CANONICAL_QUERY_LEVELS, {
    skip: options?.skip,
  });
  const data: Level[] = useMemo(
    () => result.data?.member ?? [],
    [result.data],
  );
  return { ...result, levels: data };
}
