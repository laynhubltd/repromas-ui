import type { AppStore } from "@/app/store";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { downloadBlob } from "@/shared/utils/download/downloadFile";
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
  const [summary, setSummary] = useState<UploadSummary | null>(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  const [bulkUpload] = useBulkUploadMutation();
  const store = useStore() as AppStore;
  const handleApiError = useApiError();

  const handleFileChange = useCallback((file: File | null) => {
    setSelectedFile(file);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const result = await bulkUpload(formData).unwrap();
      if (deriveSummaryState(result) === "success") {
        notifyMutationSuccess(
          `${result.processedCount} student${result.processedCount === 1 ? "" : "s"} imported successfully.`,
        );
      }
      setSummary(result);
      setSummaryModalOpen(true);
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, bulkUpload, handleApiError]);

  const handleDownloadTemplate = useCallback(async () => {
    try {
      await downloadStudentTemplate(store);
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "GET" },
      });
    }
  }, [store, handleApiError]);

  const handleDownloadErrorReport = useCallback(() => {
    if (!summary) return;
    const csv = generateErrorReportCsv(summary.errors);
    downloadBlob({ blob: new Blob([csv], { type: "text/csv" }), filename: "upload-errors.csv" });
  }, [summary]);

  const handleCloseSummary = useCallback(() => {
    setSelectedFile(null);
    setSummary(null);
    setSummaryModalOpen(false);
    onClose();
  }, [onClose]);

  const summaryState = summary ? deriveSummaryState(summary) : null;

  return {
    state: {
      selectedFile,
      isUploading,
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
