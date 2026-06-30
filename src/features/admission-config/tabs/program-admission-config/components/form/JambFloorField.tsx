import { Form, InputNumber, Typography } from "antd";
import { minimumJambScoreRules } from "../../utils/validators";

export function JambFloorField() {
  return (
    <>
      <Typography.Text strong style={{ display: "block", marginBottom: 4 }}>
        UTME floor (optional)
      </Typography.Text>
      <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
        Minimum JAMB score for UTME applicants only. Leave empty to disable.
      </Typography.Text>
      <Form.Item name="minimumJambScore" label="Minimum JAMB score" rules={minimumJambScoreRules}>
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          max={400}
          precision={0}
          placeholder="Not set"
        />
      </Form.Item>
    </>
  );
}
