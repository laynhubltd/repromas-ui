import { Card, Space, Typography } from "antd";
import { useContactContent } from "../hooks/use-contact-content";

const { Text, Title } = Typography;

export default function ContactPage() {
  const content = useContactContent();

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <Card>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Title level={2} style={{ marginBottom: 0 }}>
            {content.title}
          </Title>
          {content.channels.map((item) => (
            <Text key={item.label}>
              <strong>{item.label}:</strong> {item.value}
            </Text>
          ))}
        </Space>
      </Card>
    </div>
  );
}
