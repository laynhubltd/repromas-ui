// Feature: faculty-department-management
import { useGetFacultiesQuery } from "../api/facultiesApi";

// useMetricsRow — derives all four metric values from a single faculty list query
// Calls getFaculties with include=departments.programs to get all data in one request.
// departments: null on a Faculty means "not loaded" (Null_Not_Empty rule) — treated as 0 when summing.
export function useMetricsRow(): {
  state: {
    facultyCount: number;
    departmentCount: number;
    programCount: number;
    avgDeptsPerFaculty: string;
    isLoading: boolean;
    isError: boolean;
  };
  actions: Record<string, never>;
  flags: { hasData: boolean };
} {
  const { data, isLoading, isError } = useGetFacultiesQuery({
    include: "departments.programs",
    itemsPerPage: 100,
  });

  const faculties = data?.member ?? [];

  const facultyCount = faculties.length;

  const departmentCount = faculties.reduce(
    (sum, faculty) => sum + (faculty.departments?.length ?? 0),
    0
  );

  const programCount = faculties.reduce((sum, faculty) => {
    const depts = faculty.departments ?? [];
    return (
      sum +
      depts.reduce((dSum, dept) => dSum + (dept.programs?.length ?? 0), 0)
    );
  }, 0);

  // No division by zero — return "0.0" when faculty list is empty
  const avgDeptsPerFaculty =
    facultyCount === 0
      ? "0.0"
      : (departmentCount / facultyCount).toFixed(1);

  return {
    state: {
      facultyCount,
      departmentCount,
      programCount,
      avgDeptsPerFaculty,
      isLoading,
      isError,
    },
    actions: {},
    flags: {
      hasData: facultyCount > 0,
    },
  };
}
