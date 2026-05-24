import { useGetFeeItemsQuery } from "@/features/billing/tabs/fee-items/api/feeItemApi";
import {
  PRICING_RULE_FEE_ITEM_PICKER_PAGE_SIZE,
  PRICING_RULE_UI_COPY,
} from "@/shared/constants/pricingRuleOptions";
import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useCreatePricingRuleItemMutation,
  useDeletePricingRuleItemMutation,
  useUpdatePricingRuleItemMutation,
} from "../api/pricingRuleItemApi";
import type { PricingRule, PricingRuleItemRead } from "../types/pricing-rule";
import {
  getNextLineSortOrder,
  isDuplicateFeeItemError,
  isImmutableConflictError,
} from "../utils/pricingRuleDisplay";
import { formatAmountString } from "../utils/computeGrossPreview";

type AddLineFormValues = {
  feeItemId: number;
  amount: number;
  isMandatory: boolean;
};

type UseAddPricingRuleLineModalOptions = {
  rule: PricingRule | null;
  open: boolean;
  onClose: () => void;
  onRuleLocked?: (ruleId: number) => void;
};

export function useAddPricingRuleLineModal({
  rule,
  open,
  onClose,
  onRuleLocked,
}: UseAddPricingRuleLineModalOptions) {
  const [form] = Form.useForm<AddLineFormValues>();
  const [formError, setFormError] = useState<string | null>(null);

  const { data: feeItemsData, isLoading: isFeeItemsLoading } = useGetFeeItemsQuery(
    {
      itemsPerPage: PRICING_RULE_FEE_ITEM_PICKER_PAGE_SIZE,
      sort: "name:asc",
      "exact[isActive]": true,
    },
    { skip: !open },
  );

  const [createLine, { isLoading: isSubmitting }] =
    useCreatePricingRuleItemMutation();

  const usedFeeItemIds = useMemo(
    () => new Set((rule?.items ?? []).map((item) => item.feeItemId)),
    [rule?.items],
  );

  const feeItemOptions = useMemo(
    () =>
      (feeItemsData?.member ?? [])
        .filter((item) => !usedFeeItemIds.has(item.id))
        .map((item) => ({
          value: item.id,
          label: item.accountingCode
            ? `${item.name} (${item.accountingCode})`
            : item.name,
        })),
    [feeItemsData, usedFeeItemIds],
  );

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    form.setFieldsValue({
      feeItemId: undefined as unknown as number,
      amount: undefined as unknown as number,
      isMandatory: true,
    });
  }, [open, form]);

  const reset = useCallback(() => {
    form.resetFields();
    setFormError(null);
  }, [form]);

  const handleCancel = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!rule) return;

    try {
      const values = await form.validateFields();
      setFormError(null);

      await createLine({
        pricingRuleId: rule.id,
        feeItemId: values.feeItemId,
        amount: formatAmountString(values.amount),
        isMandatory: values.isMandatory ?? true,
        sortOrder: getNextLineSortOrder(rule.items),
      }).unwrap();

      notification.success({ message: PRICING_RULE_UI_COPY.lineCreateSuccess });
      reset();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });

      if (parsed.status === 409 && isImmutableConflictError(parsed.message)) {
        onRuleLocked?.(rule.id);
      }

      if (parsed.status === 400 && isDuplicateFeeItemError(parsed.message)) {
        form.setFields([{ name: "feeItemId", errors: [parsed.message] }]);
      }

      applyFormErrors(parsed, form, setFormError);
    }
  };

  return {
    form,
    state: {
      formError,
      isSubmitting,
      isFeeItemsLoading,
      feeItemOptions,
      hasAvailableFeeItems: feeItemOptions.length > 0,
      allFeeItemsUsed:
        (feeItemsData?.member?.length ?? 0) > 0 && feeItemOptions.length === 0,
    },
    actions: {
      handleSubmit,
      handleCancel,
    },
  };
}

type EditLineFormValues = {
  feeItemId: number;
  amount: number;
  isMandatory: boolean;
};

type UseEditPricingRuleLineModalOptions = {
  rule: PricingRule | null;
  line: PricingRuleItemRead | null;
  open: boolean;
  onClose: () => void;
  onRuleLocked?: (ruleId: number) => void;
};

