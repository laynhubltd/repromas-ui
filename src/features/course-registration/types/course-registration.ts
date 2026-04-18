// ─── Course Registration Factory API Types ────────────────────────────────────

export type CourseItem = {
  configId: number;
  courseCode: string;
  courseTitle: string;
  creditUnits: number;
  isMandatory: boolean;
};

export type CreditLimits = {
  /** Minimum total credit units the student must register. Always 0 or greater. */
  min: number;
  /** Maximum total credit units. -1 means no upper limit applies. */
  max: number;
};

export type StudentContext = {
  id: number;
  currentLevel: string;
  activeSemesterId: number;
  activeSessionId: number;
  semesterTypeId: number;
  resolvedSemesterId: number;
  isLateWindow: boolean;
  totalUnitsRegistered: number;
  creditLimits: CreditLimits;
  /**
   * When true, the student must select all carryover courses before selecting
   * any current-core or elective courses (FORCE_CARRYOVER_FIRST system config).
   */
  forceCarryoverFirst?: boolean;
};

export type CoursePool = {
  registered: CourseItem[];
  carryovers: CourseItem[];
  arrears: CourseItem[];
  currentCore: CourseItem[];
  electives: CourseItem[];
};

export type CourseRegistrationPoolResponse = {
  student: StudentContext;
  courses: CoursePool;
};

export type CourseRegistrationSubmitRequest = {
  configIds: number[];
};

export type CourseRegistrationSubmitResponse = {
  registrationIds: number[];
};

// ─── Semester Types ───────────────────────────────────────────────────────────

export type SemesterType = {
  id: number;
  name: string;
  code: string;
  sortOrder: number;
};

export type SemesterTypesResponse = {
  member: SemesterType[];
  totalItems: number;
};

// ─── UI State Types ───────────────────────────────────────────────────────────

export type CourseSelectionState = {
  selectedCourseIds: number[];
  totalCredits: number;
  mandatoryCoursesSelected: boolean;
  isWithinLimits: boolean;
};

/** Scope of the currently authenticated user. */
export type UserScope = "admin" | "staff" | "student";

/**
 * Structured validation errors exposed by useRegistrationInterface.
 * Each field is null when there is no violation.
 */
export type ValidationErrors = {
  /** configIds of mandatory courses that are not yet selected (client-side). */
  missingMandatoryCourseIds: number[];
  /** Human-readable message when the credit selection is out of range, or null. */
  creditLimitViolation: string | null;
  /**
   * Human-readable message when FORCE_CARRYOVER_FIRST is enabled and the
   * student has selected current-core or elective courses before all carryovers,
   * or null when the rule is satisfied.
   */
  forceCarryoverFirstViolation: string | null;
  /**
   * configIds of mandatory courses that the server reported as missing in the
   * last failed submission (422 missingConfigIds). Used to highlight courses
   * that the server rejected even when client-side validation passed.
   * Empty array when no server-side missing-course error has occurred.
   */
  serverMissingConfigIds: number[];
};

/**
 * Structured error state for the registration interface.
 * Separates the error message from recovery guidance and error classification.
 */
export type RegistrationErrorState = {
  /** User-facing error message. null when no error. */
  message: string | null;
  /**
   * Recovery guidance to display below the error message.
   * null when no specific guidance is available.
   */
  recoveryGuidance: string | null;
  /**
   * Whether the error is an eligibility error (403).
   * When true, the ineligibility alert is shown instead of the generic error alert.
   */
  isEligibilityError: boolean;
  /**
   * Whether the error is a stale-data error that can be resolved by
   * re-fetching the course pool.
   */
  isStaleDataError: boolean;
  /**
   * Whether the error is a concurrent-submission conflict (409).
   */
  isConflictError: boolean;
};
