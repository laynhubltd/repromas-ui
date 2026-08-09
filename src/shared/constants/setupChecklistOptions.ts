import type { SetupStepId } from "@/features/tenant-setup/types/setup";

export const SETUP_CHECKLIST_TITLE = "Set up your institution";
export const SETUP_CHECKLIST_SUBTITLE =
  "Complete these steps to unlock the rest of the platform.";
export const SETUP_CHECKLIST_PHASE2_TITLE = "Continue setup";
export const SETUP_CHECKLIST_PHASE2_SUBTITLE =
  "Your academic foundation is ready. Configure people and operations next.";
export const SETUP_CHECKLIST_CTA_LABEL = "Continue setup";
export const SETUP_CHECKLIST_LAUNCHER_LABEL = "Setup guide";
export const SETUP_CHECKLIST_PHASE1_COMPLETE_MESSAGE =
  "Academic foundation complete. You can now manage students and daily operations.";

export const SETUP_STEP_LABELS: Record<SetupStepId, string> = {
  signedIn: "Signed in",
  department: "Faculty & Departments",
  level: "Levels",
  program: "Program",
  curriculumVersion: "Curriculum Version",
  course: "Courses",
  staff: "Staff",
  transitionStatusDefault: "Default Transition Status",
  student: "Students",
  admissionConfig: "Admission Config",
  admissionCandidate: "Admission Candidates",
  courseRegistration: "Course Registration",
  assessment: "Assessment",
  gradingConfig: "Grading Config",
  billing: "Billing",
  settings: "Settings",
  systemConfig: "System Configuration"
};

export const SETUP_STEP_DESCRIPTIONS: Record<SetupStepId, string> = {
  signedIn: "Your account is ready.",
  department: "Create at least one department under a faculty.",
  level: "Define academic levels (e.g. 100 Level, 200 Level).",
  program: "Add an academic program linked to a department.",
  curriculumVersion: "Create a curriculum version for your programs.",
  course: "Add courses offered by your departments.",
  staff: "Register academic staff members.",
  transitionStatusDefault: "Create a transition status and mark one as default for new student enrollment.",
  student: "Enroll students into programs and levels.",
  admissionConfig: "Configure admission rules for your programs.",
  admissionCandidate: "Manage candidate applications.",
  courseRegistration: "Register students for semester courses.",
  assessment: "Load score sheets and enter student grades.",
  gradingConfig: "Configure grading schemas and evaluation rules.",
  billing: "Set up fee events, policies, and pricing.",
  settings: "Configure levels, curriculum, and system options.",
  systemConfig: "Configure system settings."
};

export const SETUP_STEP_TOOLTIP_BLOCKED: Record<SetupStepId, string> = {
  signedIn: "",
  department: "Start here — no prerequisites.",
  level: "Add a department first.",
  program: "Add a department first.",
  curriculumVersion: "Add a program first.",
  course: "Add a program and curriculum version first.",
  staff: "Add a department first.",
  transitionStatusDefault: "Configure the default status students receive on enrollment.",
  student: "Add a program, level, curriculum version, and default transition status first.",
  admissionConfig: "Add a program first.",
  admissionCandidate: "Configure admission settings and a default transition status first.",
  courseRegistration: "Add students and courses first.",
  assessment: "Add programs, levels, and courses first.",
  gradingConfig: "Complete the academic foundation first.",
  billing: "Complete the academic foundation first.",
  settings: "Add a department first.",
  systemConfig: "Add a department first."
};
