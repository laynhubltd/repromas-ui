// Feature: student-transition
import {
    useGetAcademicSessionsQuery,
    useGetSemesterTypesQuery,
} from "@/features/settings/tabs/academic-calendar/api/academicCalendarApi";
import { useGetLevelsQuery } from "@/features/settings/tabs/level-config/api/levelApi";
import { useGetTransitionStatusesQuery } from "@/features/settings/tabs/student-transition-status/api/studentTransitionStatusApi";
import { useGetSemestersQuery } from "@/features/settings/tabs/system-timeframes/api/systemTimeFramesApi";
import { useMemo, useState } from "react";
import { useListTransitionsQuery } from "../api/studentTransitionsApi";
import type { StudentEnrollmentTransition } from "../types/studentTransition";

export function useTransitionsSection(studentId: number) {
  // ── Modal state ────────────────────────────────────────────────────────────

  const [formTarget, setFormTarget] = useState<StudentEnrollmentTransition | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentEnrollmentTransition | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // ── Transitions list ───────────────────────────────────────────────────────

  const {
    data: transitionsData,
    isLoading: transitionsLoading,
    isError: transitionsError,
    refetch,
  } = useListTransitionsQuery({
    "exact[student]": studentId,
    sort: "startDate:desc",
  });

  const transitions: StudentEnrollmentTransition[] = transitionsData?.member ?? [];

  // ── Reference data ─────────────────────────────────────────────────────────

  const { data: statusesData } = useGetTransitionStatusesQuery({
    sort: "name:asc",
    itemsPerPage: 100,
  });

  const { data: sessionsData } = useGetAcademicSessionsQuery({
    sort: "name:asc",
    itemsPerPage: 100,
  });

  const { data: semestersData } = useGetSemestersQuery({
    sort: "createdAt:asc",
    itemsPerPage: 100,
  });

  const { data: semesterTypesData } = useGetSemesterTypesQuery({
    sort: "sortOrder:asc",
    itemsPerPage: 100,
  });

  const { data: levelsData } = useGetLevelsQuery({
    sort: "name:asc",
    itemsPerPage: 100,
  });

  // ── Reference maps ─────────────────────────────────────────────────────────

  const statusMap = useMemo<Record<number, string>>(
    () =>
      Object.fromEntries(
        (statusesData?.member ?? []).map((s) => [s.id, s.name]),
      ),
    [statusesData],
  );

  const sessionMap = useMemo<Record<number, string>>(
    () =>
      Object.fromEntries(
        (sessionsData?.member ?? []).map((s) => [s.id, s.name]),
      ),
    [sessionsData],
  );

  const semesterTypeMap = useMemo<Record<number, string>>(
    () =>
      Object.fromEntries(
        (semesterTypesData?.member ?? []).map((st) => [st.id, st.name]),
      ),
    [semesterTypesData],
  );

  const semesterMap = useMemo<Record<number, string>>(
    () =>
      Object.fromEntries(
        (semestersData?.member ?? []).map((s) => [
          s.id,
          semesterTypeMap[s.semesterTypeId] ?? `Semester #${s.id}`,
        ]),
      ),
    [semestersData, semesterTypeMap],
  );

  const levelMap = useMemo<Record<number, string>>(
    () =>
      Object.fromEntries(
        (levelsData?.member ?? []).map((l) => [l.id, l.name]),
      ),
    [levelsData],
  );

  // ── Accordion grouping ─────────────────────────────────────────────────────

  const groupedBySession = useMemo(() => {
    const map = new Map<number, StudentEnrollmentTransition[]>();
    for (const t of transitions) {
      const group = map.get(t.sessionId) ?? [];
      group.push(t);
      map.set(t.sessionId, group);
    }
    return Array.from(map.entries()).map(([sessionId, items]) => ({
      sessionId,
      sessionLabel: sessionMap[sessionId] ?? `Session #${sessionId}`,
      transitions: items,
      mostRecentStartDate: items.reduce(
        (max, t) => (t.startDate > max ? t.startDate : max),
        items[0].startDate,
      ),
    }));
  }, [transitions, sessionMap]);

  const defaultExpandedKeys = useMemo(
    () =>
      groupedBySession.length > 0
        ? [
            String(
              groupedBySession.sort((a, b) =>
                b.mostRecentStartDate.localeCompare(a.mostRecentStartDate),
              )[0].sessionId,
            ),
          ]
        : [],
    [groupedBySession],
  );

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleOpenCreate = () => {
    setFormTarget(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (t: StudentEnrollmentTransition) => {
    setFormTarget(t);
    setFormModalOpen(true);
  };

  const handleOpenDelete = (t: StudentEnrollmentTransition) => {
    setDeleteTarget(t);
    setDeleteModalOpen(true);
  };

  const handleCloseForm = () => {
    setFormModalOpen(false);
    setFormTarget(null);
  };

  const handleCloseDelete = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  // ── Return ─────────────────────────────────────────────────────────────────

  return {
    state: {
      transitions,
      isLoading: transitionsLoading,
      isError: transitionsError,
      formTarget,
      deleteTarget,
      formModalOpen,
      deleteModalOpen,
      statusMap,
      sessionMap,
      semesterMap,
      levelMap,
    },
    actions: {
      handleOpenCreate,
      handleOpenEdit,
      handleOpenDelete,
      handleCloseForm,
      handleCloseDelete,
      refetch,
    },
    flags: {
      hasTransitions: transitions.length > 0,
      groupedBySession,
      defaultExpandedKeys,
    },
  };
}
