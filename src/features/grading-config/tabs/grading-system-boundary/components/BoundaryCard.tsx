// Feature: grading-config
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Flex, Tag, Typography } from "antd";
import type { GradingSystemBoundary } from "../types/grading-system-boundary";

type BoundaryCardProps = {
  boundary: GradingSystemBoundary;
  onEdit: (b: GradingSystemBoundary) => void;
  onDelete: (b: GradingSystemBoundary) => void;
};

export function BoundaryCard({
  boundary,
  onEdit,
  onDelete,
}: BoundaryCardProps) {
  const token = useToken();

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        background: token.colorBgContainer,
        padding: "12px 16px",
      }}
    >
      <Flex align="center" justify="space-between" gap={12}>
        {/* Left: boundary info */}
        <Flex
          align="center"
          gap={12}
          wrap="wrap"
          style={{ flex: 1, minWidth: 0 }}
        >
          {/* Letter grade */}
          <Typography.Text
            strong
            style={{ fontSize: token.fontSizeLG, minWidth: 40 }}
          >
            {boundary.letterGrade}
          </Typography.Text>

          {/* Score range */}
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
          >
            {boundary.minScore}–{boundary.maxScore}
          </Typography.Text>

          {/* Grade point */}
          <Typography.Text style={{ fontSize: token.fontSizeSM }}>
            GP: <strong>{boundary.gradePoint}</strong>
          </Typography.Text>

          {/* Pass/Fail tag */}
          <Tag
            color={boundary.isPass ? "success" : "error"}
            style={{ margin: 0 }}
          >
            {boundary.isPass ? "Pass" : "Fail"}
          </Tag>
        </Flex>

        {/* Right: actions */}
        <Flex align="center" gap={4} style={{ flexShrink: 0 }}>
          <PermissionGuard permission={Permission.GradingSchemaConfigsUpdate}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ fontSize: 16 }} />}
              onClick={() => onEdit(boundary)}
              title="Edit"
            />
          </PermissionGuard>
          <PermissionGuard permission={Permission.GradingSchemaConfigsDelete}>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined style={{ fontSize: 16 }} />}
              onClick={() => onDelete(boundary)}
              title="Delete"
            />
          </PermissionGuard>
        </Flex>
      </Flex>
    </div>
  );
}
