import type {
  ContractOptionsResolver,
  FieldType,
  FormField,
  MappingType,
  TargetEntity,
  VisibilityConfig,
} from "@/features/dynamic-form/types";
import {
  LGA_OPTIONS_RESOLVER,
  STATIC_OPTIONS_BUILDER_HINT,
} from "@/shared/constants/dynamicFormOptions";
import { useToken } from "@/shared/hooks/useToken";
import { Button, Form, Input, Select, Switch, Typography } from "antd";
import type { FormInstance } from "antd/es/form";
import { useState } from "react";
import { StaticOptionsFormModal } from "./modals/StaticOptionsFormModal";
import { ValidationRuleFormModal } from "./modals/ValidationRuleFormModal";
import { VisibilityRuleFormModal } from "./modals/VisibilityRuleFormModal";
import { useFieldOptionsConfig } from "../hooks/useFieldOptionsConfig";
import {
  defaultStaticOptionsForColumn,
  STATIC_OPTIONS_SOURCE,
} from "../utils/optionsConfigForm";
import {
  mergeValidationEnumFromStaticOptions,
  parseStaticOptionsJson,
  rowsToFieldOptions,
  serializeStaticOptionsJson,
  summarizeStaticOptions,
  validateStaticOptionRows,
} from "../utils/staticOptionsForm";
import {
  fieldKeyRules,
  fieldLabelRules,
  jsonSchemaRules,
  lgaDependsOnFieldRules,
} from "../utils/validators";
import { isFileFieldType, isSelectableFieldType, isWidgetFieldType } from "../utils/fieldConfigDefaults";
import {
  parseAdvancedValidationJson,
  summarizeValidationConfig,
} from "../utils/validationRuleForm";
import {
  buildMetadataJsonKey,
  ensureUniqueJsonKey,
} from "../utils/metadataJsonKey";
import {
  buildVisibilityConfigFromFormSlice,
  summarizeVisibilityConfig,
  type VisibilityFormSlice,
} from "../utils/visibilityRuleForm";

type FieldPropertiesPanelProps = {
  fieldForm: FormInstance;
  selectedField: FormField;
  sectionFields: FormField[];
  sectionTitle: string;
  isStructureLocked: boolean;
  isSaving: boolean;
  targetEntity: TargetEntity | undefined;
  fieldTypeOptions: { value: FieldType; label: string; disabled?: boolean }[];
  mappingTypeOptions: { value: MappingType; label: string }[];
  columnOptions: { value: string; label: string }[];
  optionsResolvers: ContractOptionsResolver[];
  allowedMappingTypes: MappingType[];
  isWidgetFieldLocked: boolean;
  onSave: () => void;
};

function parseValidationSchemaFromFormJson(
  json: string | undefined,
  fallback: Record<string, unknown>,
): Record<string, unknown> {
  return parseAdvancedValidationJson(json ?? "", fallback);
}

