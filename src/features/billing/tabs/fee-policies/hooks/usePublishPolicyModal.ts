import { useLazyGetBillableEventCatalogEntryQuery } from "@/features/billing/tabs/fee-events/api/billableEventApi";
import type {
  BillableEvent,
  BillableEventPolicyEmbed,
  PaymentTiming,
} from "@/features/billing/tabs/fee-events/types/billable-event";
import type { PublishedPolicyHandoff } from "@/features/billing/types/configure-pricing";
import { isStructuralPolicyBlockedError } from "@/features/billing/tabs/pricing-rules/utils/pricingRuleDisplay";
import { FEE_POLICY_UI_COPY } from "@/shared/constants/feePolicyOptions";
import { PRICING_RULE_UI_COPY } from "@/shared/constants/pricingRuleOptions";
import { BILLING_POLICY_UI_COPY } from "@/shared/constants/billingPolicyOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form, Modal } from "antd";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
  usePublishBillableEventPolicyMutation,
  useReviseBillableEventPolicyMutation,
} from "../api/billableEventPolicyApi";
import {
  billingPolicyFormReducer,
  BillingPolicyFormActionType,
  initialBillingPolicyFormState,
} from "../state/billingPolicyFormState";
import type { BillableEventPolicy } from "../types/billable-event-policy";
import { applyCatalogDefaultsToPolicyForm } from "../utils/applyCatalogDefaultsToPolicyForm";
import {
  buildPublishPayload,
  buildRevisePayload,
  policiesAreEqual,
  policyWritableFieldsFromPolicy,
  type PolicyFormValues,
} from "../utils/billingPolicyPayload";

function policyFormFromEmbed(
  embed: BillableEventPolicyEmbed,
): PolicyFormValues {
  return {
    paymentTiming: embed.paymentTiming,
    feeChargeTriggerEvent: embed.feeChargeTriggerEvent,
    guardWorkflowStep: embed.guardWorkflowStep,
    guardRequired: embed.guardRequired ?? true,
    missingFeeChargePolicy: embed.missingFeeChargePolicy ?? "BLOCK",
    fulfilledStatuses: embed.fulfilledStatuses ?? ["FULFILLED", "WAIVED"],
    occurrenceMode: embed.occurrenceMode,
    periodType: embed.periodType,
    arrearsMode: embed.arrearsMode,
  };
}
import { periodTypeForOccurrenceMode } from "../utils/occurrencePeriodPairing";

export type UsePublishPolicyModalOptions = {
  event: BillableEvent | null;
  draftPolicy: BillableEventPolicy | null;
  bindEventId: number | null;
  reviseFromPolicyId: number | null;
  activePolicy: BillableEventPolicy | null;
  open: boolean;
  onClose: () => void;
  onPublished?: (handoff: PublishedPolicyHandoff) => void;
};

