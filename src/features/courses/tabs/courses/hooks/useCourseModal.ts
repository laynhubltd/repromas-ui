import { useAccessControl } from "@/features/access-control";
import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import {
    useCreateCourseMutation,
    useDeleteCourseMutation,
    useUpdateCourseMutation,
} from "../api/coursesApi";
import type { Course } from "../types/course";

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

type CourseFormValues = {
  departmentId: number;
  code: string;
  title: string;
  creditUnits: number;
  isActive: boolean;
};

/**
 * Upsert hook for Course form modal.
 * - target === null  → create mode
 * - target !== null  → edit mode
 */
export function useCourseFormModal(
  target: Course | null,
  open: boolean,
  onClose: () => void,
  showDepartmentField: boolean = true,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<CourseFormValues>();
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const { activeRole } = useAccessControl();

  const isLoading = isCreating || isUpdating;

  // Pre-fill form in edit mode
  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({
        ...(showDepartmentField ? { departmentId: target.departmentId } : {}),
        code: target.code,
        title: target.title,
        creditUnits: target.creditUnits,
        isActive: target.isActive,
      });
    }
    if (!open) {
      setFormError(null);
    }
  }, [open, target, form, showDepartmentField]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormError(null);

      let departmentId: number;
      if (showDepartmentField) {
        departmentId = values.departmentId;
      } else {
        const scopeRefId = activeRole?.scopeReferenceId ?? null;
        if (scopeRefId === null) {
          setFormError("Unable to determine your department. Please contact your administrator.");
          return;
        }
        departmentId = Number(scopeRefId);
      }

      if (isEditMode) {
        await updateCourse({
          id: target.id,
          departmentId,
          code: values.code.trim(),
          title: values.title.trim(),
          creditUnits: values.creditUnits,
          isActive: values.isActive,
        }).unwrap();
      } else {
        await createCourse({
          departmentId,
          code: values.code.trim(),
          title: values.title.trim(),
          creditUnits: values.creditUnits,
          isActive: values.isActive ?? true,
        }).unwrap();
      }

      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
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
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete hook for Course modal.
 */
export function useDeleteCourseModal(
  target: Course | null,
  open: boolean,
  onClose: () => void,
) {
  const [deleteCourse, { isLoading }] = useDeleteCourseMutation();
  const [error, setError] = useState<string | null>(null);

  // Reset error when modal opens/closes
  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteCourse(target.id).unwrap();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
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
