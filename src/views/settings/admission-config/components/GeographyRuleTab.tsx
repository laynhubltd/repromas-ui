import { useToken } from "@/hooks/useToken";
import { Space, Typography } from "antd";

export function GeographyRuleTab() {
  const token = useToken();

  return (
    <Space direction="vertical" size={token.sizeLG} style={{ width: "100%" }}>
      <div>
        <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>
          Geography Rule
        </Typography.Title>
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM, display: "block", marginTop: 2 }}
        >
          Configure geographic eligibility rules for admission
        </Typography.Text>
      </div>
      <Typography.Text type="secondary">
        Geography rule configuration. Content and table to be wired to API.
      </Typography.Text>
    </Space>
  );
}
