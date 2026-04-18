import type { Program } from "@/features/program/tabs/programs/types/program";
import type { SemesterType } from "@/features/settings/tabs/academic-calendar/types/academic-calendar";
import type { CurriculumVersion } from "@/features/settings/tabs/curriculum-version/types/curriculum-version";
import type { Level } from "@/features/settings/tabs/level-config/types/level";
import type { Course } from "../../courses/types/course";

export type CourseStatus = "CORE" | "ELECTIVE" | "REQUIRED" | "PREREQUISITE";

export type CourseConfiguration = {
  id: number;
  // Flat IDs — always present on the root object
  programId: number;
  versionId: number;
  courseId: number;
  levelId: number;
  semesterTypeId: number;
  courseStatus: CourseStatus;
  creditUnit: number;
  prerequisiteIds: number[];
  createdAt: string;
  updatedAt: string;
  // Relation objects — only present when requested via include=
  program?: Program | null;
  version?: CurriculumVersion | null;
  course?: Course | null;
  level?: Level | null;
  semesterType?: SemesterType | null;
};

export type CourseConfigListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "exact[program]"?: number;
  "exact[version]"?: number;
  "exact[level]"?: number;
  "exact[semesterType]"?: number;
  "exact[courseId]"?: number;
  "exact[courseStatus]"?: CourseStatus;
  include?: string;
};

export type CreateCourseConfigRequest = {
  programId: number;
  versionId: number;
  courseId: number;
  levelId: number;
  semesterTypeId: number;
  courseStatus: CourseStatus;
  creditUnit: number;
  prerequisiteIds?: number[];
};

export type UpdateCourseConfigRequest = {
  id: number;
  levelId: number;
  semesterTypeId: number;
  courseStatus: CourseStatus;
  creditUnit: number;
  prerequisiteIds?: number[];
};

export type CurriculumGridCell = {
  levelId: number;
  semesterTypeId: number;
  configs: CourseConfiguration[];
};

export type CurriculumGridRow = {
  level: Level;
  cells: Map<number, CourseConfiguration[]>; // key = semesterTypeId
};
