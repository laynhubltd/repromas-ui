/**
 * Score Row API Fix — Bug Condition Exploration Tests
 *
 * Feature: score-row-api-fix
 * Property 1: Bug Condition — Wrong Endpoint and Field Name on Score/Eval-Status Save
 *
 * CRITICAL: These tests are written BEFORE the fix is implemented.
 * They MUST FAIL on unfixed code — failure confirms the bug exists.
 * DO NOT fix the source code when these tests fail.
 *
 * Test cases:
 *   1. Score save calls wrong mutation (updateStudentScores instead of upsertStudentScoreSheet)
 *   2. Score save sends full merged map (componentScores with ALL keys, not just the changed key)
 *   3. Score save mutation has invalidatesTags for StudentScoreSheetData
 *   4. Eval-status save uses wrong path param (registrationId instead of scoreSheetId)
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.9, 1.10
 */

import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import * as fc from "fast-check";
import React from "react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Module mocks ──────────────────────────────────────────────────────────────

// We mock the scoreSheetApi module to intercept mutation calls.
// The mock captures what arguments each mutation is called with.

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

// Mock antd notification to avoid side effects
vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();
  return {
    ...actual,
    notification: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
  };
});

// ── Fixtures ──────────────────────────────────────────────────────────────────

/**
 * A minimal ScoreSheetRow with multiple score components.
 * The presence of multiple keys (ca1, ca2, exam) is essential for test case 2:
 * the full merged map must contain ALL keys, not just the changed one.
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
    // id is the StudentScoreSheet.id returned by the GET data endpoint
    id: overrides.id ?? 7,
  };
}

/**
 * Minimal Redux store — the hook only needs the RTK Query api slice.
 * Since all mutations are mocked, we use a simple store with just a dummy reducer.
 * The hook doesn't read from the store directly; it only calls the mocked mutations.
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

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();

  // Default: mutations resolve successfully (unwrap returns void)
  mockUpdateStudentScores.mockReturnValue({ unwrap: () => Promise.resolve() });
  mockUpsertStudentScoreSheet.mockReturnValue({
    unwrap: () => Promise.resolve(),
  });
  mockUpdateEvaluationStatus.mockReturnValue({
    unwrap: () => Promise.resolve(),
  });
});

// ── Test Case 1: Score save calls wrong mutation ──────────────────────────────

/**
 * **Validates: Requirements 1.1, 1.9**
 *
 * The current (broken) code calls `updateStudentScores` (wrong mutation).
 * The fixed code must call `upsertStudentScoreSheet` (correct mutation).
 *
 * This test asserts the CORRECT behavior (upsertStudentScoreSheet is called).
 * It FAILS on unfixed code because the hook calls updateStudentScores instead.
 */
describe("Test Case 1 — score save calls correct mutation (upsertStudentScoreSheet)", () => {
  it("calls upsertStudentScoreSheet, NOT updateStudentScores, when handleScoreSave is called with a dirty score", async () => {
    // Validates: Requirements 1.1, 1.9
    const { useScoreRow } =
      await import("@/features/assessment/hooks/useScoreRow");
    const row = makeRow();
    const store = makeStore();

    const { result } = renderHook(() => useScoreRow(row as any), {
      wrapper: wrapWithStore(store),
    });

    // Set a dirty score for "ca1"
    act(() => {
      result.current.actions.handleScoreChange("ca1", 18.5);
    });

    // Trigger save
    await act(async () => {
      await result.current.actions.handleScoreSave("ca1");
    });

    // ASSERTION: upsertStudentScoreSheet must be called (correct mutation)
    expect(mockUpsertStudentScoreSheet).toHaveBeenCalledTimes(1);

    // ASSERTION: updateStudentScores must NOT be called (wrong mutation)
    expect(mockUpdateStudentScores).not.toHaveBeenCalled();
  });

  it("property: for any dirty score value, upsertStudentScoreSheet is called and updateStudentScores is not", async () => {
    // Validates: Requirements 1.1, 1.9
    const { useScoreRow } =
      await import("@/features/assessment/hooks/useScoreRow");

    await fc.assert(
      fc.asyncProperty(
        fc.float({ min: 0, max: 100, noNaN: true }),
        async (scoreValue) => {
          vi.clearAllMocks();
          mockUpdateStudentScores.mockReturnValue({
            unwrap: () => Promise.resolve(),
          });
          mockUpsertStudentScoreSheet.mockReturnValue({
            unwrap: () => Promise.resolve(),
          });

          const row = makeRow();
          const store = makeStore();

          const { result } = renderHook(() => useScoreRow(row as any), {
            wrapper: wrapWithStore(store),
          });

          act(() => {
            result.current.actions.handleScoreChange("ca1", scoreValue);
          });

          await act(async () => {
            await result.current.actions.handleScoreSave("ca1");
          });

          // The correct mutation must be called
          expect(mockUpsertStudentScoreSheet).toHaveBeenCalledTimes(1);
          // The wrong mutation must NOT be called
          expect(mockUpdateStudentScores).not.toHaveBeenCalled();
        },
      ),
      { numRuns: 20 },
    );
  });
});

