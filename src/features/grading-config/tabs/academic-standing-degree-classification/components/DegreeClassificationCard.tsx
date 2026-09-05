import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Badge, Button, Card, Flex, Space, Tag, Typography } from "antd";
import type { DegreeClassificationBand } from "../types/academic-standing-degree-classification";

export interface DegreeClassificationCardProps {
  band: DegreeClassificationBand;
  policyMaxCgpa: number;
  onEdit: (band: DegreeClassificationBand) => void;
  onDelete: (band: DegreeClassificationBand) => void;
}

export function DegreeClassificationCard({
  band,
  policyMaxCgpa,
  onEdit,
  onDelete,
}: DegreeClassificationCardProps) {
  const token = useToken();

  const minVal = Number(band.minCgpa ?? 0);
  const maxVal =
    band.maxCgpa !== null && band.maxCgpa !== undefined ? Number(band.maxCgpa) : null;
  const maxScale = Number(policyMaxCgpa ?? 5.0);

  const intervalText =
    maxVal === null
      ? `${minVal.toFixed(2)} – ${maxScale.toFixed(2)} (Open Ceiling)`
      : `${minVal.toFixed(2)} – ${maxVal.toFixed(2)}`;

  return (
    <Card
      size="small"
      style={{
        width: "100%",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}
      styles={{ body: { padding: "14px 18px" } }}
    >
      <Flex wrap="wrap" justify="space-between" align="center" gap={12}>
        {/* Left Info */}
        <Flex align="center" gap={12}>
          <Tag style={{ fontWeight: 600, fontSize: 12, margin: 0 }}>
            Order {band.rankOrder}
          </Tag>
          <div>
            <Flex align="center" gap={8}>
              <Typography.Text strong style={{ fontSize: 15 }}>
                {band.name}
              </Typography.Text>
              <Tag color="blue" style={{ fontWeight: 600, fontSize: 11, margin: 0 }}>
                {band.code}
              </Tag>
            </Flex>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Order {band.rankOrder} in degree award hierarchy
            </Typography.Text>
          </div>
        </Flex>

        {/* Center: CGPA Range */}
        <Flex vertical align="center">
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            Qualifying CGPA Range
          </Typography.Text>
          <Typography.Text
            strong
            style={{
              fontSize: 15,
              fontVariantNumeric: "tabular-nums",
              color: token.colorTextHeading,
            }}
          >
            {intervalText}
          </Typography.Text>
        </Flex>

        {/* Right: Actions */}
        <Space size="small">
          <PermissionGuard permission={Permission.AcademicStandingsUpdate}>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(band)}
            >
              Edit
            </Button>
          </PermissionGuard>

          <PermissionGuard permission={Permission.AcademicStandingsDelete}>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(band)}
            >
              Delete
            </Button>
          </PermissionGuard>
        </Space>
      </Flex>
    </Card>
  );
}
