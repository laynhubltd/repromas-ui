/**
 * Session config entity types aligned with repromas-api Entity/Academic.
 */

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

export interface SemesterType {
  id: number;
  name: string;
}

/** Session with its semesters grouped (for collapsible UI). */
export interface SessionWithSemesters {
  session: AcademicSession;
  semesters: Semester[];
}

/** Level entity (repromas-api Entity/Academic/Level.php). */
export interface Level {
  id: number;
  name: string;
  rankOrder: number;
  description: string | null;
}