// ── Test Case 2: Score save sends full merged map ─────────────────────────────

/**
 * **Validates: Requirements 1.1, 1.9, 2.1**
 *
 * The current (broken) code sends only the single changed key: `{ scores: { [key]: value } }`.
 * The fixed code must send the full merged map: `{ componentScores: { ca1, ca2, exam } }`
 * with the dirty value applied to the changed key and all other keys from row.scores preserved.
 *
 * This test asserts the CORRECT behavior (full merged map with correct field name).
 * It FAILS on unfixed code because:
 *   - The field is named `scores` instead of `componentScores`
 *   - Only the single changed key is sent, not the full map
 */
describe("Test Case 2 — score save sends full merged componentScores map", () => {
  it("mutation body has componentScores with ALL component keys from row.scores, dirty value applied", async () => {
    // Validates: Requirements 1.1, 1.9, 2.1
    const { useScoreRow } =
      await import("@/features/assessment/hooks/useScoreRow");
    const row = makeRow({
      scores: { ca1: 15.0, ca2: 12.0, exam: 50.0 },
    });
    const store = makeStore();

    const { result } = renderHook(() => useScoreRow(row as any), {
      wrapper: wrapWithStore(store),
    });

    // Set dirty score for "ca1" only
    act(() => {
      result.current.actions.handleScoreChange("ca1", 18.5);
    });

    await act(async () => {
      await result.current.actions.handleScoreSave("ca1");
    });

    // The mutation must be called with the full merged map
    expect(mockUpsertStudentScoreSheet).toHaveBeenCalledWith(
      expect.objectContaining({
        componentScores: {
          ca1: 18.5, // dirty value applied
          ca2: 12.0, // preserved from row.scores
          exam: 50.0, // preserved from row.scores
        },
      }),
    );
  });

  it("property: for any changed key and dirty value, componentScores contains ALL row.scores keys with dirty value applied", async () => {
    // Validates: Requirements 1.1, 1.9, 2.1
    const { useScoreRow } =
      await import("@/features/assessment/hooks/useScoreRow");

    const scoreKeys = ["ca1", "ca2", "exam"];

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...scoreKeys),
        fc.float({ min: 0, max: 100, noNaN: true }),
        async (changedKey, dirtyValue) => {
          vi.clearAllMocks();
          mockUpsertStudentScoreSheet.mockReturnValue({
            unwrap: () => Promise.resolve(),
          });

          const baseScores = { ca1: 15.0, ca2: 12.0, exam: 50.0 };
          const row = makeRow({ scores: { ...baseScores } });
          const store = makeStore();

          const { result } = renderHook(() => useScoreRow(row as any), {
            wrapper: wrapWithStore(store),
          });

          act(() => {
            result.current.actions.handleScoreChange(changedKey, dirtyValue);
          });

          await act(async () => {
            await result.current.actions.handleScoreSave(changedKey);
          });

          // Must be called with componentScores (not scores)
          const callArg = mockUpsertStudentScoreSheet.mock.calls[0]?.[0];
          expect(callArg).toBeDefined();

          // Field must be named componentScores, not scores
          expect(callArg).toHaveProperty("componentScores");
          expect(callArg).not.toHaveProperty("scores");

          // Must contain ALL keys from row.scores
          const componentScores = callArg.componentScores;
          for (const key of scoreKeys) {
            expect(componentScores).toHaveProperty(key);
          }

          // The changed key must have the dirty value applied
          expect(componentScores[changedKey]).toBe(dirtyValue);

          // Other keys must be preserved from row.scores
          for (const key of scoreKeys) {
            if (key !== changedKey) {
              expect(componentScores[key]).toBe(
                baseScores[key as keyof typeof baseScores],
              );
            }
          }
        },
      ),
      { numRuns: 20 },
    );
  });
});

