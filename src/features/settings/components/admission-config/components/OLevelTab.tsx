import { useToken } from "@/shared/hooks/useToken";
import { Space, Typography } from "antd";

export function OLevelTab() {
  const token = useToken();

  return (
    <Space direction="vertical" size={token.sizeLG} style={{ width: "100%" }}>
      <div>
        <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>
          O&apos;Level
        </Typography.Title>
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM, display: "block", marginTop: 2 }}
        >
          Manage O&apos;Level subjects or qualifications
        </Typography.Text>
      </div>
      <Typography.Text type="secondary">
        O&apos;Level configuration. Content and table to be wired to API.
      </Typography.Text>
    </Space>
  );
}
