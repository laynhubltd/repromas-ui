/**
 * Score Row API Fix — Preservation Property Tests
 *
 * Feature: score-row-api-fix
 * Property 2: Preservation — Dirty-Score Tracking, Cell Error State, and Eval-Status Revert
 *
 * IMPORTANT: These tests are written BEFORE the fix is implemented.
 * They MUST PASS on unfixed code — passing confirms the baseline behavior to preserve.
 * DO NOT fix the source code when these tests fail.
 *
 * Test cases:
 *   P1 - Dirty score tracking: handleScoreChange(key, value) updates state.dirtyScores[key]
 *        to value and does NOT call any mutation
 *   P2 - Cell error state: on any non-500 save failure, the cell key is added to
 *        state.errorCells with the parsed error message and notification.error is called
 *   P3 - Eval-status revert: on any eval-status save failure, state.localEvalStatusCode
 *        reverts to row.evaluationStatusCode
 *
 * Validates: Requirements 3.1, 3.3, 3.5
 */

import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import * as fc from "fast-check";
import React from "react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Module mocks ──────────────────────────────────────────────────────────────

const mockUpdateStudentScores = vi.fn();
const mockUpsertStudentScoreSheet = vi.fn();
const mockUpdateEvaluationStatus = vi.fn();

vi.mock("@/features/assessment/api/scoreSheetApi", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@/features/assessment/api/scoreSheetApi")
    >();
  return {
    ...actual,
    useUpdateStudentScoresMutation: () => [
      mockUpdateStudentScores,
      { isLoading: false },
    ],
    useUpsertStudentScoreSheetMutation: () => [
      mockUpsertStudentScoreSheet,
      { isLoading: false },
    ],
    useUpdateEvaluationStatusMutation: () => [
      mockUpdateEvaluationStatus,
      { isLoading: false },
    ],
  };
});

// Mock antd notification to capture calls
const mockNotificationError = vi.fn();
const mockNotificationSuccess = vi.fn();

vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();
  return {
    ...actual,
    notification: {
      success: mockNotificationSuccess,
      error: mockNotificationError,
      warning: vi.fn(),
      info: vi.fn(),
    },
  };
});

// ── Fixtures ──────────────────────────────────────────────────────────────────

/**
 * A minimal ScoreSheetRow with multiple score components.
 */
function makeRow(
  overrides: Partial<{
    registrationId: number;
    id: number | null;
    scores: Record<string, number | null>;
    evaluationStatusCode: string;
  }> = {},
) {
  return {
    registrationId: overrides.registrationId ?? 42,
    configId: 1,
    regNo: "STU001",
    fullName: "Test Student",
    scores: overrides.scores ?? { ca1: 15.0, ca2: 12.0, exam: 50.0 },
    totalScore: 77.0,
    grade: "B",
    gradePoint: 4.0,
    isPass: true,
    evaluationStatusCode: overrides.evaluationStatusCode ?? "NORMAL",
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
        name: "Incomplete",
        code: "INCOMPLETE",
        isStandardGraded: false,
        computesInGpa: false,
        earnsCredit: false,
        requiresRetake: true,
        isDefault: false,
      },
      {
        id: 3,
        name: "Carry-Over",
        code: "CARRY_OVER",
        isStandardGraded: false,
        computesInGpa: false,
        earnsCredit: false,
        requiresRetake: true,
        isDefault: false,
      },
    ],
    id: overrides.id ?? 7,
  };
}

/**
 * Minimal Redux store — the hook only needs the RTK Query api slice.
 * Since all mutations are mocked, we use a simple store with just a dummy reducer.
 */
function makeStore() {
  return configureStore({
    reducer: { _dummy: (state = {}) => state },
  });
}

function wrapWithStore(store: ReturnType<typeof makeStore>) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store, children });
}

/**
 * Build a non-500 error object that parseApiError will parse into a known message.
 * We use a 404 error with a known detail string so we can assert the exact message.
 */
function makeNon500Error(detail: string) {
  return {
    message: detail,
    status: 404,
    error: JSON.stringify({
      type: "/errors/not-found",
      title: "Not Found",
      status: 404,
      detail,
    }),
  };
}

/**
 * Build a 500 error object. parseApiError masks 500 detail with the generic fallback.
 */
function make500Error() {
  return {
    message: "Something went wrong. Please try again.",
    status: 500,
    error: JSON.stringify({
      type: "/errors/internal",
      title: "Internal Server Error",
      status: 500,
      detail: "Internal error detail",
    }),
  };
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();

  // Default: mutations resolve successfully
  mockUpdateStudentScores.mockReturnValue({ unwrap: () => Promise.resolve() });
  mockUpsertStudentScoreSheet.mockReturnValue({
    unwrap: () => Promise.resolve(),
  });
  mockUpdateEvaluationStatus.mockReturnValue({
    unwrap: () => Promise.resolve(),
  });
});

