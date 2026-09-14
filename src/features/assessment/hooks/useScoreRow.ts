import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { notification } from "antd";
import { useCallback, useEffect, useReducer } from "react";
import {
  useUpdateEvaluationStatusMutation,
  useUpsertStudentScoreSheetMutation,
} from "../api/scoreSheetApi";
import {
  ScoreRowActionType,
  initialScoreRowState,
  scoreRowReducer,
} from "../state/scoreRowState";
import type { ScoreSheetRow } from "../types/score-sheet";

export function useScoreRow(row: ScoreSheetRow) {
  const handleApiError = useApiError();

  // ─── Reducer ──────────────────────────────────────────────────────────────
  const [state, dispatch] = useReducer(scoreRowReducer, undefined, () =>
    initialScoreRowState(row),
  );

  // Keep localEvalStatusId and localEvalStatusCode in sync when row prop updates (e.g. on refetch or parent reload)
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

    if (resolvedId !== null) {
      dispatch({
        type: ScoreRowActionType.SetLocalEvalStatusId,
        payload: { statusId: resolvedId, code: resolvedCode },
      });
    }
  }, [row.evaluationStatusId, row.evaluationStatusCode, row.evaluationStatuses]);

  // ─── Mutations ────────────────────────────────────────────────────────────
  const [upsertStudentScoreSheet] = useUpsertStudentScoreSheetMutation();
  const [updateEvaluationStatus] = useUpdateEvaluationStatusMutation();

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

        await upsertStudentScoreSheet({
          registrationId: row.registrationId,
          componentScores: mergedScores,
        }).unwrap();

        // On success: clear saving cell and any prior error (cache invalidation refetch updates row.scores)
        dispatch({
          type: ScoreRowActionType.ClearSavingCell,
          payload: { key },
        });
        dispatch({
          type: ScoreRowActionType.ClearErrorCell,
          payload: { key },
        });
        notification.success({ message: "Scores saved" });
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
      upsertStudentScoreSheet,
      handleApiError,
    ],
  );

  // ─── Evaluation status action ─────────────────────────────────────────────
  const handleEvalStatusChange = useCallback(
    async (statusId: number) => {
      console.log(
        "[useScoreRow] handleEvalStatusChange triggered with statusId:",
        statusId,
        "row.id:",
        row.id,
        "registrationId:",
        row.registrationId,
      );

      const selected = row.evaluationStatuses.find((s) => s.id === statusId);
      if (!selected) {
        console.warn("[useScoreRow] Status not found in evaluationStatuses for statusId:", statusId);
        return;
      }

      const previousStatusId = state.localEvalStatusId;
      const previousStatusCode = state.localEvalStatusCode;

      // Optimistic update
      dispatch({
        type: ScoreRowActionType.SetLocalEvalStatusId,
        payload: { statusId, code: selected.code },
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
        // If row.id is null (score sheet not persisted yet), create it with current scores
        if (row.id === null) {
          console.log(
            "[useScoreRow] row.id is null — auto-creating score sheet via upsertStudentScoreSheet...",
          );
          await upsertStudentScoreSheet({
            registrationId: row.registrationId,
            componentScores: row.scores ?? {},
          }).unwrap();

          notification.success({ message: `Evaluation status set to ${selected.name}` });
          return;
        }

        console.log(
          "[useScoreRow] Calling updateEvaluationStatus PATCH with scoreSheetId:",
          row.id,
          "evaluationStatusId:",
          statusId,
        );
        await updateEvaluationStatus({
          scoreSheetId: row.id,
          evaluationStatusId: statusId,
        }).unwrap();

        notification.success({ message: `Evaluation status updated to ${selected.name}` });
        dispatch({
          type: ScoreRowActionType.SetIsSavingEvalStatus,
          payload: { isSaving: false },
        });
      } catch (err: unknown) {
        console.error("[useScoreRow] handleEvalStatusChange failed with error:", err);
        const decision = handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "PATCH" },
        });
        // Revert optimistic update
        dispatch({
          type: ScoreRowActionType.SetLocalEvalStatusId,
          payload: { statusId: previousStatusId, code: previousStatusCode },
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
      row.id,
      row.registrationId,
      row.scores,
      row.evaluationStatuses,
      state.localEvalStatusId,
      state.localEvalStatusCode,
      upsertStudentScoreSheet,
      updateEvaluationStatus,
      handleApiError,
    ],
  );

  return {
    state,
    actions: {
      handleScoreChange,
      handleScoreSave,
      handleEvalStatusChange,
    },
  };
}
