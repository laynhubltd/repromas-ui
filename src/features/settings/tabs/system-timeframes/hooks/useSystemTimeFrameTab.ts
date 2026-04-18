// Feature: settings-timeframe
import { useEffect, useState } from "react";
import {
    useGetAcademicSessionsQuery,
    useGetSemesterTypesQuery,
} from "../../academic-calendar/api/academicCalendarApi";
import type {
    AcademicSession,
    Semester,
    SemesterType,
} from "../../academic-calendar/types/academic-calendar";
import { useGetSemestersQuery, useGetSystemTimeFramesQuery } from "../api/systemTimeFramesApi";
import type {
    EventType,
    SystemTimeFrame,
    SystemTimeFrameListParams,
    TimeFrameFilters,
} from "../types/system-timeframe";

// ── Pure helpers ─────────────────────────────────────────────────────────────

export function groupByEventType(
  timeFrames: SystemTimeFrame[],
): Record<EventType, SystemTimeFrame[]> {
  const result = {} as Record<EventType, SystemTimeFrame[]>;
  for (const tf of timeFrames) {
    if (!result[tf.eventType]) {
      result[tf.eventType] = [];
    }
    result[tf.eventType].push(tf);
  }
  return result;
}

export function buildQueryParams(
  filters: TimeFrameFilters,
  page: number,
  sort: string,
): SystemTimeFrameListParams {
  const base: SystemTimeFrameListParams = {
    sort,
    itemsPerPage: 30,
    page,
    include: "session,semester,scopeReference",
  };

  const hasFilters =
    filters.eventType !== undefined ||
    filters.scope !== undefined ||
    filters.sessionId !== undefined ||
    filters.semesterId !== undefined ||
    filters.isActive !== undefined ||
    filters.isLateWindow !== undefined;

  if (!hasFilters) {
    return base;
  }

  return {
    ...base,
    ...(filters.eventType !== undefined ? { "exact[eventType]": filters.eventType } : {}),
    ...(filters.scope !== undefined ? { "exact[scope]": filters.scope } : {}),
    ...(filters.sessionId !== undefined ? { "exact[sessionId]": filters.sessionId } : {}),
    ...(filters.semesterId !== undefined ? { "exact[semesterId]": filters.semesterId } : {}),
    ...(filters.isActive !== undefined ? { "boolean[isActive]": filters.isActive } : {}),
    ...(filters.isLateWindow !== undefined ? { "boolean[isLateWindow]": filters.isLateWindow } : {}),
  };
}

export function calcTotalPages(totalItems: number, itemsPerPage: number): number {
  if (itemsPerPage <= 0) return 0;
  return Math.ceil(totalItems / itemsPerPage);
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useSystemTimeFrameTab() {
  // ── List state ─────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<TimeFrameFilters>({});
  const [page, setPage] = useState(1);
  const [sort] = useState("startAt:asc");
  const [totalItems, setTotalItems] = useState(0);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [upsertTarget, setUpsertTarget] = useState<SystemTimeFrame | null>(null);
  const [upsertOpen, setUpsertOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SystemTimeFrame | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ── Queries ────────────────────────────────────────────────────────────────
  const queryParams = buildQueryParams(filters, page, sort);

  const { data: timeFramesData, isLoading, isError } = useGetSystemTimeFramesQuery(queryParams);

  // Sync totalItems from query result
  useEffect(() => {
    if (timeFramesData?.totalItems !== undefined) {
      setTotalItems(timeFramesData.totalItems);
    }
  }, [timeFramesData?.totalItems]);

  const timeFrames: SystemTimeFrame[] = timeFramesData?.member ?? [];
  const groupedTimeFrames = groupByEventType(timeFrames);

  const { data: sessionsData } = useGetAcademicSessionsQuery({
    sort: "name:desc",
    itemsPerPage: 100,
  });
  const sessions: AcademicSession[] = sessionsData?.member ?? [];

  const { data: semestersData } = useGetSemestersQuery(
    { "exact[sessionId]": filters.sessionId, sort: "semesterTypeId:asc", itemsPerPage: 100 },
    { skip: filters.sessionId === undefined },
  );
  const semesters: Semester[] = semestersData?.member ?? [];

  const { data: semesterTypesData } = useGetSemesterTypesQuery({
    sort: "sortOrder:asc",
    itemsPerPage: 100,
  });
  const semesterTypes: SemesterType[] = semesterTypesData?.member ?? [];

  // ── Action callbacks ───────────────────────────────────────────────────────
  const onApplyFilters = (newFilters: TimeFrameFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const onClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const onPageChange = (newPage: number) => {
    setPage(newPage);
  };

  const onOpenUpsert = (target?: SystemTimeFrame) => {
    setUpsertTarget(target ?? null);
    setUpsertOpen(true);
  };

  const onCloseUpsert = () => {
    setUpsertOpen(false);
    setUpsertTarget(null);
  };

  const onOpenDelete = (target: SystemTimeFrame) => {
    setDeleteTarget(target);
    setDeleteOpen(true);
  };

  const onCloseDelete = () => {
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  return {
    groupedTimeFrames,
    isLoading,
    isError,
    filters,
    page,
    totalItems,
    sort,
    sessions,
    semesters,
    semesterTypes,
    upsertOpen,
    upsertTarget,
    deleteOpen,
    deleteTarget,
    onApplyFilters,
    onClearFilters,
    onPageChange,
    onOpenUpsert,
    onCloseUpsert,
    onOpenDelete,
    onCloseDelete,
  };
}
