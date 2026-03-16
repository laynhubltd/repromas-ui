import { useToken } from "@/hooks/useToken";
import { Space, Typography } from "antd";

export function OLevelGradingTab() {
  const token = useToken();

  return (
    <Space direction="vertical" size={token.sizeLG} style={{ width: "100%" }}>
      <div>
        <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>
          O&apos;Level Grading
        </Typography.Title>
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM, display: "block", marginTop: 2 }}
        >
          Define O&apos;Level grading scales or grade points
        </Typography.Text>
      </div>
      <Typography.Text type="secondary">
        O&apos;Level grading configuration. Content and table to be wired to API.
      </Typography.Text>
    </Space>
  );
}
