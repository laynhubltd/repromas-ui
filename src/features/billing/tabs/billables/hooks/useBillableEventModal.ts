import { BILLABLE_EVENT_UI_COPY } from "@/shared/constants/billableEventOptions";
import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, Modal, notification } from "antd";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
  useCreateBillableEventMutation,
  useDeleteBillableEventMutation,
  useLazyGetBillableEventCatalogEntryQuery,
  useUpdateBillableEventMutation,
} from "../api/billableEventApi";
import {
  billableEventFormReducer,
  BillableEventFormActionType,
  initialBillableEventFormState,
} from "../state/billableEventFormState";
import type {
  BillableEvent,
  BillableEventCatalogEntry,
  MissingFeeChargePolicy,
  PaymentTiming,
} from "../types/billable-event";

export type BillableEventFormValues = {
  code?: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  paymentTiming: PaymentTiming;
  feeChargeTriggerEvent: string;
  guardWorkflowStep: string;
  guardRequired: boolean;
  missingFeeChargePolicy: MissingFeeChargePolicy;
  fulfilledStatuses: string[];
};

type UseBillableEventFormModalOptions = {
  configuredCodes: Set<string>;
};

function applyCatalogDefaultsToForm(
  form: ReturnType<typeof Form.useForm<BillableEventFormValues>>[0],
  entry: BillableEventCatalogEntry,
  paymentTiming: PaymentTiming,
  preserveName?: string,
) {
  const defaults = entry.defaultsByPaymentTiming[paymentTiming];
  const currentName = preserveName ?? form.getFieldValue("name");

  form.setFieldsValue({
    name: currentName || entry.defaultName,
    paymentTiming,
    feeChargeTriggerEvent: defaults?.feeChargeTriggerEvent,
    guardWorkflowStep: defaults?.guardWorkflowStep,
    fulfilledStatuses: defaults?.fulfilledStatuses ?? ["FULFILLED", "WAIVED"],
  });
}

