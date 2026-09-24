import { appPaths } from "@/app/routing/app-path";
import { Permission } from "./permissions";
import type { PermissionRequirement } from "./types";

export const routePrivilegeMatrix: Record<string, PermissionRequirement> = {
  // 1. Dashboard (Open to all authenticated users)
  [appPaths.dashboard]: [],

  // 2. Main Navigation (All 11 routes explicitly defined)
  [appPaths.staff]: [Permission.StaffList, Permission.StaffManage],
  [appPaths.students]: [Permission.StudentsList, Permission.StudentsManage],
  [appPaths.admissionCandidates]: [
    Permission.AdmissionCandidatesList,
    Permission.AdmissionCandidatesManage,
    Permission.AdmissionScreeningsList,
  ],
  [appPaths.academicStructure]: [
    Permission.FacultiesList,
    Permission.DepartmentsList,
    Permission.ProgramsList,
  ],
  [appPaths.program]: [Permission.ProgramsList, Permission.ProgramsManage],
  [appPaths.courses]: [Permission.CoursesList, Permission.CoursesManage],
  [appPaths.courseRegistration]: [
    Permission.StudentCourseRegistrationsList,
    Permission.StudentCourseRegistrationsRead,
    Permission.StudentCourseRegistrationsManage,
    Permission.CourseRegistrationFactoryList,
  ],
  [appPaths.assessment]: [
    Permission.StudentScoreSheetsList,
    Permission.StudentScoreSheetList,
    Permission.AssessmentList,
    Permission.AssessmentRead,
  ],
  [appPaths.resultBroadsheet]: [
    Permission.ResultBroadsheetRead,
    Permission.ResultRead,
    Permission.ResultManage,
  ],
  [appPaths.studentTransitions]: [
    Permission.StudentEnrollmentTransitionsList,
    Permission.StudentEnrollmentTransitionsManage,
    Permission.BulkEnrollmentTransitionsList,
  ],
  [appPaths.billing]: [
    Permission.BillingBillableEventsList,
    Permission.BillingBillableEventPoliciesList,
    Permission.BillingFeeItemsList,
    Permission.BillingPricingRulesList,
    Permission.TenantPaymentGatewayConfigsList,
    Permission.BillingFeeChargesList,
    Permission.BillingInvoicesList,
    Permission.BillingPaymentsList,
    Permission.BillingPaymentTransactionsList,
  ],

  // 3. Bottom Navigation (3 configuration containers)
  [appPaths.gradingConfig]: [
    Permission.GradingSchemaConfigsList,
    Permission.GradingList,
    Permission.AcademicStandingsList,
    Permission.AcademicStandingBoundariesList,
    Permission.AcademicStandingDegreeClassificationsList,
    Permission.AcademicStandingEscalationStepsList,
    Permission.ScoreEvaluationStatusesList,
  ],
  [appPaths.admissionConfig]: [
    Permission.AdmissionCyclesList,
    Permission.ProgramAdmissionConfigsList,
    Permission.OlevelSubjectsList,
    Permission.JambCombinationGroupsList,
    Permission.AdmissionDocumentTypesList,
    Permission.PriorQualificationTypesList,
    Permission.PostUtmeScoresList,
    Permission.DynamicFormsList,
    Permission.AdmissionGeographyRulesList,
    Permission.MatricNumberFormatsList,
    Permission.OlevelGradePointsList,
    Permission.ProgramOlevelRequirementsList,
    Permission.ProgramPriorQualificationRequirementsList,
  ],
  [appPaths.settings]: [
    Permission.SystemConfigsList,
    Permission.RolesList,
    Permission.UsersList,
    Permission.AcademicSessionsList,
    Permission.LevelsList,
    Permission.CurriculumVersionsList,
    Permission.WorkflowDefinitionsList,
    Permission.StudentTransitionStatusesList,
    Permission.SystemTimeFramesList,
  ],
};
