import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WorkflowTransitionDto } from "../types/approval-workflow";
import { useWorkflowTransitions } from "./useWorkflowTransitions";

const mockExecuteTransition = vi.fn();

vi.mock("../api/approvalWorkflowApi", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/approvalWorkflowApi")>();
  return {
    ...actual,
    useExecuteTransitionMutation: () => [
      mockExecuteTransition,
      { isLoading: false },
    ],
    useGetAvailableTransitionsQuery: () => ({
      data: {
        isLocked: false,
        isTerminal: false,
        transitions: [
          {
            id: 1,
            transitionId: 1,
            name: "SUBMIT",
            actionName: "Submit for Approval",
            fromState: "DRAFT",
            toState: "SUBMITTED",
            direction: "FORWARD",
            requiresComment: false,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    }),
  };
});

function makeWrapper() {
  const store = configureStore({
    reducer: { _dummy: (state = {}) => state },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store, children });
}

describe("useWorkflowTransitions — Submission Gating Modal & Precondition Parsing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles structured 422 SCORE_SHEET_INCOMPLETE error with details.unassessed", async () => {
    const error422 = {
      status: 422,
      data: {
        code: "SCORE_SHEET_INCOMPLETE",
        message: "Course score sheet batch is incomplete",
        details: {
          total: 2,
          unassessed: [
            {
              regNo: "MAT001",
              name: "Student One",
              reason: "NO_SCORES",
            },
            {
              regNo: "MAT002",
              fullName: "Student Two",
              reason: "INCOMPLETE_SCORES",
            },
          ],
        },
      },
    };

    mockExecuteTransition.mockReturnValue({
      unwrap: () => Promise.reject(error422),
    });

    const { result } = renderHook(
      () =>
        useWorkflowTransitions({
          targetEntity: "COURSE_SCORE_SHEET",
          targetId: 100,
        }),
      { wrapper: makeWrapper() },
    );

    const transition: WorkflowTransitionDto = {
      id: 1,
      transitionId: 1,
      name: "SUBMIT",
      actionName: "Submit for Approval",
      fromState: "DRAFT",
      toState: "SUBMITTED",
      direction: "FORWARD",
      requiresComment: false,
    };

    await act(async () => {
      result.current.actions.handleInitiateTransition(transition);
    });

    expect(result.current.state.isGatingModalOpen).toBe(true);
    expect(result.current.state.gatingStudents).toHaveLength(2);
    expect(result.current.state.gatingStudents[0]).toEqual({
      matricNumber: "MAT001",
      studentName: "Student One",
      reason: "No scores recorded",
    });
    expect(result.current.state.gatingStudents[1]).toEqual({
      matricNumber: "MAT002",
      studentName: "Student Two",
      reason: "Incomplete component scores",
    });
  });

  it("handles 20-student unassessed payload without truncation", async () => {
    const unassessed = Array.from({ length: 20 }, (_, i) => ({
      regNo: `MAT${100 + i}`,
      name: `Student ${i + 1}`,
      reason: "NO_SCORES",
    }));

    const error422 = {
      status: 422,
      data: {
        code: "SCORE_SHEET_INCOMPLETE",
        details: {
          total: 20,
          unassessed,
        },
      },
    };

    mockExecuteTransition.mockReturnValue({
      unwrap: () => Promise.reject(error422),
    });

    const { result } = renderHook(
      () =>
        useWorkflowTransitions({
          targetEntity: "COURSE_SCORE_SHEET",
          targetId: 100,
        }),
      { wrapper: makeWrapper() },
    );

    await act(async () => {
      result.current.actions.handleInitiateTransition({
        id: 1,
        transitionId: 1,
        name: "SUBMIT",
        actionName: "Submit for Approval",
        fromState: "DRAFT",
        toState: "SUBMITTED",
        direction: "FORWARD",
        requiresComment: false,
      });
    });

    expect(result.current.state.isGatingModalOpen).toBe(true);
    expect(result.current.state.gatingStudents).toHaveLength(20);
  });
});
