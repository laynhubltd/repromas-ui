// Feature: system-config
import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { HttpStatusCode, parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import {
    useCreateSystemConfigMutation,
    useDeleteSystemConfigMutation,
    useUpdateSystemConfigMutation,
} from "../api/systemConfigApi";
import type {
    ConfigKey,
    ConfigScope,
    CreditLoadLimitsValue,
    DataType,
    ProgramOption,
    SystemConfig,
    SystemConfigFormValues,
} from "../types/system-config";

// ── DataType derivation ───────────────────────────────────────────────────────

const DATA_TYPE_MAP: Record<ConfigKey, DataType> = {
  CREDIT_LOAD_LIMITS: "JSON_OBJECT",
  FORCE_CARRYOVER_FIRST: "BOOLEAN",
};

/**
 * Pure function exported for independent testability (Property 7).
 */
export function deriveDataType(configKey: ConfigKey): DataType {
  return DATA_TYPE_MAP[configKey];
}

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

/**
 * Upsert hook for SystemConfigFormModal.
 * - target === null  → create mode
 * - target !== null  → edit mode (configKey is read-only)
 */
export function useSystemConfigModal(
  target: SystemConfig | null,
  open: boolean,
  onClose: () => void,
  programs: ProgramOption[],
  programsLoading: boolean,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<SystemConfigFormValues>();
  const [createSystemConfig, { isLoading: isCreating }] = useCreateSystemConfigMutation();
  const [updateSystemConfig, { isLoading: isUpdating }] = useUpdateSystemConfigMutation();
  const [formError, setFormError] = useState<string | null>(null);

  // ── Conditional field visibility flags ────────────────────────────────────

  const [showReferenceId, setShowReferenceId] = useState(false);
  const [showCreditFields, setShowCreditFields] = useState(false);
  const [showCarryoverToggle, setShowCarryoverToggle] = useState(false);

  const isLoading = isCreating || isUpdating;

  // ── Sync flags from target in edit mode; reset on close ───────────────────

  useEffect(() => {
    if (open && target) {
      const scope = target.scope;
      const configKey = target.configKey;
      const creditValue = target.configValue as CreditLoadLimitsValue | undefined;

      setShowReferenceId(scope === "PROGRAM");
      setShowCreditFields(configKey === "CREDIT_LOAD_LIMITS");
      setShowCarryoverToggle(configKey === "FORCE_CARRYOVER_FIRST");

      form.setFieldsValue({
        configKey,
        scope,
        referenceId: target.referenceId ?? undefined,
        description: target.description ?? undefined,
        ...(configKey === "CREDIT_LOAD_LIMITS" && creditValue
          ? { minCredits: creditValue.min_credits, maxCredits: creditValue.max_credits }
          : {}),
        ...(configKey === "FORCE_CARRYOVER_FIRST"
          ? { forceCarryover: target.configValue as boolean }
          : {}),
      });
    }

    if (!open) {
      form.resetFields();
      setFormError(null);
      setShowReferenceId(false);
      setShowCreditFields(false);
      setShowCarryoverToggle(false);
    }
  }, [open, target, form]);


  // ── Field change handlers ─────────────────────────────────────────────────

  const handleConfigKeyChange = (key: ConfigKey) => {
    setShowCreditFields(key === "CREDIT_LOAD_LIMITS");
    setShowCarryoverToggle(key === "FORCE_CARRYOVER_FIRST");
    // Clear value fields when switching config key
    form.setFieldsValue({ minCredits: undefined, maxCredits: undefined, forceCarryover: undefined });
  };

  const handleScopeChange = (scope: ConfigScope) => {
    setShowReferenceId(scope === "PROGRAM");
    if (scope !== "PROGRAM") {
      form.setFieldValue("referenceId", undefined);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormError(null);

      const dataType = deriveDataType(values.configKey);
      const configValue: CreditLoadLimitsValue | boolean =
        values.configKey === "CREDIT_LOAD_LIMITS"
          ? { min_credits: values.minCredits!, max_credits: values.maxCredits! }
          : (values.forceCarryover ?? false);

      if (isEditMode) {
        await updateSystemConfig({
          id: target.id,
          scope: values.scope,
          referenceId: values.scope === "PROGRAM" ? (values.referenceId ?? null) : null,
          configValue,
          description: values.description ?? null,
        }).unwrap();
      } else {
        await createSystemConfig({
          configKey: values.configKey,
          dataType,
          scope: values.scope,
          referenceId: values.scope === "PROGRAM" ? (values.referenceId ?? null) : null,
          configValue,
          description: values.description ?? null,
        }).unwrap();
      }

      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);

      if (isEditMode && parsed.status === HttpStatusCode.NotFound) {
        notification.error({ message: "This configuration no longer exists." });
        onClose();
        return;
      }

      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, setFormError);
    }
  };

  // ── Cancel ────────────────────────────────────────────────────────────────

  const handleCancel = () => {
    form.resetFields();
    setFormError(null);
    onClose();
  };

  return {
    state: {
      formError,
      isLoading,
      isEditMode,
      programs,
      programsLoading,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleConfigKeyChange,
      handleScopeChange,
    },
    form,
    flags: {
      showReferenceId,
      showCreditFields,
      showCarryoverToggle,
      isConfigKeyReadOnly: isEditMode,
    },
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete hook for DeleteSystemConfigModal.
 * - 404 on DELETE → close silently (list refetches via cache invalidation)
 */
export function useDeleteSystemConfigModal(
  target: SystemConfig | null,
  open: boolean,
  onClose: () => void,
) {
  const [deleteSystemConfig, { isLoading }] = useDeleteSystemConfigMutation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteSystemConfig({ id: target.id }).unwrap();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);

      if (parsed.status === HttpStatusCode.NotFound) {
        // 404 — close silently; list refetches via cache invalidation
        onClose();
        return;
      }

      notification.error({ message: parsed.message });
      setError(parsed.message);
    }
  };

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  return {
    state: { error, isLoading },
    actions: { handleConfirm, handleCancel },
  };
}
