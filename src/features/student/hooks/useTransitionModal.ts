// Feature: student-transition
import {
    useGetAcademicSessionsQuery,
    useGetSemesterTypesQuery,
} from "@/features/settings/tabs/academic-calendar/api/academicCalendarApi";
import { useGetLevelsQuery } from "@/features/settings/tabs/level-config/api/levelApi";
import { useGetTransitionStatusesQuery } from "@/features/settings/tabs/student-transition-status/api/studentTransitionStatusApi";
import { useGetSemestersQuery } from "@/features/settings/tabs/system-timeframes/api/systemTimeFramesApi";
import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { HttpStatusCode, parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
    useCreateTransitionMutation,
    useDeleteTransitionMutation,
    useUpdateTransitionMutation,
} from "../api/studentTransitionsApi";
import type { StudentEnrollmentTransition } from "../types/studentTransition";

// ─── Form field values shape ──────────────────────────────────────────────────

type TransitionFormValues = {
  statusId: number;
  sessionId: number;
  semesterId: number;
  levelId: number;
  startDate: string;
  endDate?: string | null;
  remarks?: string | null;
};

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

/**
 * Upsert hook for TransitionFormModal.
 * - target === null  → create mode
 * - target !== null  → edit mode (studentId and semesterId are immutable)
 */
export function useTransitionFormModal(
  target: StudentEnrollmentTransition | null,
  open: boolean,
  onClose: () => void,
  studentId: number,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<TransitionFormValues>();
  const [createTransition, { isLoading: isCreating }] = useCreateTransitionMutation();
  const [updateTransition, { isLoading: isUpdating }] = useUpdateTransitionMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | undefined>(
    target?.sessionId ?? undefined,
  );

  const isLoading = isCreating || isUpdating;

  // ── Reference data queries ─────────────────────────────────────────────────

  const { data: statusesData, isLoading: statusesLoading } = useGetTransitionStatusesQuery(
    { sort: "name:asc", itemsPerPage: 100 },
    { skip: !open },
  );
  const statuses = (statusesData?.member ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    canRegisterCourses: s.canRegisterCourses,
  }));

  const { data: sessionsData, isLoading: sessionsLoading } = useGetAcademicSessionsQuery(
    { sort: "name:asc", itemsPerPage: 100 },
    { skip: !open },
  );
  const sessions = (sessionsData?.member ?? []).map((s) => ({ id: s.id, name: s.name, startDate: s.startDate }));

  const { data: semestersData, isLoading: semestersLoading } = useGetSemestersQuery(
    { "exact[session]": selectedSessionId, sort: "createdAt:asc", itemsPerPage: 100 },
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
  const levels = (levelsData?.member ?? []).map((l) => ({ id: l.id, name: l.name }));

  // ── Pre-fill form in edit mode; reset on close ─────────────────────────────

  useEffect(() => {
    if (open && target) {
      setSelectedSessionId(target.sessionId);
      form.setFieldsValue({
        statusId: target.statusId,
        sessionId: target.sessionId,
        levelId: target.levelId,
        startDate: target.startDate,
        endDate: target.endDate ?? undefined,
        remarks: target.remarks ?? undefined,
      });
    }
    if (!open) {
      form.resetFields();
      setFormError(null);
      setSelectedSessionId(undefined);
    }
  }, [open, target, form]);

  // ── Session change handler ─────────────────────────────────────────────────

  const handleSessionChange = (sessionId: number | undefined) => {
    setSelectedSessionId(sessionId);
    form.setFieldValue("semesterId", undefined);
    // In create mode, auto-fill startDate from the selected session's startDate
    if (!isEditMode && sessionId) {
      const session = (sessionsData?.member ?? []).find((s) => s.id === sessionId);
      if (session?.startDate) {
        form.setFieldValue("startDate", dayjs(session.startDate));
      }
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormError(null);

      if (isEditMode) {
        await updateTransition({
          id: target.id,
          statusId: values.statusId,
          sessionId: values.sessionId,
          levelId: values.levelId,
          startDate: values.startDate,
          endDate: values.endDate ?? null,
          remarks: values.remarks ?? null,
        }).unwrap();
      } else {
        await createTransition({
          studentId,
          statusId: values.statusId,
          sessionId: values.sessionId,
          semesterId: values.semesterId,
          levelId: values.levelId,
          startDate: values.startDate,
          endDate: values.endDate ?? null,
          remarks: values.remarks ?? null,
        }).unwrap();
      }

      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);

      if (!isEditMode && parsed.status === HttpStatusCode.Conflict) {
        // 409 on POST — duplicate student + semester
        notification.error({ message: parsed.message });
        setFormError("A transition for this student and semester already exists.");
        return;
      }

      if (isEditMode && parsed.status === HttpStatusCode.NotFound) {
        // 404 on PUT — record was deleted
        notification.error({ message: "This transition no longer exists." });
        onClose();
        return;
      }

      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, setFormError);
    }
  };

  // ── Cancel ─────────────────────────────────────────────────────────────────

  const handleCancel = () => {
    form.resetFields();
    setFormError(null);
    setSelectedSessionId(undefined);
    onClose();
  };

  return {
    state: { formError, isLoading, isEditMode },
    actions: { handleSubmit, handleCancel, handleSessionChange },
    form,
    refs: {
      statuses,
      sessions,
      semesters,
      levels,
      statusesLoading,
      sessionsLoading,
      semestersLoading,
      levelsLoading,
    },
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete hook for DeleteTransitionModal.
 * - 404 on DELETE → close silently (list refetches via cache invalidation)
 */
export function useDeleteTransitionModal(
  target: StudentEnrollmentTransition | null,
  open: boolean,
  onClose: () => void,
  studentId: number,
) {
  const [deleteTransition, { isLoading }] = useDeleteTransitionMutation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteTransition({ id: target.id, studentId }).unwrap();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);

      if (parsed.status === HttpStatusCode.NotFound) {
        // 404 — close silently; list refetches via cache invalidation
        onClose();
        return;
      }

      notification.error({ message: parsed.message });
      setError(parsed.message);
    }
  };

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  return {
    state: { error, isLoading },
    actions: { handleConfirm, handleCancel },
  };
}
