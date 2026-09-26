import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ScoreSheetRow } from "../types/score-sheet";
import { useScoreRow } from "./useScoreRow";

const {
  mockUpsertStudentScoreSheet,
  mockAssignEvaluationStatus,
  mockClearEvaluationStatus,
  mockNotificationSuccess,
  mockNotificationDestroy,
} = vi.hoisted(() => ({
  mockUpsertStudentScoreSheet: vi.fn(),
  mockAssignEvaluationStatus: vi.fn(),
  mockClearEvaluationStatus: vi.fn(),
  mockNotificationSuccess: vi.fn(),
  mockNotificationDestroy: vi.fn(),
}));

vi.mock("../api/scoreSheetApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/scoreSheetApi")>();
  return {
    ...actual,
    useUpsertStudentScoreSheetMutation: () => [
      mockUpsertStudentScoreSheet,
      { isLoading: false },
    ],
    useAssignEvaluationStatusMutation: () => [
      mockAssignEvaluationStatus,
      { isLoading: false },
    ],
    useClearEvaluationStatusMutation: () => [
      mockClearEvaluationStatus,
      { isLoading: false },
    ],
  };
});

vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();
  return {
    ...actual,
    notification: {
      success: mockNotificationSuccess,
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
      destroy: mockNotificationDestroy,
    },
  };
});

function makeRow(overrides: Partial<ScoreSheetRow> = {}): ScoreSheetRow {
  return {
    registrationId: overrides.registrationId ?? 101,
    configId: 42,
    regNo: "REG001",
    fullName: "Ada Lovelace",
    scores: overrides.scores ?? { ca: 25.0, exam: 50.0 },
    totalScore: 75.0,
    grade: "A",
    gradePoint: 5.0,
    isPass: true,
    displayGrade: "A",
    id: overrides.id !== undefined ? overrides.id : 1001,
    wasVetoed: false,
    vetoReason: null,
    evaluationStatuses: [
      {
        id: 1,
        name: "Normal",
        code: "NORMAL",
        isStandardGraded: true,
        computesInGpa: true,
        earnsCredit: true,
        requiresRetake: false,
        isDefault: true,
      },
      {
        id: 2,
        name: "Absent",
        code: "ABS",
        isStandardGraded: false,
        computesInGpa: false,
        earnsCredit: false,
        requiresRetake: true,
        isDefault: false,
      },
    ],
    ...overrides,
  };
}

function makeWrapper() {
  const store = configureStore({
    reducer: { _dummy: (state = {}) => state },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store, children });
}

describe("useScoreRow — Direct Score Sheet Creation & Entry (Upsert Flow)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsertStudentScoreSheet.mockReturnValue({
      unwrap: () => Promise.resolve({ id: 9999 }),
    });
    mockAssignEvaluationStatus.mockReturnValue({
      unwrap: () => Promise.resolve({ id: 9999 }),
    });
    mockClearEvaluationStatus.mockReturnValue({
      unwrap: () => Promise.resolve({ id: 9999 }),
    });
  });

  it("assigns evaluation status on unpersisted row (id === null) via single-shot upsert with evaluationStatusId", async () => {
    const row = makeRow({ id: null });
    const { result } = renderHook(() => useScoreRow(row), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.actions.handleAssignEvalStatus(2); // ABS
    });

    // Exactly one upsert mutation called with evaluationStatusId
    expect(mockUpsertStudentScoreSheet).toHaveBeenCalledTimes(1);
    expect(mockUpsertStudentScoreSheet).toHaveBeenCalledWith({
      registrationId: 101,
      componentScores: { ca: 25.0, exam: 50.0 },
      evaluationStatusId: 2,
      courseConfigId: 42,
    });

    // assignEvaluationStatus PATCH mutation must NOT be called for unpersisted row
    expect(mockAssignEvaluationStatus).not.toHaveBeenCalled();
  });

  it("assigns evaluation status on persisted row (id !== null) via PATCH mutation", async () => {
    const row = makeRow({ id: 1001 });
    const { result } = renderHook(() => useScoreRow(row), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.actions.handleAssignEvalStatus(2); // ABS
    });

    // Exactly one PATCH call
    expect(mockAssignEvaluationStatus).toHaveBeenCalledTimes(1);
    expect(mockAssignEvaluationStatus).toHaveBeenCalledWith({
      scoreSheetId: 1001,
      evaluationStatusId: 2,
      courseConfigId: 42,
    });
    expect(mockUpsertStudentScoreSheet).not.toHaveBeenCalled();
  });

  it("routine score save passes courseConfigId and componentScores (BC1 freshness)", async () => {
    const row = makeRow({ id: 1001, scores: { ca: 20.0, exam: 40.0 } });
    const { result } = renderHook(() => useScoreRow(row), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.actions.handleScoreChange("ca", 28.0);
    });

    await act(async () => {
      await result.current.actions.handleScoreSave("ca");
    });

    expect(mockUpsertStudentScoreSheet).toHaveBeenCalledWith({
      registrationId: 101,
      componentScores: { ca: 28.0, exam: 40.0 },
      courseConfigId: 42,
    });
  });

  it("serializes rapid cell saves on an unpersisted row through queue", async () => {
    const row = makeRow({ id: null, scores: { ca: null, exam: null } });
    const { result } = renderHook(() => useScoreRow(row), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.actions.handleScoreChange("ca", 15.0);
      result.current.actions.handleScoreChange("exam", 60.0);
    });

    // Fire two saves concurrently
    await act(async () => {
      const p1 = result.current.actions.handleScoreSave("ca");
      const p2 = result.current.actions.handleScoreSave("exam");
      await Promise.all([p1, p2]);
    });

    expect(mockUpsertStudentScoreSheet).toHaveBeenCalledTimes(2);
  });

  it("wipes all scores via Mode 3 ({}) and displays undo toast", async () => {
    const row = makeRow({ id: 1001, scores: { ca: 25.0, exam: 50.0 } });
    const { result } = renderHook(() => useScoreRow(row), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.actions.handleWipeScores();
    });

    // Upsert called with empty componentScores {}
    expect(mockUpsertStudentScoreSheet).toHaveBeenCalledWith({
      registrationId: 101,
      componentScores: {},
      courseConfigId: 42,
    });

    // Toast emitted with Undo action button
    expect(mockNotificationSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Scores Cleared",
      }),
    );
  });
});
