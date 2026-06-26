import { Col, Form, Row, Typography } from "antd";
import type { RenderField, RenderSection } from "../../types";
import { useDynamicFormLayout } from "../../hooks/useDynamicFormLayout";
import { groupFieldsForLayout } from "../../utils/dynamicFormLayout";
import type { DynamicFormLayoutFlags } from "../../utils/dynamicFormLayout";
import { evaluateVisibilityCondition } from "../../utils/evaluateVisibilityCondition";
import { DynamicFieldRenderer } from "./DynamicFieldRenderer";

type DynamicFormSectionViewProps = {
  section: RenderSection;
  values: Record<string, unknown>;
  onFieldChange: (fieldKey: string, value: unknown) => void;
  fieldErrors?: Record<string, string>;
  disabled?: boolean;
  programOptions?: Array<{ value: number; label: string }>;
  stateOptions?: Array<{ value: number; label: string }>;
  lgaOptions?: Array<{ value: number; label: string }>;
  subjectOptions?: Array<{ value: number; label: string }>;
  isLgasLoading?: boolean;
  /** Candidate entity ID — forwarded to FILE field upload widgets */
  candidateId?: number;
  /** Actor type — forwarded to FILE field upload widgets */
  actorType?: string;
};

function renderFieldItem(
  field: RenderField,
  values: Record<string, unknown>,
  onFieldChange: (fieldKey: string, value: unknown) => void,
  fieldErrors: Record<string, string>,
  disabled: boolean | undefined,
  programOptions: Array<{ value: number; label: string }> | undefined,
  stateOptions: Array<{ value: number; label: string }> | undefined,
  lgaOptions: Array<{ value: number; label: string }> | undefined,
  subjectOptions: Array<{ value: number; label: string }> | undefined,
  isLgasLoading: boolean | undefined,
  layout: DynamicFormLayoutFlags,
  candidateId?: number,
  actorType?: string,
) {
  const errorMessage = fieldErrors[field.fieldKey];

  return (
    <Form.Item
      key={field.fieldKey}
      label={
        field.fieldType !== "CHECKBOX" ? (
          <span>
            {field.label}
            {field.isRequired && (
              <span style={{ color: "#ff4d4f", marginLeft: 4 }}>*</span>
            )}
          </span>
        ) : null
      }
      help={errorMessage ?? field.helpText ?? undefined}
      validateStatus={errorMessage ? "error" : undefined}
      style={{ marginBottom: 16 }}
    >
      <DynamicFieldRenderer
        field={field}
        value={values[field.fieldKey]}
        onChange={(v) => onFieldChange(field.fieldKey, v)}
        disabled={disabled}
        programOptions={programOptions}
        stateOptions={stateOptions}
        lgaOptions={lgaOptions}
        subjectOptions={subjectOptions}
        isLgasLoading={isLgasLoading}
        layout={layout}
        candidateId={candidateId}
        actorType={actorType}
      />
    </Form.Item>
  );
}

export function DynamicFormSectionView({
  section,
  values,
  onFieldChange,
  fieldErrors = {},
  disabled,
  programOptions,
  stateOptions,
  lgaOptions,
  subjectOptions,
  isLgasLoading,
  candidateId,
  actorType,
}: DynamicFormSectionViewProps) {
  const layout = useDynamicFormLayout();

  const sortedFields = [...section.fields]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .filter((field) =>
      evaluateVisibilityCondition(
        field.visibilityConfig?.["x-condition"],
        values,
      ),
    );

  const fieldGroups = groupFieldsForLayout(sortedFields, layout.isMobile);

  return (
    <div>
      {section.description && (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          {section.description}
        </Typography.Paragraph>
      )}
      <Form layout="vertical" requiredMark={false}>
        {fieldGroups.map((group) => {
          if (group.kind === "single") {
            return renderFieldItem(
              group.field,
              values,
              onFieldChange,
              fieldErrors,
              disabled,
              programOptions,
              stateOptions,
              lgaOptions,
              subjectOptions,
              isLgasLoading,
              layout,
              candidateId,
              actorType,
            );
          }

          return (
            <Row key={`${group.fields[0].fieldKey}-${group.fields[1].fieldKey}`} gutter={16}>
              {group.fields.map((field) => (
                <Col key={field.fieldKey} xs={24} sm={12}>
                  {renderFieldItem(
                    field,
                    values,
                    onFieldChange,
                    fieldErrors,
                    disabled,
                    programOptions,
                    stateOptions,
                    lgaOptions,
                    subjectOptions,
                    isLgasLoading,
                    layout,
                    candidateId,
                    actorType,
                  )}
                </Col>
              ))}
            </Row>
          );
        })}
      </Form>
    </div>
  );
}
