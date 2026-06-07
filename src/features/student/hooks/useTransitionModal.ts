// Feature: student-transition
import {
    useGetAcademicSessionsQuery,
    useGetSemesterTypesQuery,
} from "@/features/settings/tabs/academic-calendar/api/academicCalendarApi";
import { useGetLevelsQuery } from "@/features/settings/tabs/level-config/api/levelApi";
import { useGetTransitionStatusesQuery } from "@/features/settings/tabs/student-transition-status/api/studentTransitionStatusApi";
import { useGetSemestersQuery } from "@/features/settings/tabs/system-timeframes/api/systemTimeFramesApi";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
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
  const [selectedSessionId, setSelectedSessionId] = useState<number | undefined>(
    target?.sessionId ?? undefined,
  );
  const handleApiError = useApiError();

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

      notifyMutationSuccess(
        mutationSuccessMessage(
          "Enrollment transition",
          isEditMode ? "updated" : "created",
        ),
      );
      form.resetFields();
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isEditMode ? "PATCH" : "POST",
        },
        form,
      });
    }
  };

  // ── Cancel ─────────────────────────────────────────────────────────────────

  const handleCancel = () => {
    form.resetFields();
    setSelectedSessionId(undefined);
    onClose();
  };

  return {
    state: { isLoading, isEditMode },
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

export function useDeleteTransitionModal(
  target: StudentEnrollmentTransition | null,
  _open: boolean,
  onClose: () => void,
  studentId: number,
) {
  const [deleteTransition, { isLoading }] = useDeleteTransitionMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteTransition({ id: target.id, studentId }).unwrap();
      notifyMutationSuccess(
        mutationSuccessMessage("Enrollment transition", "deleted"),
      );
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "DELETE" },
      });
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return {
    state: { isLoading },
    actions: { handleConfirm, handleCancel },
  };
}
