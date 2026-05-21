// Feature: grading-config
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Flex, Tag, Typography } from "antd";
import type { ScoreEvaluationStatus } from "../types/evaluation-status";

type EvaluationStatusCardProps = {
  status: ScoreEvaluationStatus;
  onEdit: (s: ScoreEvaluationStatus) => void;
  onDelete: (s: ScoreEvaluationStatus) => void;
};

export function EvaluationStatusCard({
  status,
  onEdit,
  onDelete,
}: EvaluationStatusCardProps) {
  const token = useToken();

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        background: token.colorBgContainer,
        padding: "16px 20px",
      }}
    >
      <Flex align="flex-start" justify="space-between" gap={12}>
        {/* Left: name, code, default tag */}
        <Flex vertical gap={6} style={{ minWidth: 160, flexShrink: 0 }}>
          <Typography.Text
            strong
            style={{ fontSize: token.fontSizeLG, lineHeight: 1.4 }}
          >
            {status.name}
          </Typography.Text>
          <Flex align="center" gap={6} wrap="wrap">
            <Tag
              style={{
                margin: 0,
                fontFamily: "monospace",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              {status.code}
            </Tag>
            <ConditionalRenderer when={status.isDefault}>
              <Tag color="green" style={{ margin: 0 }}>
                Default
              </Tag>
            </ConditionalRenderer>
          </Flex>
        </Flex>

        {/* Middle: behavioral flag chips */}
        <Flex align="center" gap={6} wrap="wrap" style={{ flex: 1 }}>
          {/* isStandardGraded */}
          <ConditionalRenderer when={status.isStandardGraded}>
            <Tag color="green" style={{ margin: 0 }}>
              Standard Graded
            </Tag>
          </ConditionalRenderer>
          <ConditionalRenderer when={!status.isStandardGraded}>
            <Tag color="orange" style={{ margin: 0 }}>
              Non-Standard
            </Tag>
          </ConditionalRenderer>

          {/* computesInGpa */}
          <ConditionalRenderer when={status.computesInGpa}>
            <Tag color="blue" style={{ margin: 0 }}>
              Counts in GPA
            </Tag>
          </ConditionalRenderer>
          <ConditionalRenderer when={!status.computesInGpa}>
            <Tag color="default" style={{ margin: 0 }}>
              Excluded from GPA
            </Tag>
          </ConditionalRenderer>

          {/* earnsCredit */}
          <ConditionalRenderer when={status.earnsCredit}>
            <Tag color="green" style={{ margin: 0 }}>
              Earns Credit
            </Tag>
          </ConditionalRenderer>
          <ConditionalRenderer when={!status.earnsCredit}>
            <Tag color="default" style={{ margin: 0 }}>
              No Credit
            </Tag>
          </ConditionalRenderer>

          {/* requiresRetake */}
          <ConditionalRenderer when={status.requiresRetake}>
            <Tag color="orange" style={{ margin: 0 }}>
              Retake Required
            </Tag>
          </ConditionalRenderer>
          <ConditionalRenderer when={!status.requiresRetake}>
            <Tag color="default" style={{ margin: 0 }}>
              No Retake
            </Tag>
          </ConditionalRenderer>
        </Flex>

        {/* Right: action buttons */}
        <Flex align="center" gap={4} style={{ flexShrink: 0 }}>
          <PermissionGuard
            permission={Permission.ScoreEvaluationStatusesUpdate}
          >
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ fontSize: 16 }} />}
              onClick={() => onEdit(status)}
              title="Edit"
            />
          </PermissionGuard>
          <PermissionGuard
            permission={Permission.ScoreEvaluationStatusesDelete}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined style={{ fontSize: 16 }} />}
              onClick={() => onDelete(status)}
              title="Delete"
            />
          </PermissionGuard>
        </Flex>
      </Flex>
    </div>
  );
}
