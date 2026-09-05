import { useMemo } from "react";
import { getOrdinalSemesterName } from "@/shared/utils/semesterOrdinal";
import { useGetSemesterTypesQuery } from "../api/semesterTypesApi";
import type { SemesterType } from "../types/course-registration";

/**
 * Hook that contains all business logic for the SemesterTypeSelector component.
 *
 * Responsibilities:
 * - Fetch semester types from the API (GET /api/semester-types)
 * - Sort semester types by sortOrder
 * - Format ordinal labels (e.g. "Third Semester" for ND II) when level rank order is provided
 * - Derive loading, error, and empty states
 * - Build the options list for the AntD Select component
 */
export function useSemesterTypeSelector(
  semesterTypeId: number | null,
  levelRankOrder?: number | null,
) {
  const { data, isLoading, isError } = useGetSemesterTypesQuery();

  /** Semester types sorted by sortOrder */
  const semesterTypes = useMemo((): SemesterType[] => {
    if (!data?.member) return [];
    return [...data.member].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [data]);

  /** AntD Select-compatible options list. */
  const options = useMemo(
    () =>
      semesterTypes.map((st) => ({
        value: st.id,
        label: levelRankOrder ? getOrdinalSemesterName(st.sortOrder, levelRankOrder) : st.name,
      })),
    [semesterTypes, levelRankOrder],
  );

  /** The currently selected SemesterType object (or null if none selected). */
  const selectedSemesterType = useMemo(
    () =>
      semesterTypeId !== null
        ? (semesterTypes.find((st) => st.id === semesterTypeId) ?? null)
        : null,
    [semesterTypeId, semesterTypes],
  );

  /** True when semester types loaded but the list is empty. */
  const isEmpty = !isLoading && !isError && semesterTypes.length === 0;

  return {
    state: {
      semesterTypes,
      options,
      selectedSemesterType,
      isLoading,
      isError,
      isEmpty,
    },
  };
}
