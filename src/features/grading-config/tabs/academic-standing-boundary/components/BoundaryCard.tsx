import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  PartitionOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Button, Card, Flex, Space, Tag, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import type { AcademicStandingBoundary } from "../types/academic-standing-boundary";

export interface BoundaryCardProps {
  boundary: AcademicStandingBoundary;
  policyId: number;
  intervalText: string;
  isBaseTier: boolean;
  onEdit: (boundary: AcademicStandingBoundary) => void;
  onDelete: (boundary: AcademicStandingBoundary) => void;
}

export function BoundaryCard({
  boundary,
  policyId,
  intervalText,
  isBaseTier,
  onEdit,
  onDelete,
}: BoundaryCardProps) {
  const token = useToken();
  const navigate = useNavigate();

  const steps = boundary.escalationSteps ?? [];
  const stepsCount = steps.length;

  const handleConfigureLadder = () => {
    navigate(
      `?group=academic-standing&tab=escalation-ladders&policyId=${policyId}&boundaryId=${boundary.id}`,
    );
  };

  return (
    <Card
      variant="outlined"
      style={{
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowTertiary,
        borderColor: token.colorBorderSecondary,
        transition: "all 0.2s ease-in-out",
      }}
      styles={{
        body: { padding: token.paddingLG },
      }}
    >
      <Flex vertical gap={token.marginMD}>
        {/* Header: Name, Interval Tag, Actions */}
        <Flex justify="space-between" align="flex-start" gap={token.marginSM} wrap="wrap">
          <Flex vertical gap={4} style={{ flex: 1, minWidth: 200 }}>
            <Flex align="center" gap={8} wrap="wrap">
              <Typography.Title level={5} style={{ margin: 0 }}>
                {boundary.name}
              </Typography.Title>
              <Tag color="blue" style={{ fontWeight: 600 }}>
                {intervalText}
              </Tag>
              {isBaseTier && (
                <Tag color="success" style={{ fontWeight: 600 }}>
                  Base Tier
                </Tag>
              )}
            </Flex>
          </Flex>

          <Space size="small">
            <PermissionGuard permission={Permission.AcademicStandingsUpdate}>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(boundary)}
                aria-label="Edit boundary"
              />
            </PermissionGuard>
            <PermissionGuard permission={Permission.AcademicStandingsDelete}>
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => onDelete(boundary)}
                aria-label="Delete boundary"
              />
            </PermissionGuard>
          </Space>
        </Flex>

        {/* Configuration Tags */}
        <Flex wrap="wrap" gap={8} align="center">
          <Tag color="default">
            Min CGPA: <strong>{Number(boundary.minCgpa).toFixed(2)}</strong>
          </Tag>
          {boundary.studentTransitionStatus && (
            <Tag color="cyan">
              Target Status: <strong>{boundary.studentTransitionStatus.name}</strong>
            </Tag>
          )}
          <Tag color="default">
            Max Carryovers: {boundary.maxCarryoverCount != null ? boundary.maxCarryoverCount : "Unlimited"}
          </Tag>

          {boundary.hasEscalationLadder ? (
            stepsCount > 0 ? (
              <Tag icon={<PartitionOutlined />} color="purple">
                Ladder Active · {stepsCount} {stepsCount === 1 ? "step" : "steps"}
              </Tag>
            ) : (
              <Tag icon={<WarningOutlined />} color="warning">
                ⚠ Ladder Enabled · No steps yet
              </Tag>
            )
          ) : (
            <Tag color="default">No Ladder</Tag>
          )}
        </Flex>

        {/* Escalation CTA if ladder enabled */}
        {boundary.hasEscalationLadder && (
          <Flex
            justify="flex-end"
            align="center"
            style={{
              paddingTop: token.paddingSM,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Button
              type="link"
              size="small"
              icon={<ArrowRightOutlined />}
              onClick={handleConfigureLadder}
              style={{ fontWeight: 600, padding: 0 }}
            >
              Configure Escalation Ladder
            </Button>
          </Flex>
        )}
      </Flex>
    </Card>
  );
}
