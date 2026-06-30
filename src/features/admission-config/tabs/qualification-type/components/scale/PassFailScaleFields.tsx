import { Tag, Typography } from "antd";

export function PassFailScaleFields() {
  return (
    <div>
      <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
        Pass / fail outcomes are fixed for this format.
      </Typography.Text>
      <Tag>PASS</Tag>
      <Tag>FAIL</Tag>
    </div>
  );
}
