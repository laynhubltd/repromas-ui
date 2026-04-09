import type { AppStore } from "@/app/store";
import { downloadBlob } from "@/shared/utils/download/downloadFile";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { notification } from "antd";
import { useCallback, useState } from "react";
import { useStore } from "react-redux";
import { downloadStudentTemplate, useBulkUploadMutation } from "../api/studentsApi";
import type { UploadError, UploadSummary, UploadSummaryState } from "../types/student";

// ─── Pure utility functions ───────────────────────────────────────────────────

export function deriveSummaryState(summary: UploadSummary): UploadSummaryState {
  const isParseError = summary.errors.length === 1 && summary.errors[0].row === undefined;
  if (isParseError) return "parse-error";
  if (summary.processedCount === 0 && summary.skippedCount > 0) return "failed";
  if (summary.skippedCount > 0) return "partial";
  return "success";
}

export function generateErrorReportCsv(errors: UploadError[]): string {
  const header = "Row,Matric Number,Reason";
  const rows = errors.map((e) => {
    const row = e.row !== undefined ? e.row : "—";
    return `${row},${JSON.stringify(e.matricNumber)},${JSON.stringify(e.message)}`;
  });
  return [header, ...rows].join("\n");
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

type UseStudentBulkUploadArgs = {
  onClose: () => void;
};

export function useStudentBulkUpload({ onClose }: UseStudentBulkUploadArgs) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [summary, setSummary] = useState<UploadSummary | null>(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  const [bulkUpload] = useBulkUploadMutation();
  const store = useStore() as AppStore;

  const handleFileChange = useCallback((file: File | null) => {
    setSelectedFile(file);
    setUploadError(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const result = await bulkUpload(formData).unwrap();
      setSummary(result);
      setSummaryModalOpen(true);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      setUploadError(parsed.message);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, bulkUpload]);

  const handleDownloadTemplate = useCallback(async () => {
    try {
      await downloadStudentTemplate(store);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
    }
  }, [store]);

  const handleDownloadErrorReport = useCallback(() => {
    if (!summary) return;
    const csv = generateErrorReportCsv(summary.errors);
    downloadBlob({ blob: new Blob([csv], { type: "text/csv" }), filename: "upload-errors.csv" });
  }, [summary]);

  const handleCloseSummary = useCallback(() => {
    setSelectedFile(null);
    setUploadError(null);
    setSummary(null);
    setSummaryModalOpen(false);
    onClose();
  }, [onClose]);

  const summaryState = summary ? deriveSummaryState(summary) : null;

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
    },
  };
}
