import { useToken } from "@/hooks/useToken";
import { Space, Typography } from "antd";

export function ProgramOLevelTab() {
  const token = useToken();

  return (
    <Space direction="vertical" size={token.sizeLG} style={{ width: "100%" }}>
      <div>
        <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>
          Program O&apos;Level
        </Typography.Title>
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM, display: "block", marginTop: 2 }}
        >
          Link O&apos;Level requirements to programs
        </Typography.Text>
      </div>
      <Typography.Text type="secondary">
        Program O&apos;Level configuration. Content and table to be wired to API.
      </Typography.Text>
    </Space>
  );
}
