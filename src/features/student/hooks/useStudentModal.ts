import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useGetCurriculumVersionsQuery } from "@/features/settings/tabs/curriculum-version/api/curriculumVersionApi";
import { useGetLevelsQuery } from "@/features/settings/tabs/level-config/api/levelApi";
import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useEffect, useMemo, useState } from "react";
import {
  useCreateStudentMutation,
  useDeleteStudentMutation,
  useUpdateStudentMutation,
} from "../api/studentsApi";
import type { Student } from "../types/student";

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

type StudentFormValues = {
  matricNumber: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  entryMode: string;
  programId: number;
  entryLevelId: number;
  currentLevelId: number;
  curriculumVersionId: number;
  status: string;
  metaData?: string | null;
};

/**
 * Upsert hook for Student form modal.
 * - target === null  → create mode
 * - target !== null  → edit mode
 */
export function useStudentFormModal(
  target: Student | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<StudentFormValues>();
  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const isLoading = isCreating || isUpdating;

  // ─── Reference data ───────────────────────────────────────────────────────
  const { data: programsData, isLoading: isProgramsLoading } =
    useGetProgramsQuery({ itemsPerPage: 200 });

  const { data: levelsData, isLoading: isLevelsLoading } = useGetLevelsQuery({
    itemsPerPage: 200,
  });

  const {
    data: curriculumVersionsData,
    isLoading: isCurriculumVersionsLoading,
  } = useGetCurriculumVersionsQuery({ itemsPerPage: 200 });

  const programs = useMemo(() => programsData?.member ?? [], [programsData]);
  const levels = useMemo(() => levelsData?.member ?? [], [levelsData]);
  const curriculumVersions = useMemo(
    () => curriculumVersionsData?.member ?? [],
    [curriculumVersionsData],
  );

  /** Display name of the student's program (edit mode read-only display). */
  const programName = useMemo(
    () =>
      programs.find((p) => p.id === target?.programId)?.name ??
      `Program #${target?.programId}`,
    [programs, target?.programId],
  );

  // Pre-fill form in edit mode
  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({
        firstName: target.firstName,
        lastName: target.lastName,
        email: target.email ?? undefined,
        currentLevelId: target.currentLevelId,
        status: target.status,
        metaData: target.metaData
          ? JSON.stringify(target.metaData, null, 2)
          : undefined,
      });
    }
  }, [open, target, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormError(null);

      if (isEditMode) {
        await updateStudent({
          id: target.id,
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email?.trim() || null,
          currentLevelId: values.currentLevelId,
          // status is always included in the PUT body, even if unchanged
          status: (values.status as Student["status"]) ?? target.status,
          metaData: values.metaData
            ? JSON.parse(values.metaData as string)
            : null,
        }).unwrap();
      } else {
        await createStudent({
          matricNumber: values.matricNumber.trim(),
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email?.trim() || null,
          entryMode: values.entryMode as Student["entryMode"],
          programId: values.programId,
          entryLevelId: values.entryLevelId,
          currentLevelId: values.currentLevelId,
          curriculumVersionId: values.curriculumVersionId,
          status: (values.status as Student["status"]) || "ACTIVE",
          metaData: values.metaData
            ? JSON.parse(values.metaData as string)
            : null,
        }).unwrap();
      }

      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);

      // 409 conflict on create → inline error on matricNumber field
      if (!isEditMode && parsed.status === 409) {
        notification.error({ message: parsed.message });
        form.setFields([{ name: "matricNumber", errors: [parsed.message] }]);
        return;
      }

      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, setFormError);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFormError(null);
    onClose();
  };

  return {
    state: { formError, isLoading, isEditMode },
    actions: { handleSubmit, handleCancel },
    form,
    data: {
      programs,
      levels,
      curriculumVersions,
      programName,
      isProgramsLoading,
      isLevelsLoading,
      isCurriculumVersionsLoading,
    },
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteStudentModal(
  target: Student | null,
  onClose: () => void,
) {
  const [deleteStudent, { isLoading }] = useDeleteStudentMutation();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteStudent({ id: target.id }).unwrap();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);

      if (parsed.status === 404) {
        notification.success({ message: "Student already removed" });
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
