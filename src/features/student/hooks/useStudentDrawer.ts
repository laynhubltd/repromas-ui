import { useGetStudentQuery } from "../api/studentsApi";
import type { Student } from "../types/student";

const DRAWER_INCLUDE =
  "program.department.faculty,entryLevel,currentLevel,curriculumVersion,currentEnrollmentTransition";

export function useStudentDrawer(studentId: number | null, open: boolean) {
  const skip = !open || studentId === null;

  const {
    data: student,
    isLoading,
    isError,
    refetch,
  } = useGetStudentQuery(
    { id: studentId as number, include: DRAWER_INCLUDE },
    { skip }
  );

  return {
    state: {
      student: student as Student | undefined,
      isLoading,
      isError,
    },
    actions: {
      refetch,
    },
  };
}
