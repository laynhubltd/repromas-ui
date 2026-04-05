import { Card, Space, Typography } from "antd";
import { useAboutContent } from "../hooks/use-about-content";

const { Paragraph, Title } = Typography;

export default function AboutPage() {
  const content = useAboutContent();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <Card>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Title level={2} style={{ marginBottom: 0 }}>
            {content.title}
          </Title>
          {content.paragraphs.map((text) => (
            <Paragraph key={text} style={{ margin: 0 }}>
              {text}
            </Paragraph>
          ))}
        </Space>
      </Card>
    </div>
  );
}
