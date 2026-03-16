import { colors } from "@/config/theme";
import { useToken } from "@/hooks/useToken";
import {
  ApartmentOutlined,
  BankOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Typography } from "antd";
import { useIsMobile } from "@/hooks/useBreakpoint";

const CARD_STYLE = {
  transition: "box-shadow 0.2s",
  cursor: "default",
};

export interface StatsCardsProps {
  totalFaculties: number;
  totalDepartments: number;
  activePrograms: number;
}

export function StatsCards({
  totalFaculties,
  totalDepartments,
  activePrograms,
}: StatsCardsProps) {
  const token = useToken();
  const isMobile = useIsMobile();

  const items = [
    {
      label: "Total Faculties",
      value: totalFaculties,
      icon: <BankOutlined />,
      color: colors.primary,
    },
    {
      label: "Total Departments",
      value: totalDepartments,
      icon: <ApartmentOutlined />,
      color: colors.info,
    },
    {
      label: "Active Programs",
      value: activePrograms,
      icon: <ReadOutlined />,
      color: colors.warning,
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {items.map(({ label, value, icon, color }) => (
        <Col xs={24} sm={12} md={8} key={label}>
          <Card
            size="small"
            style={{
              ...CARD_STYLE,
              borderRadius: token.borderRadius,
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
            }}
            bodyStyle={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 12 : 16,
              padding: isMobile ? 16 : 24,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = token.boxShadowSecondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)";
            }}
          >
            <div
              style={{
                width: isMobile ? 40 : 48,
                height: isMobile ? 40 : 48,
                borderRadius: "50%",
                background: `${color}14`,
                color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isMobile ? 20 : 24,
              }}
            >
              {icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <Typography.Text
                type="secondary"
                style={{
                  fontSize: isMobile ? 9 : 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                {label}
              </Typography.Text>
              <Typography.Title
                level={3}
                style={{
                  margin: 0,
                  lineHeight: 1,
                  fontSize: isMobile ? 22 : undefined,
                }}
              >
                {value}
              </Typography.Title>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
