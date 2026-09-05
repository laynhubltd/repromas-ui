import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { Form, notification } from "antd";
import { useMemo } from "react";
import { useCreateCurriculumVersionMutation } from "../api/curriculumVersionApi";
import type { CurriculumScope } from "../types/curriculum-version";

export interface CreateVersionFormValues {
  name: string;
  scope: CurriculumScope;
  referenceId?: number | null;
}

export function useCreateVersionModal(open: boolean, onClose: () => void) {
  const [form] = Form.useForm<CreateVersionFormValues>();
  const [createCurriculumVersion, { isLoading }] = useCreateCurriculumVersionMutation();
  const handleApiError = useApiError();

  const { data: programsData, isLoading: isProgramsLoading } = useGetProgramsQuery(
    { itemsPerPage: 200 },
    { skip: !open },
  );

  const programs = useMemo(() => {
    if (Array.isArray(programsData)) return programsData;
    return programsData?.member ?? [];
  }, [programsData]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createCurriculumVersion({
        name: values.name.trim(),
        scope: values.scope ?? "GLOBAL",
        referenceId: values.scope === "PROGRAM" ? values.referenceId : null,
      }).unwrap();
      notification.success({ message: "Version created successfully" });
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


