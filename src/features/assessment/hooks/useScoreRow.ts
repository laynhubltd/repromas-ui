import { parseApiError } from "@/shared/utils/error/parseApiError";
import { notification } from "antd";
import { useCallback, useReducer } from "react";
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
import { map500Detail } from "../utils/scoreSheetErrors";

export function useScoreRow(row: ScoreSheetRow) {
  // ─── Reducer ──────────────────────────────────────────────────────────────
  const [state, dispatch] = useReducer(scoreRowReducer, undefined, () =>
    initialScoreRowState(row),
  );

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
        if ((err as { status?: number }).status === 500) {
          const detail: string =
            (err as { data?: { detail?: string } }).data?.detail ?? "";
          const mappedMessage = map500Detail(detail);
          notification.error({ message: mappedMessage });
          dispatch({
            type: ScoreRowActionType.SetErrorCell,
            payload: { key, message: mappedMessage },
          });
        } else {
          const parsed = parseApiError(err);
          notification.error({ message: parsed.message });
          dispatch({
            type: ScoreRowActionType.SetErrorCell,
            payload: { key, message: parsed.message },
          });
        }
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
    ],
  );

  // ─── Evaluation status action ─────────────────────────────────────────────
  const handleEvalStatusChange = useCallback(
    async (statusId: number) => {
      // Guard: scoreSheetId must exist before assigning an evaluation status
      if (row.id === null) {
        notification.error({
          message:
            "Scores must be saved before an evaluation status can be assigned.",
        });
        return;
      }

      const selected = row.evaluationStatuses.find((s) => s.id === statusId);
      if (!selected) return;

      // Optimistic update
      dispatch({
        type: ScoreRowActionType.SetLocalEvalStatusCode,
        payload: { code: selected.code },
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
        await updateEvaluationStatus({
          scoreSheetId: row.id,
          evaluationStatusId: statusId,
        }).unwrap();

        // Optimistic update stands; just clear the saving flag
        dispatch({
          type: ScoreRowActionType.SetIsSavingEvalStatus,
          payload: { isSaving: false },
        });
      } catch (err: unknown) {
        const parsed = parseApiError(err);
        notification.error({ message: parsed.message });
        // Revert optimistic update
        dispatch({
          type: ScoreRowActionType.SetLocalEvalStatusCode,
          payload: { code: row.evaluationStatusCode },
        });
        dispatch({
          type: ScoreRowActionType.SetEvalStatusError,
          payload: { error: parsed.message },
        });
        dispatch({
          type: ScoreRowActionType.SetIsSavingEvalStatus,
          payload: { isSaving: false },
        });
      }
    },
    [
      row.id,
      row.evaluationStatuses,
      row.evaluationStatusCode,
      updateEvaluationStatus,
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
