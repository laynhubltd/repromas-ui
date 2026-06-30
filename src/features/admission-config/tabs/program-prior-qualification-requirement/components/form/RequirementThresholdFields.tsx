import type { PriorQualificationType } from "@/features/admission-config/tabs/qualification-type/types/prior-qualification-type";
import { Alert, Form, InputNumber, Select } from "antd";
import {
  minimumClassRules,
  minimumPointsRules,
} from "../../utils/validators";

type RequirementThresholdFieldsProps = {
  selectedType: PriorQualificationType | null;
};

function getClassificationOptions(type: PriorQualificationType | null): string[] {
  if (!type) return [];
  const scale = type.scaleDefinition;
  const classes = (scale as { classes?: string[] }).classes;
  if (classes?.length) return classes;
  const grades = (scale as { grades?: string[] }).grades;
  return grades ?? [];
}

function getMaxPoints(type: PriorQualificationType | null): number | undefined {
  if (!type || type.assessmentFormat !== "POINTS") return undefined;
  return (type.scaleDefinition as { maxPoints?: number }).maxPoints;
}

export function RequirementThresholdFields({
  selectedType,
}: RequirementThresholdFieldsProps) {
  const format = selectedType?.assessmentFormat;

  if (!selectedType) {
    return (
      <Alert
        type="info"
        showIcon
        message="Select a qualification type to configure the minimum threshold."
      />
    );
  }

  if (format === "POINTS") {
    const maxPoints = getMaxPoints(selectedType);
    return (
      <Form.Item
        name="minimumPoints"
        label="Minimum points"
        rules={minimumPointsRules}
        extra={
          maxPoints != null
            ? `Maximum for this type is ${maxPoints} points.`
            : undefined
        }
      >
        <InputNumber min={1} max={maxPoints} precision={0} style={{ width: "100%" }} />
      </Form.Item>
    );
  }

  if (format === "CLASSIFICATION") {
    const options = getClassificationOptions(selectedType).map((value) => ({
      value,
      label: value,
    }));

    return (
      <>
        <Form.Item
          name="minimumClass"
          label="Minimum class / grade"
          rules={minimumClassRules}
          extra="Best acceptable class on the type scale."
        >
          <Select
            placeholder="Select minimum class"
            options={options}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item
          name="minimumClassRank"
          label="Minimum class rank (optional alternative)"
          extra="Lower rank number = better class. Use instead of class name if preferred."
        >
          <InputNumber min={1} precision={0} style={{ width: "100%" }} />
        </Form.Item>
      </>
    );
  }

  return (
    <Alert
      type="info"
      showIcon
      message="No numeric threshold"
      description="For CGPA and Pass/Fail types, the requirement means the candidate must hold this qualification. No minimum score is configured in v1."
    />
  );
}
