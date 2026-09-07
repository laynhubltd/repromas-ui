// 1. Action type constants
export const DashboardFilterActionType = {
  SetSession: "SET_SESSION",
  SetFaculty: "SET_FACULTY",
  SetDepartment: "SET_DEPARTMENT",
  SetProgram: "SET_PROGRAM",
  SetLevel: "SET_LEVEL",
  Reset: "RESET",
} as const;

// 2. State shape
export type DashboardFilterState = {
  sessionId?: number;
  facultyId?: number;
  departmentId?: number;
  programId?: number;
  levelId?: number;
};

// 3. Action union
export type DashboardFilterAction =
  | {
      type: typeof DashboardFilterActionType.SetSession;
      sessionId?: number;
    }
  | {
      type: typeof DashboardFilterActionType.SetFaculty;
      facultyId?: number;
    }
  | {
      type: typeof DashboardFilterActionType.SetDepartment;
      departmentId?: number;
    }
  | {
      type: typeof DashboardFilterActionType.SetProgram;
      programId?: number;
    }
  | {
      type: typeof DashboardFilterActionType.SetLevel;
      levelId?: number;
    }
  | { type: typeof DashboardFilterActionType.Reset };

// 4. Initial state
export const initialDashboardFilterState: DashboardFilterState = {
  sessionId: undefined,
  facultyId: undefined,
  departmentId: undefined,
  programId: undefined,
  levelId: undefined,
};

// 5. Pure reducer with cascading resets
export function dashboardFilterReducer(
  state: DashboardFilterState,
  action: DashboardFilterAction
): DashboardFilterState {
  switch (action.type) {
    case DashboardFilterActionType.SetSession:
      return { ...state, sessionId: action.sessionId };

    case DashboardFilterActionType.SetFaculty:
      // Cascading reset: changing faculty invalidates selected department & program
      return {
        ...state,
        facultyId: action.facultyId,
        departmentId: undefined,
        programId: undefined,
      };

    case DashboardFilterActionType.SetDepartment:
      // Cascading reset: changing department invalidates selected program
      return {
        ...state,
        departmentId: action.departmentId,
        programId: undefined,
      };

    case DashboardFilterActionType.SetProgram:
      return {
        ...state,
        programId: action.programId,
      };

    case DashboardFilterActionType.SetLevel:
      return {
        ...state,
        levelId: action.levelId,
      };

    case DashboardFilterActionType.Reset:
      return initialDashboardFilterState;
  }
}
