import type { AppStore } from "@/app/store";
import { downloadBlob } from "@/shared/utils/download/downloadFile";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { notification } from "antd";
import { useCallback, useState } from "react";
import { useStore } from "react-redux";
import {
  downloadCapsTemplate,
  useCapsBulkUploadMutation,
} from "../api/admissionCandidateApi";
import type {
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

type UseAdmissionCandidateBulkUploadArgs = {
  cycleId: number | undefined;
  canIngest: boolean;
  onClose: () => void;
};

export function useAdmissionCandidateBulkUpload({
  cycleId,
  canIngest,
  onClose,
}: UseAdmissionCandidateBulkUploadArgs) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [summary, setSummary] = useState<CapsBulkUploadSummary | null>(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  const [capsBulkUpload] = useCapsBulkUploadMutation();
  const store = useStore() as AppStore;

  const handleFileChange = useCallback((file: File | null) => {
    setSelectedFile(file);
    setUploadError(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || cycleId === undefined) return;
    if (!canIngest) {
      notification.warning({
        message:
          "Candidate ingestion is only allowed when the cycle is in Pre-processing or Application Open.",
      });
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const result = await capsBulkUpload({ cycleId, formData }).unwrap();
      setSummary(result);
      setSummaryModalOpen(true);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      setUploadError(parsed.message);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, cycleId, canIngest, capsBulkUpload]);

  const handleDownloadTemplate = useCallback(async () => {
    if (cycleId === undefined) {
      notification.warning({ message: "Select an admission cycle first." });
      return;
    }
    try {
      await downloadCapsTemplate(store, cycleId);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
    }
  }, [store, cycleId]);

  const handleDownloadErrorReport = useCallback(() => {
    if (!summary) return;
    const issues = [...summary.errors, ...summary.warnings];
    const csv = generateCapsErrorReportCsv(issues);
    downloadBlob({
      blob: new Blob([csv], { type: "text/csv" }),
      filename: "caps-upload-issues.csv",
    });
  }, [summary]);

  const handleCloseSummary = useCallback(() => {
    setSelectedFile(null);
    setUploadError(null);
    setSummary(null);
    setSummaryModalOpen(false);
    onClose();
  }, [onClose]);

  const summaryState = summary ? deriveCapsSummaryState(summary) : null;

  return {
    state: {
      selectedFile,
      isUploading,
      uploadError,
      summary,
      summaryModalOpen,
    },
    actions: {
      handleFileChange,
      handleUpload,
      handleDownloadTemplate,
      handleDownloadErrorReport,
      handleCloseSummary,
    },
    flags: {
      hasFile: selectedFile !== null,
      summaryState,
      canUpload: cycleId !== undefined && canIngest,
    },
  };
}
