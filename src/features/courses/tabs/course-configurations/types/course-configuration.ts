import type { Program } from "@/features/program/tabs/programs/types/program";
import type { SemesterType } from "@/features/settings/tabs/academic-calendar/types/academic-calendar";
import type { CurriculumVersion } from "@/features/settings/tabs/curriculum-version/types/curriculum-version";
import type { Level } from "@/features/settings/tabs/level-config/types/level";
import type { Course } from "../../courses/types/course";

export type CourseStatus = "CORE" | "ELECTIVE" | "REQUIRED" | "PREREQUISITE";

export interface FormattedSemester {
  semesterTypeId: number;
  semesterTypeName: string;
  position: number | null;
  semesterTitle: string | null;
  ordinalName: string;
  displayLabel: string;
}

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
  semester?: FormattedSemester | null;
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
  "search[course.code]"?: string;
  "search[course.title]"?: string;
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

export interface CourseConfigurationLeafOption {
  "@id"?: string;
  "@type"?: string;
  /** The Course Configuration ID (to be submitted as form value) */
  value: number;
  /** Pre-formatted display label: "{code} — {title} ({creditUnit} Unit(s)) [{courseStatus}]" */
  label: string;
  /** Base Course ID */
  courseId: number;
  /** Course code (e.g. "COM111") */
  code: string;
  /** Course title (e.g. "Introduction to Computers") */
  title: string;
  /** Credit units (e.g. 3) */
  creditUnit: number;
  /** Status (e.g. "CORE", "ELECTIVE", "REQUIRED", "AUDIT") */
  courseStatus: string;
  /** Academic Level ID */
  levelId: number;
  /** Academic Level Name (e.g. "ND I") */
  levelName?: string;
  /** Semester Type ID */
  semesterTypeId: number;
  /** Semester Type Name (e.g. "First Semester") */
  semesterName?: string;
  /** Alias for semesterName if provided */
  semesterTypeName?: string;
}

export interface CourseConfigurationGroupOption {
  "@id"?: string;
  "@type"?: string;
  /** Curriculum Version ID */
  versionId: number;
  /** Group Label for AntD optgroup (e.g. "2022/2023 - 2026/2027") */
  label: string;
  /** OrgUnit scope (e.g. "DEPARTMENT", "GLOBAL", "PROGRAM") */
  scope: string;
  /** Indicates if active for current admissions */
  isActiveForAdmission: boolean;
  /** List of child course configuration options */
  options: CourseConfigurationLeafOption[];
}

export interface CourseConfigurationGroupedParams {
  programId: number;
  levelId?: number;
  semesterTypeId?: number;
  search?: string;
  courseStatus?: string;
  versionId?: number;
}
