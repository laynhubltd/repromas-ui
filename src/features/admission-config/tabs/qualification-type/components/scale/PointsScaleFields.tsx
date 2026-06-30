import { Form, InputNumber } from "antd";
import { maxPointsRules } from "../../utils/validators";

export function PointsScaleFields() {
  return (
    <Form.Item
      name="maxPoints"
      label="Maximum points"
      rules={maxPointsRules}
      extra="Highest achievable score for this qualification type."
    >
      <InputNumber min={1} precision={0} style={{ width: "100%" }} />
    </Form.Item>
  );
}
