import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";
import type { OlevelGradePoint } from "../types/olevel-grade-point";

type OlevelGradePointCardProps = {
  gradePoint: OlevelGradePoint;
  onEdit: (gradePoint: OlevelGradePoint) => void;
  onDelete: (gradePoint: OlevelGradePoint) => void;
};

export function OlevelGradePointCard({
  gradePoint,
  onEdit,
  onDelete,
}: OlevelGradePointCardProps) {
  const token = useToken();

  const formatCreatedAt = (createdAt: string): string =>
    new Date(createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        background: token.colorBgContainer,
        padding: "16px",
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Flex vertical gap={8} style={{ flex: 1, minWidth: 0 }}>
        <Typography.Text
          strong
          style={{ fontSize: token.fontSizeLG, lineHeight: 1.2 }}
          ellipsis={{ tooltip: gradePoint.grade }}
        >
          {gradePoint.grade}
        </Typography.Text>

        <Typography.Text style={{ fontSize: token.fontSize }}>
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Points:{" "}
          </Typography.Text>
          <strong>
            {gradePoint.points} {gradePoint.points === 1 ? "pt" : "pts"}
          </strong>
        </Typography.Text>

        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM, marginTop: "auto" }}
        >
          Added {formatCreatedAt(gradePoint.createdAt)}
        </Typography.Text>
      </Flex>

      <Flex align="center" justify="flex-end" gap={4} style={{ marginTop: 12 }}>
        <PermissionGuard permission={Permission.AdmissionOlevelGradePointsUpdate}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined style={{ fontSize: 16 }} />}
            onClick={() => onEdit(gradePoint)}
            title="Edit"
          />
        </PermissionGuard>
        <PermissionGuard permission={Permission.AdmissionOlevelGradePointsDelete}>
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined style={{ fontSize: 16 }} />}
            onClick={() => onDelete(gradePoint)}
            title="Delete"
          />
        </PermissionGuard>
      </Flex>
    </div>
  );
}