export function FieldPropertiesPanel({
  fieldForm,
  selectedField,
  sectionFields,
  sectionTitle,
  isStructureLocked,
  isSaving,
  fieldTypeOptions,
  mappingTypeOptions,
  columnOptions,
  optionsResolvers,
  allowedMappingTypes,
  isWidgetFieldLocked,
  onSave,
}: FieldPropertiesPanelProps) {
  const token = useToken();
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [visibilityModalOpen, setVisibilityModalOpen] = useState(false);
  const [staticOptionsModalOpen, setStaticOptionsModalOpen] = useState(false);

  const {
    columnName,
    suggestedResolver,
    dependsOnFieldOptions,
    isGeographyColumnField,
    resolverLabels,
  } = useFieldOptionsConfig({
    selectedField,
    sectionFields,
    optionsResolvers,
  });

  const optionsSource = Form.useWatch("optionsSource", fieldForm) as
    | string
    | undefined;
  const staticOptionsJson = Form.useWatch("staticOptionsJson", fieldForm) as
    | string
    | undefined;
  const showLgaDependsOn =
    optionsSource === LGA_OPTIONS_RESOLVER ||
    selectedField.optionsConfig?.source === LGA_OPTIONS_RESOLVER;
  const showStaticOptions = optionsSource === "STATIC";

  const staticOptionsSummary = summarizeStaticOptions(
    rowsToFieldOptions(parseStaticOptionsJson(staticOptionsJson)),
  );

  const filteredFieldTypes = fieldTypeOptions.filter((opt) => {
    if (isWidgetFieldLocked) {
      return opt.value === selectedField.fieldType;
    }
    // FILE is only available in AdmissionDocumentUpload sections (scoped by
    // getFieldTypeOptionsForEntity in useBuilderContract); here we only
    // exclude WIDGET_* for non-widget sections — FILE exclusion is handled upstream.
    return !String(opt.value).startsWith("WIDGET_");
  });

  const isFileFieldLocked = isFileFieldType(selectedField.fieldType);

  const filteredMappingTypes = mappingTypeOptions.filter((opt) =>
    allowedMappingTypes.includes(opt.value),
  );

  const resolverOptions = [
    { value: "NONE", label: "No options source" },
    ...optionsResolvers.map((r) => ({ value: r.key, label: r.label })),
    { value: "STATIC", label: "Static list (inline options)" },
  ];

  const watchedFieldType = Form.useWatch("fieldType", fieldForm) as FieldType | undefined;
  const fieldType = watchedFieldType ?? selectedField.fieldType;
  const watchedLabel = Form.useWatch("label", fieldForm) as string | undefined;
  const watchedMappingType = Form.useWatch("mappingType", fieldForm) as
    | MappingType
    | undefined;

  const metadataPathPreview = (() => {
    if (watchedMappingType !== "META_DATA" && selectedField.mappingConfig.type !== "META_DATA") {
      return null;
    }
    if (watchedMappingType && watchedMappingType !== "META_DATA") {
      return null;
    }
    const label = (watchedLabel ?? selectedField.label).trim();
    const baseKey = buildMetadataJsonKey(sectionTitle, label);
    const usedKeys = new Set<string>();
    for (const field of sectionFields) {
      if (field.id === selectedField.id) continue;
      if (field.mappingConfig.type === "META_DATA") {
        const jsonKey = field.mappingConfig.json_key?.trim();
        if (jsonKey) usedKeys.add(jsonKey);
      }
    }
    return ensureUniqueJsonKey(baseKey, usedKeys);
  })();

  const validationConfigJson = Form.useWatch("validationConfigJson", fieldForm) as
    | string
    | undefined;
  const isRequired = Form.useWatch("isRequired", fieldForm) as boolean | undefined;
  const visibilityEnabled = Form.useWatch("visibilityEnabled", fieldForm) as
    | boolean
    | undefined;
  const visibilityField = Form.useWatch("visibilityField", fieldForm) as string | undefined;
  const visibilityOperator = Form.useWatch("visibilityOperator", fieldForm) as
    | "equals"
    | "not_equals"
    | "in"
    | undefined;
  const visibilityValue = Form.useWatch("visibilityValue", fieldForm) as string | undefined;
  const visibilityInValues = Form.useWatch("visibilityInValues", fieldForm) as
    | string[]
    | undefined;

  const validationSummary = summarizeValidationConfig(
    parseValidationSchemaFromFormJson(validationConfigJson, selectedField.validationConfig),
    fieldType,
    isRequired ?? selectedField.isRequired,
  );

  const visibilitySummary = summarizeVisibilityConfig(
    buildVisibilityConfigFromFormSlice({
      visibilityEnabled,
      visibilityField,
      visibilityOperator,
      visibilityValue,
      visibilityInValues,
    }),
    sectionFields,
  );

  const initialValidationSchema = parseValidationSchemaFromFormJson(
    validationConfigJson,
    selectedField.validationConfig,
  );

  const initialVisibilityConfig: VisibilityConfig | null = buildVisibilityConfigFromFormSlice({
    visibilityEnabled,
    visibilityField,
    visibilityOperator,
    visibilityValue,
    visibilityInValues,
  });

  const handleValidationApply = (
    _schema: Record<string, unknown>,
    json: string,
    required: boolean,
  ) => {
    fieldForm.setFieldsValue({ validationConfigJson: json, isRequired: required });
    setValidationModalOpen(false);
  };

  const handleVisibilityApply = (slice: VisibilityFormSlice) => {
    fieldForm.setFieldsValue(slice);
    setVisibilityModalOpen(false);
  };

  const handleStaticOptionsApply = (json: string, enumValues: string[]) => {
    const nextValues: Record<string, unknown> = { staticOptionsJson: json };
    const mergedValidation = mergeValidationEnumFromStaticOptions(
      validationConfigJson,
      selectedField.validationConfig,
      enumValues,
    );
    if (mergedValidation) {
      nextValues.validationConfigJson = mergedValidation;
    }
    fieldForm.setFieldsValue(nextValues);
    setStaticOptionsModalOpen(false);
  };

  const handleOptionsSourceChange = (source: string) => {
    if (source !== STATIC_OPTIONS_SOURCE) return;
    const currentJson = fieldForm.getFieldValue("staticOptionsJson") as
      | string
      | undefined;
    if (currentJson?.trim()) return;

    const mappingType = fieldForm.getFieldValue("mappingType") as MappingType;
    const resolvedColumn =
      mappingType === "COLUMN"
        ? (fieldForm.getFieldValue("columnName") as string | undefined) ?? columnName
        : columnName;

    const fromField =
      selectedField.optionsConfig?.source === STATIC_OPTIONS_SOURCE &&
      "options" in selectedField.optionsConfig
        ? selectedField.optionsConfig.options
        : null;
    const defaults =
      fromField && fromField.length > 0
        ? fromField
        : defaultStaticOptionsForColumn(resolvedColumn);

    if (defaults.length > 0) {
      fieldForm.setFieldValue(
        "staticOptionsJson",
        serializeStaticOptionsJson(
          defaults.map((o) => ({ value: String(o.value), label: o.label })),
        ),
      );
    }
  };

  return (
    <>
      <Form
        form={fieldForm}
        layout="vertical"
        disabled={isStructureLocked}
      >
        <Form.Item name="fieldKey" label="Field key" rules={fieldKeyRules}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="label" label="Label" rules={fieldLabelRules}>
          <Input />
        </Form.Item>
        <Form.Item name="helpText" label="Help text">
          <Input />
        </Form.Item>
        <Form.Item name="fieldType" label="Field type">
          <Select options={filteredFieldTypes} disabled={isWidgetFieldLocked || isFileFieldLocked} />
        </Form.Item>
        {isGeographyColumnField && suggestedResolver && (
          <Typography.Paragraph
            type="secondary"
            style={{ fontSize: token.fontSizeSM, marginBottom: 16 }}
          >
            Geography column <strong>{columnName}</strong> uses{" "}
            {resolverLabels[suggestedResolver] ?? suggestedResolver} (
            {suggestedResolver}).
          </Typography.Paragraph>
        )}

        <Typography.Text
          strong
          style={{ display: "block", marginBottom: 8, fontSize: token.fontSizeSM }}
        >
          Mapping
        </Typography.Text>
        <Form.Item name="mappingType" label="Mapping type">
          <Select
            options={filteredMappingTypes}
            disabled={isWidgetFieldLocked || isFileFieldLocked}
          />
        </Form.Item>
        <Form.Item noStyle shouldUpdate>
          {() => {
            const mappingType = fieldForm.getFieldValue("mappingType");
            if (mappingType === "COLUMN") {
              return (
                <Form.Item
                  name="columnName"
                  label="Column"
                  rules={[{ required: true, message: "Column is required" }]}
                >
                  <Select
                    options={columnOptions}
                    showSearch
                    placeholder="Select an allowlisted column"
                    disabled={isWidgetFieldLocked}
                  />
                </Form.Item>
              );
            }
            if (mappingType === "META_DATA") {
              return (
                <Typography.Paragraph
                  type="secondary"
                  style={{ fontSize: token.fontSizeSM, marginBottom: 16 }}
                >
                  <Typography.Text strong>Metadata path: </Typography.Text>
                  <Typography.Text code>
                    {metadataPathPreview ?? "—"}
                  </Typography.Text>
                  <br />
                  Derived from section title and field label. Updates when you save.
                </Typography.Paragraph>
              );
            }
            if (mappingType === "CUSTOM_HANDLER") {
              return (
                <Form.Item
                  name="handlerKey"
                  label="Handler key"
                  rules={[{ required: true, message: "Handler key is required" }]}
                >
                  <Input disabled={isWidgetFieldLocked} />
                </Form.Item>
              );
            }
            return null;
          }}
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {() => {
            const currentFieldType = fieldForm.getFieldValue("fieldType") as FieldType;

            // FILE: fixed resolver — show read-only info, no picker needed
            if (isFileFieldType(currentFieldType)) {
              return (
                <>
                  <Typography.Text
                    strong
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: token.fontSizeSM,
                    }}
                  >
                    Options
                  </Typography.Text>
                  <Typography.Paragraph
                    type="secondary"
                    style={{ fontSize: token.fontSizeSM, marginBottom: 16 }}
                  >
                    FILE fields automatically use{" "}
                    <Typography.Text code>DocumentTypeOptionsResolver</Typography.Text>.
                    Active document types are resolved at render time and returned
                    with accepted MIME types and max file size in{" "}
                    <Typography.Text code>meta</Typography.Text>. No configuration
                    required.
                  </Typography.Paragraph>
                </>
              );
            }

            if (!isSelectableFieldType(currentFieldType)) return null;
            return (
              <>
                <Typography.Text
                  strong
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: token.fontSizeSM,
                  }}
                >
                  Options (SELECT/RADIO)
                </Typography.Text>
                <Form.Item name="optionsSource" label="Options source">
                  <Select
                    options={resolverOptions}
                    onChange={handleOptionsSourceChange}
                  />
                </Form.Item>
                {showLgaDependsOn && (
                  <>
                    <Form.Item
                      name="dependsOnFieldKey"
                      label="Depends on field"
                      rules={lgaDependsOnFieldRules}
                      initialValue="stateId"
                    >
                      <Select
                        options={dependsOnFieldOptions}
                        placeholder="Select state field"
                      />
                    </Form.Item>
                    <Typography.Paragraph
                      type="secondary"
                      style={{ fontSize: token.fontSizeSM, marginBottom: 8 }}
                    >
                      LGA options are resolved at runtime from the selected state.
                    </Typography.Paragraph>
                  </>
                )}
                {showStaticOptions && (
                  <>
                    <Typography.Paragraph
                      type="secondary"
                      style={{ fontSize: token.fontSizeSM, marginBottom: 8 }}
                    >
                      {STATIC_OPTIONS_BUILDER_HINT}
                    </Typography.Paragraph>
                    <Typography.Paragraph
                      type="secondary"
                      style={{ fontSize: token.fontSizeSM, marginBottom: 8 }}
                    >
                      {staticOptionsSummary}
                    </Typography.Paragraph>
                    <Button
                      block
                      style={{ marginBottom: 16 }}
                      disabled={isStructureLocked}
                      onClick={() => setStaticOptionsModalOpen(true)}
                    >
                      Configure static options
                    </Button>
                  </>
                )}
              </>
            );
          }}
        </Form.Item>

        <Form.Item
          name="staticOptionsJson"
          hidden
          dependencies={["optionsSource"]}
          rules={[
            ({ getFieldValue }) => ({
              validator: async (_, value: string) => {
                if (getFieldValue("optionsSource") !== STATIC_OPTIONS_SOURCE) return;
                const error = validateStaticOptionRows(parseStaticOptionsJson(value));
                if (error) throw new Error(error);
              },
            }),
          ]}
        >
          <Input />
        </Form.Item>

        <Typography.Text
          strong
          style={{ display: "block", marginBottom: 8, fontSize: token.fontSizeSM }}
        >
          Validation rules
        </Typography.Text>
        <Typography.Paragraph
          type="secondary"
          style={{ fontSize: token.fontSizeSM, marginBottom: 8 }}
        >
          {validationSummary}
        </Typography.Paragraph>
        <Button
          block
          style={{ marginBottom: 16 }}
          disabled={isStructureLocked}
          onClick={() => setValidationModalOpen(true)}
        >
          Configure validation
        </Button>
        <Form.Item name="validationConfigJson" hidden rules={jsonSchemaRules}>
          <Input />
        </Form.Item>

        {!isWidgetFieldType(selectedField.fieldType) && !isFileFieldType(selectedField.fieldType) && (
          <>
            <Typography.Text
              strong
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: token.fontSizeSM,
              }}
            >
              Visibility rules
            </Typography.Text>
            <Typography.Paragraph
              type="secondary"
              style={{ fontSize: token.fontSizeSM, marginBottom: 8 }}
            >
              {visibilitySummary}
            </Typography.Paragraph>
            <Button
              block
              style={{ marginBottom: 16 }}
              disabled={isStructureLocked}
              onClick={() => setVisibilityModalOpen(true)}
            >
              Configure visibility
            </Button>
            <Form.Item name="visibilityEnabled" hidden>
              <Switch />
            </Form.Item>
            <Form.Item name="visibilityField" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="visibilityOperator" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="visibilityValue" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="visibilityInValues" hidden>
              <Select mode="tags" />
            </Form.Item>
          </>
        )}

        <Form.Item name="isRequired" hidden valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="isReadOnly" label="Read only" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Button
          type="primary"
          block
          loading={isSaving}
          disabled={isStructureLocked}
          onClick={onSave}
        >
          Save field
        </Button>
      </Form>

      <ValidationRuleFormModal
        open={validationModalOpen}
        fieldType={fieldType}
        initialSchema={initialValidationSchema}
        initialIsRequired={isRequired ?? selectedField.isRequired}
        onClose={() => setValidationModalOpen(false)}
        onApply={handleValidationApply}
      />

      {!isWidgetFieldType(selectedField.fieldType) && !isFileFieldType(selectedField.fieldType) && (
        <VisibilityRuleFormModal
          open={visibilityModalOpen}
          sectionFields={sectionFields}
          currentFieldKey={selectedField.fieldKey}
          initialConfig={initialVisibilityConfig}
          onClose={() => setVisibilityModalOpen(false)}
          onApply={handleVisibilityApply}
        />
      )}

      <StaticOptionsFormModal
        open={staticOptionsModalOpen}
        initialJson={staticOptionsJson}
        columnName={columnName}
        onClose={() => setStaticOptionsModalOpen(false)}
        onApply={handleStaticOptionsApply}
      />
    </>
  );
}
