import { Form, InputNumber } from "antd";
import { cgpaMaxRules, cgpaMinRules } from "../../utils/validators";

export function CgpaScaleFields() {
  return (
    <>
      <Form.Item
        name="cgpaMin"
        label="Minimum CGPA"
        rules={cgpaMinRules}
        style={{ display: "inline-block", width: "calc(50% - 8px)", marginRight: 16 }}
      >
        <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="cgpaMax"
        label="Maximum CGPA"
        rules={cgpaMaxRules}
        style={{ display: "inline-block", width: "calc(50% - 8px)" }}
      >
        <InputNumber min={0.01} step={0.01} style={{ width: "100%" }} />
      </Form.Item>
    </>
  );
}