// ── Test Case 3: Score save mutation has invalidatesTags ──────────────────────

/**
 * **Validates: Requirements 1.4**
 *
 * The current (broken) code has NO invalidatesTags on updateStudentScores.
 * The fixed code must have invalidatesTags: [{ type: StudentScoreSheetData, id: "LIST" }]
 * on upsertStudentScoreSheet so the table refetches on success.
 *
 * This test inspects the API slice definition directly (static analysis).
 * It FAILS on unfixed code because:
 *   - updateStudentScores has no invalidatesTags
 *   - upsertStudentScoreSheet does not exist yet
 */
describe("Test Case 3 — score save mutation has invalidatesTags for StudentScoreSheetData", () => {
  it("upsertStudentScoreSheet mutation definition has invalidatesTags containing StudentScoreSheetData", async () => {
    // Validates: Requirements 1.4
    // RTK Query v2 does not expose invalidatesTags on api.endpoints — those are stored in an
    // internal closure. We verify the configuration via source-code inspection: read the API
    // slice file and assert that the invalidatesTags declaration is present for the correct
    // endpoint. This is equivalent to static analysis and is the reliable approach for RTK Query v2.
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(
      __dirname,
      "../features/assessment/api/scoreSheetApi.ts",
    );
    const source = fs.readFileSync(filePath, "utf8");

    // upsertStudentScoreSheet must exist (not updateStudentScores)
    expect(source).toContain("upsertStudentScoreSheet");
    expect(source).not.toContain("updateStudentScores");

    // The source must declare invalidatesTags with StudentScoreSheetData for upsertStudentScoreSheet.
    // We check that the invalidatesTags block appears after the upsertStudentScoreSheet declaration
    // and before the next endpoint declaration.
    const upsertIdx = source.indexOf("upsertStudentScoreSheet");
    expect(upsertIdx).toBeGreaterThan(-1);

    // Find the next top-level endpoint after upsertStudentScoreSheet
    const afterUpsert = source.slice(upsertIdx);
    const invalidatesIdx = afterUpsert.indexOf("invalidatesTags");
    expect(invalidatesIdx).toBeGreaterThan(-1);

    // The invalidatesTags block must reference StudentScoreSheetData
    const invalidatesBlock = afterUpsert.slice(
      invalidatesIdx,
      invalidatesIdx + 200,
    );
    expect(invalidatesBlock).toContain("StudentScoreSheetData");
  });

  it("updateEvaluationStatus mutation definition has invalidatesTags containing StudentScoreSheetData", async () => {
    // Validates: Requirements 1.4 (also applies to eval-status mutation)
    // Same source-code inspection approach as above.
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(
      __dirname,
      "../features/assessment/api/scoreSheetApi.ts",
    );
    const source = fs.readFileSync(filePath, "utf8");

    // updateEvaluationStatus must exist
    expect(source).toContain("updateEvaluationStatus");

    // Find the updateEvaluationStatus declaration and check for invalidatesTags after it
    const evalStatusIdx = source.indexOf("updateEvaluationStatus");
    expect(evalStatusIdx).toBeGreaterThan(-1);

    const afterEvalStatus = source.slice(evalStatusIdx);
    const invalidatesIdx = afterEvalStatus.indexOf("invalidatesTags");
    expect(invalidatesIdx).toBeGreaterThan(-1);

    // The invalidatesTags block must reference StudentScoreSheetData
    const invalidatesBlock = afterEvalStatus.slice(
      invalidatesIdx,
      invalidatesIdx + 200,
    );
    expect(invalidatesBlock).toContain("StudentScoreSheetData");
  });
});

