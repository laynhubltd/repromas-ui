import { describe, expect, it } from "vitest";
import {
  DashboardFilterActionType,
  dashboardFilterReducer,
  initialDashboardFilterState,
  type DashboardFilterState,
} from "./dashboardFilterState";

describe("dashboardFilterReducer", () => {
  it("sets session correctly", () => {
    const nextState = dashboardFilterReducer(initialDashboardFilterState, {
      type: DashboardFilterActionType.SetSession,
      sessionId: 14,
    });
    expect(nextState.sessionId).toBe(14);
  });

  it("cascades reset of department and program when faculty changes", () => {
    const filledState: DashboardFilterState = {
      sessionId: 14,
      facultyId: 1,
      departmentId: 5,
      programId: 12,
      levelId: 2,
    };

    const nextState = dashboardFilterReducer(filledState, {
      type: DashboardFilterActionType.SetFaculty,
      facultyId: 2,
    });

    expect(nextState.facultyId).toBe(2);
    expect(nextState.departmentId).toBeUndefined();
    expect(nextState.programId).toBeUndefined();
    // Non-cascaded fields remain intact
    expect(nextState.sessionId).toBe(14);
    expect(nextState.levelId).toBe(2);
  });

  it("cascades reset of program when department changes", () => {
    const filledState: DashboardFilterState = {
      sessionId: 14,
      facultyId: 1,
      departmentId: 5,
      programId: 12,
      levelId: 2,
    };

    const nextState = dashboardFilterReducer(filledState, {
      type: DashboardFilterActionType.SetDepartment,
      departmentId: 8,
    });

    expect(nextState.departmentId).toBe(8);
    expect(nextState.programId).toBeUndefined();
    expect(nextState.facultyId).toBe(1);
    expect(nextState.sessionId).toBe(14);
  });

  it("sets program and level without cascading resets", () => {
    let state = dashboardFilterReducer(initialDashboardFilterState, {
      type: DashboardFilterActionType.SetProgram,
      programId: 10,
    });
    expect(state.programId).toBe(10);

    state = dashboardFilterReducer(state, {
      type: DashboardFilterActionType.SetLevel,
      levelId: 3,
    });
    expect(state.levelId).toBe(3);
  });

  it("resets all filters back to initial state on Reset action", () => {
    const filledState: DashboardFilterState = {
      sessionId: 14,
      facultyId: 1,
      departmentId: 5,
      programId: 12,
      levelId: 2,
    };

    const nextState = dashboardFilterReducer(filledState, {
      type: DashboardFilterActionType.Reset,
    });

    expect(nextState).toEqual(initialDashboardFilterState);
  });
});
