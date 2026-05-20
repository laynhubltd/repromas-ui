import type { AppStore } from "@/app/store";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { notification } from "antd";
import { useReducer, useState } from "react";
import { useStore } from "react-redux";
import {
    downloadScoreSheet,
    useUploadScoreSheetMutation,
} from "../api/scoreSheetApi";
import {
    ScoreSheetUploadActionType,
    initialScoreSheetUploadState,
    scoreSheetUploadReducer,
} from "../state/scoreSheetUploadState";
import type {
    ScoreSheetUploadSummary,
    ScoreSheetUploadSummaryState,
} from "../types/score-sheet";

// ─── Pure utility — exported for testing ─────────────────────────────────────

export function deriveScoreSheetSummaryState(
  summary: ScoreSheetUploadSummary,
): ScoreSheetUploadSummaryState {
  // Priority 1: any error with regNo === null → system-error
  if (summary.errors.some((e) => e.regNo === null)) {
    return "system-error";
  }

  // Priority 2: no rows processed but some skipped → failed
  if (summary.processedCount === 0 && summary.skippedCount > 0) {
    return "failed";
  }

  // Priority 3: some processed and some skipped → partial
  if (summary.processedCount > 0 && summary.skippedCount > 0) {
    return "partial";
  }

  // Priority 4: everything else → success
  return "success";
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useScoreSheetBulkOperations({
  courseConfigId,
  courseCode,
  courseTitle,
}: {
  courseConfigId: number | null;
  courseCode: string | null;
  courseTitle: string | null;
}) {
  const [reducerState, dispatch] = useReducer(
    scoreSheetUploadReducer,
    initialScoreSheetUploadState,
  );

  const [isDownloading, setIsDownloading] = useState(false);

  const store = useStore() as AppStore;

  const [uploadScoreSheet] = useUploadScoreSheetMutation();

  const { selectedFile, summary } = reducerState;

  // ─── Download ─────────────────────────────────────────────────────────────

  const handleDownload = async () => {
    if (courseConfigId === null || courseCode === null || courseTitle === null)
      return;

    setIsDownloading(true);
    try {
      await downloadScoreSheet({
        courseConfigId,
        courseCode,
        courseTitle,
        store,
      });
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
    } finally {
      setIsDownloading(false);
    }
  };

  // ─── Upload modal ─────────────────────────────────────────────────────────

  const handleOpenUpload = () => {
    dispatch({
      type: ScoreSheetUploadActionType.SetUploadModalOpen,
      open: true,
    });
  };

  const handleCloseUpload = () => {
    dispatch({
      type: ScoreSheetUploadActionType.SetUploadModalOpen,
      open: false,
    });
  };

  const handleFileChange = (file: File | null) => {
    dispatch({ type: ScoreSheetUploadActionType.SetSelectedFile, file });
  };

  // ─── Upload execution ─────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (courseConfigId === null || selectedFile === null) return;

    dispatch({ type: ScoreSheetUploadActionType.SetIsUploading, value: true });
    try {
      const result = await uploadScoreSheet({
        courseConfigId,
        file: selectedFile,
      }).unwrap();

      dispatch({
        type: ScoreSheetUploadActionType.SetSummary,
        summary: result,
      });
      dispatch({
        type: ScoreSheetUploadActionType.SetSummaryModalOpen,
        open: true,
      });
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      dispatch({
        type: ScoreSheetUploadActionType.SetUploadError,
        error: parsed.message,
      });
      notification.error({ message: parsed.message });
    } finally {
      dispatch({
        type: ScoreSheetUploadActionType.SetIsUploading,
        value: false,
      });
    }
  };

  // ─── Summary close ────────────────────────────────────────────────────────

  const handleCloseSummary = () => {
    dispatch({ type: ScoreSheetUploadActionType.Reset });
  };

  // ─── Return ───────────────────────────────────────────────────────────────

  return {
    state: {
      ...reducerState,
      isDownloading,
    },
    actions: {
      handleDownload,
      handleOpenUpload,
      handleCloseUpload,
      handleFileChange,
      handleUpload,
      handleCloseSummary,
    },
    flags: {
      hasFile: selectedFile !== null,
      summaryState: summary ? deriveScoreSheetSummaryState(summary) : null,
      isBulkDisabled: courseConfigId === null,
    },
  };
}
