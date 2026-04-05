import { Button, Card, Col, Row, Space, Typography } from "antd";
import { Link } from "react-router-dom";
import { useHomeContent } from "../hooks/use-home-content";

const { Paragraph, Text, Title } = Typography;

export default function HomePage() {
  const content = useHomeContent();

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <Title level={1} style={{ marginBottom: 0 }}>
          {content.title}
        </Title>
        <Paragraph type="secondary" style={{ marginTop: 0 }}>
          {content.subtitle}
        </Paragraph>

        <Row gutter={[16, 16]}>
          {content.highlights.map((item) => (
            <Col xs={24} md={12} key={item}>
              <Card>
                <Text>{item}</Text>
              </Card>
            </Col>
          ))}
        </Row>

        <Space>
          <Button type="primary">
            <Link to="/tenant-signup">Find my institution</Link>
          </Button>
          <Button>
            <Link to="/about">Learn more</Link>
          </Button>
        </Space>
      </Space>
    </div>
  );
}
