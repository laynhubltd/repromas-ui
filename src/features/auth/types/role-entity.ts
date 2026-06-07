import type {
  Department,
  Faculty,
} from "@/features/academic-structure/types/faculty";
import type { AdmissionCycleStatus } from "@/features/admission-config/tabs/admission-cycle/types/admission-cycle";
import type {
  LgaRef,
  StateRef,
} from "@/features/admission-candidate/types/admission-candidate";
import type { Program } from "@/features/program/tabs/programs/types/program";
import type {
  AcademicSession,
  Semester,
} from "@/features/settings/tabs/academic-calendar/types/academic-calendar";
import type { CurriculumVersion } from "@/features/settings/tabs/curriculum-version/types/curriculum-version";
import type { Level } from "@/features/settings/tabs/level-config/types/level";
import type { StudentTransitionStatus } from "@/features/settings/tabs/student-transition-status/types/student-transition-status";
import type { Student } from "@/features/student/types/student";
import type { StudentEnrollmentTransition } from "@/features/student/types/studentTransition";

export type AuthRoleScope =
  | "GLOBAL"
  | "FACULTY"
  | "DEPARTMENT"
  | "PROGRAM"
  | "STUDENT"
  | "CANDIDATE";

export const AUTH_ROLE_SCOPES: AuthRoleScope[] = [
  "GLOBAL",
  "FACULTY",
  "DEPARTMENT",
  "PROGRAM",
  "STUDENT",
  "CANDIDATE",
];

export type AuthFacultyEntity = Pick<
  Faculty,
  "id" | "name" | "code" | "createdAt" | "updatedAt"
>;

export type AuthDepartmentEntity = Omit<Department, "programs" | "faculty"> & {
  faculty: AuthFacultyEntity;
};

export type AuthProgramEntity = Omit<Program, "department"> & {
  department: AuthDepartmentEntity;
};

export type AuthSemesterEmbed = Omit<Semester, "session"> & {
  semesterTypeName: string;
};

export type AuthEnrollmentTransition = StudentEnrollmentTransition & {
  status: StudentTransitionStatus;
  session: Omit<AcademicSession, "semesters">;
  semester: AuthSemesterEmbed;
  level: Level;
};

export type AuthStudentEntity = Pick<
  Student,
  | "id"
  | "matricNumber"
  | "firstName"
  | "lastName"
  | "email"
  | "entryMode"
  | "programId"
  | "entryLevelId"
  | "currentLevelId"
  | "curriculumVersionId"
  | "status"
  | "metaData"
  | "createdAt"
  | "updatedAt"
> & {
  program: AuthProgramEntity;
  entryLevel: Level;
  currentLevel: Level;
  curriculumVersion: CurriculumVersion;
  currentEnrollmentTransition: AuthEnrollmentTransition | null;
};

export type AuthCandidateApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "DOCUMENTS_VERIFIED";

export type AuthCandidateFinalDecision =
  | "PENDING"
  | "ADMIT_MERIT"
  | "ADMIT_CATCHMENT"
  | "ADMIT_ELDS"
  | "OFFER_CHANGE_OF_COURSE"
  | "REJECTED";

export type AuthCandidateApplication = {
  id: number;
  candidate_id: number;
  applied_program_id: number;
  offered_program_id: number | null;
  application_status: AuthCandidateApplicationStatus;
  final_decision: AuthCandidateFinalDecision;
  is_matriculated: boolean;
  updated_at: string;
};

export type AuthCandidateCycleEmbed = {
  id: number;
  sessionId: number;
  name: string;
  status: AdmissionCycleStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
};

/** Login / role-switch wire format — snake_case at root per API contract. */
export type AuthCandidateEntity = {
  id: number;
  cycle_id: number;
  jamb_reg_no: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: string | null;
  state_id: number;
  lga_id: number | null;
  email: string | null;
  phone: string | null;
  entry_mode: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  application: AuthCandidateApplication | null;
  state: StateRef | null;
  lga: LgaRef | null;
  cycle: AuthCandidateCycleEmbed | null;
};

export type RoleEntity =
  | AuthFacultyEntity
  | AuthDepartmentEntity
  | AuthProgramEntity
  | AuthStudentEntity
  | AuthCandidateEntity
  | null;

export type RoleEntityByScope = {
  GLOBAL: null;
  FACULTY: AuthFacultyEntity;
  DEPARTMENT: AuthDepartmentEntity;
  PROGRAM: AuthProgramEntity;
  STUDENT: AuthStudentEntity;
  CANDIDATE: AuthCandidateEntity;
};
