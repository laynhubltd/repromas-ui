import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { Form, notification } from "antd";
import { useEffect, useMemo } from "react";
import { useCloneCurriculumVersionMutation } from "../api/curriculumVersionApi";
import type { CurriculumScope, CurriculumVersion } from "../types/curriculum-version";

export interface CloneVersionFormValues {
  name: string;
  scope: CurriculumScope;
  referenceId?: number | null;
  copyCourseConfigurations: boolean;
  copyGraduationRequirements: boolean;
}

export function useCloneVersionModal(
  open: boolean,
  target: CurriculumVersion | null,
  onClose: () => void,
) {
  const [form] = Form.useForm<CloneVersionFormValues>();
  const [cloneCurriculumVersion, { isLoading }] = useCloneCurriculumVersionMutation();
  const handleApiError = useApiError();

  const { data: programsData, isLoading: isProgramsLoading } = useGetProgramsQuery(
    { itemsPerPage: 200 },
    { skip: !open },
  );

  const programs = useMemo(() => {
    if (Array.isArray(programsData)) return programsData;
    return programsData?.member ?? [];
  }, [programsData]);

  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({
        name: `${target.name} (Custom)`,
        scope: target.scope === "PROGRAM" ? "PROGRAM" : "PROGRAM", // Default clone to PROGRAM scope as recommended in UX
        referenceId: target.referenceId ?? undefined,
        copyCourseConfigurations: true,
        copyGraduationRequirements: true,
      });
    } else if (!open) {
      form.resetFields();
    }
  }, [open, target, form]);

  const handleSubmit = async () => {
    if (!target) return;
    try {
      const values = await form.validateFields();
      await cloneCurriculumVersion({
        id: target.id,
        name: values.name.trim(),
        scope: values.scope,
        referenceId: values.scope === "PROGRAM" ? values.referenceId : null,
        copyCourseConfigurations: values.copyCourseConfigurations,
        copyGraduationRequirements: values.copyGraduationRequirements,
      }).unwrap();

      notification.success({
        message: "Curriculum version branched successfully",
        description: `Created new ${values.scope === "PROGRAM" ? "program" : "global"} version "${values.name.trim()}".`,
      });
      form.resetFields();
      window.dispatchEvent(new CustomEvent("curriculumVersionCreated"));
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Modal, method: "POST" },
        form,
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return {
    state: { isLoading, isProgramsLoading, programs },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

