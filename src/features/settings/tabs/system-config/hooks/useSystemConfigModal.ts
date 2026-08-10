// Feature: system-config
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
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
  HAS_LEVEL_CATEGORY: "BOOLEAN",
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
  const handleApiError = useApiError();

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

      notifyMutationSuccess(
        mutationSuccessMessage(
          "System configuration",
          isEditMode ? "updated" : "created",
        ),
      );
      form.resetFields();
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

  // ── Cancel ────────────────────────────────────────────────────────────────

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return {
    state: {
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
  const handleApiError = useApiError();

  void open;

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteSystemConfig({ id: target.id }).unwrap();
      notifyMutationSuccess(
        mutationSuccessMessage("System configuration", "deleted"),
      );
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
