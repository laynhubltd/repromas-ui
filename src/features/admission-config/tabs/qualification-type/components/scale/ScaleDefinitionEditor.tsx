import { Form, Typography } from "antd";
import type { FormInstance } from "antd/es/form";
import type {
  AssessmentFormat,
  QualificationTypeFormValues,
} from "../../types/prior-qualification-type";
import { ClassificationScaleEditor } from "./ClassificationScaleEditor";
import { CgpaScaleFields } from "./CgpaScaleFields";
import { PassFailScaleFields } from "./PassFailScaleFields";
import { PointsScaleFields } from "./PointsScaleFields";

type ScaleDefinitionEditorProps = {
  form: FormInstance<QualificationTypeFormValues>;
  assessmentFormat: AssessmentFormat | undefined;
};

export function ScaleDefinitionEditor({
  form,
  assessmentFormat,
}: ScaleDefinitionEditorProps) {
  if (!assessmentFormat) {
    return (
      <Typography.Text type="secondary">
        Select an assessment format to configure the scale.
      </Typography.Text>
    );
  }

  return (
    <Form.Item label="Scale definition" required>
      {assessmentFormat === "POINTS" && <PointsScaleFields />}
      {assessmentFormat === "CLASSIFICATION" && (
        <ClassificationScaleEditor form={form} />
      )}
      {assessmentFormat === "CGPA" && <CgpaScaleFields />}
      {assessmentFormat === "PASS_FAIL" && <PassFailScaleFields />}
    </Form.Item>
  );
}
