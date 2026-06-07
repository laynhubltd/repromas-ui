export type SetupStepId =
  | "signedIn"
  | "department"
  | "level"
  | "program"
  | "curriculumVersion"
  | "course"
  | "staff"
  | "student"
  | "admissionConfig"
  | "admissionCandidate"
  | "courseRegistration"
  | "assessment"
  | "gradingConfig"
  | "billing"
  | "settings";

export type SetupPhase = 1 | 2;

export type SetupProbeCounts = {
  departments: number;
  levels: number;
  programs: number;
  curriculumVersions: number;
  courses: number;
  staff: number;
  students: number;
  admissionConfigs: number;
  admissionCandidates: number;
};

export type SetupStepDefinition = {
  id: SetupStepId;
  phase: SetupPhase;
  prerequisites: SetupStepId[];
  route: string;
  menuPath?: string;
  checklistVisible: boolean;
};

export type SetupStepState = {
  id: SetupStepId;
  complete: boolean;
  accessible: boolean;
  active: boolean;
};

export type SetupEvaluation = {
  steps: Record<SetupStepId, SetupStepState>;
  currentStepId: SetupStepId;
  phase1StepIds: SetupStepId[];
  phase2StepIds: SetupStepId[];
  phase1CompletedCount: number;
  phase1TotalCount: number;
  phase1ProgressPercent: number;
  isPhase1Complete: boolean;
  isSetupComplete: boolean;
  remainingStepCount: number;
};