export function useEditPricingRuleLineModal({
  rule,
  line,
  open,
  onClose,
  onRuleLocked,
}: UseEditPricingRuleLineModalOptions) {
  const [form] = Form.useForm<EditLineFormValues>();
  const [formError, setFormError] = useState<string | null>(null);

  const { data: feeItemsData, isLoading: isFeeItemsLoading } = useGetFeeItemsQuery(
    {
      itemsPerPage: PRICING_RULE_FEE_ITEM_PICKER_PAGE_SIZE,
      sort: "name:asc",
      "exact[isActive]": true,
    },
    { skip: !open },
  );

  const [updateLine, { isLoading: isSubmitting }] =
    useUpdatePricingRuleItemMutation();

  const usedFeeItemIds = useMemo(() => {
    const ids = new Set((rule?.items ?? []).map((item) => item.feeItemId));
    if (line) ids.delete(line.feeItemId);
    return ids;
  }, [rule?.items, line]);

  const feeItemOptions = useMemo(() => {
    const options = (feeItemsData?.member ?? [])
      .filter((item) => !usedFeeItemIds.has(item.id))
      .map((item) => ({
        value: item.id,
        label: item.accountingCode
          ? `${item.name} (${item.accountingCode})`
          : item.name,
      }));

    if (
      line &&
      !options.some((option) => option.value === line.feeItemId)
    ) {
      options.unshift({
        value: line.feeItemId,
        label: line.accountingCode
          ? `${line.feeItemName} (${line.accountingCode})`
          : line.feeItemName,
      });
    }

    return options;
  }, [feeItemsData, line, usedFeeItemIds]);

  useEffect(() => {
    if (!open || !line) return;
    setFormError(null);
    const parsedAmount = parseFloat(line.amount);
    form.setFieldsValue({
      feeItemId: line.feeItemId,
      amount: Number.isNaN(parsedAmount) ? undefined : parsedAmount,
      isMandatory: line.isMandatory,
    });
  }, [open, line, form]);

  const reset = useCallback(() => {
    form.resetFields();
    setFormError(null);
  }, [form]);

  const handleCancel = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!rule || !line) return;

    try {
      const values = await form.validateFields();
      setFormError(null);

      await updateLine({
        id: line.id,
        feeItemId: values.feeItemId,
        amount: formatAmountString(values.amount),
        isMandatory: values.isMandatory ?? true,
        sortOrder: line.sortOrder,
      }).unwrap();

      notification.success({ message: PRICING_RULE_UI_COPY.lineUpdateSuccess });
      reset();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });

      if (parsed.status === 409 && isImmutableConflictError(parsed.message)) {
        onRuleLocked?.(rule.id);
      }

      if (parsed.status === 400 && isDuplicateFeeItemError(parsed.message)) {
        form.setFields([{ name: "feeItemId", errors: [parsed.message] }]);
      }

      applyFormErrors(parsed, form, setFormError);
    }
  };

  return {
    form,
    state: {
      formError,
      isSubmitting,
      isFeeItemsLoading,
      feeItemOptions,
    },
    actions: {
      handleSubmit,
      handleCancel,
    },
  };
}

type UseDeletePricingRuleLineModalOptions = {
  rule: PricingRule | null;
  line: PricingRuleItemRead | null;
  open: boolean;
  onClose: () => void;
  onRuleLocked?: (ruleId: number) => void;
};

export function useDeletePricingRuleLineModal({
  rule,
  line,
  open,
  onClose,
  onRuleLocked,
}: UseDeletePricingRuleLineModalOptions) {
  const [error, setError] = useState<string | null>(null);
  const [deleteLine, { isLoading: isDeleting }] =
    useDeletePricingRuleItemMutation();

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (!rule || !line) return;

    try {
      setError(null);
      await deleteLine(line.id).unwrap();
      notification.success({ message: PRICING_RULE_UI_COPY.lineDeleteSuccess });
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      notification.error({ message: parsed.message });

      if (parsed.status === 409 && isImmutableConflictError(parsed.message)) {
        onRuleLocked?.(rule.id);
      }
    }
  };

  return {
    state: { error, isDeleting },
    actions: { handleConfirm, handleCancel },
  };
}