export function useBillableEventFormModal(
  target: BillableEvent | null,
  open: boolean,
  onClose: () => void,
  { configuredCodes }: UseBillableEventFormModalOptions,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<BillableEventFormValues>();
  const [modalState, dispatch] = useReducer(
    billableEventFormReducer,
    initialBillableEventFormState,
  );
  const { formError, catalogEntry } = modalState;

  const [fetchCatalogEntry] = useLazyGetBillableEventCatalogEntryQuery();
  const [createBillableEvent, { isLoading: isCreating }] =
    useCreateBillableEventMutation();
  const [updateBillableEvent, { isLoading: isUpdating }] =
    useUpdateBillableEventMutation();

  const isSubmitting = isCreating || isUpdating;

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: BillableEventFormActionType.Reset });
  }, [form]);

  const loadCatalogEntry = useCallback(
    async (code: string, paymentTiming?: PaymentTiming) => {
      const entry = await fetchCatalogEntry({ code, paymentTiming }).unwrap();
      dispatch({
        type: BillableEventFormActionType.SetCatalogEntry,
        entry,
      });
      return entry;
    },
    [fetchCatalogEntry],
  );

  useEffect(() => {
    if (!open) return;

    if (isEditMode && target) {
      form.setFieldsValue({
        name: target.name,
        description: target.description ?? undefined,
        isActive: target.isActive,
        paymentTiming: target.paymentTiming,
        feeChargeTriggerEvent: target.feeChargeTriggerEvent,
        guardWorkflowStep: target.guardWorkflowStep,
        guardRequired: target.guardRequired,
        missingFeeChargePolicy: target.missingFeeChargePolicy,
        fulfilledStatuses: target.fulfilledStatuses,
      });
      void loadCatalogEntry(target.code, target.paymentTiming);
    } else {
      form.setFieldsValue({
        code: undefined,
        name: undefined,
        description: undefined,
        isActive: true,
        paymentTiming: "PAY_BEFORE",
        guardRequired: true,
        missingFeeChargePolicy: "BLOCK",
        fulfilledStatuses: ["FULFILLED", "WAIVED"],
      });
      dispatch({
        type: BillableEventFormActionType.SetCatalogEntry,
        entry: null,
      });
    }
  }, [open, isEditMode, target, form, loadCatalogEntry]);

  const handleCodeChange = async (code: string) => {
    form.setFieldValue("code", code);
    const entry = await loadCatalogEntry(code);
    const paymentTiming =
      form.getFieldValue("paymentTiming") ?? ("PAY_BEFORE" as PaymentTiming);
    applyCatalogDefaultsToForm(form, entry, paymentTiming);
  };

  const applyTimingDefaults = async (paymentTiming: PaymentTiming) => {
    const code = isEditMode ? target?.code : form.getFieldValue("code");
    form.setFieldValue("paymentTiming", paymentTiming);

    if (!code) return;

    const entry = await loadCatalogEntry(code, paymentTiming);
    applyCatalogDefaultsToForm(
      form,
      entry,
      paymentTiming,
      isEditMode ? target?.name : undefined,
    );
  };

  const handlePaymentTimingChange = (paymentTiming: PaymentTiming) => {
    if (isEditMode) {
      Modal.confirm({
        title: "Update payment timing?",
        content:
          "This will update when the fee is recorded and which step requires payment, using the recommended settings for this timing. Existing student fee records will not change.",
        okText: "Update settings",
        cancelText: "Cancel",
        onOk: () => applyTimingDefaults(paymentTiming),
      });
      return;
    }
    void applyTimingDefaults(paymentTiming);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      dispatch({
        type: BillableEventFormActionType.SetFormError,
        message: null,
      });

      if (isEditMode && target) {
        const body = {
          name: values.name.trim(),
          description: values.description?.trim() || null,
          isActive: values.isActive,
          paymentTiming: values.paymentTiming,
          feeChargeTriggerEvent: values.feeChargeTriggerEvent,
          guardWorkflowStep: values.guardWorkflowStep,
          guardRequired: values.guardRequired,
          missingFeeChargePolicy: values.missingFeeChargePolicy,
          fulfilledStatuses: values.fulfilledStatuses,
        };

        await updateBillableEvent({ id: target.id, body }).unwrap();
        notification.success({
          message: BILLABLE_EVENT_UI_COPY.feeUpdatedSuccess,
        });
      } else {
        const code = values.code;
        if (!code) {
          dispatch({
            type: BillableEventFormActionType.SetFormError,
            message: "Fee code is required",
          });
          return;
        }

        await createBillableEvent({
          code,
          name: values.name.trim(),
          description: values.description?.trim() || null,
          isActive: values.isActive,
          paymentTiming: values.paymentTiming,
          feeChargeTriggerEvent: values.feeChargeTriggerEvent,
          guardWorkflowStep: values.guardWorkflowStep,
          guardRequired: values.guardRequired,
          missingFeeChargePolicy: values.missingFeeChargePolicy,
          fulfilledStatuses: values.fulfilledStatuses,
        }).unwrap();
        notification.success({
          message: BILLABLE_EVENT_UI_COPY.feeCreatedSuccess,
        });
      }

      reset();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, (msg) =>
        dispatch({
          type: BillableEventFormActionType.SetFormError,
          message: msg,
        }),
      );
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  const isCodeDisabled = (code: string) =>
    configuredCodes.has(code) && (!isEditMode || target?.code !== code);

  return {
    state: {
      isEditMode,
      formError,
      isSubmitting,
      catalogEntry,
      configuredCodes,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleCodeChange,
      handlePaymentTimingChange,
      isCodeDisabled,
    },
    form,
  };
}

export function useDeleteBillableEventModal(
  target: BillableEvent | null,
  _open: boolean,
  onClose: () => void,
) {
  const [deleteBillableEvent, { isLoading: isDeleting }] =
    useDeleteBillableEventMutation();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteBillableEvent(target.id).unwrap();
      notification.success({
        message: BILLABLE_EVENT_UI_COPY.feeDeletedSuccess,
      });
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
    state: { error, isDeleting },
    actions: { handleConfirm, handleCancel },
  };
}
