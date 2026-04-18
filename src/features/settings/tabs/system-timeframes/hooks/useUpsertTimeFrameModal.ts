// Feature: settings-timeframe
import { Form } from "antd";
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
import {
  useCreateSystemTimeFrameMutation,
  useGetSemestersQuery,
  useUpdateSystemTimeFrameMutation,
} from "../api/systemTimeFramesApi";
import type {
  CreateSystemTimeFrameRequest,
  EventType,
  Scope,
  SystemTimeFrame,
} from "../types/system-timeframe";
import { normalizeTimeFrameApiError } from "../utils/validators";

export type UpsertTimeFrameFormValues = {
  eventType: EventType;
  scope: Scope;
  referenceId: number | null;
  sessionId: number | null;
  semesterId: number | null;
  startAt: string;
  endAt: string;
  isLateWindow: boolean;
  isActive: boolean;
};

export type UseUpsertTimeFrameModalResult = {
  form: ReturnType<typeof Form.useForm<UpsertTimeFrameFormValues>>[0];
  formError: string | null;
  isSubmitting: boolean;
  sessions: AcademicSession[];
  semesters: Semester[];
  semesterTypes: SemesterType[];
  sessionsLoading: boolean;
  semestersLoading: boolean;
  selectedSessionId: number | null;
  onSessionChange: (sessionId: number | null) => void;
  handleSubmit: () => Promise<void>;
  handleCancel: () => void;
};

export function useUpsertTimeFrameModal(
  open: boolean,
  target: SystemTimeFrame | null,
  onClose: () => void,
): UseUpsertTimeFrameModalResult {
  const [form] = Form.useForm<UpsertTimeFrameFormValues>();
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  const [createTimeFrame, { isLoading: isCreating }] = useCreateSystemTimeFrameMutation();
  const [updateTimeFrame, { isLoading: isUpdating }] = useUpdateSystemTimeFrameMutation();
  const isSubmitting = isCreating || isUpdating;

  // ── Sessions ───────────────────────────────────────────────────────────────
  const { data: sessionsData, isLoading: sessionsLoading } = useGetAcademicSessionsQuery({
    sort: "name:desc",
    itemsPerPage: 100,
  });
  const sessions: AcademicSession[] = sessionsData?.member ?? [];

  // ── Semesters (filtered by selected session) ───────────────────────────────
  const { data: semestersData, isLoading: semestersLoading } = useGetSemestersQuery(
    { "exact[session]": selectedSessionId ?? undefined, sort: "createdAt:asc", itemsPerPage: 100 },
    { skip: selectedSessionId === null },
  );
  const semesters: Semester[] = semestersData?.member ?? [];

  // ── Semester types (for display labels) ───────────────────────────────────
  const { data: semesterTypesData } = useGetSemesterTypesQuery({
    sort: "sortOrder:asc",
    itemsPerPage: 100,
  });
  const semesterTypes: SemesterType[] = semesterTypesData?.member ?? [];

  // ── Populate form when opening in edit mode ────────────────────────────────
  useEffect(() => {
    if (open && target) {
      setSelectedSessionId(target.sessionId);
      form.setFieldsValue({
        eventType: target.eventType,
        scope: target.scope,
        referenceId: target.referenceId,
        sessionId: target.sessionId,
        semesterId: target.semesterId,
        startAt: target.startAt,
        endAt: target.endAt,
        isLateWindow: target.isLateWindow,
        isActive: target.isActive,
      });
    } else if (open && !target) {
      // Create mode — reset to defaults
      setSelectedSessionId(null);
      form.resetFields();
      form.setFieldsValue({ isActive: true, isLateWindow: false });
    }
  }, [open, target, form]);

  // ── Session change handler — clears semesterId ─────────────────────────────
  const onSessionChange = (sessionId: number | null) => {
    console.log({ sessionId });
    setSelectedSessionId(sessionId);
    form.setFieldValue("semesterId", null);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormError(null);

      const payload: CreateSystemTimeFrameRequest = {
        eventType: values.eventType,
        scope: values.scope,
        referenceId: values.referenceId ?? null,
        sessionId: values.sessionId ?? null,
        semesterId: values.semesterId ?? null,
        startAt: values.startAt,
        endAt: values.endAt,
        isLateWindow: values.isLateWindow ?? false,
        isActive: values.isActive ?? true,
      };

      if (target) {
        await updateTimeFrame({ ...payload, id: target.id }).unwrap();
      } else {
        await createTimeFrame(payload).unwrap();
      }

      form.resetFields();
      setSelectedSessionId(null);
      onClose();
    } catch (err: unknown) {
      // Ant Design form validation errors are thrown as plain objects without status/data
      // — only handle API errors (those have a status or data property)
      const isApiError =
        err !== null &&
        typeof err === "object" &&
        ("status" in (err as object) || "data" in (err as object));

      if (isApiError) {
        const message = normalizeTimeFrameApiError(err);
        setFormError(message ?? "An unexpected error occurred. Please try again.");
      }
    }
  };

  // ── Cancel ─────────────────────────────────────────────────────────────────
  const handleCancel = () => {
    form.resetFields();
    setFormError(null);
    setSelectedSessionId(null);
    onClose();
  };

  return {
    form,
    formError,
    isSubmitting,
    sessions,
    semesters,
    semesterTypes,
    sessionsLoading,
    semestersLoading,
    selectedSessionId,
    onSessionChange,
    handleSubmit,
    handleCancel,
  };
}
