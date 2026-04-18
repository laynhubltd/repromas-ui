import type { AppStore } from "@/app/store";
import { downloadBlob } from "@/shared/utils/download/downloadFile";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { notification } from "antd";
import { useCallback, useState } from "react";
import { useStore } from "react-redux";
import { downloadCourseTemplate, useBulkUploadCoursesMutation } from "../api/coursesApi";
import type { CourseUploadError, CourseUploadSummary, CourseUploadSummaryState } from "../types/course";

// ─── Pure utility functions ───────────────────────────────────────────────────

export function deriveSummaryState(summary: CourseUploadSummary): CourseUploadSummaryState {
  const isParseError = summary.errors.length === 1 && summary.errors[0].row === undefined;
  if (isParseError) return "parse-error";
  if (summary.processedCount === 0 && summary.skippedCount > 0) return "failed";
  if (summary.skippedCount > 0) return "partial";
  return "success";
}

export function generateErrorReportCsv(errors: CourseUploadError[]): string {
  const header = "Row,Code,Reason";
  const rows = errors.map((e) => {
    const row = e.row !== undefined ? e.row : "—";
    return `${row},${JSON.stringify(e.code)},${JSON.stringify(e.message)}`;
  });
  return [header, ...rows].join("\n");
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

type UseCourseBulkUploadArgs = {
  onClose: () => void;
};

export function useCourseBulkUpload({ onClose }: UseCourseBulkUploadArgs) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [summary, setSummary] = useState<CourseUploadSummary | null>(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  const [bulkUpload] = useBulkUploadCoursesMutation();
  const store = useStore() as AppStore;

  const handleFileChange = useCallback((file: File | null) => {
    setSelectedFile(file);
    if (file === null) setUploadError(null);
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
      await downloadCourseTemplate(store);
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
