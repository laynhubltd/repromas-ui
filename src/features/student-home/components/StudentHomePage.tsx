import { Card, Space, Typography } from "antd";

const { Paragraph, Title } = Typography;

export default function StudentHomePage() {
  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <Card>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Title level={2} style={{ marginBottom: 0 }}>
            Student Portal
          </Title>
          <Paragraph style={{ marginBottom: 0 }}>
            Welcome to the student module. Your tenant and role were validated by
            the module mounter.
          </Paragraph>
        </Space>
      </Card>
    </div>
  );
}
