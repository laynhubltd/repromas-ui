import { useToken } from "@/shared/hooks/useToken";
import { Space, Typography } from "antd";

export function ProgramQuotaTab() {
  const token = useToken();

  return (
    <Space direction="vertical" size={token.sizeLG} style={{ width: "100%" }}>
      <div>
        <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>
          Program Quota
        </Typography.Title>
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM, display: "block", marginTop: 2 }}
        >
          Set admission quotas per program
        </Typography.Text>
      </div>
      <Typography.Text type="secondary">
        Program quota configuration. Content and table to be wired to API.
      </Typography.Text>
    </Space>
  );
}
