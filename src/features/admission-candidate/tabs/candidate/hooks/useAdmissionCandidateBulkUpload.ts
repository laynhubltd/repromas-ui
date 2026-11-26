import type { AppStore } from "@/app/store";
import type {
  AdmissionCycle,
  AdmissionCycleLaneConfig,
} from "@/features/admission-config/tabs/admission-cycle/types/admission-cycle";
import {
  CANDIDATE_ENTRY_MODE_OPTIONS,
  getCandidateEntryModeLabel,
} from "@/shared/constants/admissionCandidateOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { downloadBlob } from "@/shared/utils/download/downloadFile";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { notification } from "antd";
import { useCallback, useMemo, useReducer } from "react";
import { useStore } from "react-redux";
import {
  downloadCapsTemplate,
  useCapsBulkUploadMutation,
} from "../api/admissionCandidateApi";
import {
  CapsBulkUploadActionType,
  capsBulkUploadReducer,
  initialCapsBulkUploadState,
} from "../state/capsBulkUploadState";
import type {
  CandidateEntryMode,
  CapsBulkUploadSummary,
  CapsBulkUploadSummaryState,
  CapsUploadIssue,
} from "../types/admission-candidate";

export function deriveCapsSummaryState(
  summary: CapsBulkUploadSummary,
): CapsBulkUploadSummaryState {
  const isParseError =
    summary.errors.length === 1 && summary.errors[0].row === undefined;
  if (isParseError) return "parse-error";
  if (summary.processedCount === 0 && summary.skippedCount > 0) return "failed";
  if (summary.skippedCount > 0 || summary.errors.length > 0) return "partial";
  return "success";
}

export function generateCapsErrorReportCsv(issues: CapsUploadIssue[]): string {
  const header = "Row,Key,Stage,Message";
  const rows = issues.map((e) => {
    const row = e.row !== undefined ? String(e.row) : "—";
    const key = e.key ?? "—";
    const stage = e.stage ?? "—";
    return `${row},${JSON.stringify(key)},${JSON.stringify(stage)},${JSON.stringify(e.message)}`;
  });
  return [header, ...rows].join("\n");
}

/**
 * Resolves CAPS default lane with priority:
 * UTME (JAMB) -> first JAMB lane -> UTME -> first non-TRANSFER lane -> first lane.
 */
export function resolveDefaultCapsEntryMode(
  lanes: AdmissionCycleLaneConfig[],
): CandidateEntryMode | undefined {
  if (lanes.length === 0) return undefined;
  const utmeJamb = lanes.find(
    (l) => l.entryMode === "UTME" && l.identityMode === "JAMB",
  );
  if (utmeJamb) return utmeJamb.entryMode;
  const firstJamb = lanes.find((l) => l.identityMode === "JAMB");
  if (firstJamb) return firstJamb.entryMode;
  const utmeAny = lanes.find((l) => l.entryMode === "UTME");
  if (utmeAny) return utmeAny.entryMode;
  const firstNonTransfer = lanes.find((l) => l.entryMode !== "TRANSFER");
  if (firstNonTransfer) return firstNonTransfer.entryMode;
  return lanes[0]?.entryMode;
}

type UseAdmissionCandidateBulkUploadArgs = {
  cycleId: number | undefined;
  selectedCycle: AdmissionCycle | undefined;
  canIngest: boolean;
  onClose: () => void;
};

