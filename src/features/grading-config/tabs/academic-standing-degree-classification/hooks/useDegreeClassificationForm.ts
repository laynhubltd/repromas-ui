import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import {
  useCreateAcademicStandingDegreeClassificationMutation,
  useUpdateAcademicStandingDegreeClassificationMutation,
} from "../api/academicStandingDegreeClassificationApi";
import type { DegreeClassificationBand } from "../types/academic-standing-degree-classification";

export interface DegreeClassificationFormValues {
  name: string;
  code: string;
  minCgpa: number;
  maxCgpa?: number | null;
  isOpenCeiling?: boolean;
  rankOrder: number;
}

export function useDegreeClassificationForm({
  academicStandingId,
  policyMaxCgpa,
  target,
  open,
  onSuccess,
}: {
  academicStandingId: number;
  policyMaxCgpa: number;
  target: DegreeClassificationBand | null;
  open: boolean;
  onSuccess: () => void;
}) {
  const [form] = Form.useForm<DegreeClassificationFormValues>();
  const [isOpenCeiling, setIsOpenCeiling] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [createClassification, { isLoading: isCreating }] =
    useCreateAcademicStandingDegreeClassificationMutation();
  const [updateClassification, { isLoading: isUpdating }] =
    useUpdateAcademicStandingDegreeClassificationMutation();

  const isEditing = target !== null;

  useEffect(() => {
    if (open) {
      if (target) {
        const openCeiling = target.maxCgpa === null || target.maxCgpa === undefined;
        setIsOpenCeiling(openCeiling);
        form.setFieldsValue({
          name: target.name,
          code: target.code,
          minCgpa: Number(target.minCgpa),
          maxCgpa:
            target.maxCgpa !== null && target.maxCgpa !== undefined
              ? Number(target.maxCgpa)
              : null,
          isOpenCeiling: openCeiling,
          rankOrder: Number(target.rankOrder),
        });
      } else {
        setIsOpenCeiling(false);
        form.resetFields();
      }
      setFormError(null);
    }
  }, [open, target, form]);

  const handleOpenCeilingChange = (checked: boolean) => {
    setIsOpenCeiling(checked);
    if (checked) {
      form.setFieldValue("maxCgpa", null);
    } else {
      form.setFieldValue("maxCgpa", policyMaxCgpa);
    }
  };

  const handleSubmit = async (values: DegreeClassificationFormValues) => {
    setFormError(null);
    const minCgpa = Number(values.minCgpa);
    const maxCgpa = isOpenCeiling || values.maxCgpa === null || values.maxCgpa === undefined
      ? null
      : Number(values.maxCgpa);

    // Client validation
    if (minCgpa < 0 || minCgpa > policyMaxCgpa) {
      setFormError(`Minimum CGPA must be between 0.00 and policy max (${policyMaxCgpa.toFixed(2)}).`);
      return;
    }
    if (maxCgpa !== null) {
      if (maxCgpa < minCgpa) {
        setFormError(`Maximum CGPA (${maxCgpa.toFixed(2)}) cannot be less than Minimum CGPA (${minCgpa.toFixed(2)}).`);
        return;
      }
      if (maxCgpa > policyMaxCgpa) {
        setFormError(`Maximum CGPA (${maxCgpa.toFixed(2)}) cannot exceed policy scale (${policyMaxCgpa.toFixed(2)}).`);
        return;
      }
    }

    try {
      if (isEditing && target) {
        await updateClassification({
          id: target.id,
          name: values.name.trim(),
          code: values.code.trim().toUpperCase(),
          minCgpa,
          maxCgpa,
          rankOrder: Number(values.rankOrder),
        }).unwrap();

        notification.success({
          message: "Degree Classification Updated",
          description: `Successfully updated band "${values.name}".`,
        });
      } else {
        await createClassification({
          academicStandingId,
          name: values.name.trim(),
          code: values.code.trim().toUpperCase(),
          minCgpa,
          maxCgpa,
          rankOrder: Number(values.rankOrder),
        }).unwrap();

        notification.success({
          message: "Degree Classification Created",
          description: `Successfully created band "${values.name}".`,
        });
      }

      onSuccess();
    } catch (err: unknown) {
      let message = "An error occurred while saving the degree classification.";
      if (typeof err === "object" && err !== null && "data" in err) {
        const data = (err as { data?: { description?: string; message?: string } }).data;
        message = data?.description ?? data?.message ?? message;
      }
      setFormError(message);
    }
  };

  return {
    form,
    isEditing,
    isOpenCeiling,
    isSubmitting: isCreating || isUpdating,
    formError,
    handleOpenCeilingChange,
    handleSubmit,
  };
}
