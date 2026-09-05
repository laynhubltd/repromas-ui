import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useGetAcademicSessionsQuery } from "@/features/settings/tabs/academic-calendar/api/academicCalendarApi";
import { useGetCurriculumVersionsQuery } from "@/features/settings/tabs/curriculum-version/api/curriculumVersionApi";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useEffect, useMemo } from "react";
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
  entrySessionId?: number;
  curriculumVersionId: number;
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
  const handleApiError = useApiError();

  const isLoading = isCreating || isUpdating;

  // ─── Reference data ───────────────────────────────────────────────────────
  const selectedProgramId = Form.useWatch("programId", form);

  const { data: programsData, isLoading: isProgramsLoading } =
    useGetProgramsQuery({ itemsPerPage: 200 }, { skip: !open });

  const {
    data: curriculumVersionsData,
    isLoading: isCurriculumVersionsLoading,
  } = useGetCurriculumVersionsQuery(
    selectedProgramId
      ? { forProgramId: selectedProgramId, include: "program", itemsPerPage: 200 }
      : { itemsPerPage: 200 },
    { skip: !open },
  );

  const { data: sessionsData, isLoading: isAcademicSessionsLoading } =
    useGetAcademicSessionsQuery(
      { itemsPerPage: 100, sort: "rankOrder:desc" },
      { skip: !open },
    );

  const programs = useMemo(() => programsData?.member ?? [], [programsData]);
  const curriculumVersions = useMemo(
    () => curriculumVersionsData?.member ?? [],
    [curriculumVersionsData],
  );
  const academicSessions = useMemo(
    () => sessionsData?.member ?? [],
    [sessionsData],
  );

  // Auto-select active version following priority cascade (Program Active -> Global Active)
  useEffect(() => {
    if (!isEditMode && selectedProgramId && curriculumVersions.length > 0) {
      const currentVal = form.getFieldValue("curriculumVersionId");
      const exists = curriculumVersions.some((v) => v.id === currentVal);
      if (!exists) {
        const programActive = curriculumVersions.find(
          (v) => v.scope === "PROGRAM" && v.isActiveForAdmission,
        );
        const globalActive = curriculumVersions.find(
          (v) => v.scope === "GLOBAL" && v.isActiveForAdmission,
        );
        const defaultVersion = programActive ?? globalActive ?? curriculumVersions[0];
        if (defaultVersion) {
          form.setFieldValue("curriculumVersionId", defaultVersion.id);
        }
      }
    }
  }, [isEditMode, selectedProgramId, curriculumVersions, form]);

  // Auto-select current academic session for entrySessionId in create mode
  useEffect(() => {
    if (!isEditMode && academicSessions.length > 0) {
      const currentVal = form.getFieldValue("entrySessionId");
      if (!currentVal) {
        const currentSession =
          academicSessions.find((s) => s.isCurrent) ?? academicSessions[0];
        if (currentSession) {
          form.setFieldValue("entrySessionId", currentSession.id);
        }
      }
    }
  }, [isEditMode, academicSessions, form]);

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
        metaData: target.metaData
          ? JSON.stringify(target.metaData, null, 2)
          : undefined,
      });
    }
  }, [open, target, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditMode) {
        await updateStudent({
          id: target.id,
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email?.trim() || null,
          currentLevelId: values.currentLevelId,
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
          entrySessionId: values.entrySessionId,
          curriculumVersionId: values.curriculumVersionId,
          metaData: values.metaData
            ? JSON.parse(values.metaData as string)
            : null,
        }).unwrap();
      }

      notifyMutationSuccess(
        mutationSuccessMessage("Student", isEditMode ? "updated" : "created"),
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

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return {
    state: { isLoading, isEditMode },
    actions: { handleSubmit, handleCancel },
    form,
    data: {
      programs,
      curriculumVersions,
      academicSessions,
      programName,
      isProgramsLoading,
      isCurriculumVersionsLoading,
      isAcademicSessionsLoading,
    },
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteStudentModal(
  target: Student | null,
  onClose: () => void,
) {
  const [deleteStudent, { isLoading }] = useDeleteStudentMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteStudent({ id: target.id }).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Student", "deleted"));
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
