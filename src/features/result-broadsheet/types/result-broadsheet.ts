export interface BroadsheetMeta {
  institutionName?: string;
  schoolName?: string;
  facultyName?: string;
  departmentName?: string;
  programName?: string;
  levelName?: string;
  sessionName?: string;
  semesterName?: string;
  semesterTypeName?: string;
  totalRegisteredStudents?: number;
  generatedAt?: string;
}

export interface BroadsheetCourseColumn {
  configId?: number;
  courseId?: number;
  id?: number;
  code?: string;
  courseCode?: string;
  title?: string;
  courseTitle?: string;
  creditUnit?: number;
  creditUnits?: number;
  courseStatus?: string;
  levelId?: number;
}

export interface BroadsheetGrade {
  grade?: string;
  score: number | null;
  gradePoint: number | null;
  netPoint: number | null;
  isPass?: boolean;
  isRegistered?: boolean;
  status?: string | null;
  gradeLetter?: string;
}

export interface BroadsheetRowSummary {
  tcu: number;
  tnp: number;
  pcgpa?: number | null;
  gpa: number;
  cgpa: number;
  totalEarnedUnits?: number;
  remark: string;
  academicStanding?: string;
  carryoverCourses?: string[];
  unclearedCarryovers?: string[];
}

export interface BroadsheetRow {
  serialNumber: number;
  studentId?: number;
  matricNumber: string;
  fullName: string;
  grades: Record<string, BroadsheetGrade>;
  summary: BroadsheetRowSummary;
}

export interface GradeDistributionItem {
  courseCode: string;
  courseTitle: string;
  creditUnit: number;
  totalSat: number;
  letterCounts: Record<string, number>;
  unknownCount?: number;
}

export interface CohortStatistics {
  totalStudents?: number;
  totalRegistered: number;
  totalSatForExam: number;
  passedCount?: number;
  totalPassed?: number;
  totalFailed?: number;
  probationCount: number;
  repeatCount: number;
  withdrawnCount: number;
  spillOverCount: number;
  withCarryoverCount: number;
  withoutCarryoverCount: number;
  cgpaAboveThresholdCount: number;
  successRate: number;
}

export interface SpecialHighlight {
  matricNumber: string;
  fullName?: string;
  cgpa: number;
}

export interface GraduatedStudent {
  serialNumber: number;
  matricNumber: string;
  fullName: string;
  cgpa: number;
  classOfDegree: string;
  graduationSession: string;
}

export interface BroadsheetSummaryPage {
  gradeLetters: string[];
  gradeDistribution: Record<string, Record<string, number>> | GradeDistributionItem[];
  statistics: CohortStatistics;
  specialHighlights: SpecialHighlight[];
}

export interface BroadsheetReport {
  meta: BroadsheetMeta;
  columns: BroadsheetCourseColumn[];
  totalCurriculumUnits?: number;
  rows: BroadsheetRow[];
  statistics: CohortStatistics;
  summaryPage: BroadsheetSummaryPage;
  graduatedStudents?: GraduatedStudent[];
  classificationFootnote?: string;
}

export interface BroadsheetFilterParams {
  programId: number;
  levelId: number;
  sessionId?: number;
  semesterTypeId?: number;
  semesterId?: number;
  curriculumVersionId?: number;
}

export type BroadsheetSourceType = "LIVE" | "SNAPSHOT";

export type BroadsheetSourceModel =
  | {
      source: "LIVE";
      data: BroadsheetReport | null;
      isPublished?: boolean;
    }
  | {
      source: "SNAPSHOT";
      data: BroadsheetReport | null;
      frozenAt: string;
      isPublished: boolean;
    };

export type CohortBroadsheetLaggard = {
  courseConfigId?: number;
  courseCode?: string;
  courseTitle?: string;
  creditUnits?: number;
  status?: string;
  statusLabel?: string;
  registeredStudentsCount?: number;
  gradedStudentsCount?: number;
  primaryLecturer?: string | null;
  lastActivityAt?: string | null;
};

export type CohortBroadsheetApproval = {
  id: number;
  programId: number;
  levelId: number;
  sessionId: number;
  semesterId?: number;
  semesterTypeId?: number;
  status?: string;
  currentStepLabel?: string;
  isReady?: boolean;
  isLocked?: boolean;
  isTerminal?: boolean;
  isPublished: boolean;
  isFrozen: boolean;
  frozenAt?: string | null;
  canAct?: boolean;
  approvedSheetsCount: number;
  totalSheetsCount: number;
  pendingSheetsCount?: number;
  completionPercentage?: number;
  totalStudentsCount?: number;
  metrics?: {
    totalSheetsCount: number;
    approvedSheetsCount: number;
    pendingSheetsCount: number;
    completionPercentage: number;
    totalStudentsCount: number;
    isReady: boolean;
  };
  laggards?: (CohortBroadsheetLaggard | string)[];
};


