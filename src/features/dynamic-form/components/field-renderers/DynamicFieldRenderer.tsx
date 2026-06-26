import { JambWidget } from "@/features/dynamic-form/components/field-renderers/JambWidget.tsx";
import { OlevelWidget } from "@/features/dynamic-form/components/field-renderers/OlevelWidget.tsx";
import { ProgramChoiceWidget } from "@/features/dynamic-form/components/field-renderers/ProgramChoiceWidget.tsx";
import { FileUploadField } from "@/features/dynamic-form/components/field-renderers/FileUploadField.tsx";
import {
  Checkbox,
  DatePicker,
  Flex,
  Input,
  InputNumber,
  Radio,
  Select,
} from "antd";
import dayjs from "dayjs";
import type { RenderField } from "../../types";
import type { DynamicFormLayoutFlags } from "../../utils/dynamicFormLayout";
import { resolveFieldWidth } from "../../utils/dynamicFormLayout";
import {
  isLgaGeographyFieldKey,
  isStateGeographyFieldKey,
} from "../../utils/geographyFieldKeys";

type FieldOption = { value: number | string; label: string };

function coerceFieldOption(raw: {
  value?: unknown;
  label?: unknown;
  id?: unknown;
  name?: unknown;
}): FieldOption | null {
  const value = raw.value ?? raw.id;
  const label = raw.label ?? raw.name;
  if (value == null || label == null || String(label).length === 0) return null;
  return { value: value as number | string, label: String(label) };
}

function coerceFieldOptions(options: RenderField["options"]): FieldOption[] {
  if (!options?.length) return [];
  return options
    .map((o) =>
      coerceFieldOption(o as FieldOption & { id?: number; name?: string }),
    )
    .filter((o): o is FieldOption => o != null);
}

/** Program SELECT fields use ProgramOptionsResolver — options may come from render-package or GET /programs. */
function isProgramSelectField(field: RenderField): boolean {
  return (
    field.fieldKey === "apply_program" ||
    field.fieldKey === "applied_program" ||
    field.fieldKey === "appliedProgramId" ||
    /program/i.test(field.fieldKey)
  );
}

function selectOptionsForField(
  field: RenderField,
  programOptions: FieldOption[],
  stateOptions: FieldOption[],
  lgaOptions: FieldOption[],
): FieldOption[] {
  const inline = coerceFieldOptions(field.options);
  if (isStateGeographyFieldKey(field.fieldKey) && stateOptions.length > 0) {
    return stateOptions;
  }
  if (isLgaGeographyFieldKey(field.fieldKey) && lgaOptions.length > 0) {
    return lgaOptions;
  }
  if (inline.length > 0) return inline;
  if (isProgramSelectField(field) && programOptions.length > 0) {
    return programOptions;
  }
  return [];
}

type DynamicFieldRendererProps = {
  field: RenderField;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  programOptions?: Array<{ value: number; label: string }>;
  stateOptions?: Array<{ value: number; label: string }>;
  lgaOptions?: Array<{ value: number; label: string }>;
  subjectOptions?: Array<{ value: number; label: string }>;
  isLgasLoading?: boolean;
  layout?: DynamicFormLayoutFlags;
  /** Candidate entity ID — required for FILE field uploads */
  candidateId?: number;
  /** Actor type for FILE uploads — defaults to "CANDIDATE" */
  actorType?: string;
};

const defaultLayout: DynamicFormLayoutFlags = {
  isMobile: false,
  isXs: false,
  fieldWidth: "100%",
  stackRadioVertical: false,
  stackWidgetRows: false,
  stackSittingCards: false,
  stepsVariant: "horizontal",
  navButtonsBlock: false,
  stickyNav: false,
};