// ── Test Case 4: Eval-status save uses correct path param ─────────────────────

/**
 * **Validates: Requirements 1.2, 1.3, 1.10**
 *
 * The current (broken) code calls updateEvaluationStatus with { registrationId, evaluationStatusId }.
 * The fixed code must call updateEvaluationStatus with { scoreSheetId, evaluationStatusId }.
 *
 * This test asserts the CORRECT behavior (scoreSheetId is used as the path param).
 * It FAILS on unfixed code because the hook passes registrationId instead of scoreSheetId.
 */
describe("Test Case 4 — eval-status save uses scoreSheetId, NOT registrationId", () => {
  it("updateEvaluationStatus is called with { scoreSheetId, evaluationStatusId }, not { registrationId, evaluationStatusId }", async () => {
    // Validates: Requirements 1.2, 1.3, 1.10
    const { useScoreRow } =
      await import("@/features/assessment/hooks/useScoreRow");
    const row = makeRow({
      registrationId: 42,
      id: 7,
    });
    const store = makeStore();

    const { result } = renderHook(() => useScoreRow(row as any), {
      wrapper: wrapWithStore(store),
    });

    await act(async () => {
      await result.current.actions.handleEvalStatusChange(3);
    });

    // ASSERTION: must be called with scoreSheetId (correct)
    expect(mockUpdateEvaluationStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        scoreSheetId: 7,
        evaluationStatusId: 3,
      }),
    );

    // ASSERTION: must NOT be called with registrationId (wrong)
    expect(mockUpdateEvaluationStatus).not.toHaveBeenCalledWith(
      expect.objectContaining({
        registrationId: expect.anything(),
      }),
    );
  });

  it("property: for any statusId, updateEvaluationStatus is called with scoreSheetId (not registrationId)", async () => {
    // Validates: Requirements 1.2, 1.3, 1.10
    const { useScoreRow } =
      await import("@/features/assessment/hooks/useScoreRow");

    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 999 }),
        fc.integer({ min: 1, max: 999 }),
        async (statusId, registrationId, scoreSheetId) => {
          vi.clearAllMocks();
          mockUpdateEvaluationStatus.mockReturnValue({
            unwrap: () => Promise.resolve(),
          });

          const row = makeRow({ registrationId, id: scoreSheetId });
          // Ensure the statusId is in the evaluationStatuses list
          const rowWithStatus = {
            ...row,
            evaluationStatuses: [
              ...row.evaluationStatuses,
              {
                id: statusId,
                name: `Status${statusId}`,
                code: `STATUS_${statusId}`,
                isStandardGraded: true,
                computesInGpa: true,
                earnsCredit: true,
                requiresRetake: false,
                isDefault: false,
              },
            ],
          };
          const store = makeStore();

          const { result } = renderHook(
            () => useScoreRow(rowWithStatus as any),
            {
              wrapper: wrapWithStore(store),
            },
          );

          await act(async () => {
            await result.current.actions.handleEvalStatusChange(statusId);
          });

          if (mockUpdateEvaluationStatus.mock.calls.length > 0) {
            const callArg = mockUpdateEvaluationStatus.mock.calls[0][0];

            // Must use scoreSheetId, not registrationId
            expect(callArg).toHaveProperty("scoreSheetId", scoreSheetId);
            expect(callArg).not.toHaveProperty("registrationId");
            expect(callArg).toHaveProperty("evaluationStatusId", statusId);
          }
        },
      ),
      { numRuns: 20 },
    );
  });
});
