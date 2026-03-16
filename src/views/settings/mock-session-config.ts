import type { AcademicSession, Semester, SemesterType, SessionWithSemesters } from "./types";

export const mockSessions: AcademicSession[] = [
  {
    id: 1,
    name: "2023/2024 Academic Session",
    startDate: "2023-09-01",
    endDate: "2024-08-31",
    isCurrent: true,
  },
  {
    id: 2,
    name: "2022/2023 Academic Session",
    startDate: "2022-09-01",
    endDate: "2023-08-31",
    isCurrent: false,
  },
];

export const mockSemesters: Semester[] = [
  { id: 1, name: "First Semester", status: "OPEN", academicSessionId: 1 },
  { id: 2, name: "Second Semester", status: "GRADING", academicSessionId: 1 },
  { id: 3, name: "First Semester", status: "CLOSED", academicSessionId: 2 },
  { id: 4, name: "Second Semester", status: "CLOSED", academicSessionId: 2 },
  { id: 5, name: "Third Semester", status: "CLOSED", academicSessionId: 2 },
];

export const mockSemesterTypes: SemesterType[] = [
  { id: 1, name: "First Semester" },
  { id: 2, name: "Second Semester" },
];

export function buildSessionsWithSemesters(
  sessions: AcademicSession[],
  semesters: Semester[],
): SessionWithSemesters[] {
  return sessions.map((session) => ({
    session,
    semesters: semesters.filter((s) => s.academicSessionId === session.id),
  }));
}
