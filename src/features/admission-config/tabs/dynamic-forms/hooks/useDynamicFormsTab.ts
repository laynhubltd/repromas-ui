import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { RequestScreen } from "@/shared/types/error-ui";
import { useCallback, useMemo, useState } from "react";
import {
  useArchiveDynamicFormMutation,
  useGetDynamicFormsQuery,
  usePublishDynamicFormMutation,
} from "../api/dynamicFormAdminApi";
import type { FormTemplate } from "@/features/dynamic-form/types";
import { useApiError } from "@/shared/hooks/useApiError";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";

export function useDynamicFormsTab() {
  const [view, setView] = useState<"templates" | "assignments">("templates");
  const [templateTarget, setTemplateTarget] = useState<FormTemplate | null>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [builderFormId, setBuilderFormId] = useState<number | null>(null);

  const { data, isLoading, isError, error, refetch } = useGetDynamicFormsQuery({
    itemsPerPage: 100,
    sort: "name:asc",
  });

  const [publishForm] = usePublishDynamicFormMutation();
  const [archiveForm] = useArchiveDynamicFormMutation();
  const handleApiError = useApiError();

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, error, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, error],
  );

  const templates = data?.member ?? [];

  const handleOpenCreate = useCallback(() => {
    setTemplateTarget(null);
    setTemplateModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((template: FormTemplate) => {
    setTemplateTarget(template);
    setTemplateModalOpen(true);
  }, []);

  const handleCloseTemplateModal = useCallback(() => {
    setTemplateModalOpen(false);
    setTemplateTarget(null);
  }, []);

  const handleOpenBuilder = useCallback((formId: number) => {
    setBuilderFormId(formId);
  }, []);

  const handleCloseBuilder = useCallback(() => {
    setBuilderFormId(null);
  }, []);

  const handlePublish = useCallback(
    async (id: number) => {
      try {
        await publishForm(id).unwrap();
        notifyMutationSuccess(mutationSuccessMessage("Form template", "updated"));
      } catch (err: unknown) {
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "POST" },
        });
      }
    },
    [publishForm, handleApiError],
  );

  const handleArchive = useCallback(
    async (id: number) => {
      try {
        await archiveForm(id).unwrap();
        notifyMutationSuccess(mutationSuccessMessage("Form template", "deleted"));
      } catch (err: unknown) {
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "POST" },
        });
      }
    },
    [archiveForm, handleApiError],
  );

  return {
    state: {
      view,
      templates,
      totalItems: data?.totalItems ?? 0,
      isLoading,
      isError,
      sectionError,
      templateTarget,
      templateModalOpen,
      builderFormId,
    },
    actions: {
      setView,
      handleOpenCreate,
      handleOpenEdit,
      handleCloseTemplateModal,
      handleOpenBuilder,
      handleCloseBuilder,
      handlePublish,
      handleArchive,
      refetch,
    },
    flags: {
      hasData: templates.length > 0,
    },
  };
}
