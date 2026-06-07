import { usePublishBillableEventPolicyMutation } from "@/features/billing/tabs/fee-policies/api/billableEventPolicyApi";
import { applyCatalogDefaultsToPolicyForm } from "@/features/billing/tabs/fee-policies/utils/applyCatalogDefaultsToPolicyForm";
import { buildPublishPayload } from "@/features/billing/tabs/fee-policies/utils/billingPolicyPayload";
import type { PolicyFormValues } from "@/features/billing/tabs/fee-policies/utils/billingPolicyPayload";
import { periodTypeForOccurrenceMode } from "@/features/billing/tabs/fee-policies/utils/occurrencePeriodPairing";
import {
  FEE_EVENT_UI_COPY,
} from "@/shared/constants/feeEventOptions";
import { FEE_POLICY_UI_COPY } from "@/shared/constants/feePolicyOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form, Modal } from "antd";
import type { FormInstance } from "antd";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
  useCreateBillableEventMutation,
  useLazyGetBillableEventCatalogEntryQuery,
} from "../api/billableEventApi";
import {
  billableEventFormReducer,
  BillableEventFormActionType,
  initialBillableEventFormState,
} from "../state/billableEventFormState";
import type {
  BillableEventCatalogEntry,
  OccurrenceMode,
  PaymentTiming,
} from "../types/billable-event";
import type { BillableEventShellFormValues } from "./useBillableEventModal";

export type FeeEventCreateWizardValues = BillableEventShellFormValues &
  PolicyFormValues;

const asPolicyForm = (
  form: FormInstance<FeeEventCreateWizardValues>,
): FormInstance<PolicyFormValues> =>
  form as unknown as FormInstance<PolicyFormValues>;

type UseFeeEventCreateWizardOptions = {
  configuredCodes: Set<string>;
  onCreatedWithoutPolicy?: (eventId: number) => void;
};

export function useFeeEventCreateWizard(
  open: boolean,
  onClose: () => void,
  { configuredCodes, onCreatedWithoutPolicy }: UseFeeEventCreateWizardOptions,
) {
  const [step, setStep] = useState(0);
  const [form] = Form.useForm<FeeEventCreateWizardValues>();
  const [modalState, dispatch] = useReducer(
    billableEventFormReducer,
    initialBillableEventFormState,
  );
  const { formError, catalogEntry } = modalState;

  const [fetchCatalogEntry] = useLazyGetBillableEventCatalogEntryQuery();
  const [createBillableEvent, { isLoading: isCreating }] =
    useCreateBillableEventMutation();
  const [publishPolicy, { isLoading: isPublishing }] =
    usePublishBillableEventPolicyMutation();
  const handleApiError = useApiError();
  const isSubmitting = isCreating || isPublishing;

  const reset = useCallback(() => {
    form.resetFields();
    setStep(0);
    dispatch({ type: BillableEventFormActionType.Reset });
  }, [form]);

  useEffect(() => {
    if (!open) return;
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
    setStep(0);
  }, [open, form]);

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

  const validateStep = async (currentStep: number) => {
    if (currentStep === 0) {
      await form.validateFields(["code"]);
      return true;
    }
    if (currentStep === 1) {
      await form.validateFields(["name", "isActive"]);
      return true;
    }
    return true;
  };

  const handleNext = async () => {
    try {
      await validateStep(step);
      setStep((s) => Math.min(s + 1, 2));
    } catch {
      /* validation surfaced on form */
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (skipPolicy: boolean) => {
    try {
      const values = await form.validateFields();
      dispatch({
        type: BillableEventFormActionType.SetFormError,
        message: null,
      });

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

      if (skipPolicy) {
        notifyMutationSuccess(FEE_EVENT_UI_COPY.feeCreatedSuccess);
        onCreatedWithoutPolicy?.(created.id);
        reset();
        onClose();
        return;
      }

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

      reset();
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Modal, method: "POST" },
        form,
      });
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  const isCodeDisabled = (code: string) => configuredCodes.has(code);

  return {
    state: {
      step,
      formError,
      isSubmitting,
      catalogEntry,
      configuredCodes,
    },
    actions: {
      handleNext,
      handleBack,
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

export type FeeEventCreateWizardCatalogEntry = BillableEventCatalogEntry;
