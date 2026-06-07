import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  flagsToQuotaTypeFormValue,
  QUOTA_TYPE_FORM_OPTIONS,
  type QuotaTypeFormValue,
} from "@/shared/constants/geographyRuleOptions";
import { Form, notification } from "antd";
import { useCallback, useEffect, useReducer } from "react";
import {
  useCreateGeographyRuleMutation,
  useDeleteGeographyRuleMutation,
  useUpdateGeographyRuleMutation,
} from "../api/geographyRuleApi";
import {
  GeographyRuleFormActionType,
  geographyRuleFormReducer,
  initialGeographyRuleFormState,
} from "../state/geographyRuleFormState";
import type { AdmissionGeographyRule } from "../types/geography-rule";

type GeographyRuleFormValues = {
  stateId?: number;
  quotaType: QuotaTypeFormValue;
};

type UseGeographyRuleFormModalParams = {
  target: AdmissionGeographyRule | null;
  open: boolean;
  onClose: () => void;
  configuredStateIds: Set<number>;
};

export function useGeographyRuleFormModal({
  target,
  open,
  onClose,
  configuredStateIds,
}: UseGeographyRuleFormModalParams) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<GeographyRuleFormValues>();
  const [modalState, dispatch] = useReducer(
    geographyRuleFormReducer,
    initialGeographyRuleFormState,
  );
  const { formError } = modalState;

  const [createGeographyRule, { isLoading: isCreating }] =
    useCreateGeographyRuleMutation();
  const [updateGeographyRule, { isLoading: isUpdating }] =
    useUpdateGeographyRuleMutation();
  const handleApiError = useApiError();

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (open && isEditMode && target) {
      form.setFieldsValue({
        quotaType: flagsToQuotaTypeFormValue(
          target.isCatchment,
          target.isElds,
        ),
      });
    } else if (open && !isEditMode) {
      form.setFieldsValue({ stateId: undefined, quotaType: undefined });
    }
  }, [open, isEditMode, target, form]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: GeographyRuleFormActionType.Reset });
  }, [form]);

  const mapQuotaTypeToFlags = (quotaType: QuotaTypeFormValue) => {
    const option = QUOTA_TYPE_FORM_OPTIONS.find((o) => o.value === quotaType);
    return {
      isCatchment: option?.isCatchment ?? false,
      isElds: option?.isElds ?? false,
    };
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      dispatch({
        type: GeographyRuleFormActionType.SetFormError,
        message: null,
      });

      const { isCatchment, isElds } = mapQuotaTypeToFlags(values.quotaType);

      if (isCatchment && isElds) {
        const msg = "A state cannot be marked as both Catchment and ELDS.";
        dispatch({
          type: GeographyRuleFormActionType.SetFormError,
          message: msg,
        });
        return;
      }

      if (isEditMode && target) {
        await updateGeographyRule({
          id: target.id,
          isCatchment,
          isElds,
        }).unwrap();
        notification.success({
          message: "Geography rule updated successfully.",
        });
      } else {
        if (!values.stateId) {
          const msg = "State is required.";
          dispatch({
            type: GeographyRuleFormActionType.SetFormError,
            message: msg,
          });
          form.setFields([{ name: "stateId", errors: [msg] }]);
          return;
        }

        if (configuredStateIds.has(values.stateId)) {
          const msg = "This state already has a geography rule.";
          dispatch({
            type: GeographyRuleFormActionType.SetFormError,
            message: msg,
          });
          form.setFields([{ name: "stateId", errors: [msg] }]);
          return;
        }

        await createGeographyRule({
          stateId: values.stateId,
          isCatchment,
          isElds,
        }).unwrap();
        notification.success({
          message: "Geography rule created successfully.",
        });
      }

      reset();
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isEditMode ? "PATCH" : "POST",
        },
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
      isEditMode,
      formError,
      isSubmitting,
      configuredStateIds,
    },
    actions: {
      handleSubmit,
      handleCancel,
    },
    form,
  };
}

export function useDeleteGeographyRuleModal(
  target: AdmissionGeographyRule | null,
  _open: boolean,
  onClose: () => void,
) {
  const [deleteGeographyRule, { isLoading: isDeleting }] =
    useDeleteGeographyRuleMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteGeographyRule(target.id).unwrap();
      notification.success({
        message: "Geography rule deleted successfully.",
      });
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
