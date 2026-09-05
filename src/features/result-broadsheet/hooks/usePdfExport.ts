import type { AppStore } from "@/app/store";
import { downloadFileFromUrl } from "@/shared/utils/download/downloadFile";
import { notification } from "antd";
import { useCallback, useState } from "react";
import { useStore } from "react-redux";
import type { BroadsheetFilterParams, BroadsheetMeta } from "../types/result-broadsheet";

export function usePdfExport(
  params: BroadsheetFilterParams | null,
  meta?: BroadsheetMeta,
) {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const store = useStore() as AppStore;

  const handleExportPdf = useCallback(async () => {
    if (!params) {
      notification.warning({
        message: "Incomplete Selection",
        description: "Please select all required filters before exporting PDF.",
      });
      return;
    }

    setIsExporting(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("programId", String(params.programId));
      queryParams.set("levelId", String(params.levelId));
      if (params.sessionId) queryParams.set("sessionId", String(params.sessionId));
      if (params.semesterTypeId) queryParams.set("semesterTypeId", String(params.semesterTypeId));
      if (params.semesterId) queryParams.set("semesterId", String(params.semesterId));
      if (params.curriculumVersionId) {
        queryParams.set("curriculumVersionId", String(params.curriculumVersionId));
      }

      const programPart = (meta?.programName ?? "program")
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .toLowerCase();
      const sessionPart = (meta?.sessionName ?? "session")
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .toLowerCase();
      const semesterPart = (meta?.semesterTypeName ?? "sem")
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .toLowerCase();

      const filename = `broadsheet_${programPart}_${sessionPart}_${semesterPart}.pdf`;

      await downloadFileFromUrl(
        {
          url: `/results/broadsheet/pdf?${queryParams.toString()}`,
          filename,
          accept: "application/pdf",
        },
        store,
      );

      notification.success({
        message: "PDF Downloaded",
        description: `Successfully exported ${filename}`,
      });
    } catch (error) {
      notification.error({
        message: "Export Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate official broadsheet PDF. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  }, [params, meta, store]);

  return {
    isExporting,
    handleExportPdf,
  };
}
