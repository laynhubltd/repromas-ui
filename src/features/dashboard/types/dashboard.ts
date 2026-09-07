export type DashboardFilterParams = {
  sessionId?: number;
  facultyId?: number;
  departmentId?: number;
  programId?: number;
  levelId?: number;
};

export type DashboardOverviewDTO = {
  id: string;
  enrolledStudents: number;
  goodStandingStudents: number;
  totalFaculties: number;
  totalDepartments: number;
  totalPrograms: number;
  totalMountedCourses: number;
  activeSessionId: number | null;
  activeSessionName: string | null;
  activeSemesterId: number | null;
  activeSemesterName: string | null;
};

export type FacultyMetricSummary = {
  facultyId: number;
  facultyName: string;
  facultyCode: string;
  departmentCount: number;
  programCount: number;
};

export type CurriculumComplianceDTO = {
  activeVersions: number;
  totalPrograms: number;
};

export type CourseSummaryDTO = {
  mountedCourses: number;
  totalCredits: number;
};

export type AcademicStructureKpiDTO = {
  id: string;
  totalFaculties: number;
  totalDepartments: number;
  totalPrograms: number;
  totalActiveCurriculumVersions: number;
  totalMountedCourses: number;
  totalCreditUnits: number;
  facultyDistribution: FacultyMetricSummary[];
  curriculumCompliance: CurriculumComplianceDTO;
  courseSummary: CourseSummaryDTO;
};

export type LevelDistributionItem = {
  levelId: number;
  levelName: string;
  rankOrder: number;
  count: number;
};

export type StudentLifecycleKpiDTO = {
  id: string;
  enrolledHeadcount: number;
  goodStandingCount: number;
  academicRiskCount: number;
  neutralStandingCount: number;
  noTransitionCount: number;
  graduatedCount: number;
  attritionCount: number;
  totalTerminalCount: number;
  totalSpilloverCount: number;
  staleTransitionCount: number;
  statusCategoryDistribution: Record<string, number>;
  semanticKindDistribution: Record<string, number>;
  entryModeDistribution: Record<string, number>;
  levelDistribution: LevelDistributionItem[];
  genderDistribution: Record<string, number>;
};

export type OverviewCardsProps = {
  overview?: DashboardOverviewDTO;
  lifecycle?: StudentLifecycleKpiDTO;
  structure?: AcademicStructureKpiDTO;
  isLoading: boolean;
};

export type StudentStandingCardProps = {
  lifecycle?: StudentLifecycleKpiDTO;
  isLoading: boolean;
};

export type LevelPyramidCardProps = {
  levelDistribution?: LevelDistributionItem[];
  enrolledHeadcount?: number;
  isLoading: boolean;
};

export type DemographicsCardProps = {
  lifecycle?: StudentLifecycleKpiDTO;
  isLoading: boolean;
};

export type TerminalStatsCardProps = {
  lifecycle?: StudentLifecycleKpiDTO;
  isLoading: boolean;
};

export type AcademicFootprintCardProps = {
  structure?: AcademicStructureKpiDTO;
  isLoading: boolean;
};

export type IntakeAlertBannerProps = {
  noTransitionCount: number;
  onNavigateToTransitions: () => void;
};
