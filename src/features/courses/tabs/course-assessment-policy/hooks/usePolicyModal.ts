import { useGetCourseConfigurationsQuery } from "@/features/courses/tabs/course-configurations/api/courseConfigurationsApi";
import type { CourseConfiguration } from "@/features/courses/tabs/course-configurations/types/course-configuration";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useGetCurriculumVersionsQuery } from "@/features/settings/tabs/curriculum-version/api/curriculumVersionApi";
import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import {
    HttpStatusCode,
    parseApiError,
} from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useCallback, useEffect, useState } from "react";
import {
    useCreateCourseAssessmentPolicyMutation,
    useDeleteCourseAssessmentPolicyMutation,
    useUpdateCourseAssessmentPolicyMutation,
} from "../api/courseAssessmentPoliciesApi";
import type {
    CalculationMethod,
    CourseAssessmentPolicy,
    PolicyScope,
} from "../types/course-assessment-policy";

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

type PolicyFormValues = {
  scope: PolicyScope;
  configId: number | null;
  breakdownName: string;
  calculationMethod: CalculationMethod;
  totalWeightPercentage: number;
  failCourseIfComponentFails: boolean;
  applyScoreCapOnVeto: boolean;
  scoreCapValue: number | null;
};

/**
 * Upsert hook for CourseAssessmentPolicy form modal.
 * - target === null  → create mode
 * - target !== null  → edit mode (scope and configId are immutable)
 */