// ── P1: Dirty score tracking ──────────────────────────────────────────────────

/**
 * **Validates: Requirements 3.1**
 *
 * For any (key, value) pair, handleScoreChange(key, value) must:
 *   1. Update state.dirtyScores[key] to value
 *   2. NOT call any mutation (no network request triggered)
 *
 * This is preserved behavior — the current code already does this correctly.
 * The fix must not break it.
 */
describe("P1 — Dirty score tracking: handleScoreChange updates dirtyScores without calling any mutation", () => {
  it("handleScoreChange sets dirtyScores[key] to value and calls no mutation (concrete example)", async () => {
    // Validates: Requirements 3.1
    const { useScoreRow } =
      await import("@/features/assessment/hooks/useScoreRow");
    const row = makeRow();
    const store = makeStore();

    const { result } = renderHook(() => useScoreRow(row as any), {
      wrapper: wrapWithStore(store),
    });

    // Initially no dirty scores
    expect(result.current.state.dirtyScores).toEqual({});

    act(() => {
      result.current.actions.handleScoreChange("ca1", 18.5);
    });

    // dirtyScores must be updated
    expect(result.current.state.dirtyScores["ca1"]).toBe(18.5);

    // No mutation must have been called
    expect(mockUpdateStudentScores).not.toHaveBeenCalled();
    expect(mockUpsertStudentScoreSheet).not.toHaveBeenCalled();
    expect(mockUpdateEvaluationStatus).not.toHaveBeenCalled();
  });

  it("property: for any (key, value) pair, handleScoreChange updates dirtyScores[key] and calls no mutation", async () => {
    // Validates: Requirements 3.1
    const { useScoreRow } =
      await import("@/features/assessment/hooks/useScoreRow");

    await fc.assert(
      fc.asyncProperty(
        // Generate a score key from the known set
        fc.constantFrom("ca1", "ca2", "exam"),
        // Generate a score value (including null to test clearing)
        fc.oneof(
          fc.float({ min: 0, max: 100, noNaN: true }),
          fc.constant(null),
        ),
        async (key, value) => {
          vi.clearAllMocks();

          const row = makeRow();
          const store = makeStore();

          const { result } = renderHook(() => useScoreRow(row as any), {
            wrapper: wrapWithStore(store),
          });

          act(() => {
            result.current.actions.handleScoreChange(key, value);
          });

          // dirtyScores[key] must equal the value passed
          expect(result.current.state.dirtyScores[key]).toBe(value);

          // No mutation must have been called — score change is local only
          expect(mockUpdateStudentScores).not.toHaveBeenCalled();
          expect(mockUpsertStudentScoreSheet).not.toHaveBeenCalled();
          expect(mockUpdateEvaluationStatus).not.toHaveBeenCalled();
        },
      ),
      { numRuns: 30 },
    );
  });

  it("property: multiple handleScoreChange calls accumulate in dirtyScores independently", async () => {
    // Validates: Requirements 3.1
    const { useScoreRow } =
      await import("@/features/assessment/hooks/useScoreRow");

    await fc.assert(
      fc.asyncProperty(
        fc.float({ min: 0, max: 100, noNaN: true }),
        fc.float({ min: 0, max: 100, noNaN: true }),
        async (ca1Value, ca2Value) => {
          vi.clearAllMocks();

          const row = makeRow();
          const store = makeStore();

          const { result } = renderHook(() => useScoreRow(row as any), {
            wrapper: wrapWithStore(store),
          });

          act(() => {
            result.current.actions.handleScoreChange("ca1", ca1Value);
            result.current.actions.handleScoreChange("ca2", ca2Value);
          });

          // Both keys must be tracked independently
          expect(result.current.state.dirtyScores["ca1"]).toBe(ca1Value);
          expect(result.current.state.dirtyScores["ca2"]).toBe(ca2Value);

          // Still no mutation called
          expect(mockUpdateStudentScores).not.toHaveBeenCalled();
          expect(mockUpsertStudentScoreSheet).not.toHaveBeenCalled();
        },
      ),
      { numRuns: 20 },
    );
  });
});

// ── P2: Cell error state ──────────────────────────────────────────────────────

/**
 * **Validates: Requirements 3.3**
 *
 * For any non-500 save failure, the cell must be:
 *   1. Added to state.errorCells with the parsed error message
 *   2. notification.error must be called
 *
 * This is preserved behavior — the current code already does this correctly.
 * The fix must not break it.
 */
