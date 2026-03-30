export interface SemesterType {
  id: number;
  name: string;
}

export interface Level {
  id: number;
  name: string;
  rankOrder: number;
  description: string | null;
}

export type SemesterStatus = "OPEN" | "CLOSED" | "GRADING";

export interface AcademicSession {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Semester {
  id: number;
  name: string;
  status: SemesterStatus;
  academicSessionId: number;
  academicSession?: { id: number; name: string };
}

export interface SessionWithSemesters {
  session: AcademicSession;
  semesters: Semester[];
}
