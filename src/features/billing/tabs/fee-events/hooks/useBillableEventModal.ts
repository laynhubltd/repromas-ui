import { usePublishBillableEventPolicyMutation } from "@/features/billing/tabs/fee-policies/api/billableEventPolicyApi";
import { applyCatalogDefaultsToPolicyForm } from "@/features/billing/tabs/fee-policies/utils/applyCatalogDefaultsToPolicyForm";
import { buildPublishPayload } from "@/features/billing/tabs/fee-policies/utils/billingPolicyPayload";
import type { PolicyFormValues } from "@/features/billing/tabs/fee-policies/utils/billingPolicyPayload";
import { FEE_EVENT_UI_COPY } from "@/shared/constants/feeEventOptions";
import { FEE_POLICY_UI_COPY } from "@/shared/constants/feePolicyOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form, Modal } from "antd";
import type { FormInstance } from "antd";
import { useCallback, useEffect, useReducer } from "react";
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
  OccurrenceMode,
  PaymentTiming,
} from "../types/billable-event";
import { periodTypeForOccurrenceMode } from "@/features/billing/tabs/fee-policies/utils/occurrencePeriodPairing";

export type BillableEventShellFormValues = {
  code?: string;
  name: string;
  description?: string | null;
  isActive: boolean;
};

export type BillableEventFormValues = BillableEventShellFormValues &
  PolicyFormValues;

const asPolicyForm = (
  form: FormInstance<BillableEventFormValues>,
): FormInstance<PolicyFormValues> =>
  form as unknown as FormInstance<PolicyFormValues>;

type UseBillableEventFormModalOptions = {
  configuredCodes: Set<string>;
};

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
  const [publishPolicy, { isLoading: isPublishing }] =
    usePublishBillableEventPolicyMutation();

  const handleApiError = useApiError();
  const isSubmitting = isCreating || isUpdating || isPublishing;

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
      });
      void loadCatalogEntry(
        target.code,
        target.currentPolicy?.paymentTiming,
      );
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
    form.setFieldValue("name", entry.defaultName);
    applyCatalogDefaultsToPolicyForm(asPolicyForm(form), entry, paymentTiming);
  };

  const applyTimingDefaults = async (paymentTiming: PaymentTiming) => {
    const code = form.getFieldValue("code");
    form.setFieldValue("paymentTiming", paymentTiming);
    if (!code) return;
    const entry = await loadCatalogEntry(code, paymentTiming);
    applyCatalogDefaultsToPolicyForm(asPolicyForm(form), entry, paymentTiming);
  };

  const handlePaymentTimingChange = (paymentTiming: PaymentTiming) => {
    Modal.confirm({
      title: FEE_POLICY_UI_COPY.paymentTimingChangeTitle,
      content: FEE_POLICY_UI_COPY.paymentTimingChangeBody,
      okText: "Update settings",
      cancelText: "Cancel",
      onOk: () => applyTimingDefaults(paymentTiming),
    });
  };

  const handleOccurrenceModeChange = (occurrenceMode: OccurrenceMode) => {
    Modal.confirm({
      title: FEE_POLICY_UI_COPY.occurrenceChangeTitle,
      content: FEE_POLICY_UI_COPY.occurrenceChangeBody,
      okText: "Continue",
      cancelText: "Cancel",
      onOk: () => {
        form.setFieldsValue({
          occurrenceMode,
          periodType: periodTypeForOccurrenceMode(occurrenceMode),
        });
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      dispatch({
        type: BillableEventFormActionType.SetFormError,
        message: null,
      });

      if (isEditMode && target) {
        await updateBillableEvent({
          id: target.id,
          body: {
            name: values.name.trim(),
            description: values.description?.trim() || null,
            isActive: values.isActive,
          },
        }).unwrap();
        notifyMutationSuccess(FEE_EVENT_UI_COPY.feeUpdatedSuccess);
      } else {
        const code = values.code;
        if (!code) {
          dispatch({
            type: BillableEventFormActionType.SetFormError,
            message: "Fee code is required",
          });
          return;
        }

        const created = await createBillableEvent({
          code,
          name: values.name.trim(),
          description: values.description?.trim() || null,
          isActive: values.isActive,
        }).unwrap();

        const policyResult = await publishPolicy(
          buildPublishPayload(created.id, {
            paymentTiming: values.paymentTiming,
            feeChargeTriggerEvent: values.feeChargeTriggerEvent,
            guardWorkflowStep: values.guardWorkflowStep,
            guardRequired: values.guardRequired,
            missingFeeChargePolicy: values.missingFeeChargePolicy,
            fulfilledStatuses: values.fulfilledStatuses,
            occurrenceMode: values.occurrenceMode,
            periodType: values.periodType,
            arrearsMode: values.arrearsMode,
          }),
        ).unwrap();

        notifyMutationSuccess(
          FEE_EVENT_UI_COPY.feeCreatedSuccess,
          FEE_POLICY_UI_COPY.publishSuccess.replace(
            "{versionNo}",
            String(policyResult.versionNo),
          ),
        );
      }

      reset();
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isEditMode ? "PUT" : "POST",
        },
        form,
      });
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
      composedPolicy: isEditMode ? target : null,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleCodeChange,
      handlePaymentTimingChange,
      handleOccurrenceModeChange,
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
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteBillableEvent(target.id).unwrap();
      notifyMutationSuccess(FEE_EVENT_UI_COPY.feeDeletedSuccess);
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
    state: { isDeleting },
    actions: { handleConfirm, handleCancel },
  };
}