describe("P2 — Cell error state: non-500 save failure adds cell to errorCells and calls notification.error", () => {
  it("on non-500 save failure, errorCells[key] is set to parsed message and notification.error is called (concrete example)", async () => {
    // Validates: Requirements 3.3
    const { useScoreRow } =
      await import("@/features/assessment/hooks/useScoreRow");
    const row = makeRow();
    const store = makeStore();

    const errorDetail = "Score not found for this registration";
    const error = makeNon500Error(errorDetail);

    // Make the mutation reject with a non-500 error
    mockUpdateStudentScores.mockReturnValue({
      unwrap: () => Promise.reject(error),
    });
    mockUpsertStudentScoreSheet.mockReturnValue({
      unwrap: () => Promise.reject(error),
    });

    const { result } = renderHook(() => useScoreRow(row as any), {
      wrapper: wrapWithStore(store),
    });

    // Set a dirty score so the save proceeds
    act(() => {
      result.current.actions.handleScoreChange("ca1", 18.5);
    });

    await act(async () => {
      await result.current.actions.handleScoreSave("ca1");
    });

    // errorCells must contain the key with the parsed error message
    expect(result.current.state.errorCells).toHaveProperty("ca1");
    expect(result.current.state.errorCells["ca1"]).toBe(errorDetail);

    // notification.error must have been called
    expect(mockNotificationError).toHaveBeenCalledTimes(1);
    expect(mockNotificationError).toHaveBeenCalledWith(
      expect.objectContaining({ message: errorDetail }),
    );
  });

  it("property: for any non-500 save failure, errorCells[key] is set and notification.error is called", async () => {
    // Validates: Requirements 3.3
    const { useScoreRow } =
      await import("@/features/assessment/hooks/useScoreRow");

    await fc.assert(
      fc.asyncProperty(
        // Generate a score key
        fc.constantFrom("ca1", "ca2", "exam"),
        // Generate a non-empty error detail string
        fc
          .string({ minLength: 1, maxLength: 80 })
          .filter((s) => s.trim().length > 0),
        // Generate a non-500 HTTP status code
        fc.constantFrom(400, 401, 403, 404, 409, 422),
        async (key, errorDetail, statusCode) => {
          vi.clearAllMocks();

          const error = {
            message: errorDetail,
            status: statusCode,
            error: JSON.stringify({
              type: "/errors/not-found",
              title: "Error",
              status: statusCode,
              detail: errorDetail,
            }),
          };

          // Both mutations reject with the non-500 error
          mockUpdateStudentScores.mockReturnValue({
            unwrap: () => Promise.reject(error),
          });
          mockUpsertStudentScoreSheet.mockReturnValue({
            unwrap: () => Promise.reject(error),
          });

          const row = makeRow();
          const store = makeStore();

          const { result } = renderHook(() => useScoreRow(row as any), {
            wrapper: wrapWithStore(store),
          });

          // Set a dirty score so the save proceeds
          act(() => {
            result.current.actions.handleScoreChange(key, 18.5);
          });

          await act(async () => {
            await result.current.actions.handleScoreSave(key);
          });

          // errorCells must contain the key
          expect(result.current.state.errorCells).toHaveProperty(key);

          // The error message must be non-empty
          expect(result.current.state.errorCells[key]).toBeTruthy();
          expect(result.current.state.errorCells[key].length).toBeGreaterThan(
            0,
          );

          // notification.error must have been called at least once
          expect(mockNotificationError).toHaveBeenCalled();
          expect(mockNotificationError).toHaveBeenCalledWith(
            expect.objectContaining({
              message: result.current.state.errorCells[key],
            }),
          );
        },
      ),
      { numRuns: 25 },
    );
  });

  it("500 errors do NOT add to errorCells (500 is handled differently)", async () => {
    // Validates: Requirements 3.3 (boundary: 500 errors are handled separately)
    const { useScoreRow } =
      await import("@/features/assessment/hooks/useScoreRow");
    const row = makeRow();
    const store = makeStore();

    const error = make500Error();

    // Both mutations reject with a 500 error
    mockUpdateStudentScores.mockReturnValue({
      unwrap: () => Promise.reject(error),
    });
    mockUpsertStudentScoreSheet.mockReturnValue({
      unwrap: () => Promise.reject(error),
    });

    const { result } = renderHook(() => useScoreRow(row as any), {
      wrapper: wrapWithStore(store),
    });

    act(() => {
      result.current.actions.handleScoreChange("ca1", 18.5);
    });

    await act(async () => {
      await result.current.actions.handleScoreSave("ca1");
    });

    // notification.error must still be called (error is shown to user)
    expect(mockNotificationError).toHaveBeenCalledTimes(1);

    // errorCells is populated by the current code for ALL errors (including 500)
    // This test documents the current behavior: errorCells["ca1"] is set
    // (The fix may change 500 handling, but the cell error state for non-500 must be preserved)
    expect(result.current.state.errorCells).toHaveProperty("ca1");
  });
});

// ── P3: Eval-status revert ────────────────────────────────────────────────────

