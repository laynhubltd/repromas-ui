import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { Form, notification } from "antd";
import { useEffect } from "react";
import {
    useCreateRegistrationCreditLimitMutation,
    useDeleteRegistrationCreditLimitMutation,
    useUpdateRegistrationCreditLimitMutation,
} from "../api/registrationCreditLimitApi";
import type {
    CreditLimitFormValues,
    RegistrationCreditLimit,
} from "../types/credit-limits";
import { computeSuggestedPriorityWeight } from "../utils/helpers";

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

export function useCreditLimitFormModal(
  target: RegistrationCreditLimit | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<CreditLimitFormValues>();
  const [createRegistrationCreditLimit, { isLoading: isCreating }] =
    useCreateRegistrationCreditLimitMutation();
  const [updateRegistrationCreditLimit, { isLoading: isUpdating }] =
    useUpdateRegistrationCreditLimitMutation();
  const handleApiError = useApiError();

  const isLoading = isCreating || isUpdating;

  // Watch all five dimension fields to reactively compute suggested priority weight
  const programId = Form.useWatch("programId", form);
  const levelId = Form.useWatch("levelId", form);
  const sessionId = Form.useWatch("sessionId", form);
  const semesterTypeId = Form.useWatch("semesterTypeId", form);
  const statusId = Form.useWatch("statusId", form);

  const watchedValues: Partial<CreditLimitFormValues> = {
    programId,
    levelId,
    sessionId,
    semesterTypeId,
    statusId,
  };

  const suggestedPriorityWeight = computeSuggestedPriorityWeight(watchedValues);
  const dimensionCount = [
    programId,
    levelId,
    sessionId,
    semesterTypeId,
    statusId,
  ].filter((v) => v !== null && v !== undefined).length;

  // Pre-populate form from target on open; reset on close
  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({
        programId: target.programId,
        levelId: target.levelId,
        sessionId: target.sessionId,
        semesterTypeId: target.semesterTypeId,
        statusId: target.statusId,
        minCredits: target.minCredits,
        maxCredits: target.maxCredits,
        priorityWeight: target.priorityWeight,
      });
    }
    if (!open) {
      form.resetFields();
    }
  }, [open, target, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditMode) {
        // PUT requires all fields — send complete shape
        await updateRegistrationCreditLimit({
          id: target.id,
          programId: values.programId ?? null,
          levelId: values.levelId ?? null,
          sessionId: values.sessionId ?? null,
          semesterTypeId: values.semesterTypeId ?? null,
          statusId: values.statusId ?? null,
          minCredits: values.minCredits,
          maxCredits: values.maxCredits,
          priorityWeight: values.priorityWeight,
        }).unwrap();
      } else {
        await createRegistrationCreditLimit({
          programId: values.programId ?? null,
          levelId: values.levelId ?? null,
          sessionId: values.sessionId ?? null,
          semesterTypeId: values.semesterTypeId ?? null,
          statusId: values.statusId ?? null,
          minCredits: values.minCredits,
          maxCredits: values.maxCredits,
          priorityWeight: values.priorityWeight,
        }).unwrap();
      }

      form.resetFields();
      notification.success({
        message: `Credit limit ${isEditMode ? "updated" : "created"} successfully.`,
      });
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
    state: { isLoading, isEditMode },
    actions: { handleSubmit, handleCancel },
    form,
    flags: { suggestedPriorityWeight, dimensionCount },
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteCreditLimitModal(
  target: RegistrationCreditLimit | null,
  open: boolean,
  onClose: () => void,
) {
  const [deleteRegistrationCreditLimit, { isLoading }] =
    useDeleteRegistrationCreditLimitMutation();
  const handleApiError = useApiError();

  void open;

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteRegistrationCreditLimit({ id: target.id }).unwrap();
      notification.success({ message: "Credit limit deleted successfully." });
      onClose();
    } catch (err: unknown) {
      const decision = handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "DELETE" },
      });
      if (decision.parsed.status === 404) {
        onClose();
      }
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
