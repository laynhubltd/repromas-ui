// Feature: result-broadsheet
import { useCallback, useMemo, useState } from "react";
import {
  useGetBroadsheetReportQuery,
  useGetCohortBroadsheetApprovalQuery,
} from "../api/resultBroadsheetApi";
import type {
  BroadsheetFilterParams,
  BroadsheetSourceModel,
} from "../types/result-broadsheet";

export function useBroadsheetSource(filterParams: BroadsheetFilterParams | null) {
  const [userForcedLive, setUserForcedLive] = useState(false);

  const shouldFetch = Boolean(filterParams?.programId && filterParams?.levelId);

  const {
    data: approval,
    isLoading: isApprovalLoading,
  } = useGetCohortBroadsheetApprovalQuery(filterParams!, {
    skip: !shouldFetch,
  });

  const {
    data: report,
    isLoading: isReportLoading,
    isFetching,
    refetch,
  } = useGetBroadsheetReportQuery(filterParams!, {
    skip: !shouldFetch,
  });

  const toggleSourceMode = useCallback(() => {
    setUserForcedLive((prev) => !prev);
  }, []);

  const sourceModel: BroadsheetSourceModel = useMemo(() => {
    if (approval?.isFrozen && approval?.frozenAt && !userForcedLive) {
      return {
        source: "SNAPSHOT",
        data: report ?? null,
        frozenAt: approval.frozenAt,
        isPublished: Boolean(approval.isPublished),
      };
    }

    return {
      source: "LIVE",
      data: report ?? null,
      isPublished: Boolean(approval?.isPublished),
    };
  }, [approval, report, userForcedLive]);

  return {
    sourceModel,
    approval: approval ?? null,
    report: report ?? null,
    isLoading: isApprovalLoading || isReportLoading,
    isFetching,
    userForcedLive,
    toggleSourceMode,
    refetch,
  };
}
