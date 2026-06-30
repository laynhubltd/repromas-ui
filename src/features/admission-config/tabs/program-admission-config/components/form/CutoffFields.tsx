import { Form, InputNumber, Space, Typography } from "antd";
import { cutoffRules } from "../../utils/validators";

export function CutoffFields() {
  return (
    <>
      <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
        Minimum cut-offs
      </Typography.Text>
      <Space.Compact style={{ width: "100%", marginBottom: 8 }}>
        <Form.Item
          name="meritCutoff"
          label="Merit"
          rules={cutoffRules}
          style={{ width: "33%" }}
        >
          <InputNumber style={{ width: "100%" }} min={0} max={100} precision={2} />
        </Form.Item>
        <Form.Item
          name="catchmentCutoff"
          label="Catchment"
          rules={cutoffRules}
          style={{ width: "33%" }}
        >
          <InputNumber style={{ width: "100%" }} min={0} max={100} precision={2} />
        </Form.Item>
        <Form.Item
          name="eldsCutoff"
          label="ELDS"
          rules={cutoffRules}
          style={{ width: "34%" }}
        >
          <InputNumber style={{ width: "100%" }} min={0} max={100} precision={2} />
        </Form.Item>
      </Space.Compact>
      <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
        Post-scoring aggregate thresholds. Ordering: Merit ≥ Catchment ≥ ELDS.
      </Typography.Text>
    </>
  );
}
