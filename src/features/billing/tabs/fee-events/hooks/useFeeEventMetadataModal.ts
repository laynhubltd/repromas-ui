import { FEE_EVENT_UI_COPY } from "@/shared/constants/feeEventOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useCallback, useEffect } from "react";
import { useUpdateBillableEventMutation } from "../api/billableEventApi";
import type { BillableEvent } from "../types/billable-event";

export type FeeEventMetadataFormValues = {
  name: string;
  description?: string | null;
  isActive: boolean;
};

export function useFeeEventMetadataModal(
  target: BillableEvent | null,
  open: boolean,
  onClose: () => void,
) {
  const [form] = Form.useForm<FeeEventMetadataFormValues>();
  const [updateBillableEvent, { isLoading: isSubmitting }] =
    useUpdateBillableEventMutation();
  const handleApiError = useApiError();

  const reset = useCallback(() => {
    form.resetFields();
  }, [form]);

  useEffect(() => {
    if (!open || !target) return;

    form.setFieldsValue({
      name: target.name,
      description: target.description ?? undefined,
      isActive: target.isActive,
    });
  }, [open, target, form]);

  const handleSubmit = async () => {
    if (!target) return;

    try {
      const values = await form.validateFields();

      await updateBillableEvent({
        id: target.id,
        body: {
          name: values.name.trim(),
          description: values.description?.trim() || null,
          isActive: values.isActive,
        },
      }).unwrap();

      notifyMutationSuccess(FEE_EVENT_UI_COPY.feeUpdatedSuccess);
      reset();
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Modal, method: "PUT" },
        form,
      });
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return {
    state: {
      formError: null as string | null,
      isSubmitting,
      target,
    },
    actions: { handleSubmit, handleCancel },
    form,
  };
}
