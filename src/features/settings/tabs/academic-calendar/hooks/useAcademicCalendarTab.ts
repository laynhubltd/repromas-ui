// Feature: academic-calendar
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { notification } from "antd";
import { useState } from "react";
import {
    useAdvanceSemesterStatusMutation,
    useGetAcademicSessionsQuery,
    useGetSemesterTypesQuery,
    useSetCurrentAcademicSessionMutation,
    useSetCurrentSemesterMutation,
} from "../api/academicCalendarApi";
import type { AcademicSession, Semester, SemesterType } from "../types/academic-calendar";
import { STATUS_NEXT } from "../utils/validators";

export function useAcademicCalendarTab() {
  // ── Queries ────────────────────────────────────────────────────────────────
  const {
    data: semesterTypesData,
    isLoading: semesterTypesLoading,
    isError: semesterTypesError,
    refetch: refetchSemesterTypes,
  } = useGetSemesterTypesQuery({ sort: "sortOrder:asc", itemsPerPage: 100 });

  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    isError: sessionsError,
    refetch: refetchSessions,
  } = useGetAcademicSessionsQuery({ sort: "name:desc", include: "semesters", itemsPerPage: 100 });

  const semesterTypes: SemesterType[] = semesterTypesData?.member ?? [];
  const sessions: AcademicSession[] = sessionsData?.member ?? [];

  // ── Mutations ──────────────────────────────────────────────────────────────
  const [setCurrentAcademicSession] = useSetCurrentAcademicSessionMutation();
  const [setCurrentSemester] = useSetCurrentSemesterMutation();
  const [advanceSemesterStatus] = useAdvanceSemesterStatusMutation();

  // ── SemesterType modal state ───────────────────────────────────────────────
  const [semesterTypeFormOpen, setSemesterTypeFormOpen] = useState(false);
  const [semesterTypeFormTarget, setSemesterTypeFormTarget] = useState<SemesterType | null>(null);
  const [deleteTypeTarget, setDeleteTypeTarget] = useState<SemesterType | null>(null);

  // ── Session modal state ────────────────────────────────────────────────────
  const [sessionFormOpen, setSessionFormOpen] = useState(false);
  const [sessionFormTarget, setSessionFormTarget] = useState<AcademicSession | null>(null);
  const [deleteSessionTarget, setDeleteSessionTarget] = useState<AcademicSession | null>(null);

  // ── Semester modal state ───────────────────────────────────────────────────
  const [semesterFormOpen, setSemesterFormOpen] = useState(false);
  const [semesterFormTarget, setSemesterFormTarget] = useState<Semester | null>(null);
  const [semesterFormSessionId, setSemesterFormSessionId] = useState<number | null>(null);
  const [deleteSemesterTarget, setDeleteSemesterTarget] = useState<Semester | null>(null);

  // ── SemesterType actions ───────────────────────────────────────────────────
  const handleOpenCreateSemesterType = () => {
    setSemesterTypeFormTarget(null);
    setSemesterTypeFormOpen(true);
  };

  const handleOpenEditSemesterType = (st: SemesterType) => {
    setSemesterTypeFormTarget(st);
    setSemesterTypeFormOpen(true);
  };

  const handleOpenDeleteSemesterType = (st: SemesterType) => {
    setDeleteTypeTarget(st);
  };

  const handleCloseSemesterTypeForm = () => {
    setSemesterTypeFormOpen(false);
    setSemesterTypeFormTarget(null);
  };

  const handleCloseDeleteSemesterType = () => {
    setDeleteTypeTarget(null);
  };

  // ── Session actions ────────────────────────────────────────────────────────
  const handleOpenCreateSession = () => {
    setSessionFormTarget(null);
    setSessionFormOpen(true);
  };

  const handleOpenEditSession = (s: AcademicSession) => {
    setSessionFormTarget(s);
    setSessionFormOpen(true);
  };

  const handleOpenDeleteSession = (s: AcademicSession) => {
    setDeleteSessionTarget(s);
  };

  const handleCloseSessionForm = () => {
    setSessionFormOpen(false);
    setSessionFormTarget(null);
  };

  const handleCloseDeleteSession = () => {
    setDeleteSessionTarget(null);
  };

  const handleSetCurrentSession = async (id: number) => {
    try {
      await setCurrentAcademicSession(id).unwrap();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
    }
  };

  // ── Semester actions ───────────────────────────────────────────────────────
  const handleOpenCreateSemester = (sessionId: number) => {
    setSemesterFormTarget(null);
    setSemesterFormSessionId(sessionId);
    setSemesterFormOpen(true);
  };

  const handleOpenEditSemester = (sem: Semester) => {
    setSemesterFormTarget(sem);
    setSemesterFormSessionId(null);
    setSemesterFormOpen(true);
  };

  const handleOpenDeleteSemester = (sem: Semester) => {
    setDeleteSemesterTarget(sem);
  };

  const handleCloseSemesterForm = () => {
    setSemesterFormOpen(false);
    setSemesterFormTarget(null);
    setSemesterFormSessionId(null);
  };

  const handleCloseDeleteSemester = () => {
    setDeleteSemesterTarget(null);
  };

  const handleAdvanceSemesterStatus = async (sem: Semester) => {
    const nextStatus = STATUS_NEXT[sem.status];
    if (!nextStatus) return;
    try {
      await advanceSemesterStatus({ id: sem.id, status: nextStatus }).unwrap();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      if (parsed.status === 422) {
        notification.error({
          message: "Invalid status transition — the semester cannot be moved to that status.",
        });
        return;
      }
      notification.error({ message: parsed.message });
    }
  };

  const handleSetCurrentSemester = async (id: number) => {
    try {
      await setCurrentSemester(id).unwrap();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
    }
  };

  return {
    state: {
      // SemesterType panel
      semesterTypes,
      semesterTypesLoading,
      semesterTypesError,
      semesterTypeFormTarget,
      semesterTypeFormOpen,
      deleteTypeTarget,
      // Session panel
      sessions,
      sessionsLoading,
      sessionsError,
      sessionFormTarget,
      sessionFormOpen,
      deleteSessionTarget,
      // Semester modals
      semesterFormTarget,
      semesterFormOpen,
      semesterFormSessionId,
      deleteSemesterTarget,
    },
    actions: {
      // SemesterType
      handleOpenCreateSemesterType,
      handleOpenEditSemesterType,
      handleOpenDeleteSemesterType,
      handleCloseSemesterTypeForm,
      handleCloseDeleteSemesterType,
      refetchSemesterTypes,
      // Session
      handleOpenCreateSession,
      handleOpenEditSession,
      handleOpenDeleteSession,
      handleCloseSessionForm,
      handleCloseDeleteSession,
      handleSetCurrentSession,
      refetchSessions,
      // Semester
      handleOpenCreateSemester,
      handleOpenEditSemester,
      handleOpenDeleteSemester,
      handleCloseSemesterForm,
      handleCloseDeleteSemester,
      handleAdvanceSemesterStatus,
      handleSetCurrentSemester,
    },
  };
}
