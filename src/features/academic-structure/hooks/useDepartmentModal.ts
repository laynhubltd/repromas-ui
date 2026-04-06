// Feature: faculty-department-management
import { useAccessControl } from "@/features/access-control";
import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import {
    useCreateDepartmentMutation,
    useDeleteDepartmentMutation,
    useUpdateDepartmentMutation,
} from "../api/departmentsApi";
import { useGetFacultiesQuery } from "../api/facultiesApi";
import type { Department } from "../types/faculty";

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

type DepartmentFormModalOptions = {
  /** Required in create mode — injected from FacultyRow context, never shown to user */
  facultyId?: number;
};

/**
 * Upsert hook for Department form modal.
 * - target === null  → create mode (facultyId required)
 * - target !== null  → edit mode
 */
export function useDepartmentFormModal(
  target: Department | null,
  open: boolean,
  onClose: () => void,
  options: DepartmentFormModalOptions = {}
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<{ name: string; code: string; facultyId?: number }>();
  const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const { activeRole } = useAccessControl();
  const showFacultySelector = isEditMode && activeRole?.scope === "GLOBAL";

  const { data: facultiesData, isLoading: facultiesLoading } = useGetFacultiesQuery(
    { itemsPerPage: 100 },
    { skip: !showFacultySelector }
  );
  const faculties = facultiesData?.member ?? [];

  const isLoading = isCreating || isUpdating;

  // Pre-fill form in edit mode
  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({
        name: target.name,
        code: target.code,
        facultyId: target.facultyId,
      });
    }
  }, [open, target, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormError(null);

      if (isEditMode) {
        const oldFacultyId = target.facultyId;
        const newFacultyId =
          showFacultySelector && values.facultyId != null ? values.facultyId : target.facultyId;
        await updateDepartment({
          id: target.id,
          oldFacultyId,
          facultyId: newFacultyId,
          name: values.name.trim(),
          code: values.code.trim(),
        }).unwrap();
      } else {
        const facultyId = options.facultyId;
        if (!facultyId) throw new Error("facultyId is required in create mode");
        await createDepartment({
          facultyId,
          name: values.name.trim(),
          code: values.code.trim(),
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
    state: { formError, isLoading, isEditMode, faculties, facultiesLoading, showFacultySelector },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteDepartmentModal(target: Department | null, onClose: () => void) {
  const [deleteDepartment, { isLoading }] = useDeleteDepartmentMutation();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteDepartment({ id: target.id, facultyId: target.facultyId }).unwrap();
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
