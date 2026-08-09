import { appPaths } from "@/app/routing/app-path";
import type { SetupStepDefinition, SetupStepId } from "../types/setup";

const settingsLevelRoute = `${appPaths.settings}?tab=level-config`;
const settingsSystemConfigRoute = `${appPaths.settings}?tab=system-config`;
const settingsCurriculumRoute = `${appPaths.settings}?tab=curriculum-versions`;

const settingsTransitionStatusRoute = `${appPaths.settings}?tab=student-transition-status`;

export const SETUP_STEP_ORDER: SetupStepId[] = [
  "signedIn",
  "department",
  "systemConfig",
  "level",
  "program",
  "curriculumVersion",
  "course",
  "staff",
  "transitionStatusDefault",
  "student",
  "admissionConfig",
  "admissionCandidate",
  "courseRegistration",
  "assessment",
  "gradingConfig",
  "billing",
];

export const PHASE1_CHECKLIST_STEP_IDS: SetupStepId[] = [
  "signedIn",
  "department",
  "systemConfig",
  "level",
  "program",
  "curriculumVersion",
  "course",
];

export const PHASE2_CHECKLIST_STEP_IDS: SetupStepId[] = [
  "transitionStatusDefault",
  "admissionConfig",
  "admissionCandidate",
  "courseRegistration",
  "assessment",
  "gradingConfig",
  "billing",
];

export const SETUP_STEP_DEFINITIONS: Record<SetupStepId, SetupStepDefinition> = {
  signedIn: {
    id: "signedIn",
    phase: 1,
    prerequisites: [],
    route: appPaths.dashboard,
    checklistVisible: true,
  },
  department: {
    id: "department",
    phase: 1,
    prerequisites: [],
    route: appPaths.academicStructure,
    menuPath: appPaths.academicStructure,
    checklistVisible: true,
  },
  systemConfig: {
    id: "systemConfig",
    phase: 1,
    prerequisites: ["program"],
    route: settingsSystemConfigRoute,
    menuPath: appPaths.settings,
    checklistVisible: true,
  },
  level: {
    id: "level",
    phase: 1,
    prerequisites: ["department"],
    route: settingsLevelRoute,
    menuPath: appPaths.settings,
    checklistVisible: true,
  },
  program: {
    id: "program",
    phase: 1,
    prerequisites: ["department"],
    route: appPaths.program,
    menuPath: appPaths.program,
    checklistVisible: true,
  },
  curriculumVersion: {
    id: "curriculumVersion",
    phase: 1,
    prerequisites: ["program"],
    route: settingsCurriculumRoute,
    menuPath: appPaths.settings,
    checklistVisible: true,
  },
  course: {
    id: "course",
    phase: 1,
    prerequisites: ["program", "curriculumVersion"],
    route: appPaths.courses,
    menuPath: appPaths.courses,
    checklistVisible: true,
  },
  staff: {
    id: "staff",
    phase: 2,
    prerequisites: ["department"],
    route: appPaths.staff,
    menuPath: appPaths.staff,
    checklistVisible: false,
  },
  transitionStatusDefault: {
    id: "transitionStatusDefault",
    phase: 2,
    prerequisites: [],
    route: settingsTransitionStatusRoute,
    menuPath: appPaths.settings,
    checklistVisible: true,
  },
  student: {
    id: "student",
    phase: 2,
    prerequisites: ["program", "level", "curriculumVersion", "transitionStatusDefault"],
    route: appPaths.students,
    menuPath: appPaths.students,
    checklistVisible: false,
  },
  admissionConfig: {
    id: "admissionConfig",
    phase: 2,
    prerequisites: ["program"],
    route: appPaths.admissionConfig,
    menuPath: appPaths.admissionConfig,
    checklistVisible: true,
  },
  admissionCandidate: {
    id: "admissionCandidate",
    phase: 2,
    prerequisites: ["admissionConfig", "transitionStatusDefault"],
    route: appPaths.admissionCandidates,
    menuPath: appPaths.admissionCandidates,
    checklistVisible: true,
  },
  courseRegistration: {
    id: "courseRegistration",
    phase: 2,
    prerequisites: ["student", "course"],
    route: appPaths.courseRegistration,
    menuPath: appPaths.courseRegistration,
    checklistVisible: true,
  },
  assessment: {
    id: "assessment",
    phase: 2,
    prerequisites: ["course", "program", "level"],
    route: appPaths.assessment,
    menuPath: appPaths.assessment,
    checklistVisible: true,
  },
  gradingConfig: {
    id: "gradingConfig",
    phase: 2,
    prerequisites: ["course"],
    route: appPaths.gradingConfig,
    menuPath: appPaths.gradingConfig,
    checklistVisible: true,
  },
  billing: {
    id: "billing",
    phase: 2,
    prerequisites: ["course"],
    route: appPaths.billing,
    menuPath: appPaths.billing,
    checklistVisible: true,
  },
  settings: {
    id: "settings",
    phase: 1,
    prerequisites: ["department"],
    route: appPaths.settings,
    menuPath: appPaths.settings,
    checklistVisible: false,
  },
};

/** Steps shown on the onboarding checklist (excludes staff, student, settings, etc.) */
export function getOnboardingChecklistStepIds(
  isPhase1Complete: boolean,
): SetupStepId[] {
  const phaseIds = isPhase1Complete
    ? PHASE2_CHECKLIST_STEP_IDS
    : PHASE1_CHECKLIST_STEP_IDS.filter((id) => id !== "signedIn");
  return phaseIds.filter((id) => SETUP_STEP_DEFINITIONS[id].checklistVisible);
}

export function getAllOnboardingChecklistStepIds(): SetupStepId[] {
  return [
    ...PHASE1_CHECKLIST_STEP_IDS.filter((id) => id !== "signedIn"),
    ...PHASE2_CHECKLIST_STEP_IDS,
  ].filter((id) => SETUP_STEP_DEFINITIONS[id].checklistVisible);
}

export const PATH_TO_SETUP_STEP: Record<string, SetupStepId> = {
  [appPaths.academicStructure]: "department",
  [appPaths.program]: "program",
  [appPaths.courses]: "course",
  [appPaths.staff]: "staff",
  [appPaths.students]: "student",
  [appPaths.admissionConfig]: "admissionConfig",
  [appPaths.admissionCandidates]: "admissionCandidate",
  [appPaths.courseRegistration]: "courseRegistration",
  [appPaths.assessment]: "assessment",
  [appPaths.gradingConfig]: "gradingConfig",
  [appPaths.billing]: "billing",
  [appPaths.settings]: "settings",
};
