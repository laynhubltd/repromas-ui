import { useGetSemesterTypesQuery } from "@/features/settings/tabs/academic-calendar/api/academicCalendarApi";
import { useGetLevelsQuery } from "@/features/settings/tabs/level-config/api/levelApi";
import { useApiError } from "@/shared/hooks/useApiError";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetCourseQuery, useGetCoursesQuery } from "../../courses/api/coursesApi";
import type { Course } from "../../courses/types/course";
import {
  useCreateCourseConfigurationMutation,
  useDeleteCourseConfigurationMutation,
  useUpdateCourseConfigurationMutation,
} from "../api/courseConfigurationsApi";
import type { CourseConfiguration, CourseStatus } from "../types/course-configuration";

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

type CourseConfigFormValues = {
  courseId: number;
  levelId: number;
  semesterTypeId: number;
  courseStatus: CourseStatus;
  creditUnit: number;
  prerequisiteIds?: number[];
};

/**
 * Upsert hook for CourseConfiguration form modal.
 * - target === null  → create mode
 * - target !== null  → edit mode (courseId is immutable)
 *
 * @param prefillLevelId      - pre-fill levelId when opened from a grid cell
 * @param prefillSemesterTypeId - pre-fill semesterTypeId when opened from a grid cell
 */
export function useCourseConfigFormModal(
  target: CourseConfiguration | null,
  open: boolean,
  onClose: () => void,
  prefillLevelId?: number,
  prefillSemesterTypeId?: number,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<CourseConfigFormValues>();
  const [createCourseConfiguration, { isLoading: isCreating }] =
    useCreateCourseConfigurationMutation();
  const [updateCourseConfiguration, { isLoading: isUpdating }] =
    useUpdateCourseConfigurationMutation();
  const handleApiError = useApiError();

  const isLoading = isCreating || isUpdating;

  // ─── Course Search State ──────────────────────────────────────────────────
  const [courseSearch, setCourseSearch] = useState("");
  const debouncedCourseSearch = useDebouncedValue(courseSearch, 300);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleCourseSearch = useCallback((value: string) => {
    setCourseSearch(value);
  }, []);

  // Fetch active courses with server-side filtering
  const { data: coursesData, isLoading: isCoursesLoading, isFetching: isCoursesFetching } = useGetCoursesQuery(
    {
      "boolean[isActive]": true,
      sort: "code:asc",
      itemsPerPage: 50,
      ...(debouncedCourseSearch ? { "search[code]": debouncedCourseSearch } : {}),
    },
    { skip: !open },
  );
  const courses = coursesData?.member ?? [];

  // If in edit mode and target has courseId not in returned list, fetch directly
  const targetCourseId = target?.courseId;
  const hasTargetInList = courses.some((c) => c.id === targetCourseId);
  const { data: fetchedTargetCourse } = useGetCourseQuery(
    { id: targetCourseId! },
    { skip: !open || !targetCourseId || hasTargetInList },
  );

  // Sync selectedCourse when target changes or fetched
  useEffect(() => {
    if (target?.course) {
      setSelectedCourse(target.course);
    } else if (fetchedTargetCourse) {
      setSelectedCourse(fetchedTargetCourse);
    }
  }, [target, fetchedTargetCourse]);

  // Build course options preserving selectedCourse
  const courseOptions = useMemo(() => {
    const list = courses.map((c) => ({
      value: c.id,
      label: `${c.code} ${c.title}`,
    }));

    if (selectedCourse && !list.some((opt) => opt.value === selectedCourse.id)) {
      return [
        {
          value: selectedCourse.id,
          label: `${selectedCourse.code} ${selectedCourse.title}`,
        },
        ...list,
      ];
    }
    return list;
  }, [courses, selectedCourse]);

  // Fetch semester types for the dropdown
  const { data: semesterTypesData, isLoading: isSemesterTypesLoading } = useGetSemesterTypesQuery(
    { sort: "sortOrder:asc", itemsPerPage: 100 },
    { skip: !open },
  );
  const semesterTypes = semesterTypesData?.member ?? [];

  // Fetch levels to resolve rankOrder for ordinal naming
  const { data: levelsData } = useGetLevelsQuery(
    { itemsPerPage: 100 },
    { skip: !open },
  );
  const levels = levelsData?.member ?? [];

  // Prerequisites: all courses excluding self (by courseId)
  const prerequisiteOptions = useMemo(() => {
    const activeTargetId = target?.courseId ?? selectedCourse?.id;
    return (activeTargetId
      ? courses.filter((c) => c.id !== activeTargetId)
      : courses
    ).map((c) => ({ value: c.id, label: `${c.code} ${c.title}` }));
  }, [courses, target?.courseId, selectedCourse?.id]);

  // Pre-fill form when modal opens
  useEffect(() => {
    if (open && target) {
      // Edit mode: pre-fill all mutable fields using flat IDs (always present)
      form.setFieldsValue({
        courseId: target.courseId,
        levelId: target.levelId,
        semesterTypeId: target.semesterTypeId,
        courseStatus: target.courseStatus,
        creditUnit: target.creditUnit,
        prerequisiteIds: target.prerequisiteIds ?? [],
      });
    } else if (open && !target) {
      // Create mode: pre-fill level/semesterType from cell context if provided
      const prefill: Partial<CourseConfigFormValues> = {};
      if (prefillLevelId !== undefined) prefill.levelId = prefillLevelId;
      if (prefillSemesterTypeId !== undefined) prefill.semesterTypeId = prefillSemesterTypeId;
      if (Object.keys(prefill).length > 0) {
        form.setFieldsValue(prefill);
      }
    }
  }, [open, target, form, prefillLevelId, prefillSemesterTypeId]);

  // Reset form and search when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setCourseSearch("");
      setSelectedCourse(null);
    }
  }, [open, form]);

  /**
   * Called when the user selects a course in create mode.
   * Auto-fills the creditUnit field with the selected course's creditUnits value.
   */
  const handleCourseChange = (courseId: number) => {
    const selected =
      courses.find((c) => c.id === courseId) ??
      (selectedCourse?.id === courseId ? selectedCourse : null);
    if (selected) {
      setSelectedCourse(selected);
      form.setFieldsValue({ creditUnit: selected.creditUnits });
    }
  };

  const handleSubmit = async (programId: number, versionId: number) => {
    try {
      const values = await form.validateFields();

      if (isEditMode) {
        await updateCourseConfiguration({
          id: target.id,
          levelId: values.levelId,
          semesterTypeId: values.semesterTypeId,
          courseStatus: values.courseStatus,
          creditUnit: values.creditUnit,
          prerequisiteIds: values.prerequisiteIds ?? [],
        }).unwrap();
      } else {
        await createCourseConfiguration({
          programId,
          versionId,
          courseId: values.courseId,
          levelId: values.levelId,
          semesterTypeId: values.semesterTypeId,
          courseStatus: values.courseStatus,
          creditUnit: values.creditUnit,
          prerequisiteIds: values.prerequisiteIds ?? [],
        }).unwrap();
      }

      notifyMutationSuccess(
        mutationSuccessMessage(
          "Course configuration",
          isEditMode ? "updated" : "created",
        ),
      );
      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const decision = handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isEditMode ? "PATCH" : "POST",
        },
        form,
      });
      if (isEditMode && decision.disableForm) {
        onClose();
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return {
    state: {
      isLoading,
      isEditMode,
      courseSearch,
      isCoursesLoading: isCoursesLoading || isCoursesFetching,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleCourseChange,
      handleCourseSearch,
    },
    form,
    courses,
    courseOptions,
    levels,
    semesterTypes,
    isSemesterTypesLoading,
    prerequisiteOptions,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete hook for CourseConfiguration modal.
 */
export function useDeleteCourseConfigModal(
  target: CourseConfiguration | null,
  open: boolean,
  onClose: () => void,
) {
  const [deleteCourseConfiguration, { isLoading }] = useDeleteCourseConfigurationMutation();
  const handleApiError = useApiError();

  void open;

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteCourseConfiguration(target.id).unwrap();
      notifyMutationSuccess(
        mutationSuccessMessage("Course configuration", "deleted"),
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
