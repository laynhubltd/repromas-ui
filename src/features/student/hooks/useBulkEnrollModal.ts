// Feature: student-transition
import {
    useGetAcademicSessionsQuery,
    useGetSemesterTypesQuery,
} from "@/features/settings/tabs/academic-calendar/api/academicCalendarApi";
import { useGetLevelsQuery } from "@/features/settings/tabs/level-config/api/levelApi";
import { useGetTransitionStatusesQuery } from "@/features/settings/tabs/student-transition-status/api/studentTransitionStatusApi";
import { useGetSemestersQuery } from "@/features/settings/tabs/system-timeframes/api/systemTimeFramesApi";
import {
    HttpStatusCode,
    parseApiError,
} from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGetStudentsQuery } from "../api/studentsApi";
import { useBulkCreateTransitionMutation } from "../api/studentTransitionsApi";
import type { Student } from "../types/student";
import type { BulkCreateTransitionResult } from "../types/studentTransition";

type BulkEnrollFormValues = {
  statusId: number;
  sessionId: number;
  semesterId: number;
  levelId: number;
  startDate: string;
  endDate?: string | null;
  remarks?: string | null;
};

export function useBulkEnrollModal(open: boolean, onClose: () => void) {
  const [form] = Form.useForm<BulkEnrollFormValues>();

  // ── Student search / pagination state ─────────────────────────────────────

  const [studentSearch, setStudentSearch] = useState("");
  const [debouncedStudentSearch, setDebouncedStudentSearch] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const searchDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // ── Selection / submission state ──────────────────────────────────────────

  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkCreateTransitionResult | null>(null);

  // ── Session-scoped semester dropdown ──────────────────────────────────────

  const [selectedSessionId, setSelectedSessionId] = useState<
    number | undefined
  >(undefined);

  // ── Level selection — gates student list visibility ───────────────────────

  const [selectedLevelId, setSelectedLevelId] = useState<number | undefined>(
    undefined,
  );

  // ── Mutations ─────────────────────────────────────────────────────────────

  const [bulkCreateTransition, { isLoading: isSubmitting }] =
    useBulkCreateTransitionMutation();

  // ── Reset on close ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setStudentSearch("");
      setDebouncedStudentSearch("");
      setStudentPage(1);
      setSelectedStudentIds([]);
      setFormError(null);
      setResult(null);
      setSelectedSessionId(undefined);
      setSelectedLevelId(undefined);
      if (searchDebounceTimer.current)
        clearTimeout(searchDebounceTimer.current);
    }
  }, [open, form]);

  // ── Cleanup debounce timer on unmount ─────────────────────────────────────

  useEffect(() => {
    return () => {
      if (searchDebounceTimer.current)
        clearTimeout(searchDebounceTimer.current);
    };
  }, []);

  // ── Student query — only runs when a level is selected ───────────────────
  // Filtered by currentLevelId and searched by matric number.

  const studentQueryParams = {
    itemsPerPage: 100,
    page: studentPage,
    ...(selectedLevelId ? { "exact[currentLevelId]": selectedLevelId } : {}),
    ...(debouncedStudentSearch
      ? { "search[matricNumber]": debouncedStudentSearch }
      : {}),
  };

  const { data: studentsData, isLoading: studentsLoading } =
    useGetStudentsQuery(studentQueryParams, {
      skip: !open || !selectedLevelId,
    });

  const students: Student[] = studentsData?.member ?? [];
  const totalStudents = studentsData?.totalItems ?? 0;

  // ── Reference data queries ─────────────────────────────────────────────────

  const { data: statusesData } = useGetTransitionStatusesQuery(
    { sort: "name:asc", itemsPerPage: 100 },
    { skip: !open },
  );
  const statuses = (statusesData?.member ?? []).map((s) => ({
    id: s.id,
    name: s.name,
  }));

  const { data: sessionsData, isLoading: sessionsLoading } =
    useGetAcademicSessionsQuery(
      { sort: "name:asc", itemsPerPage: 100 },
      { skip: !open },
    );
  const sessions = (sessionsData?.member ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    isCurrent: s.isCurrent,
  }));

  const { data: semestersData, isLoading: semestersLoading } =
    useGetSemestersQuery(
      {
        "exact[session]": selectedSessionId,
        sort: "createdAt:asc",
        itemsPerPage: 100,
      },
      { skip: !selectedSessionId },
    );

  const { data: semesterTypesData } = useGetSemesterTypesQuery(
    { sort: "sortOrder:asc", itemsPerPage: 100 },
    { skip: !open },
  );
  const semesterTypeMap = Object.fromEntries(
    (semesterTypesData?.member ?? []).map((st) => [st.id, st.name]),
  );
  const semesters = (semestersData?.member ?? []).map((s) => ({
    id: s.id,
    name: semesterTypeMap[s.semesterTypeId] ?? `Semester #${s.id}`,
  }));

  const { data: levelsData, isLoading: levelsLoading } = useGetLevelsQuery(
    { sort: "name:asc", itemsPerPage: 100 },
    { skip: !open },
  );
  const levels = (levelsData?.member ?? []).map((l) => ({
    id: l.id,
    name: l.name,
  }));

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleStudentSearchChange = useCallback((value: string) => {
    setStudentSearch(value);
    setStudentPage(1);
    if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);
    searchDebounceTimer.current = setTimeout(
      () => setDebouncedStudentSearch(value),
      300,
    );
  }, []);

  const handleStudentPageChange = useCallback((page: number) => {
    setStudentPage(page);
  }, []);

  const handleSelectionChange = useCallback((ids: number[]) => {
    setSelectedStudentIds(ids);
  }, []);

  const handleSessionChange = useCallback(
    (sessionId: number | undefined) => {
      setSelectedSessionId(sessionId);
      form.setFieldValue("semesterId", undefined);
    },
    [form],
  );

  const handleLevelChange = useCallback((levelId: number | undefined) => {
    setSelectedLevelId(levelId);
    // Clear student selection when level changes
    setSelectedStudentIds([]);
    setStudentPage(1);
  }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormError(null);

      // Deduplicate studentIds before submission (Requirement 13.6)
      const uniqueStudentIds = [...new Set(selectedStudentIds)];

      const response = await bulkCreateTransition({
        studentIds: uniqueStudentIds,
        statusId: values.statusId,
        sessionId: values.sessionId,
        semesterId: values.semesterId,
        levelId: values.levelId,
        startDate: values.startDate,
        endDate: values.endDate ?? null,
        remarks: values.remarks ?? null,
      }).unwrap();

      // 201 — set result, keep modal open to show summary
      setResult(response);
    } catch (err: unknown) {
      const parsed = parseApiError(err);

      if (parsed.status === HttpStatusCode.UnprocessableEntity) {
        // 422 — no transitions written; show detail as ErrorAlert
        setFormError(parsed.message);
        return;
      }

      // 400 — show notification + inline error
      notification.error({ message: parsed.message });
      setFormError(parsed.message);
    }
  };

  const handleRetryFailed = useCallback(() => {
    if (!result) return;
    const failedIds = Object.keys(result.failed).map(Number);
    setSelectedStudentIds(failedIds);
    setResult(null);
  }, [result]);

  const handleCancel = useCallback(() => {
    form.resetFields();
    setFormError(null);
    setResult(null);
    setSelectedStudentIds([]);
    setSelectedSessionId(undefined);
    setSelectedLevelId(undefined);
    onClose();
  }, [form, onClose]);

  // ── Return ─────────────────────────────────────────────────────────────────

  return {
    state: {
      students,
      totalStudents,
      studentsLoading,
      studentSearch,
      studentPage,
      selectedStudentIds,
      formError,
      isSubmitting,
      result,
      selectedLevelId,
    },
    actions: {
      handleStudentSearchChange,
      handleStudentPageChange,
      handleSelectionChange,
      handleSessionChange,
      handleLevelChange,
      handleSubmit,
      handleRetryFailed,
      handleCancel,
    },
    form,
    refs: {
      statuses,
      sessions,
      semesters,
      levels,
      sessionsLoading,
      semestersLoading,
      levelsLoading,
    },
  };
}
