import { useMemo } from "react";
import { useGetBroadsheetReportQuery } from "../api/resultBroadsheetApi";
import type {
  BroadsheetFilterParams,
  BroadsheetReport,
} from "../types/result-broadsheet";

function unwrapReport(rawData: unknown): BroadsheetReport | null {
  if (!rawData) return null;
  if (Array.isArray(rawData)) {
    return (rawData[0] as BroadsheetReport) ?? null;
  }
  if (typeof rawData === "object" && rawData !== null) {
    const obj = rawData as Record<string, unknown>;
    if (Array.isArray(obj.member) && obj.member.length > 0) {
      return (obj.member[0] as BroadsheetReport) ?? null;
    }
    if (Array.isArray(obj["hydra:member"]) && (obj["hydra:member"] as unknown[]).length > 0) {
      return ((obj["hydra:member"] as unknown[])[0] as BroadsheetReport) ?? null;
    }
    if (Array.isArray(obj.data) && obj.data.length > 0) {
      return (obj.data[0] as BroadsheetReport) ?? null;
    }
    if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
      return (obj.data as BroadsheetReport) ?? null;
    }
  }
  return rawData as BroadsheetReport;
}

export function useBroadsheetReport(params: BroadsheetFilterParams | null) {
  const {
    data: rawData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetBroadsheetReportQuery(params as BroadsheetFilterParams, {
    skip: !params,
  });

  const report: BroadsheetReport | null = useMemo(
    () => unwrapReport(rawData),
    [rawData],
  );

  const meta = report?.meta;
  const courses = useMemo(() => report?.columns ?? [], [report?.columns]);
  const rows = useMemo(() => report?.rows ?? [], [report?.rows]);
  const statistics = report?.statistics;
  const summaryPage = report?.summaryPage;
  const graduatedStudents = useMemo(
    () => report?.graduatedStudents ?? [],
    [report?.graduatedStudents],
  );
  const classificationFootnote = report?.classificationFootnote;

  const hasData = rows.length > 0;
  const hasGraduates = graduatedStudents.length > 0;

  return {
    state: {
      report,
      meta,
      courses,
      rows,
      statistics,
      summaryPage,
      graduatedStudents,
      classificationFootnote,
      hasData,
      hasGraduates,
      isLoading,
      isFetching,
      isError,
      error,
    },
    actions: {
      refetch,
    },
  };
}
