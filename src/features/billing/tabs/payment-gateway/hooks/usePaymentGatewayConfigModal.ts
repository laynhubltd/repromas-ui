import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { GATEWAY_CONFIG_UI_COPY } from "@/shared/constants/gatewayConfigOptions";
import { Form } from "antd";
import { useCallback, useEffect, useReducer } from "react";
import {
  useCreatePaymentGatewayConfigMutation,
  useDeletePaymentGatewayConfigMutation,
  useGetPaymentGatewayConfigQuery,
  useGetPaymentGatewayConfigsQuery,
  useUpdatePaymentGatewayConfigMutation,
} from "../api/paymentGatewayConfigApi";
import {
  initialPaymentGatewayConfigFormState,
  PaymentGatewayConfigFormActionType,
  paymentGatewayConfigFormReducer,
} from "../state/paymentGatewayConfigFormState";
import type { TenantPaymentGatewayConfig } from "../types/payment-gateway-config";
import {
  billableEventIdToScopeValue,
  scopeValueToBillableEventId,
} from "../utils/buildScopeOptions";
import {
  buildUpsertGatewayConfigPayload,
  credentialsToFormValues,
  type PaymentGatewayConfigFormValues,
} from "../utils/gatewayConfigPayload";

type UsePaymentGatewayConfigFormModalOptions = {
  defaultGlobalFallback?: boolean;
  allConfigs: TenantPaymentGatewayConfig[];
};

export function usePaymentGatewayConfigFormModal(
  target: TenantPaymentGatewayConfig | null,
  open: boolean,
  onClose: () => void,
  options: UsePaymentGatewayConfigFormModalOptions,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<PaymentGatewayConfigFormValues>();
  const [formState, dispatch] = useReducer(
    paymentGatewayConfigFormReducer,
    initialPaymentGatewayConfigFormState,
  );

  const { data: freshConfig, isLoading: isLoadingDetail } =
    useGetPaymentGatewayConfigQuery(target?.id ?? 0, {
      skip: !open || !isEditMode || !target,
    });

  const { data: configsList = [] } = useGetPaymentGatewayConfigsQuery(
    undefined,
    { skip: !open },
  );

  const [createConfig, { isLoading: isCreating }] =
    useCreatePaymentGatewayConfigMutation();
  const [updateConfig, { isLoading: isUpdating }] =
    useUpdatePaymentGatewayConfigMutation();
  const handleApiError = useApiError();

  const isSubmitting = isCreating || isUpdating;
  const loadedConfig =
    isEditMode && target
      ? freshConfig?.id === target.id
        ? freshConfig
        : target
      : null;
  const configsForScope = options.allConfigs.length
    ? options.allConfigs
    : configsList;

  useEffect(() => {
    if (!open) return;

    if (isEditMode && loadedConfig) {
      form.setFieldsValue({
        provider: loadedConfig.provider,
        billableEventId: loadedConfig.billableEventId,
        scopeValue: billableEventIdToScopeValue(loadedConfig.billableEventId),
        isActive: loadedConfig.isActive,
        credentials: credentialsToFormValues(loadedConfig.credentials),
      });
    } else if (!isEditMode) {
      form.setFieldsValue({
        provider: undefined,
        billableEventId: options.defaultGlobalFallback ? null : undefined,
        scopeValue: options.defaultGlobalFallback
          ? billableEventIdToScopeValue(null)
          : undefined,
        isActive: true,
        credentials: {},
      });
    }
  }, [
    open,
    isEditMode,
    loadedConfig,
    form,
    options.defaultGlobalFallback,
  ]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: PaymentGatewayConfigFormActionType.Reset });
  }, [form]);

  const submitValues = async (values: PaymentGatewayConfigFormValues) => {
    const scopeValue = values.scopeValue;
    const billableEventId = isEditMode
      ? (loadedConfig?.billableEventId ?? null)
      : scopeValue !== undefined
        ? scopeValueToBillableEventId(scopeValue)
        : (values.billableEventId ?? null);

    const provider = isEditMode
      ? loadedConfig!.provider
      : values.provider;

    const payload = buildUpsertGatewayConfigPayload({
      ...values,
      provider,
      billableEventId,
    });

    const hadActiveSibling =
      values.isActive &&
      configsForScope.some(
        (c) =>
          c.isActive &&
          c.billableEventId === billableEventId &&
          c.id !== loadedConfig?.id,
      );

    if (isEditMode && loadedConfig) {
      await updateConfig({
        id: loadedConfig.id,
        body: payload,
      }).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Gateway", "updated"));
      if (hadActiveSibling) {
        notifyMutationSuccess(GATEWAY_CONFIG_UI_COPY.siblingDeactivatedNote);
      }
    } else {
      await createConfig(payload).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Gateway", "created"));
      if (hadActiveSibling) {
        notifyMutationSuccess(GATEWAY_CONFIG_UI_COPY.siblingDeactivatedNote);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const willActivate = values.isActive;

      if (
        willActivate &&
        !formState.pendingActivation &&
        configsForScope.some(
          (c) =>
            c.isActive &&
            c.billableEventId ===
              (values.scopeValue !== undefined
                ? scopeValueToBillableEventId(values.scopeValue)
                : values.billableEventId) &&
            c.id !== loadedConfig?.id,
        )
      ) {
        dispatch({
          type: PaymentGatewayConfigFormActionType.SetPendingActivation,
          value: true,
        });
        return;
      }

      await submitValues(values);
      reset();
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errorFields" in err) {
        return;
      }
      handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isEditMode ? "PUT" : "POST",
        },
        form,
      });
    }
  };

  const handleConfirmActivation = async () => {
    try {
      const values = await form.validateFields();
      await submitValues(values);
      reset();
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errorFields" in err) {
        return;
      }
      handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isEditMode ? "PUT" : "POST",
        },
        form,
      });
    }
  };

  const handleCancelActivation = () => {
    dispatch({
      type: PaymentGatewayConfigFormActionType.SetPendingActivation,
      value: false,
    });
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  const handleToggleAdvanced = (value: boolean) => {
    dispatch({
      type: PaymentGatewayConfigFormActionType.SetShowAdvanced,
      value,
    });
  };

  return {
    state: {
      isEditMode,
      isSubmitting,
      isLoadingDetail,
      showAdvanced: formState.showAdvanced,
      pendingActivation: formState.pendingActivation,
      loadedConfig,
      configsForScope,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleConfirmActivation,
      handleCancelActivation,
      handleToggleAdvanced,
    },
    form,
  };
}

export function useDeletePaymentGatewayConfigModal(
  target: TenantPaymentGatewayConfig | null,
  _open: boolean,
  onClose: () => void,
) {
  const [deleteConfig, { isLoading: isDeleting }] =
    useDeletePaymentGatewayConfigMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteConfig(target.id).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Gateway", "deleted"));
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