export function usePublishPolicyModal({
  event,
  draftPolicy,
  bindEventId,
  reviseFromPolicyId,
  activePolicy,
  open,
  onClose,
  onPublished,
}: UsePublishPolicyModalOptions) {
  const [form] = Form.useForm<PolicyFormValues>();
  const [modalState, dispatch] = useReducer(
    billingPolicyFormReducer,
    initialBillingPolicyFormState,
  );
  const { formError, catalogEntry } = modalState;

  const [fetchCatalogEntry] = useLazyGetBillableEventCatalogEntryQuery();
  const [publishPolicy, { isLoading: isPublishing }] =
    usePublishBillableEventPolicyMutation();
  const [revisePolicy, { isLoading: isRevising }] =
    useReviseBillableEventPolicyMutation();
  const handleApiError = useApiError();

  const isReviseMode = reviseFromPolicyId !== null;
  const isFirstPublish = bindEventId !== null && !isReviseMode;
  const isSubmitting = isPublishing || isRevising;

  const baselinePolicy = useMemo((): PolicyFormValues | null => {
    if (isReviseMode && activePolicy) {
      return policyWritableFieldsFromPolicy(activePolicy);
    }
    return null;
  }, [isReviseMode, activePolicy]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: BillingPolicyFormActionType.Reset });
  }, [form]);

  const loadCatalogEntry = useCallback(
    async (code: string, paymentTiming?: PaymentTiming) => {
      const entry = await fetchCatalogEntry({ code, paymentTiming }).unwrap();
      dispatch({
        type: BillingPolicyFormActionType.SetCatalogEntry,
        entry,
      });
      return entry;
    },
    [fetchCatalogEntry],
  );

  useEffect(() => {
    if (!open || !event) return;

    const source = draftPolicy ?? activePolicy;
    if (source) {
      form.setFieldsValue(policyWritableFieldsFromPolicy(source));
      void loadCatalogEntry(event.code, source.paymentTiming);
    } else if (event.currentPolicy) {
      form.setFieldsValue(policyFormFromEmbed(event.currentPolicy));
      void loadCatalogEntry(event.code, event.currentPolicy.paymentTiming);
    } else {
      form.setFieldsValue({
        guardRequired: true,
        missingFeeChargePolicy: "BLOCK",
        fulfilledStatuses: ["FULFILLED", "WAIVED"],
        paymentTiming: "PAY_BEFORE",
      });
      void loadCatalogEntry(event.code, "PAY_BEFORE").then((entry) => {
        applyCatalogDefaultsToPolicyForm(form, entry, "PAY_BEFORE");
      });
    }
  }, [open, event, draftPolicy, activePolicy, form, loadCatalogEntry]);

  const applyTimingDefaults = async (paymentTiming: PaymentTiming) => {
    if (!event) return;
    const entry = await loadCatalogEntry(event.code, paymentTiming);
    applyCatalogDefaultsToPolicyForm(form, entry, paymentTiming);
  };

  const handlePaymentTimingChange = (paymentTiming: PaymentTiming) => {
    Modal.confirm({
      title: BILLING_POLICY_UI_COPY.paymentTimingChangeTitle,
      content: BILLING_POLICY_UI_COPY.paymentTimingChangeBody,
      okText: "Update settings",
      cancelText: "Cancel",
      onOk: () => applyTimingDefaults(paymentTiming),
    });
  };

  const handleOccurrenceModeChange = (occurrenceMode: PolicyFormValues["occurrenceMode"]) => {
    const current = form.getFieldValue("occurrenceMode");
    if (current === occurrenceMode) {
      form.setFieldValue("periodType", periodTypeForOccurrenceMode(occurrenceMode));
      return;
    }

    Modal.confirm({
      title: FEE_POLICY_UI_COPY.publishOccurrenceConfirmTitle,
      content: FEE_POLICY_UI_COPY.publishOccurrenceConfirmBody,
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

  const hasNoChanges = useMemo(() => {
    if (!baselinePolicy) return false;
    try {
      const values = form.getFieldsValue(true) as PolicyFormValues;
      return policiesAreEqual(values, baselinePolicy);
    } catch {
      return false;
    }
  }, [baselinePolicy, form, open]);

  const emitPublishHandoff = (
    result: BillableEventPolicy,
    successMessage: string,
    priorActivePolicyId?: number,
  ) => {
    notifyMutationSuccess(
      successMessage,
      PRICING_RULE_UI_COPY.configurePricingAfterPublish,
    );
    onPublished?.({
      eventCode: event!.code,
      policyId: result.id,
      versionNo: result.versionNo,
      priorActivePolicyId,
    });
  };

  const handleSubmit = async () => {
    if (!event) return;

    try {
      const values = await form.validateFields();
      dispatch({
        type: BillingPolicyFormActionType.SetFormError,
        message: null,
      });

      if (isReviseMode && reviseFromPolicyId !== null) {
        if (baselinePolicy && policiesAreEqual(values, baselinePolicy)) {
          dispatch({
            type: BillingPolicyFormActionType.SetFormError,
            message: BILLING_POLICY_UI_COPY.unchangedPolicy,
          });
          return;
        }

        const result = await revisePolicy({
          id: reviseFromPolicyId,
          body: buildRevisePayload(values),
        }).unwrap();
        emitPublishHandoff(
          result,
          BILLING_POLICY_UI_COPY.reviseSuccess.replace(
            "{versionNo}",
            String(result.versionNo),
          ),
          activePolicy?.id,
        );
      } else if (isFirstPublish && bindEventId !== null) {
        const result = await publishPolicy(
          buildPublishPayload(bindEventId, values),
        ).unwrap();
        emitPublishHandoff(
          result,
          BILLING_POLICY_UI_COPY.publishSuccess.replace(
            "{versionNo}",
            String(result.versionNo),
          ),
        );
      } else if (activePolicy) {
        if (baselinePolicy && policiesAreEqual(values, baselinePolicy)) {
          dispatch({
            type: BillingPolicyFormActionType.SetFormError,
            message: BILLING_POLICY_UI_COPY.unchangedPolicy,
          });
          return;
        }
        const result = await revisePolicy({
          id: activePolicy.id,
          body: buildRevisePayload(values),
        }).unwrap();
        emitPublishHandoff(
          result,
          BILLING_POLICY_UI_COPY.reviseSuccess.replace(
            "{versionNo}",
            String(result.versionNo),
          ),
          activePolicy.id,
        );
      } else if (bindEventId !== null) {
        const result = await publishPolicy(
          buildPublishPayload(bindEventId, values),
        ).unwrap();
        emitPublishHandoff(
          result,
          BILLING_POLICY_UI_COPY.publishSuccess.replace(
            "{versionNo}",
            String(result.versionNo),
          ),
        );
      }

      reset();
      onClose();
    } catch (err: unknown) {
      const decision = handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isReviseMode ? "PUT" : "POST",
        },
        form,
      });
      if (isStructuralPolicyBlockedError(decision.message)) {
        dispatch({
          type: BillingPolicyFormActionType.SetFormError,
          message: FEE_POLICY_UI_COPY.structuralChangeBlockedBody,
        });
      }
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return {
    state: {
      formError,
      isSubmitting,
      catalogEntry,
      isReviseMode,
      isFirstPublish,
      hasNoChanges: isReviseMode && hasNoChanges,
      eventCode: event?.code ?? null,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handlePaymentTimingChange,
      handleOccurrenceModeChange,
    },
    form,
  };
}
