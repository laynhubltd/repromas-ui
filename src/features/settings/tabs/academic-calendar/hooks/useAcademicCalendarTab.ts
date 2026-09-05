// Feature: academic-calendar
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { useMemo, useState } from "react";
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
  const handleApiError = useApiError();

  // ── Queries ────────────────────────────────────────────────────────────────
  const {
    data: semesterTypesData,
    isLoading: semesterTypesLoading,
    isError: semesterTypesError,
    error: semesterTypesQueryError,
    refetch: refetchSemesterTypes,
  } = useGetSemesterTypesQuery({ sort: "sortOrder:asc", itemsPerPage: 100 });

  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    isError: sessionsError,
    error: sessionsQueryError,
    refetch: refetchSessions,
  } = useGetAcademicSessionsQuery({ sort: "rankOrder:desc", include: "semesters", itemsPerPage: 100 });

  const semesterTypesSectionError = useMemo(
    () =>
      deriveSectionErrorMessage(semesterTypesError, semesterTypesQueryError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [semesterTypesError, semesterTypesQueryError],
  );

  const sessionsSectionError = useMemo(
    () =>
      deriveSectionErrorMessage(sessionsError, sessionsQueryError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [sessionsError, sessionsQueryError],
  );

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
      notifyMutationSuccess("Current academic session updated successfully.");
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
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
      notifyMutationSuccess("Semester status advanced successfully.");
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    }
  };

  const handleSetCurrentSemester = async (id: number) => {
    try {
      await setCurrentSemester(id).unwrap();
      notifyMutationSuccess("Current semester updated successfully.");
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    }
  };

  return {
    state: {
      // SemesterType panel
      semesterTypes,
      semesterTypesLoading,
      semesterTypesError,
      semesterTypesSectionError,
      semesterTypeFormTarget,
      semesterTypeFormOpen,
      deleteTypeTarget,
      // Session panel
      sessions,
      sessionsLoading,
      sessionsError,
      sessionsSectionError,
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
