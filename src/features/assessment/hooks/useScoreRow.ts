import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { Button, notification } from "antd";
import React, { useCallback, useEffect, useReducer, useRef } from "react";
import {
  useAssignEvaluationStatusMutation,
  useClearEvaluationStatusMutation,
  useUpsertStudentScoreSheetMutation,
} from "../api/scoreSheetApi";
import {
  ScoreRowActionType,
  initialScoreRowState,
  scoreRowReducer,
} from "../state/scoreRowState";
import { EvaluationStatusSource, type ScoreSheetRow } from "../types/score-sheet";

export function useScoreRow(row: ScoreSheetRow) {
  const handleApiError = useApiError();

  // ─── Reducer ──────────────────────────────────────────────────────────────
  const [state, dispatch] = useReducer(scoreRowReducer, undefined, () =>
    initialScoreRowState(row),
  );

  // Keep localEvalStatusId, localEvalStatusCode, source, and displayGrade in sync when row prop updates
  useEffect(() => {
    const defaultStatus = row.evaluationStatuses?.find((s) => s.isDefault);
    const resolvedId =
      row.evaluationStatusId ??
      (row.evaluationStatusCode
        ? row.evaluationStatuses?.find(
            (s) =>
              s.code === row.evaluationStatusCode ||
              s.code?.toLowerCase() === row.evaluationStatusCode?.toLowerCase(),
          )?.id
        : undefined) ??
      defaultStatus?.id ??
      null;

    const resolvedCode =
      row.evaluationStatuses?.find((s) => s.id === resolvedId)?.code ??
      row.evaluationStatusCode ??
      defaultStatus?.code ??
      "";

    const resolvedSource = row.evaluationStatusSource ?? null;
    const resolvedDisplayGrade = row.displayGrade ?? row.grade ?? "NR";

    dispatch({
      type: ScoreRowActionType.SetLocalEvalStatusId,
      payload: {
        statusId: resolvedId,
        code: resolvedCode,
        source: resolvedSource,
        displayGrade: resolvedDisplayGrade,
      },
    });
  }, [
    row.evaluationStatusId,
    row.evaluationStatusCode,
    row.evaluationStatusSource,
    row.displayGrade,
    row.grade,
    row.evaluationStatuses,
  ]);

  // ─── In-Flight Save Serialization Queue (B2) ──────────────────────────────
  const inFlightSaveRef = useRef<Promise<any> | null>(null);
  const persistedIdRef = useRef<number | null>(row.id);

  useEffect(() => {
    persistedIdRef.current = row.id;
  }, [row.id]);

  const executeSerializedSave = useCallback(
    async <T>(saveFn: (currentId: number | null) => Promise<T>): Promise<T> => {
      const previousPromise = inFlightSaveRef.current || Promise.resolve();
      const currentPromise = previousPromise
        .catch(() => {}) // Don't block subsequent save if prior failed
        .then(() => saveFn(persistedIdRef.current));
      inFlightSaveRef.current = currentPromise;
      return currentPromise as Promise<T>;
    },
    [],
  );

  // ─── Mutations ────────────────────────────────────────────────────────────
  const [upsertStudentScoreSheet] = useUpsertStudentScoreSheetMutation();
  const [assignEvaluationStatus] = useAssignEvaluationStatusMutation();
  const [clearEvaluationStatus] = useClearEvaluationStatusMutation();

  // ─── Score actions ────────────────────────────────────────────────────────
  const handleScoreChange = useCallback((key: string, value: number | null) => {
    dispatch({
      type: ScoreRowActionType.SetDirtyScore,
      payload: { key, value },
    });
  }, []);

  const handleScoreSave = useCallback(
    async (key: string) => {
      if (!(key in state.dirtyScores)) return;

      dispatch({
        type: ScoreRowActionType.SetSavingCell,
        payload: { key },
      });

      try {
        const mergedScores = { ...row.scores, [key]: state.dirtyScores[key] };

        await executeSerializedSave(async () => {
          const res = await upsertStudentScoreSheet({
            registrationId: row.registrationId,
            componentScores: mergedScores,
            courseConfigId: row.configId,
          }).unwrap();
          if (res?.id) {
            persistedIdRef.current = res.id;
          }
        });

        // On success: clear saving cell and any prior error (cache invalidation/patch updates row.scores)
        dispatch({
          type: ScoreRowActionType.ClearSavingCell,
          payload: { key },
        });
        dispatch({
          type: ScoreRowActionType.ClearErrorCell,
          payload: { key },
        });
        notifyMutationSuccess("Scores saved");
      } catch (err: unknown) {
        const decision = handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "POST" },
        });
        dispatch({
          type: ScoreRowActionType.SetErrorCell,
          payload: { key, message: decision.message },
        });
        dispatch({
          type: ScoreRowActionType.ClearSavingCell,
          payload: { key },
        });
      }
    },
    [
      state.dirtyScores,
      row.scores,
      row.registrationId,
      row.configId,
      upsertStudentScoreSheet,
      handleApiError,
      executeSerializedSave,
    ],
  );

  // ─── Evaluation status actions ────────────────────────────────────────────
  const handleAssignEvalStatus = useCallback(
    async (statusId: number) => {
      const selected = row.evaluationStatuses?.find((s) => s.id === statusId);
      if (!selected) return;

      const previousStatusId = state.localEvalStatusId;
      const previousStatusCode = state.localEvalStatusCode;
      const previousSource = state.localEvalStatusSource;
      const previousDisplayGrade = state.localDisplayGrade;

      // Optimistic update
      dispatch({
        type: ScoreRowActionType.SetLocalEvalStatusId,
        payload: {
          statusId,
          code: selected.code,
          source: EvaluationStatusSource.MANUAL,
          displayGrade: selected.code,
        },
      });
      dispatch({
        type: ScoreRowActionType.SetEvalStatusError,
        payload: { error: null },
      });
      dispatch({
        type: ScoreRowActionType.SetIsSavingEvalStatus,
        payload: { isSaving: true },
      });

      try {
        await executeSerializedSave(async (currentId) => {
          if (currentId === null) {
            const res = await upsertStudentScoreSheet({
              registrationId: row.registrationId,
              componentScores: row.scores ?? {},
              evaluationStatusId: statusId,
              courseConfigId: row.configId,
            }).unwrap();
            if (res?.id) {
              persistedIdRef.current = res.id;
            }
          } else {
            await assignEvaluationStatus({
              scoreSheetId: currentId,
              evaluationStatusId: statusId,
              courseConfigId: row.configId,
            }).unwrap();
          }
        });

        notifyMutationSuccess(
          `Administrative status set to ${selected.name} (${selected.code})`,
        );
        dispatch({
          type: ScoreRowActionType.SetIsSavingEvalStatus,
          payload: { isSaving: false },
        });
      } catch (err: unknown) {
        const decision = handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "POST" },
        });
        // Revert optimistic update
        dispatch({
          type: ScoreRowActionType.SetLocalEvalStatusId,
          payload: {
            statusId: previousStatusId,
            code: previousStatusCode,
            source: previousSource,
            displayGrade: previousDisplayGrade,
          },
        });
        dispatch({
          type: ScoreRowActionType.SetEvalStatusError,
          payload: { error: decision.message },
        });
        dispatch({
          type: ScoreRowActionType.SetIsSavingEvalStatus,
          payload: { isSaving: false },
        });
      }
    },
    [
      row.registrationId,
      row.scores,
      row.configId,
      row.evaluationStatuses,
      state.localEvalStatusId,
      state.localEvalStatusCode,
      state.localEvalStatusSource,
      state.localDisplayGrade,
      upsertStudentScoreSheet,
      assignEvaluationStatus,
      handleApiError,
      executeSerializedSave,
    ],
  );

  const handleClearEvalStatus = useCallback(async () => {
    if (persistedIdRef.current === null) return;

    const previousStatusId = state.localEvalStatusId;
    const previousStatusCode = state.localEvalStatusCode;
    const previousSource = state.localEvalStatusSource;
    const previousDisplayGrade = state.localDisplayGrade;

    // Optimistic update
    dispatch({ type: ScoreRowActionType.ClearLocalEvalStatus });
    dispatch({
      type: ScoreRowActionType.SetEvalStatusError,
      payload: { error: null },
    });
    dispatch({
      type: ScoreRowActionType.SetIsSavingEvalStatus,
      payload: { isSaving: true },
    });

    try {
      await executeSerializedSave(async (currentId) => {
        if (currentId !== null) {
          await clearEvaluationStatus({
            scoreSheetId: currentId,
            courseConfigId: row.configId,
          }).unwrap();
        }
      });

      notifyMutationSuccess(
        "Administrative status cleared. Scores re-evaluated.",
      );
      dispatch({
        type: ScoreRowActionType.SetIsSavingEvalStatus,
        payload: { isSaving: false },
      });
    } catch (err: unknown) {
      const decision = handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "DELETE" },
      });
      // Revert optimistic update
      dispatch({
        type: ScoreRowActionType.SetLocalEvalStatusId,
        payload: {
          statusId: previousStatusId,
          code: previousStatusCode,
          source: previousSource,
          displayGrade: previousDisplayGrade,
        },
      });
      dispatch({
        type: ScoreRowActionType.SetEvalStatusError,
        payload: { error: decision.message },
      });
      dispatch({
        type: ScoreRowActionType.SetIsSavingEvalStatus,
        payload: { isSaving: false },
      });
    }
  }, [
    row.configId,
    state.localEvalStatusId,
    state.localEvalStatusCode,
    state.localEvalStatusSource,
    state.localDisplayGrade,
    clearEvaluationStatus,
    handleApiError,
    executeSerializedSave,
  ]);

  // ─── Mode 3: Wipe Scores & Undo ───────────────────────────────────────────
  const handleWipeScores = useCallback(async () => {
    const snapshotScores: Record<string, number | null> = { ...row.scores };
    Object.entries(state.dirtyScores).forEach(([k, v]) => {
      if (v !== undefined) snapshotScores[k] = v;
    });

    dispatch({
      type: ScoreRowActionType.SetIsSavingEvalStatus,
      payload: { isSaving: true },
    });

    try {
      await executeSerializedSave(async () => {
        const res = await upsertStudentScoreSheet({
          registrationId: row.registrationId,
          componentScores: {}, // Mode 3: Wipe payload
          courseConfigId: row.configId,
        }).unwrap();
        if (res?.id) {
          persistedIdRef.current = res.id;
        }
      });

      const undoKey = `undo-wipe-${row.registrationId}-${Date.now()}`;
      notification.success({
        key: undoKey,
        message: "Scores Cleared",
        description:
          "All component scores cleared. Manual administrative status is preserved.",
        duration: 8,
        btn: React.createElement(
          Button,
          {
            type: "primary",
            size: "small",
            onClick: async () => {
              notification.destroy(undoKey);
              try {
                await executeSerializedSave(async () => {
                  await upsertStudentScoreSheet({
                    registrationId: row.registrationId,
                    componentScores: snapshotScores,
                    courseConfigId: row.configId,
                  }).unwrap();
                });
                notifyMutationSuccess("Scores restored successfully.");
              } catch (undoErr) {
                handleApiError(undoErr, {
                  context: { screen: RequestScreen.Action, method: "POST" },
                });
              }
            },
          },
          "Undo",
        ),
      });
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    } finally {
      dispatch({
        type: ScoreRowActionType.SetIsSavingEvalStatus,
        payload: { isSaving: false },
      });
    }
  }, [
    row.registrationId,
    row.scores,
    row.configId,
    state.dirtyScores,
    upsertStudentScoreSheet,
    handleApiError,
    executeSerializedSave,
  ]);

  return {
    state,
    actions: {
      handleScoreChange,
      handleScoreSave,
      handleAssignEvalStatus,
      handleClearEvalStatus,
      handleEvalStatusChange: handleAssignEvalStatus,
      handleWipeScores,
    },
  };
}


