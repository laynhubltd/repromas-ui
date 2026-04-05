import { Card, Col, Row, Typography } from "antd";
import { useServicesContent } from "../hooks/use-services-content";

const { Text, Title } = Typography;

export default function ServicesPage() {
  const content = useServicesContent();

  return (
    <div style={{ maxWidth: 940, margin: "0 auto" }}>
      <Title level={2}>{content.title}</Title>
      <Row gutter={[16, 16]}>
        {content.items.map((service) => (
          <Col xs={24} md={12} key={service}>
            <Card>
              <Text>{service}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