export function DynamicFieldRenderer({
  field,
  value,
  onChange,
  disabled,
  programOptions = [],
  stateOptions = [],
  lgaOptions = [],
  subjectOptions = [],
  isLgasLoading = false,
  layout = defaultLayout,
  candidateId,
  actorType,
}: DynamicFieldRendererProps) {
  const uiWidth = field.ui?.width as string | undefined;
  const width = resolveFieldWidth(uiWidth, layout.isMobile);
  const fullWidthStyle = layout.isMobile ? { width: "100%" } : { width };
  const placeholder = (field.ui?.placeholder as string) ?? undefined;
  const selectOptions = selectOptionsForField(
    field,
    programOptions,
    stateOptions,
    lgaOptions,
  );
  const isLgaField = isLgaGeographyFieldKey(field.fieldKey);
  const lgaAwaitingState = isLgaField && selectOptions.length === 0;
  const lgaSelectLoading = isLgaField && isLgasLoading;

  switch (field.fieldType) {
    case "TEXT":
    case "EMAIL":
    case "PHONE":
      return (
        <Input
          type={field.fieldType === "EMAIL" ? "email" : "text"}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || field.isReadOnly}
          style={fullWidthStyle}
        />
      );
    case "TEXTAREA":
      return (
        <Input.TextArea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || field.isReadOnly}
          rows={4}
          style={fullWidthStyle}
        />
      );
    case "NUMBER":
      return (
        <InputNumber
          value={value as number | null}
          onChange={(v) => onChange(v)}
          disabled={disabled || field.isReadOnly}
          style={fullWidthStyle}
        />
      );
    case "DATE":
      return (
        <DatePicker
          value={value ? dayjs(value as string) : null}
          onChange={(d) => onChange(d ? d.format("YYYY-MM-DD") : null)}
          disabled={disabled || field.isReadOnly}
          style={fullWidthStyle}
        />
      );
    case "SELECT":
      return (
        <Select
          value={value as string | number | undefined}
          onChange={onChange}
          options={selectOptions.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          disabled={disabled || field.isReadOnly || lgaAwaitingState}
          loading={lgaSelectLoading}
          placeholder={
            lgaSelectLoading
              ? "Loading LGAs..."
              : lgaAwaitingState
                ? "Select a state first"
                : (placeholder ?? "Select...")
          }
          style={fullWidthStyle}
          allowClear
          showSearch={selectOptions.length > 0}
          optionFilterProp="label"
          popupMatchSelectWidth={layout.isMobile}
        />
      );
    case "RADIO":
      return (
        <Radio.Group
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || field.isReadOnly}
          style={fullWidthStyle}
        >
          <Flex
            vertical={layout.stackRadioVertical}
            gap={layout.stackRadioVertical ? 8 : 0}
            wrap="wrap"
          >
            {selectOptions.map((o) => (
              <Radio key={String(o.value)} value={o.value}>
                {o.label}
              </Radio>
            ))}
          </Flex>
        </Radio.Group>
      );
    case "CHECKBOX":
      return (
        <Checkbox
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled || field.isReadOnly}
        >
          {field.label}
        </Checkbox>
      );
    case "WIDGET_PROGRAM_CHOICE":
      return (
        <ProgramChoiceWidget
          value={
            value as
              | { first_choice?: number; second_choice?: number }
              | undefined
          }
          onChange={onChange}
          options={
            programOptions.length
              ? programOptions
              : selectOptions.map((o) => ({
                  value: Number(o.value),
                  label: o.label,
                }))
          }
          disabled={disabled || field.isReadOnly}
        />
      );
    case "WIDGET_OLEVEL":
      return (
        <OlevelWidget
          value={
            value as
              | {
                  sittings?: Array<{
                    examType?: string;
                    examYear?: number;
                    examRegNo?: string;
                    centerNumber?: string;
                    schoolName?: string;
                    grades?: Array<{ subjectId?: number; grade?: string }>;
                  }>;
                }
              | undefined
          }
          onChange={onChange}
          disabled={disabled || field.isReadOnly}
          subjectOptions={subjectOptions}
          layout={layout}
        />
      );
    case "WIDGET_JAMB":
      return (
        <JambWidget
          value={
            value as
              | { scores?: Array<{ subjectId?: number; score?: number }> }
              | undefined
          }
          onChange={onChange}
          disabled={disabled || field.isReadOnly}
          subjectOptions={subjectOptions}
          layout={layout}
        />
      );
    case "FILE":
      return (
        <FileUploadField
          field={field}
          value={typeof value === "number" ? value : null}
          onChange={(uploadId) => onChange(uploadId)}
          disabled={disabled || field.isReadOnly}
          candidateId={candidateId}
          actorType={actorType}
        />
      );
    default:
      return (
        <Input
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || field.isReadOnly}
          style={fullWidthStyle}
        />
      );
  }
}