export function usePolicyFormModal(
  target: CourseAssessmentPolicy | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<PolicyFormValues>();
  const [createPolicy, { isLoading: isCreating }] =
    useCreateCourseAssessmentPolicyMutation();
  const [updatePolicy, { isLoading: isUpdating }] =
    useUpdateCourseAssessmentPolicyMutation();
  const [formError, setFormError] = useState<string | null>(null);

  // Conditional field state — watched to drive disabled/required logic in the form
  const [scopeValue, setScopeValue] = useState<PolicyScope>("COURSE");
  const [applyScoreCapOnVetoValue, setApplyScoreCapOnVetoValue] =
    useState<boolean>(true);

  // Program / version selectors for the configId dropdown (create mode, COURSE scope)
  const [selectedProgramId, setSelectedProgramId] = useState<
    number | undefined
  >(undefined);
  const [selectedVersionId, setSelectedVersionId] = useState<
    number | undefined
  >(undefined);
  const [configSearch, setConfigSearch] = useState<string>("");

  const isSubmitting = isCreating || isUpdating;
  const bothSelected =
    selectedProgramId !== undefined && selectedVersionId !== undefined;

  // Programs list
  const { data: programsData, isLoading: isProgramsLoading } =
    useGetProgramsQuery(
      { sort: "name:asc", itemsPerPage: 100 },
      { skip: !open },
    );
  const programs = programsData?.member ?? [];

  // Curriculum versions list (all versions, no program filter)
  const { data: versionsData, isLoading: isVersionsLoading } =
    useGetCurriculumVersionsQuery(
      { sort: "name:asc", itemsPerPage: 100 },
      { skip: !open },
    );
  const versions = versionsData?.member ?? [];

  // Course configurations — only load when both program + version are selected and scope is COURSE
  const { data: courseConfigsData, isLoading: isCourseConfigsLoading } =
    useGetCourseConfigurationsQuery(
      {
        "exact[program]": selectedProgramId!,
        "exact[version]": selectedVersionId!,
        ...(configSearch ? { "search[course.code]": configSearch } : {}),
        include: "course",
        sort: "id:asc",
        itemsPerPage: 50,
      },
      { skip: !open || !bothSelected || scopeValue !== "COURSE" },
    );
  const courseConfigs: CourseConfiguration[] = courseConfigsData?.member ?? [];

  // ─── Program / version handlers ──────────────────────────────────────────

  const handleProgramChange = useCallback(
    (value: number | undefined) => {
      setSelectedProgramId(value);
      setSelectedVersionId(undefined);
      form.setFieldsValue({ configId: null });
      setConfigSearch("");
    },
    [form],
  );

  const handleVersionChange = useCallback(
    (value: number | undefined) => {
      setSelectedVersionId(value);
      form.setFieldsValue({ configId: null });
      setConfigSearch("");
    },
    [form],
  );

  const handleConfigSearch = useCallback((value: string) => {
    setConfigSearch(value);
  }, []);

  // ─── Form lifecycle ──────────────────────────────────────────────────────

  // Pre-fill form in edit mode; reset conditional state on open
  useEffect(() => {
    if (open && target) {
      // Edit mode: pre-fill all mutable fields
      form.setFieldsValue({
        scope: target.scope,
        configId: target.configId,
        breakdownName: target.breakdownName,
        calculationMethod: target.calculationMethod,
        totalWeightPercentage: target.totalWeightPercentage,
        failCourseIfComponentFails: target.failCourseIfComponentFails,
        applyScoreCapOnVeto: target.applyScoreCapOnVeto,
        scoreCapValue: target.scoreCapValue,
      });
      setScopeValue(target.scope);
      setApplyScoreCapOnVetoValue(target.applyScoreCapOnVeto);
    } else if (open && !target) {
      // Create mode: apply defaults
      form.setFieldsValue({
        calculationMethod: "WEIGHTED_SUM",
        totalWeightPercentage: 100,
        failCourseIfComponentFails: true,
        applyScoreCapOnVeto: true,
        scoreCapValue: 39,
      });
      setScopeValue("COURSE");
      setApplyScoreCapOnVetoValue(true);
    }
    if (!open) {
      setFormError(null);
      setSelectedProgramId(undefined);
      setSelectedVersionId(undefined);
      setConfigSearch("");
    }
  }, [open, target, form]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  // ─── Conditional field handlers ──────────────────────────────────────────

  /**
   * Called when the scope radio changes.
   * When GLOBAL is selected, clear and disable configId + reset program/version.
   */
  const handleScopeChange = (value: PolicyScope) => {
    setScopeValue(value);
    if (value === "GLOBAL") {
      form.setFieldsValue({ configId: null });
      setSelectedProgramId(undefined);
      setSelectedVersionId(undefined);
      setConfigSearch("");
    }
  };

  /**
   * Called when the applyScoreCapOnVeto checkbox changes.
   * When unchecked, clear and disable scoreCapValue.
   */
  const handleScoreCapToggle = (checked: boolean) => {
    setApplyScoreCapOnVetoValue(checked);
    if (!checked) {
      form.setFieldsValue({ scoreCapValue: null });
    }
  };

  // ─── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormError(null);

      // Enforce conditional field nullification before submission
      const configId = values.scope === "GLOBAL" ? null : values.configId;
      const scoreCapValue = values.applyScoreCapOnVeto
        ? values.scoreCapValue
        : null;

      if (isEditMode) {
        await updatePolicy({
          id: target.id,
          breakdownName: values.breakdownName,
          calculationMethod: values.calculationMethod,
          totalWeightPercentage: values.totalWeightPercentage,
          failCourseIfComponentFails: values.failCourseIfComponentFails,
          applyScoreCapOnVeto: values.applyScoreCapOnVeto,
          scoreCapValue,
        }).unwrap();
      } else {
        await createPolicy({
          scope: values.scope,
          configId,
          breakdownName: values.breakdownName,
          calculationMethod: values.calculationMethod,
          totalWeightPercentage: values.totalWeightPercentage,
          failCourseIfComponentFails: values.failCourseIfComponentFails,
          applyScoreCapOnVeto: values.applyScoreCapOnVeto,
          scoreCapValue,
        }).unwrap();
      }

      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);

      if (parsed.status === HttpStatusCode.Conflict) {
        // 409 duplicate policy for scope/configId → form-level error
        setFormError(parsed.message);
      } else if (parsed.status === HttpStatusCode.UnprocessableEntity) {
        // 422 field-level errors
        applyFormErrors(parsed, form, setFormError);
      } else {
        applyFormErrors(parsed, form, setFormError);
      }
    }
  };

  const handleClose = () => {
    form.resetFields();
    setFormError(null);
    onClose();
  };

  return {
    state: {
      isEditMode,
      isSubmitting,
      formError,
      scopeValue,
      applyScoreCapOnVetoValue,
      selectedProgramId,
      selectedVersionId,
      bothSelected,
    },
    actions: {
      handleSubmit,
      handleClose,
      handleScopeChange,
      handleScoreCapToggle,
      handleProgramChange,
      handleVersionChange,
      handleConfigSearch,
    },
    form,
    programs,
    isProgramsLoading,
    versions,
    isVersionsLoading,
    courseConfigs,
    isCourseConfigsLoading,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete hook for CourseAssessmentPolicy modal.
 *
 * @param target         - the policy to delete (null when modal is closed)
 * @param componentCount - number of components that will be cascade-deleted
 * @param open           - whether the modal is open
 * @param onClose        - callback to close the modal
 */
export function useDeletePolicyModal(
  target: CourseAssessmentPolicy | null,
  componentCount: number,
  open: boolean,
  onClose: () => void,
) {
  const [deletePolicy, { isLoading: isDeleting }] =
    useDeleteCourseAssessmentPolicyMutation();
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
      await deletePolicy(target.id).unwrap();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      setError(parsed.message);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  // componentCount is accepted as a parameter so the modal can display it;
  // it is not used in the hook logic itself but is part of the public API.
  void componentCount;

  return {
    state: {
      isDeleting,
      error,
    },
    actions: {
      handleConfirm,
      handleClose,
    },
  };
}