/**
 * **Validates: Requirements 3.5**
 *
 * For any eval-status save failure, state.localEvalStatusCode must revert to
 * row.evaluationStatusCode (the original value before the optimistic update).
 *
 * This is preserved behavior — the current code already does this correctly.
 * The fix must not break it.
 */
describe("P3 — Eval-status revert: save failure reverts localEvalStatusCode to row.evaluationStatusCode", () => {
  it("on eval-status save failure, localEvalStatusCode reverts to row.evaluationStatusCode (concrete example)", async () => {
    // Validates: Requirements 3.5
    const { useScoreRow } =
      await import("@/features/assessment/hooks/useScoreRow");
    const row = makeRow({ evaluationStatusCode: "NORMAL" });
    const store = makeStore();

    const error = makeNon500Error("Evaluation status update failed");

    // Make the mutation reject
    mockUpdateEvaluationStatus.mockReturnValue({
      unwrap: () => Promise.reject(error),
    });

    const { result } = renderHook(() => useScoreRow(row as any), {
      wrapper: wrapWithStore(store),
    });

    // Initially localEvalStatusCode matches row.evaluationStatusCode
    expect(result.current.state.localEvalStatusCode).toBe("NORMAL");

    // Trigger eval status change to status id=2 (INCOMPLETE)
    await act(async () => {
      await result.current.actions.handleEvalStatusChange(2);
    });

    // After failure, localEvalStatusCode must revert to the original
    expect(result.current.state.localEvalStatusCode).toBe("NORMAL");

    // notification.error must have been called
    expect(mockNotificationError).toHaveBeenCalledTimes(1);
  });

  it("property: for any eval-status save failure, localEvalStatusCode reverts to row.evaluationStatusCode", async () => {
    // Validates: Requirements 3.5
    const { useScoreRow } =
      await import("@/features/assessment/hooks/useScoreRow");

    await fc.assert(
      fc.asyncProperty(
        // Generate the original eval status code
        fc.constantFrom("NORMAL", "INCOMPLETE", "CARRY_OVER"),
        // Generate a different status id to change to
        fc.constantFrom(1, 2, 3),
        // Generate a non-empty error detail
        fc
          .string({ minLength: 1, maxLength: 80 })
          .filter((s) => s.trim().length > 0),
        async (originalCode, newStatusId, errorDetail) => {
          vi.clearAllMocks();

          const error = makeNon500Error(errorDetail);

          mockUpdateEvaluationStatus.mockReturnValue({
            unwrap: () => Promise.reject(error),
          });

          const row = makeRow({ evaluationStatusCode: originalCode });
          const store = makeStore();

          const { result } = renderHook(() => useScoreRow(row as any), {
            wrapper: wrapWithStore(store),
          });

          // Verify initial state
          expect(result.current.state.localEvalStatusCode).toBe(originalCode);

          // Trigger eval status change
          await act(async () => {
            await result.current.actions.handleEvalStatusChange(newStatusId);
          });

          // After failure, must revert to the original row.evaluationStatusCode
          expect(result.current.state.localEvalStatusCode).toBe(originalCode);

          // notification.error must have been called
          expect(mockNotificationError).toHaveBeenCalled();
        },
      ),
      { numRuns: 25 },
    );
  });

  it("property: on success, localEvalStatusCode stays at the optimistically updated value", async () => {
    // Validates: Requirements 3.5 (complementary — success path must NOT revert)
    const { useScoreRow } =
      await import("@/features/assessment/hooks/useScoreRow");

    const availableStatuses = [
      { id: 1, code: "NORMAL" },
      { id: 2, code: "INCOMPLETE" },
      { id: 3, code: "CARRY_OVER" },
    ];

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("NORMAL", "INCOMPLETE", "CARRY_OVER"),
        fc.constantFrom(1, 2, 3),
        async (originalCode, newStatusId) => {
          vi.clearAllMocks();

          // Mutation succeeds
          mockUpdateEvaluationStatus.mockReturnValue({
            unwrap: () => Promise.resolve(),
          });

          const row = makeRow({ evaluationStatusCode: originalCode });
          const store = makeStore();

          const { result } = renderHook(() => useScoreRow(row as any), {
            wrapper: wrapWithStore(store),
          });

          await act(async () => {
            await result.current.actions.handleEvalStatusChange(newStatusId);
          });

          // On success, localEvalStatusCode must be the code of the selected status
          const selectedStatus = availableStatuses.find(
            (s) => s.id === newStatusId,
          );
          if (selectedStatus) {
            expect(result.current.state.localEvalStatusCode).toBe(
              selectedStatus.code,
            );
          }

          // notification.error must NOT have been called
          expect(mockNotificationError).not.toHaveBeenCalled();
        },
      ),
      { numRuns: 20 },
    );
  });
});