export function useAdmissionCandidateBulkUpload({
  cycleId,
  selectedCycle,
  canIngest,
  onClose,
}: UseAdmissionCandidateBulkUploadArgs) {
  const [state, dispatch] = useReducer(
    capsBulkUploadReducer,
    initialCapsBulkUploadState,
  );

  const [capsBulkUpload] = useCapsBulkUploadMutation();
  const store = useStore() as AppStore;
  const handleApiError = useApiError();

  const configuredLanes = useMemo(
    () => selectedCycle?.entryModes ?? [],
    [selectedCycle?.entryModes],
  );

  const entryModeOptions = useMemo(() => {
    if (configuredLanes.length === 0) {
      return CANDIDATE_ENTRY_MODE_OPTIONS;
    }
    return configuredLanes.map((lane) => ({
      value: lane.entryMode,
      label: lane.enabled
        ? getCandidateEntryModeLabel(lane.entryMode)
        : `${getCandidateEntryModeLabel(lane.entryMode)} (Paused)`,
    }));
  }, [configuredLanes]);

  const effectiveUploadEntryMode = useMemo(() => {
    if (
      state.uploadEntryMode &&
      (configuredLanes.length === 0 ||
        configuredLanes.some((l) => l.entryMode === state.uploadEntryMode))
    ) {
      return state.uploadEntryMode;
    }
    return resolveDefaultCapsEntryMode(configuredLanes);
  }, [state.uploadEntryMode, configuredLanes]);

  const handleFileChange = useCallback((file: File | null) => {
    dispatch({ type: CapsBulkUploadActionType.SetSelectedFile, file });
  }, []);

  const clearSelectedFile = useCallback(() => {
    dispatch({ type: CapsBulkUploadActionType.ClearSelectedFile });
  }, []);

  const handleUploadEntryModeChange = useCallback(
    (entryMode: CandidateEntryMode | undefined) => {
      dispatch({
        type: CapsBulkUploadActionType.SetUploadEntryMode,
        entryMode,
      });
    },
    [],
  );

  const handleUpload = useCallback(async () => {
    if (!state.selectedFile || cycleId === undefined) return;
    if (!canIngest) {
      notification.warning({
        message:
          "Candidate ingestion is only allowed when the cycle is in Pre-processing or Application Open.",
      });
      return;
    }
    dispatch({
      type: CapsBulkUploadActionType.SetIsUploading,
      isUploading: true,
    });
    try {
      const formData = new FormData();
      formData.append("file", state.selectedFile);
      if (effectiveUploadEntryMode) {
        formData.append("entryMode", effectiveUploadEntryMode);
      }
      const result = await capsBulkUpload({ cycleId, formData }).unwrap();
      if (deriveCapsSummaryState(result) === "success") {
        notifyMutationSuccess(
          `${result.processedCount} candidate${result.processedCount === 1 ? "" : "s"} imported successfully.`,
        );
      }
      dispatch({
        type: CapsBulkUploadActionType.SetSummaryResult,
        summary: result,
      });
    } catch (err: unknown) {
      dispatch({
        type: CapsBulkUploadActionType.SetIsUploading,
        isUploading: false,
      });
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    }
  }, [
    state.selectedFile,
    cycleId,
    canIngest,
    effectiveUploadEntryMode,
    capsBulkUpload,
    handleApiError,
  ]);

  const handleDownloadTemplate = useCallback(async () => {
    if (cycleId === undefined) {
      notification.warning({ message: "Select an admission cycle first." });
      return;
    }
    try {
      await downloadCapsTemplate(store, cycleId);
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "GET" },
      });
    }
  }, [store, cycleId, handleApiError]);

  const handleDownloadErrorReport = useCallback(() => {
    if (!state.summary) return;
    const issues = [...state.summary.errors, ...state.summary.warnings];
    const csv = generateCapsErrorReportCsv(issues);
    downloadBlob({
      blob: new Blob([csv], { type: "text/csv" }),
      filename: "caps-upload-issues.csv",
    });
  }, [state.summary]);

  const handleCloseSummary = useCallback(() => {
    dispatch({ type: CapsBulkUploadActionType.CloseSummary });
    onClose();
  }, [onClose]);

  const summaryState = state.summary
    ? deriveCapsSummaryState(state.summary)
    : null;

  return {
    state: {
      selectedFile: state.selectedFile,
      uploadEntryMode: effectiveUploadEntryMode,
      entryModeOptions,
      isUploading: state.isUploading,
      summary: state.summary,
      summaryModalOpen: state.summaryModalOpen,
    },
    actions: {
      handleFileChange,
      clearSelectedFile,
      handleUploadEntryModeChange,
      handleUpload,
      handleDownloadTemplate,
      handleDownloadErrorReport,
      handleCloseSummary,
    },
    flags: {
      hasFile: state.selectedFile !== null,
      summaryState,
      canUpload: cycleId !== undefined && canIngest,
    },
  };
}
