import type { FieldType, FormField, VisibilityConfig } from "@/features/dynamic-form/types";
import { Form } from "antd";
import { useCallback, useEffect } from "react";
import { serializeValidationConfigForForm } from "../utils/parseFieldFormValues";
import {
  buildValidationSchemaFromRuleForm,
  getDefaultRuleFormValues,
  parseValidationSchemaToRuleForm,
  type ValidationRuleFormValues,
} from "../utils/validationRuleForm";
import {
  parseVisibilityConfigToFormSlice,
  type VisibilityFormSlice,
} from "../utils/visibilityRuleForm";

type ValidationModalFormValues = ValidationRuleFormValues;

type VisibilityModalFormValues = VisibilityFormSlice;

// ─── Validation rules ─────────────────────────────────────────────────────────

export function useValidationRuleModal(
  fieldType: FieldType,
  initialSchema: Record<string, unknown>,
  initialIsRequired: boolean,
  open: boolean,
  onApply: (
    schema: Record<string, unknown>,
    json: string,
    isRequired: boolean,
  ) => void,
  onClose: () => void,
) {
  const [form] = Form.useForm<ValidationModalFormValues>();

  useEffect(() => {
    if (!open) return;
    const hasSchema = initialSchema && Object.keys(initialSchema).length > 0;
    const ruleForm = hasSchema
      ? parseValidationSchemaToRuleForm(initialSchema, fieldType)
      : getDefaultRuleFormValues(fieldType, initialIsRequired);
    form.setFieldsValue({
      ...ruleForm,
      required: initialIsRequired,
    });
  }, [open, initialSchema, initialIsRequired, fieldType, form]);

  const reset = useCallback(() => {
    form.resetFields();
  }, [form]);

  const handleApply = async () => {
    const values = await form.validateFields();
    const schema = buildValidationSchemaFromRuleForm(values);
    onApply(schema, serializeValidationConfigForForm(schema), values.required ?? false);
    reset();
    onClose();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return {
    state: {},
    actions: { handleApply, handleCancel },
    form,
  };
}

// ─── Visibility rules ─────────────────────────────────────────────────────────

export function useVisibilityRuleModal(
  _sectionFields: FormField[],
  _currentFieldKey: string,
  initialConfig: VisibilityConfig | null,
  open: boolean,
  onApply: (slice: VisibilityFormSlice) => void,
  onClose: () => void,
) {
  const [form] = Form.useForm<VisibilityModalFormValues>();

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue(parseVisibilityConfigToFormSlice(initialConfig));
  }, [open, initialConfig, form]);

  const reset = useCallback(() => {
    form.resetFields();
  }, [form]);

  const handleApply = async () => {
    const values = await form.validateFields();
    if (!values.visibilityEnabled) {
      onApply({
        visibilityEnabled: false,
        visibilityField: undefined,
        visibilityOperator: undefined,
        visibilityValue: undefined,
        visibilityInValues: undefined,
      });
    } else {
      onApply(values);
    }
    reset();
    onClose();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return {
    state: {},
    actions: { handleApply, handleCancel },
    form,
  };
}
