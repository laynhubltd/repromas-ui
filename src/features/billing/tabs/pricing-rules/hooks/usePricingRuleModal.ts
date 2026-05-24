import { PRICING_RULE_UI_COPY } from "@/shared/constants/pricingRuleOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { Form, notification } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useReducer } from "react";
import {
  useCreatePricingRuleMutation,
  useDeletePricingRuleMutation,
  useUpdatePricingRuleMutation,
} from "../api/pricingRuleApi";
import {
  initialPricingRuleFormState,
  pricingRuleFormReducer,
  PricingRuleFormActionType,
} from "../state/pricingRuleFormState";
import type { PricingRule } from "../types/pricing-rule";
import { isImmutableConflictError } from "../utils/pricingRuleDisplay";
import {
  buildCreatePayload,
  buildFullUpdatePayload,
  getFullPricingRuleFormFieldNames,
  LOCKED_PRICING_RULE_FORM_FIELD_NAMES,
  mapPricingRuleToFormValues,
  type PricingRuleFormValues,
} from "../utils/pricingRulePayload";

type UsePricingRuleFormModalOptions = {
  target: PricingRule | null;
  open: boolean;
  onClose: () => void;
  initialLocked?: boolean;
  onRuleLocked?: (id: number) => void;
};

export function usePricingRuleFormModal({
  target,
  open,
  onClose,
  initialLocked = false,
  onRuleLocked,
}: UsePricingRuleFormModalOptions) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<PricingRuleFormValues>();
  const [modalState, dispatch] = useReducer(
    pricingRuleFormReducer,
    initialPricingRuleFormState,
  );
  const { formError, createStep, isLocked, retireReplaceMode } = modalState;

  const [createPricingRule, { isLoading: isCreating }] =
    useCreatePricingRuleMutation();
  const [updatePricingRule, { isLoading: isUpdating }] =
    useUpdatePricingRuleMutation();

  const handleApiError = useApiError();
  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;

    dispatch({ type: PricingRuleFormActionType.Reset });
    dispatch({
      type: PricingRuleFormActionType.SetIsLocked,
      value: initialLocked,
    });

    if (isEditMode && target) {
      form.setFieldsValue(mapPricingRuleToFormValues(target));
    } else {
      form.setFieldsValue({
        scope: "GLOBAL",
        referenceId: null,
        indigeneStatus: "NON_INDIGENE",
        effectiveFrom: dayjs().format("YYYY-MM-DD"),
        effectiveTo: null,
        priority: 10,
        isActive: true,
        items: [{ feeItemId: undefined as unknown as number, amount: undefined as unknown as number, isMandatory: true }],
      });
    }
  }, [open, isEditMode, target, form, initialLocked]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: PricingRuleFormActionType.Reset });
  }, [form]);

  const handleCancel = () => {
    reset();
    onClose();
  };

  const setCreateStep = (step: number) => {
    dispatch({ type: PricingRuleFormActionType.SetCreateStep, value: step });
  };

  const handleNextStep = async (): Promise<boolean> => {
    try {
      dispatch({
        type: PricingRuleFormActionType.SetFormError,
        message: null,
      });

      if (createStep === 0) {
        await form.validateFields(["eventCode"]);
      } else if (createStep === 1) {
        const scope = form.getFieldValue("scope");
        const fields: (keyof PricingRuleFormValues)[] = [
          "scope",
          "indigeneStatus",
          "effectiveFrom",
          "priority",
        ];
        if (scope !== "GLOBAL") {
          fields.push("referenceId");
        }
        await form.validateFields(fields);
      }

      setCreateStep(createStep + 1);
      return true;
    } catch {
      return false;
    }
  };

  const handlePrevStep = () => {
    setCreateStep(Math.max(0, createStep - 1));
  };

  const enterRetireReplaceMode = () => {
    dispatch({
      type: PricingRuleFormActionType.SetRetireReplaceMode,
      value: true,
    });
    dispatch({ type: PricingRuleFormActionType.SetIsLocked, value: false });
    const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
    form.setFieldsValue({
      effectiveFrom: tomorrow,
      effectiveTo: null,
      isActive: true,
    });
  };

  const validateUniqueFeeItems = (values: PricingRuleFormValues): boolean => {
    const ids = values.items.map((line) => line.feeItemId).filter(Boolean);
    const unique = new Set(ids);
    if (unique.size !== ids.length) {
      dispatch({
        type: PricingRuleFormActionType.SetFormError,
        message: "Each fee item can only appear once per rule.",
      });
      return false;
    }
    return true;
  };

  const validateAndGetFormValues =
    async (): Promise<PricingRuleFormValues> => {
      if (isLocked && !retireReplaceMode) {
        await form.validateFields([...LOCKED_PRICING_RULE_FORM_FIELD_NAMES]);
        return form.getFieldsValue(true) as PricingRuleFormValues;
      }

      const scope = form.getFieldValue("scope") as
        | PricingRuleFormValues["scope"]
        | undefined;
      const fieldNames = getFullPricingRuleFormFieldNames(scope);
      await form.validateFields(fieldNames);
      return form.getFieldsValue(true) as PricingRuleFormValues;
    };

  const handleSubmit = async () => {
    try {
      const values = await validateAndGetFormValues();
      dispatch({
        type: PricingRuleFormActionType.SetFormError,
        message: null,
      });

      if (!values.eventCode) {
        dispatch({
          type: PricingRuleFormActionType.SetFormError,
          message: "Fee event is required.",
        });
        if (!isEditMode) {
          setCreateStep(0);
        }
        return;
      }

      const needsLineValidation = !isLocked || retireReplaceMode;
      if (needsLineValidation && !validateUniqueFeeItems(values)) {
        return;
      }

      if (retireReplaceMode && isEditMode && target) {
        const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
        await updatePricingRule({
          id: target.id,
          effectiveTo: yesterday,
          isActive: false,
          priority: target.priority,
        } as never).unwrap();

        await createPricingRule(buildCreatePayload(values)).unwrap();
        notification.success({
          message: PRICING_RULE_UI_COPY.retireSuccess,
        });
        notification.success({
          message: PRICING_RULE_UI_COPY.createSuccess,
        });
        reset();
        onClose();
        return;
      }

      if (isEditMode && target) {
        if (isLocked) {
          await updatePricingRule({
            id: target.id,
            effectiveTo: values.effectiveTo ?? null,
            isActive: values.isActive,
            priority: values.priority,
          } as never).unwrap();
          notification.success({
            message: PRICING_RULE_UI_COPY.updateSuccess,
          });
        } else {
          await updatePricingRule(
            buildFullUpdatePayload(target.id, values) as never,
          ).unwrap();
          notification.success({
            message: PRICING_RULE_UI_COPY.updateSuccess,
          });
        }
      } else {
        await createPricingRule(buildCreatePayload(values)).unwrap();
        notification.success({
          message: PRICING_RULE_UI_COPY.createSuccess,
        });
      }

      reset();
      onClose();
    } catch (err: unknown) {
      const decision = handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isEditMode ? "PATCH" : "POST",
        },
        form,
      });

      if (decision.parsed.status === 409 && isImmutableConflictError(decision.message)) {
        dispatch({
          type: PricingRuleFormActionType.SetIsLocked,
          value: true,
        });
        if (target) {
          onRuleLocked?.(target.id);
        }
      }
    }
  };

  const switchToLockedMode = () => {
    dispatch({ type: PricingRuleFormActionType.SetIsLocked, value: true });
    if (target) {
      onRuleLocked?.(target.id);
    }
  };

  return {
    state: {
      isEditMode,
      formError,
      isSubmitting,
      createStep,
      isLocked,
      retireReplaceMode,
      showBalanceWarning: isEditMode,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleNextStep,
      handlePrevStep,
      enterRetireReplaceMode,
      switchToLockedMode,
      setCreateStep,
    },
    form,
  };
}

export function useDeletePricingRuleModal(
  target: PricingRule | null,
  _open: boolean,
  onClose: () => void,
  options?: {
    isLocked?: boolean;
    onRuleLocked?: (id: number) => void;
  },
) {
  const [deletePricingRule, { isLoading: isDeleting }] =
    useDeletePricingRuleMutation();
  const handleApiError = useApiError();

  const isRetire = options?.isLocked ?? false;

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deletePricingRule(target.id).unwrap();
      notification.success({
        message: isRetire
          ? PRICING_RULE_UI_COPY.retireSuccess
          : PRICING_RULE_UI_COPY.deleteSuccess,
      });
      if (isRetire) {
        options?.onRuleLocked?.(target.id);
      }
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
    state: { isDeleting, isRetire },
    actions: { handleConfirm, handleCancel },
  };
}
