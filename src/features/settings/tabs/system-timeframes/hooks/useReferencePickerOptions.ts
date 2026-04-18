// Feature: settings-timeframe
import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useGetFacultiesQuery } from "@/features/academic-structure/api/facultiesApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useGetLevelsQuery } from "@/features/settings/tabs/level-config/api/levelApi";
import { useGetStudentsQuery } from "@/features/student/api/studentsApi";
import type { Scope } from "../types/system-timeframe";

export type ReferenceOption = {
  id: number;
  label: string;
};

export type UseReferencePickerOptionsResult = {
  options: ReferenceOption[];
  isLoading: boolean;
};

export function useReferencePickerOptions(
  scope: Scope,
  search: string,
): UseReferencePickerOptionsResult {
  const isFaculty = scope === "FACULTY";
  const isDepartment = scope === "DEPARTMENT";
  const isProgram = scope === "PROGRAM";
  const isLevel = scope === "LEVEL";
  const isStudent = scope === "STUDENT";

  const { data: facultiesData, isLoading: facultiesLoading } = useGetFacultiesQuery(
    { itemsPerPage: 30, ...(search ? { "search[name]": search } : {}) },
    { skip: !isFaculty },
  );

  const { data: departmentsData, isLoading: departmentsLoading } = useGetDepartmentsQuery(
    { itemsPerPage: 30, ...(search ? { "search[name]": search } : {}) },
    { skip: !isDepartment },
  );

  const { data: programsData, isLoading: programsLoading } = useGetProgramsQuery(
    { itemsPerPage: 30, ...(search ? { "search[name]": search } : {}) },
    { skip: !isProgram },
  );

  const { data: levelsData, isLoading: levelsLoading } = useGetLevelsQuery(
    { itemsPerPage: 30, ...(search ? { "search[name]": search } : {}) },
    { skip: !isLevel },
  );

  // Students: only load when search is non-empty (matric number search)
  const { data: studentsData, isLoading: studentsLoading } = useGetStudentsQuery(
    { itemsPerPage: 30, "search[matricNumber]": search },
    { skip: !isStudent || !search },
  );

  if (isFaculty) {
    return {
      options: (facultiesData?.member ?? []).map((f) => ({ id: f.id, label: f.name })),
      isLoading: facultiesLoading,
    };
  }

  if (isDepartment) {
    return {
      options: (departmentsData?.member ?? []).map((d) => ({ id: d.id, label: d.name })),
      isLoading: departmentsLoading,
    };
  }

  if (isProgram) {
    return {
      options: (programsData?.member ?? []).map((p) => ({ id: p.id, label: p.name })),
      isLoading: programsLoading,
    };
  }

  if (isLevel) {
    return {
      options: (levelsData?.member ?? []).map((l) => ({ id: l.id, label: l.name })),
      isLoading: levelsLoading,
    };
  }

  if (isStudent) {
    return {
      options: (studentsData?.member ?? []).map((s) => ({
        id: s.id,
        label: `${s.matricNumber} — ${s.firstName} ${s.lastName}`,
      })),
      isLoading: studentsLoading,
    };
  }

  // GLOBAL scope — no picker needed
  return { options: [], isLoading: false };
}
